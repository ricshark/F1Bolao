// /api/alexa/next-race/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

        // Busca a primeira corrida cuja data seja maior ou igual a hoje
        const nextRace = await Race.findOne({ date: { $gte: now } })
            .sort({ date: 1 })
            .lean();

        let speech = "Por enquanto, não temos nenhuma corrida futura cadastrada no sistema.";

        if (nextRace) {
            const dataCorrida = new Date(nextRace.date);

            // Zera horas para evitar erro de fuso ao calcular dias
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const corrida = new Date(dataCorrida);
            corrida.setHours(0, 0, 0, 0);

            // Diferença em dias
            const diffTime = corrida.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const dia = dataCorrida.getUTCDate();

            const meses = [
                "janeiro", "fevereiro", "março", "abril", "maio", "junho",
                "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
            ];
            const mesNome = meses[dataCorrida.getUTCMonth()];

            // Monta frase com dias restantes
            if (diffDays === 0) {
                speech = `A próxima corrida é o ${nextRace.name}, que acontece hoje, dia ${dia} de ${mesNome}.`;
            } else if (diffDays === 1) {
                speech = `A próxima corrida é o ${nextRace.name}, que acontece amanhã, dia ${dia} de ${mesNome}. Falta 1 dia.`;
            } else {
                speech = `A próxima corrida é o ${nextRace.name}, que acontece no dia ${dia} de ${mesNome}. Faltam ${diffDays} dias.`;
            }

            // Horário
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