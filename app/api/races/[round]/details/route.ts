import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Race from '@/models/Race';
import Bet from '@/models/Bet';
import User from '@/models/User';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { round: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { round } = params;

  await dbConnect();

  try {
    // 1. Get Race details from Database
    const race = await Race.findOne({ round: Number(round) });
    if (!race) {
      return NextResponse.json({ error: 'Race not found' }, { status: 404 });
    }

    // 2. Fetch real official results from Ergast API
    let realResults = [];
    try {
      const ergastRes = await axios.get(`https://api.jolpi.ca/ergast/f1/current/${round}/results.json`);
      const raceData = ergastRes.data?.MRData?.RaceTable?.Races?.[0];
      if (raceData && raceData.Results) {
        realResults = raceData.Results.slice(0, 3).map((r: any) => ({
          position: r.position,
          driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
          points: r.points
        }));
      }
    } catch (apiError) {
      console.error('Ergast API fallback or offline:', apiError);
      // Fallback handles gracefully through empty realResults
    }

    // 3. Fetch all Bets for this race, complete with the User Name
    const bets = await Bet.find({ race: race._id }).populate({
      path: 'user',
      select: 'name'
    });

    const formattedBets = bets.map(bet => ({
      _id: bet._id,
      userName: bet.user.name,
      prediction: bet.prediction,
      points: bet.points || 0,
      createdAt: bet.createdAt
    }));

    return NextResponse.json({
      race: {
        name: race.name,
        round: race.round,
        date: race.date,
        time: race.time,
        circuit: race.circuit
      },
      realResults,
      bets: formattedBets
    });

  } catch (error) {
    console.error('Error fetching race details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
