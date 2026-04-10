import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Race from "@/models/Race";
import Bet from "@/models/Bet";
import SystemConfig from "@/models/SystemConfig";

export const runtime = "nodejs";

const OFFICIAL_DRIVERS = [
    'Arvid Lindblad', 'Carlos Sainz', 'Charles Leclerc', 'Esteban Ocon',
    'Fernando Alonso', 'Franco Colapinto', 'Gabriel Bortoleto', 'George Russell',
    'Isack Hadjar', 'Lance Stroll', 'Lewis Hamilton', 'Liam Lawson',
    'Lando Norris', 'Max Verstappen', 'Nico Hülkenberg', 'Oliver Bearman',
    'Oscar Piastri', 'Pierre Gasly', 'Sergio Pérez', 'Valtteri Bottas'
];

function matchDriverName(input: string): string {
    if (!input) return '';
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const normalizedInput = normalize(input);

    for (const driver of OFFICIAL_DRIVERS) {
        if (normalize(driver).includes(normalizedInput)) {
            return driver; // Retorna o nome formatado exato da lista do seu dropdown
        }
    }
    return input; // Se não achar ninguem, salva como a Alexa mandou para fallback
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();

        const { piloto1, piloto2, piloto3, email } = body;
        const consentToken = body?.session?.user?.permissions?.consentToken;
        console.log("email:", email);


        let userEmail: string | null = null;

        if (email) {
            userEmail = email;
        }

        if (!userEmail) {
            return NextResponse.json({ success: false, message: 'Identificação do usuário da Alexa não fornecida.' }, { status: 400 });
        }

        if (!piloto1 || !piloto2 || !piloto3 || !email) {
            return NextResponse.json({ success: false, message: 'Faltam dados para preencher o pódio completamente.' }, { status: 400 });
        }

        // Identifica o Usuario na Base pelo ID vindo da Alexa
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Sua conta da Alexa ainda não está vinculada a nenhum usuário no F1 Bolão.'
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

        const prediction = {
            first: matchDriverName(piloto1),
            second: matchDriverName(piloto2),
            third: matchDriverName(piloto3)
        };

        let existingBet = await Bet.findOne({ user: user._id, race: nextRace._id });
        const currentDate = new Date();
        if (existingBet) {
            existingBet.prediction = prediction;
            existingBet.updatedAt = currentDate;
            if (!existingBet.createdAt) {
                existingBet.createdAt = currentDate;
            }
            await existingBet.save();
        } else {
            existingBet = new Bet({
                user: user._id,
                race: nextRace._id,
                prediction,
                createdAt: currentDate,
                updatedAt: currentDate
            });
            await existingBet.save();
        }

        return NextResponse.json({ success: true, message: 'Maravilha! Seu palpite foi salvo e atualizado com sucesso no painel do F1 Bolão.' }, { status: 200 });

    } catch (error) {
        console.error('Erro API register-palpite:', error);
        return NextResponse.json({ success: false, message: 'Ocorreu um erro interno ao tentar registrar sua aposta.' }, { status: 500 });
    }
}
