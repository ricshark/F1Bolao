import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bet from '@/models/Bet';
import User from '@/models/User';

// Import models for side-effects (prevents Next.js tree-shaking)
import '@/models/User';
import '@/models/Race';
import '@/models/Bet';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const isAdmin = (session?.user as any)?.isAdmin;

    if (!userId || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Reset all users' and bets' points to 0 before calculating sequentially
    await User.updateMany({}, { points: 0 });
    await Bet.updateMany({}, { points: 0 });

    const bets = await Bet.find({}).populate('race');

    // Group bets by race round so we don't spam the Ergast API
    const betsByRound: { [round: number]: any[] } = {};
    for (const bet of bets) {
      if (!bet.race) continue;
      if (!betsByRound[bet.race.round]) {
        betsByRound[bet.race.round] = [];
      }
      betsByRound[bet.race.round].push(bet);
    }

    for (const roundStr in betsByRound) {
      const round = Number(roundStr);
      const roundBets = betsByRound[round];

      let resultsData: any;
      try {
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/current/${round}/results.json`, { cache: 'no-store' });
        if (!response.ok) {
          console.log(`Race ${round} haven't happened yet or API failed.`);
          continue;
        }
        const data = await response.json();
        resultsData = data.MRData?.RaceTable?.Races[0]?.Results;
      } catch (err: any) {
        console.error(`Error fetching results for round ${round}`, err.message);
        continue;
      }

      if (!resultsData || resultsData.length === 0) {
        continue; // Race hasn't happened yet
      }

      // Map official results: { "Max Verstappen": { position: 1, points: 25 }, ... }
      const officialResults: { [driverName: string]: { position: number, points: number } } = {};
      resultsData.forEach((r: any) => {
        const driverName = `${r.Driver.givenName} ${r.Driver.familyName}`;
        officialResults[driverName] = {
          position: parseInt(r.position, 10),
          points: parseInt(r.points, 10),
        };
      });

      // Calculate points for each bet in this round
      for (const bet of roundBets) {
        let betPoints = 0;

        // Verify 1st place prediction
        const firstDriver = officialResults[bet.prediction.first];
        if (firstDriver && firstDriver.position === 1) {
          betPoints += firstDriver.points;
        }

        // Verify 2nd place prediction
        const secondDriver = officialResults[bet.prediction.second];
        if (secondDriver && secondDriver.position === 2) {
          betPoints += secondDriver.points;
        }

        // Verify 3rd place prediction
        const thirdDriver = officialResults[bet.prediction.third];
        if (thirdDriver && thirdDriver.position === 3) {
          betPoints += thirdDriver.points;
        }

        // Update the bet document
        bet.points = betPoints;
        await bet.save();

        // Increment the points into the user
        await User.findByIdAndUpdate(bet.user, { $inc: { points: betPoints } });
      }
    }

    return NextResponse.json({ message: 'Points calculated successfully' });
  } catch (error: any) {
    console.error('Calculate Points Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
