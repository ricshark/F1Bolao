import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { syncAlexaUser } from "@/lib/alexa-sync";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Tenta capturar o userId e email se enviados para sincronia de usuário
        try {
            const body = await req.json();
            const { email, userId } = body;
            if (email && userId) {
                await syncAlexaUser(email, userId);
            }
        } catch (e) {
            // Ignora se não for enviado body JSON ou se der erro no parse
        }

        // Fetching F1 news in Portuguese from Motorsport RSS
        const response = await fetch('https://motorsport.uol.com.br/rss/f1/news/');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch RSS: ${response.status}`);
        }

        const xmlText = await response.text();

        // Extrair itens individuais
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const items = [];
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
            items.push(match[1]);
            if (items.length >= 3) break; // Só precisamos dos 3 primeiros
        }

        const titles = items.map(item => {
            const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
            return titleMatch ? titleMatch[1].trim() : "Notícia sem título";
        });

        let speech = "Direto do paddock para você! Confira as últimas manchetes do mundo da Fórmula 1: ";
        
        if (titles.length === 0) {
            speech = "Parece que a comunicação com o paddock falhou! Não consegui acessar as últimas notícias agora. Tente novamente em instantes.";
        } else {
            titles.forEach((t, i) => {
                speech += `Manchete ${i + 1}: ${t}. `;
            });
            speech += "Para mais detalhes, acesse o aplicativo F1 Bolão!";
        }

        return NextResponse.json({
            success: true,
            speech: speech.trim()
        }, {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });

    } catch (error) {
        console.error("Error fetching F1 news:", error);
        return NextResponse.json({
            success: false,
            speech: "A conexão com o paddock caiu! Não consegui carregar as últimas notícias agora. Tente novamente em breve."
        }, { status: 500 });
    }
}
