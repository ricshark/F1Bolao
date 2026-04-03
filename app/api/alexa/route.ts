// /api/alexa
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const user = searchParams.get("user");

        // Aqui você conecta ao seu banco real
        const points = 141; // mock, depois pega do MongoDB

        return NextResponse.json({
            success: true,
            speech: `Você ${user}tem ${points} pontos no bolão`
        }, {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            speech: "Erro ao buscar sua pontuação"
        }, { status: 500 });
    }
}

/* 1ST CODE

//===========================================================================================================================================
// FINAL CODE 
// REMARK: This code only works when you have your own domain. 
// It doesn't work with vercel.app. Identified issue: "Certificate for host 'f1-bolao-three.vercel.app' contains wildcard '*.vercel.app'"
//============================================================================================================================================

import { SkillBuilders } from "ask-sdk-core";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const APP_ID = process.env.ALEXA_ID;

// =========================
// HANDLER
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
// SKILL COMO LAMBDA
// =========================
const alexaHandler = SkillBuilders.custom()
    .addRequestHandlers(LaunchRequestHandler)
    .lambda();

// =========================
// VALIDAÇÃO
// =========================
function isValidAlexaRequest(body: any): boolean {
    try {
        const appId =
            body?.session?.application?.applicationId ||
            body?.context?.System?.application?.applicationId;

        if (appId !== APP_ID) {
            console.log("❌ App ID inválido:", appId);
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

// =========================
// ROUTE
// =========================
export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();

        console.log("📩 REQUEST RECEBIDO");

        if (!isValidAlexaRequest(body)) {
            return new Response("Unauthorized", { status: 401 });
        }

        console.log("✅ Requisição válida");

        // 🔥 PROMISE WRAP (ESSENCIAL)
        const response = await new Promise((resolve, reject) => {
            alexaHandler(body, null, (err: any, result: any) => {
                if (err) {
                    console.error("❌ ERRO ALEXA:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        console.log("📤 RESPONSE:");
        console.log(JSON.stringify(response, null, 2));

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("🔥 ERRO GERAL:", error);
        return new Response("Erro interno", { status: 500 });
    }
}
*/






/*

2ND CODE

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