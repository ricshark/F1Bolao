import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Race from "@/models/Race";
import Bet from "@/models/Bet";

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

        // Busca a próxima corrida
        const nextRace = await Race.findOne({ date: { $gte: now } })
            .sort({ date: 1 })
            .lean();

        if (!nextRace) {
            return NextResponse.json({
                success: true,
                speech: "Por enquanto, não temos nenhuma corrida futura cadastrada no sistema."
            }, { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } });
        }

        // Busca os palpites da próxima corrida
        // @ts-ignore
        const bets = await Bet.find({ race: nextRace._id }).lean();

        if (!bets || bets.length === 0) {
            return NextResponse.json({
                success: true,
                speech: `Ainda não temos nenhum palpite registrado para a próxima corrida.`
            }, { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } });
        }

        const totalBets = bets.length;

        const firstCounts: Record<string, number> = {};
        const secondCounts: Record<string, number> = {};
        const thirdCounts: Record<string, number> = {};

        bets.forEach((bet: any) => {
            const p = bet.prediction;
            if (p.first) {
                firstCounts[p.first] = (firstCounts[p.first] || 0) + 1;
            }
            if (p.second) {
                secondCounts[p.second] = (secondCounts[p.second] || 0) + 1;
            }
            if (p.third) {
                thirdCounts[p.third] = (thirdCounts[p.third] || 0) + 1;
            }
        });

        const getTop = (counts: Record<string, number>) => {
            let maxDriver = null;
            let maxCount = 0;
            for (const [driver, count] of Object.entries(counts)) {
                if (count > maxCount) {
                    maxCount = count;
                    maxDriver = driver;
                }
            }
            return { driver: maxDriver, count: maxCount };
        };

        const firstTop = getTop(firstCounts);
        const secondTop = getTop(secondCounts);
        const thirdTop = getTop(thirdCounts);

        const p1Prob = firstTop.driver ? Math.round((firstTop.count / totalBets) * 100) : 0;
        const p2Prob = secondTop.driver ? Math.round((secondTop.count / totalBets) * 100) : 0;
        const p3Prob = thirdTop.driver ? Math.round((thirdTop.count / totalBets) * 100) : 0;

        let probSpeech = "";
        
        if (totalBets === 1) {
             probSpeech = `Com base no único palpite registrado, a probabilidade é cento por cento para ${firstTop.driver} em primeiro, ${secondTop.driver} em segundo e ${thirdTop.driver} em terceiro.`;
        } else {
             probSpeech = `Com base na comunidade do bolão, o pódio mais provável é: ${firstTop.driver} em primeiro com ${p1Prob} por cento de chances, ${secondTop.driver} em segundo com ${p2Prob} por cento, e ${thirdTop.driver} em terceiro com ${p3Prob} por cento.`;
        }

        return NextResponse.json({
            success: true,
            speech: probSpeech
        }, {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            speech: "Erro ao calcular probabilidade da próxima corrida."
        }, { status: 500 });
    }
}
