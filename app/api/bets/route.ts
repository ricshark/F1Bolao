import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bet from '@/models/Bet';
import Race from '@/models/Race';

const fallbackRaces = [
  { round: 1, name: 'Bahrain Grand Prix', date: '2026-03-28', circuit: 'Bahrain International Circuit', season: 2026 },
  { round: 2, name: 'Saudi Arabian Grand Prix', date: '2026-04-04', circuit: 'Jeddah Corniche Circuit', season: 2026 },
  { round: 3, name: 'Australian Grand Prix', date: '2026-04-18', circuit: 'Albert Park Circuit', season: 2026 },
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Session not found' }, { status: 401 });
  }

  // Try multiple ways to get the user ID
  const userId = (session.user as any).id || (session as any).user?.id;
  
  if (!userId) {
    console.error('User ID not available in session:', JSON.stringify(session.user));
    return NextResponse.json({ error: 'User ID not available in session' }, { status: 401 });
  }

  await dbConnect();

  const { round, prediction } = await request.json();

  let race = await Race.findOne({ round });
  if (!race) {
    // Try to fetch race data from API, but fall back to local data if offline.
    try {
      const raceRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/${round}.json`);
      const raceData = await raceRes.json();
      const r = raceData.MRData.RaceTable.Races[0];
      race = new Race({
        round: r.round,
        name: r.raceName,
        date: r.date,
        circuit: r.Circuit.circuitName,
        season: r.season,
      });
    } catch (error) {
      const fallback = fallbackRaces.find((r) => r.round === round);
      if (!fallback) {
        return NextResponse.json({ error: 'Unable to fetch race data and no fallback available' }, { status: 500 });
      }
      race = new Race({
        round: fallback.round,
        name: fallback.name,
        date: fallback.date,
        circuit: fallback.circuit,
        season: fallback.season,
      });
    }

    await race.save();
  }

  const raceId = race._id;

  const existingBet = await Bet.findOne({ user: userId, race: raceId });
  if (existingBet) {
    return NextResponse.json({ error: 'Bet already placed' }, { status: 400 });
  }

  const bet = new Bet({
    user: userId,
    race: raceId,
    prediction,
  });

  await bet.save();

  return NextResponse.json(bet);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const bets = await Bet.find({ user: userId }).populate('race');
  return NextResponse.json(bets);
}