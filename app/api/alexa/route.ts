import express from "express";
import { SkillBuilders } from "ask-sdk-core";
import { ExpressAdapter } from "ask-sdk-express-adapter";

// força node runtime
export const runtime = "nodejs";

const app = express();

// ⚠️ precisa raw body
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

const LaunchRequestHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput: any) {
        return handlerInput.responseBuilder
            .speak("Bem-vindo ao Bolão de Fórmula Um!")
            .reprompt("Você pode perguntar o ranking.")
            .getResponse();
    },
};

const GetRankingIntentHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "GetRankingIntent";
    },
    handle(handlerInput: any) {
        return handlerInput.responseBuilder
            .speak("O líder é Ricardo com 141 pontos.")
            .getResponse();
    },
};

const skill = SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetRankingIntentHandler
    )
    .create();

// 🔐 adapter faz validação automática
const adapter = new ExpressAdapter(skill, true, true);

app.post("/api/alexa", adapter.getRequestHandlers());

// exporta handler pro Next
export async function POST(req: Request): Promise<Response> {
    try {
        return await new Promise<Response>((resolve) => {
            app(req as any, {
                end: (body: any) => {
                    resolve(new Response(body, { status: 200 }));
                }
            } as any);
        });
    } catch (error) {
        console.error(error);
        return new Response("Erro interno", { status: 500 });
    }
}