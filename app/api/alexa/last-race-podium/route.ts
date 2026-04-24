import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Result from "@/models/Result";
import Race from "@/models/Race";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Tenta capturar o userId e email se enviados
        try {
            const body = await req.json();
            const { email, userId } = body;

            if (email && userId) {
                const user = await User.findOne({ email });
                if (user && user.alexaId !== userId) {
                    user.alexaId = userId;
                    await user.save();
                    console.log(`alexaId atualizado para o usuário: ${email}`);
                }
            }
        } catch (e) {
            // Ignora se não for enviado body JSON ou se der erro no parse
        }

        // Pega a data atual
        const now = new Date();

        // Busca a última corrida que já ocorreu
        const lastRace = await Race.findOne({ date: { $lt: now } })
            .sort({ date: -1 })
            .lean();

        if (!lastRace) {
            return NextResponse.json({
                success: true,
                speech: "Ainda não temos informações sobre a última corrida cadastrada no sistema."
            }, { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } });
        }

        // Busca o resultado dessa corrida
        // @ts-ignore
        const result = await Result.findOne({ race: lastRace._id }).lean();

        if (!result || !result.results || result.results.length === 0) {
            return NextResponse.json({
                success: true,
                // @ts-ignore
                speech: `A última corrida foi o ${lastRace.name}, mas os resultados oficiais ainda não foram lançados no sistema.`
            }, { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } });
        }

        const podium = result.results.filter((r: any) => r.position <= 3).sort((a: any, b: any) => a.position - b.position);
        
        let p1 = podium.find((r: any) => r.position === 1)?.driver || "não informado";
        let p2 = podium.find((r: any) => r.position === 2)?.driver || "não informado";
        let p3 = podium.find((r: any) => r.position === 3)?.driver || "não informado";

        // @ts-ignore
        const speech = `O pódio da última corrida, que foi o ${lastRace.name}, teve ${p1} em primeiro, ${p2} em segundo e ${p3} em terceiro lugar.`;

        return NextResponse.json({
            success: true,
            speech: speech.trim()
        }, {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            speech: "Erro ao buscar sobre a última corrida."
        }, { status: 500 });
    }
}
