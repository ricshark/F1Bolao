// /api/alexa/users-ranking
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

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

        const topUsers = await User.find({})
            .sort({ points: -1 })
            .limit(3)
            .lean();

        let top3Speech = "O ranking dos 3 primeiros colocados é: ";
        const posicoes = ["Primeiro lugar", "Segundo lugar", "Terceiro lugar"];

        topUsers.forEach((u, index) => {
            const posicao = posicoes[index] || `${index + 1}º lugar`;
            top3Speech += `${posicao}, ${u.name} com ${u.points} pontos. `;
        });

        return NextResponse.json({
            success: true,
            speech: top3Speech.trim()
        }, {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            speech: "Erro ao buscar o resultado do ranking do bolão"
        }, { status: 500 });
    }
}