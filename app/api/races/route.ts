import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const fallbackRaces = [
  { round: 1, name: 'Bahrain Grand Prix', date: '2026-03-28', circuit: 'Bahrain International Circuit', season: 2026 },
  { round: 2, name: 'Saudi Arabian Grand Prix', date: '2026-04-04', circuit: 'Jeddah Corniche Circuit', season: 2026 },
  { round: 3, name: 'Australian Grand Prix', date: '2026-03-10', circuit: 'Albert Park Circuit', season: 2026 },
];

export async function GET() {
  try {
    const response = await axios.get('https://api.jolpi.ca/ergast/f1/current.json');
    const races = response.data.MRData.RaceTable.Races.map((race: any) => ({
      round: race.round,
      name: race.raceName,
      date: race.date,
      circuit: race.Circuit.circuitName,
      season: race.season,
    }));

    if (!Array.isArray(races) || races.length === 0) {
      return NextResponse.json(fallbackRaces);
    }

    return NextResponse.json(races);
  } catch (error) {
    return NextResponse.json(fallbackRaces);
  }
}