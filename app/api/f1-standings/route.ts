import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/driverstandings.json');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch standings: ${response.status}`);
        }

        const data = await response.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        const formattedStandings = standings.map((item: any) => ({
            position: item.position,
            points: item.points,
            name: `${item.Driver.givenName} ${item.Driver.familyName}`,
            team: item.Constructors[0].name,
            code: item.Driver.code,
            nationality: item.Driver.nationality
        }));

        return NextResponse.json(formattedStandings);
    } catch (error) {
        console.error("Error fetching F1 standings:", error);
        return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
    }
}
