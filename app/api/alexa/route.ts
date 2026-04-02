import { SkillBuilders, HandlerInput } from "ask-sdk-core";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const APP_ID = process.env.ALEXA_ID;

// ==============================
// HANDLERS
// ==============================
const LaunchRequestHandler = {
    canHandle(handlerInput: HandlerInput) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput: HandlerInput) {
        return handlerInput.responseBuilder
            .speak("Bem-vindo ao Bolão de Fórmula Um!")
            .reprompt("Você pode perguntar o ranking.")
            .getResponse();
    },
};

// ==============================
// SKILL
// ==============================
const skill = SkillBuilders.custom()
    .addRequestHandlers(LaunchRequestHandler)
    .create();

// ==============================
// ROUTE (VERCEL)
// ==============================
export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();

        console.log("=== REQUEST BODY ===");
        console.log(JSON.stringify(body, null, 2));

        console.log("=== HEADERS ===");
        req.headers.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        // 🔒 Validação mínima (recomendada)
        if (body?.session?.application?.applicationId !== APP_ID) {
            console.log("❌ APP_ID inválido");
            return new Response("Unauthorized", { status: 401 });
        }

        console.log("✅ Requisição válida");

        // 🎯 Executa skill
        const response = await skill.invoke(body);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });

    } catch (error) {
        console.error("❌ ERRO GERAL:", error);
        return new Response("Erro interno", { status: 500 });
    }
}

/*

-- SECURE CODE HOWEVER VERCEL REMOVE SENSIBLE DATA

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
        console.log("=== HEADERS DEBUG ===");

        req.headers.forEach((value, key) => {
            console.log(key.toLowerCase(), ":", value);
        });

        console.log("=== HEADERS DEBUG END ===");

        const response = await skill.invoke(body);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("ERRO:", error);
        return new Response("Erro interno", { status: 500 });
    }
}*/