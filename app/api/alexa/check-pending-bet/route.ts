import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ success: false, message: 'Email não fornecido' }, { status: 400 });
    }

    try {
        // 1. Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ success: false, hasPendingBet: false, message: 'Usuário não encontrado' });
        }

        // 2. Buscar a próxima corrida que ainda não aconteceu
        const nextRace = await prisma.race.findFirst({
            where: {
                date: {
                    gt: new Date()
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        if (!nextRace) {
            return NextResponse.json({ success: true, hasPendingBet: false, message: 'Nenhuma corrida futura encontrada' });
        }

        // 3. Verificar se o usuário já tem palpite para esta corrida
        const bet = await prisma.bet.findFirst({
            where: {
                userId: user.id,
                raceId: nextRace.id
            }
        });

        // Retorna se o palpite está pendente (não existe bet)
        return NextResponse.json({
            success: true,
            hasPendingBet: !bet,
            raceName: nextRace.name,
            raceDate: nextRace.date
        });

    } catch (error) {
        console.error('Erro ao verificar palpite pendente:', error);
        return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
    }
}
