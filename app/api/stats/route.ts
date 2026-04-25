import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bet from "@/models/Bet";
import Race from "@/models/Race";
import User from "@/models/User";
import Result from "@/models/Result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        const races = await Race.find({}).sort({ round: 1 }).lean();
        const bets = await Bet.find({}).populate('race').lean();
        
        // 1. Frequency of pilots in P1, P2, P3
        const pilotStats: Record<string, { p1: number, p2: number, p3: number, total: number }> = {};

        bets.forEach((bet: any) => {
            const { first, second, third } = bet.prediction;
            
            [first, second, third].forEach((pilot, index) => {
                if (!pilot) return;
                if (!pilotStats[pilot]) {
                    pilotStats[pilot] = { p1: 0, p2: 0, p3: 0, total: 0 };
                }
                pilotStats[pilot].total++;
                if (index === 0) pilotStats[pilot].p1++;
                else if (index === 1) pilotStats[pilot].p2++;
                else if (index === 2) pilotStats[pilot].p3++;
            });
        });

        const pilotStatsArray = Object.entries(pilotStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // 2. Average points per race and Personal points
        const raceStats: Record<number, { totalPoints: number, count: number, name: string, userPoints?: number }> = {};

        bets.forEach((bet: any) => {
            if (!bet.race) return;
            const round = bet.race.round;
            if (!raceStats[round]) {
                raceStats[round] = { totalPoints: 0, count: 0, name: bet.race.name };
            }
            raceStats[round].totalPoints += (bet.points || 0);
            raceStats[round].count++;

            if (session?.user && String(bet.user) === (session.user as any).id) {
                raceStats[round].userPoints = bet.points || 0;
            }
        });

        const pointsEvolution = Object.entries(raceStats)
            .map(([round, stats]) => ({
                round: parseInt(round),
                name: stats.name,
                avgPoints: stats.count > 0 ? parseFloat((stats.totalPoints / stats.count).toFixed(2)) : 0,
                userPoints: stats.userPoints ?? null
            }))
            .sort((a, b) => a.round - b.round);

        // 3. Consensus vs Reality (Latest Race with Result)
        const latestResult = await Result.findOne().sort({ createdAt: -1 }).populate('race').lean();
        let consensusData = null;

        if (latestResult && latestResult.race) {
            const raceBets = bets.filter((b: any) => String(b.race?._id) === String(latestResult.race._id));
            const p1Consensus: Record<string, number> = {};
            raceBets.forEach((b: any) => {
                const p = b.prediction.first;
                p1Consensus[p] = (p1Consensus[p] || 0) + 1;
            });

            const topConsensus = Object.entries(p1Consensus)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
            
            const realWinner = latestResult.results.find((r: any) => r.position === 1)?.driver || 'N/A';

            consensusData = {
                raceName: (latestResult.race as any).name,
                predictedWinner: topConsensus,
                actualWinner: realWinner,
                isCorrect: topConsensus === realWinner
            };
        }

        // 4. Bots vs Humans
        const users = await User.find({}).select('isBot points').lean();
        const botsCount = users.filter((u: any) => u.isBot).length;
        const humansCount = users.length - botsCount;
        
        const botsAvgPoints = botsCount > 0 
            ? users.filter((u: any) => u.isBot).reduce((acc: number, u: any) => acc + (u.points || 0), 0) / botsCount 
            : 0;
        const humansAvgPoints = humansCount > 0 
            ? users.filter((u: any) => !u.isBot).reduce((acc: number, u: any) => acc + (u.points || 0), 0) / humansCount 
            : 0;

        return NextResponse.json({
            pilotStats: pilotStatsArray,
            pointsEvolution,
            consensus: consensusData,
            comparison: [
                { type: 'Bots', avg: parseFloat(botsAvgPoints.toFixed(2)), count: botsCount },
                { type: 'Humanos', avg: parseFloat(humansAvgPoints.toFixed(2)), count: humansCount }
            ]
        });

    } catch (error: any) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
