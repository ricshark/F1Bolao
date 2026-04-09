import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Bet from "@/models/Bet";
import { getAlexaUserEmail } from "@/lib/alexa";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Pegar o access token enviado pela Alexa
        //const authHeader = req.headers.get("authorization");
        //let userEmail: string | null = null;

        // 2. Buscar email do usuário para encontrar o usuário no F1 Bolão
        //if (authHeader && authHeader.startsWith("Bearer ")) {
        //    const accessToken = authHeader.replace("Bearer ", "").trim();
        //    userEmail = await getAlexaUserEmail(accessToken);
        //}

        const body = await req.json();
        const { raceName } = body;
        const consentToken = body?.session?.user?.permissions?.consentToken;
        console.log("consentToken:", consentToken);
        console.log("System context:", body?.session?.user?.permissions?.consentToken);
        console.log("Body recebido:", JSON.stringify(body, null, 2));


        let userEmail: string | null = null;

        if (consentToken) {
            userEmail = await getAlexaUserEmail(consentToken);
        }

        if (!userEmail) {
            return NextResponse.json({ success: false, message: 'Identificação do usuário da Alexa não fornecida.' }, { status: 400 });
        }

        // Buscar usuário pelo alexaId
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Sua conta da Alexa ainda não está vinculada a nenhum usuário no F1 Bolão.'
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
            return NextResponse.json({ success: false, message: 'Calendário de corridas não disponível no momento.' });
        }

        // Buscar palpite do usuário para esta corrida
        const bet = await Bet.findOne({ user: user._id, race: targetRace._id });

        if (!bet) {
            return NextResponse.json({
                success: true,
                message: `Você ainda não registrou nenhum palpite para o ${targetRace.name}.`,
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
        return NextResponse.json({ success: false, message: 'Ocorreu um erro interno ao buscar seus palpites.' }, { status: 500 });
    }
}
