import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const fallbackResults = [
  { position: 1, driver: 'Max Verstappen', points: 25 },
  { position: 2, driver: 'Charles Leclerc', points: 18 },
  { position: 3, driver: 'Lewis Hamilton', points: 15 },
];

export async function GET(request: NextRequest, { params }: { params: { round: string } }) {
  try {
    const response = await axios.get(`https://api.jolpi.ca/ergast/f1/current/${params.round}/results.json`);
    const results = response.data.MRData.RaceTable.Races[0].Results.map((result: any) => ({
      position: result.position,
      driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
      points: result.points,
    }));

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ source: 'fallback', results: fallbackResults });
    }

    return NextResponse.json({ source: 'ergast', results });
  } catch (error) {
    return NextResponse.json({ source: 'fallback', results: fallbackResults });
  }
}