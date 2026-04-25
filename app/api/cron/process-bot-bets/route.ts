import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Bet from "@/models/Bet";
import SystemConfig from "@/models/SystemConfig";

export const runtime = "nodejs";

const OFFICIAL_DRIVERS = [
    'Arvid Lindblad', 'Carlos Sainz', 'Charles Leclerc', 'Esteban Ocon',
    'Fernando Alonso', 'Franco Colapinto', 'Gabriel Bortoleto', 'George Russell',
    'Isack Hadjar', 'Lance Stroll', 'Lewis Hamilton', 'Liam Lawson',
    'Lando Norris', 'Max Verstappen', 'Nico Hülkenberg', 'Oliver Bearman',
    'Oscar Piastri', 'Pierre Gasly', 'Sergio Pérez', 'Valtteri Bottas'
];

function getRandomDrivers(count: number): string[] {
    const shuffled = [...OFFICIAL_DRIVERS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Find next race
        const now = new Date();
        const nextRace = await Race.findOne({ date: { $gte: now } }).sort({ date: 1 });

        if (!nextRace) {
            return NextResponse.json({ message: "No future races found." });
        }

        // 2. Check lock time
        const config = await SystemConfig.findOne();
        const betLockHours = config?.betLockHours ?? 1;
        const raceDateStr = new Date(nextRace.date).toISOString().split('T')[0];
        const raceDateTime = new Date(nextRace.time ? `${raceDateStr}T${nextRace.time}` : `${raceDateStr}T15:00:00Z`);
        const lockTime = new Date(raceDateTime.getTime() - betLockHours * 3600 * 1000);

        if (now > lockTime) {
            return NextResponse.json({ message: "Betting is locked for the next race." });
        }

        // 3. Find all bots
        const bots = await User.find({ isBot: true });
        
        let createdCount = 0;
        const currentDate = new Date();

        for (const bot of bots) {
            // Check if bot already bet
            const existingBet = await Bet.findOne({ user: bot._id, race: nextRace._id });
            
            if (!existingBet) {
                const [p1, p2, p3] = getRandomDrivers(3);
                const newBet = new Bet({
                    user: bot._id,
                    race: nextRace._id,
                    prediction: {
                        first: p1,
                        second: p2,
                        third: p3
                    },
                    createdAt: currentDate,
                    updatedAt: currentDate
                });
                await newBet.save();
                createdCount++;
            }
        }

        return NextResponse.json({
            message: `Processed bot bets for ${nextRace.name}.`,
            botsProcessed: bots.length,
            betsCreated: createdCount
        });

    } catch (error: any) {
        console.error("Error processing bot bets:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
