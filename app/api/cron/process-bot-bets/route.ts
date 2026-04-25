import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Bet from "@/models/Bet";
import SystemConfig from "@/models/SystemConfig";

export const runtime = "nodejs";

const OFFICIAL_DRIVERS = [
    'Alexander Albon', 'Carlos Sainz', 'Charles Leclerc', 'Esteban Ocon',
    'Fernando Alonso', 'Gabriel Bortoleto', 'George Russell', 'Isack Hadjar',
    'Jack Doohan', 'Kimi Antonelli', 'Lance Stroll', 'Lewis Hamilton',
    'Liam Lawson', 'Lando Norris', 'Max Verstappen', 'Nico Hülkenberg',
    'Oliver Bearman', 'Oscar Piastri', 'Pierre Gasly', 'Yuki Tsunoda'
];

function getRandomDrivers(count: number): string[] {
    const shuffled = [...OFFICIAL_DRIVERS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await dbConnect();

        // 1. Find next race
        const now = new Date();
        const nextRace = await Race.findOne({ date: { $gte: now } }).sort({ date: 1 });

        if (!nextRace) {
            return NextResponse.json({ message: "No future races found." });
        }

        // 2. Check timing and lock status
        const config = await SystemConfig.findOne();
        const betLockHours = config?.betLockHours ?? 1;
        
        const raceDateStr = new Date(nextRace.date).toISOString().split('T')[0];
        const raceDateTime = new Date(nextRace.time ? `${raceDateStr}T${nextRace.time}` : `${raceDateStr}T15:00:00Z`);
        
        const diffMs = raceDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // REGRAS:
        // - Não pode ter passado do tempo de bloqueio (lockTime)
        // - Só vota se faltar menos de 2.5 horas para a largada (janela de ativação)
        
        const lockTime = new Date(raceDateTime.getTime() - betLockHours * 3600 * 1000);

        if (now > lockTime) {
            return NextResponse.json({ message: `Betting is locked for ${nextRace.name}.` });
        }

        if (diffHours > 2.5) {
            return NextResponse.json({ 
                message: `Too early for bot bets. Next race ${nextRace.name} is in ${diffHours.toFixed(1)} hours.`,
                diffHours 
            });
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
