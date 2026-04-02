// arquivo: /app/api/alexa/route.ts

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const intent = body?.request?.intent?.name;

    let resposta = "Desculpe, não entendi sua solicitação.";

    if (intent === "GetRankingIntent") {
        resposta = "O líder do bolão é Ricardo com 141 pontos.";
    }

    if (intent === "GetNextRaceIntent") {
        resposta = "A próxima corrida é o GP de Miami no dia 03 de maio.";
    }

    return new Response(
        JSON.stringify({
            version: "1.0",
            response: {
                shouldEndSession: true,
                outputSpeech: {
                    type: "PlainText",
                    text: resposta,
                },
            },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}
