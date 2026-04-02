import { SkillBuilders } from "ask-sdk-core";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// ⚠️ desativa verificação manual (para teste)
const skill = SkillBuilders.custom()
    .addRequestHandlers({
        canHandle(handlerInput: any) {
            return handlerInput.requestEnvelope.request.type === "LaunchRequest";
        },
        handle(handlerInput: any) {
            return handlerInput.responseBuilder
                .speak("Bem-vindo ao Bolão de Fórmula Um!")
                .reprompt("Você pode perguntar o ranking.")
                .getResponse();
        },
    })
    .create();

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();

        console.log("REQUEST:", body);
        //console.log("HEADERS:", [...req.headers]);
        console.log("=== HEADERS START ===");

        req.headers.forEach((value, key) => {
            console.log(key + ": " + value);
        });

        console.log("=== HEADERS END ===");

        const response = await skill.invoke(body);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("ERRO:", error);
        return new Response("Erro interno", { status: 500 });
    }
}