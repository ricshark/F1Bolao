import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Bet from "@/models/Bet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { userId, email, raceName } = body;
        console.log("email:", email);

        let userEmail: string | null = null;

        if (email) {
            userEmail = email;
        }

        if (!userEmail) {
            return NextResponse.json({ success: false, message: 'Fomos desclassificados! Não recebi sua identificação de piloto.' }, { status: 400 });
        }

        // Buscar usuário pelo alexaId
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Você ainda não está no nosso grid de largada! Sua conta não foi encontrada no F1 Bolão.'
            });
        }

        let targetRace;
        const now = new Date();

        if (raceName) {
            const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const normalizedInput = normalize(raceName);

            // Buscar todas as corridas e tentar dar match no nome ou circuito
            const allRaces = await Race.find();
            targetRace = allRaces.find(r =>
                normalize(r.name).includes(normalizedInput) ||
                normalize(r.circuit).includes(normalizedInput)
            );
        }

        // Se não especificou corrida ou não encontrou pelo nome, busca a próxima
        if (!targetRace) {
            targetRace = await Race.findOne({ date: { $gte: now } }).sort({ date: 1 });
        }

        if (!targetRace) {
            return NextResponse.json({ success: false, message: 'O calendário oficial sumiu dos boxes! Nenhuma corrida encontrada.' });
        }

        // Buscar palpite do usuário para esta corrida
        const bet = await Bet.findOne({ user: user._id, race: targetRace._id });

        if (!bet) {
            return NextResponse.json({
                success: true,
                message: `Você ainda não definiu sua estratégia para o ${targetRace.name}. O grid está aberto para seus palpites!`,
                raceName: targetRace.name,
                hasBet: false
            });
        }

        // Montar resposta
        const { first, second, third } = bet.prediction;
        let responseMessage = `Seus palpites para o ${targetRace.name} são: `;
        responseMessage += `primeiro lugar, ${first}; `;
        if (second) responseMessage += `segundo lugar, ${second}; `;
        if (third) responseMessage += `e terceiro lugar, ${third}.`;

        return NextResponse.json({
            success: true,
            message: responseMessage,
            raceName: targetRace.name,
            prediction: bet.prediction,
            hasBet: true
        });

    } catch (error) {
        console.error('Erro API get-palpite:', error);
        return NextResponse.json({ success: false, message: 'Tivemos uma pane seca no sistema! Não consegui buscar seus palpites agora.' }, { status: 500 });
    }
}
