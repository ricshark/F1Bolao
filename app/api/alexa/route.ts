import { SkillBuilders } from "ask-sdk-core";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const APP_ID = process.env.ALEXA_ID;

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

function isValidAlexaRequest(body: any, headers: Headers): boolean {
    try {
        // 1. Estrutura básica
        if (!body?.request || !body?.context || !body?.session) {
            return false;
        }

        // 2. Application ID
        if (body?.session?.application?.applicationId !== APP_ID) {
            return false;
        }

        // 3. Timestamp (até 150 segundos)
        const requestTime = new Date(body.request.timestamp).getTime();
        const now = Date.now();
        const diff = Math.abs(now - requestTime);

        if (diff > 150000) {
            console.log("Timestamp inválido");
            return false;
        }

        // 4. Origem esperada
        const forwarded = headers.get("forwarded") || "";
        if (!forwarded.includes("proto=https")) {
            return false;
        }

        // 5. User agent (heurística)
        const userAgent = headers.get("user-agent") || "";
        if (!userAgent.toLowerCase().includes("amazon")) {
            console.log("User-Agent suspeito:", userAgent);
        }

        return true;

    } catch (err) {
        console.error("Erro na validação:", err);
        return false;
    }
}

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();

        console.log("REQUEST:", body);

        req.headers.forEach((value, key) => {
            console.log(key + ": " + value);
        });

        // 🔒 VALIDAÇÃO CUSTOM
        if (!isValidAlexaRequest(body, req.headers)) {
            console.log("❌ Requisição inválida");
            return new Response("Unauthorized", { status: 401 });
        }

        console.log("✅ Requisição válida");

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