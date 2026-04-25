import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json', {
      next: { revalidate: 3600 } // Cache por 1 hora
    });
    
    if (!res.ok) throw new Error('Failed to fetch constructor standings');
    
    const data = await res.json();
    const standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
    
    const formatted = standings.map((s: any) => ({
      position: s.position,
      points: s.points,
      name: s.Constructor.name,
      nationality: s.Constructor.nationality,
      code: s.Constructor.constructorId
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('API Standings Error:', error);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}
