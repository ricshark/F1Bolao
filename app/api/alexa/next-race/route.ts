// /api/alexa/next-race/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Race from "@/models/Race";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Pega a data atual
        const now = new Date();

        // Busca a primeira corrida cuja data seja maior ou igual a hoje
        const nextRace = await Race.findOne({ date: { $gte: now } })
            .sort({ date: 1 })
            .lean();

        let speech = "Por enquanto, não temos nenhuma corrida futura cadastrada no sistema.";

        if (nextRace) {
            // Monta uma data mais natural para audição garantindo que usamos a data da corrida
            const dataCorrida = new Date(nextRace.date);
            const dia = dataCorrida.getUTCDate();
            
            const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", 
                           "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
            const mesNome = meses[dataCorrida.getUTCMonth()];

            speech = `A próxima corrida no calendário é o ${nextRace.name}, que vai acontecer no dia ${dia} de ${mesNome}.`;
            
            // Se possuir o horário da corrida preenchido ex: "14:00" ou "14:00:00Z"
            if (nextRace.time) {
                const parts = nextRace.time.split(":");
                if (parts.length > 0) {
                    const horaFormatada = parseInt(parts[0], 10);
                    if (!isNaN(horaFormatada)) {
                        speech += ` A largada está prevista para as ${horaFormatada} horas.`;
                    }
                }
            }
        }

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
            speech: "Erro ao buscar sobre a próxima corrida."
        }, { status: 500 });
    }
}