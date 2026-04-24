import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Race from '@/models/Race';
import Bet from '@/models/Bet';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ success: false, message: 'Email não fornecido' }, { status: 400 });
    }

    try {
        await dbConnect();

        // 1. Buscar usuário pelo e-mail
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ success: false, hasPendingBet: false, message: 'Usuário não encontrado' });
        }

        // 2. Buscar a próxima corrida que ainda não aconteceu
        const nextRace = await Race.findOne({
            date: { $gt: new Date() }
        }).sort({ date: 1 });

        if (!nextRace) {
            return NextResponse.json({ success: true, hasPendingBet: false, message: 'Nenhuma corrida futura encontrada' });
        }

        // 3. Verificar se o usuário já tem palpite para esta corrida
        const bet = await Bet.findOne({
            userId: user._id,
            raceId: nextRace._id
        });

        // Retorna se o palpite está pendente (se não existir bet)
        return NextResponse.json({
            success: true,
            hasPendingBet: !bet,
            raceName: nextRace.name,
            raceDate: nextRace.date
        });

    } catch (error) {
        console.error('Erro ao verificar palpite pendente na API Alexa:', error);
        return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
    }
}
