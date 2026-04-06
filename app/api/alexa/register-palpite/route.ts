import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Bet from "@/models/Bet";
import SystemConfig from "@/models/SystemConfig";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { userId, piloto1, piloto2, piloto3 } = body;

        if (!userId || !piloto1 || !piloto2 || !piloto3) {
            return NextResponse.json({ success: false, message: 'Faltam dados para preencher o pódio completamente.' }, { status: 400 });
        }

        // Identifica o Usuario na Base pelo ID vindo da Alexa
        const user = await User.findOne({ alexaId: userId });
        
        if (!user) {
            // Em log podemos debugar qual o id que bateu para ajudar a mapear manualmente depois
            console.error(`AlexaId não vinculado no MongoDB. Alexa enviou ID: ${userId}`);
            return NextResponse.json({ 
                success: false, 
                message: 'Sua conta da Alexa ainda não está vinculada a nenhum usuário no bolão. Peça ao administrador para fazer o vínculo informando os logs da api.' 
            });
        }

        // Busca a próxima corrida ativa
        const now = new Date();
        const nextRace = await Race.findOne({ date: { $gte: now } }).sort({ date: 1 });

        if (!nextRace) {
            return NextResponse.json({ success: false, message: 'Nenhuma corrida futura ativa encontrada no calendário.' });
        }

        // Verifica Lock limits do Sistema
        const config = await SystemConfig.findOne();
        const betLockHours = config?.betLockHours ?? 1;

        const raceDateStr = new Date(nextRace.date).toISOString().split('T')[0];
        const raceDateTime = new Date(nextRace.time ? `${raceDateStr}T${nextRace.time}` : `${raceDateStr}T15:00:00Z`);
        const lockTime = new Date(raceDateTime.getTime() - betLockHours * 3600 * 1000);

        if (new Date() > lockTime) {
            return NextResponse.json({ success: false, message: 'Desculpe, o tempo limite para registrar palpites para a próxima corrida esgotou.' });
        }

        const prediction = { first: piloto1, second: piloto2, third: piloto3 };
        
        let existingBet = await Bet.findOne({ user: user._id, race: nextRace._id });
        if (existingBet) {
            existingBet.prediction = prediction;
            await existingBet.save();
        } else {
            existingBet = new Bet({
                user: user._id,
                race: nextRace._id,
                prediction
            });
            await existingBet.save();
        }

        return NextResponse.json({ success: true, message: 'Maravilha! Seu palpite foi salvo e atualizado com sucesso no painel do F1 Bolão.' }, { status: 200 });

    } catch (error) {
        console.error('Erro API register-palpite:', error);
        return NextResponse.json({ success: false, message: 'Ocorreu um erro interno ao tentar registrar sua aposta.' }, { status: 500 });
    }
}
