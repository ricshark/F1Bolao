import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const requestType = body?.request?.type;
    const intent = body?.request?.intent?.name;

    console.log("Alexa request body:", body);

    let resposta = "Desculpe, não entendi sua solicitação.";

    if (requestType === "LaunchRequest") {
        resposta = "Bem-vindo ao Bolão de Fórmula Um! Você pode me perguntar o ranking ou a próxima corrida.";
    }

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
                shouldEndSession: false, // mantém a sessão aberta após o LaunchRequest
                outputSpeech: {
                    type: "PlainText",
                    text: resposta,
                },
            },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}
