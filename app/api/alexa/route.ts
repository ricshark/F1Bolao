import { SkillBuilders } from "ask-sdk-core";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const APP_ID = process.env.ALEXA_ID;

// =========================
// HANDLERS
// =========================
const LaunchRequestHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput: any) {
        console.log("🚀 LaunchRequest disparado");

        return handlerInput.responseBuilder
            .speak("Bem-vindo ao Bolão de Fórmula Um!")
            .reprompt("Você pode perguntar o ranking.")
            .getResponse();
    },
};

// =========================
// SKILL
// =========================
const skill = SkillBuilders.custom()
    .addRequestHandlers(LaunchRequestHandler)
    .create();

// =========================
// VALIDAÇÃO SIMPLES (SAFE PRA VERCEL)
// =========================
function isValidAlexaRequest(body: any): boolean {
    try {
        // Estrutura mínima
        if (!body?.request || !body?.context) {
            console.log("❌ Estrutura inválida");
            return false;
        }

        // Application ID (aceita session OU context)
        const appId =
            body?.session?.application?.applicationId ||
            body?.context?.System?.application?.applicationId;

        if (appId !== APP_ID) {
            console.log("❌ App ID inválido:", appId);
            return false;
        }

        // Timestamp (até 150s)
        const requestTime = new Date(body.request.timestamp).getTime();
        const now = Date.now();
        const diff = Math.abs(now - requestTime);

        if (diff > 150000) {
            console.log("❌ Timestamp inválido:", diff);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Erro validação:", err);
        return false;
    }
}

// =========================
// ROUTE
// =========================
export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();

        console.log("📩 REQUEST RECEBIDO:");
        console.log(JSON.stringify(body, null, 2));

        // 🔒 Validação
        if (!isValidAlexaRequest(body)) {
            console.log("❌ Requisição inválida");
            return new Response("Unauthorized", { status: 401 });
        }

        console.log("✅ Requisição válida");

        // 🚀 EXECUTA SKILL
        const response = await skill.invoke(body);

        console.log("📤 RESPONSE:");
        console.log(JSON.stringify(response, null, 2));

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });

    } catch (error) {
        console.error("🔥 ERRO:", error);
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