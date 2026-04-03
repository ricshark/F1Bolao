// /api/alexa/users-ranking
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

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
            speech: "Erro ao buscar o ranking do bolão"
        }, { status: 500 });
    }
}