import { SkillBuilders } from "ask-sdk-core";
import { NextRequest } from "next/server";

const verifier = require("alexa-verifier");
const LaunchRequestHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput: any) {
        return handlerInput.responseBuilder
            .speak("Bem-vindo ao Bolão de Fórmula Um! Você pode me perguntar o ranking ou a próxima corrida.")
            .reprompt("Você pode perguntar o ranking ou a próxima corrida.")
            .getResponse();
    },
};

const GetRankingIntentHandler = {
    canHandle(handlerInput: any) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "GetRankingIntent"
        );
    },
    handle(handlerInput: any) {
        return handlerInput.responseBuilder
            .speak("O líder do bolão é Ricardo com 141 pontos.")
            .getResponse();
    },
};

const GetNextRaceIntentHandler = {
    canHandle(handlerInput: any) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "GetNextRaceIntent"
        );
    },
    handle(handlerInput: any) {
        return handlerInput.responseBuilder
            .speak("A próxima corrida é o GP de Miami no dia 3 de maio.")
            .getResponse();
    },
};

const skill = SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetRankingIntentHandler,
        GetNextRaceIntentHandler
    )
    .create();

export async function POST(req: NextRequest) {
    try {
        // ⚠️ PEGAR RAW BODY (ESSENCIAL)
        const rawBody = await req.text();

        // Headers da Alexa
        const signature = req.headers.get("signature") || "";
        const certUrl = req.headers.get("signaturecertchainurl") || "";

        // 🔐 VALIDAÇÃO
        const isValid = await new Promise<boolean>((resolve) => {
            verifier(rawBody, certUrl, signature, (err: any) => {
                if (err) {
                    console.error("Erro na validação:", err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

        if (!isValid) {
            return new Response("Invalid request", { status: 400 });
        }

        // Parse depois da validação
        const body = JSON.parse(rawBody);

        const response = await skill.invoke(body);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Erro geral:", error);
        return new Response("Erro interno", { status: 500 });
    }
}


/*import { NextRequest } from "next/server";

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
}*/
