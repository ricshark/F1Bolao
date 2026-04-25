import { URLSearchParams } from 'url';

let alexaToken: string | null = null;
let tokenExpiration: number = 0;

/**
 * Obtém o token de acesso da Alexa usando as credenciais do Skill Messaging.
 * Implementa retry para erro 500 e tratamento para escopos.
 */
async function getAlexaAccessToken() {
    if (alexaToken && Date.now() < tokenExpiration) {
        return alexaToken;
    }

    const clientId = process.env.ALEXA_CLIENT_ID;
    const clientSecret = process.env.ALEXA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("ALEXA_CLIENT_ID ou ALEXA_CLIENT_SECRET não configurados.");
    }

    // Usamos o escopo de Lembretes como alvo principal
    const scopeName = 'alexa::alerts:reminders:skill:readwrite';
    let lastError = null;
    
    // Tentamos até 3 vezes com intervalo em caso de erro 500
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            // Logando 40 caracteres para ver o ID real
            console.log(`[Alexa Debug] ID: ${clientId.trim().substring(0, 40)}...`);
            
            // TESTE: Removendo o SCOPE para ver se o erro 500 para
            const response = await fetch('https://api.amazon.com/auth/o2/token', {
                method: 'POST',
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: clientId.trim(),
                    client_secret: clientSecret.trim()
                }).toString()
            });

            if (response.ok) {
                const data = await response.json();
                alexaToken = data.access_token;
                tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;
                return alexaToken;
            } else {
                const errText = await response.text();
                lastError = `Status ${response.status}: ${errText}`;
                
                // Se for 500, espera 5 segundos e tenta de novo
                if (response.status === 500 && attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                // Se for 400 (invalid_scope), não adianta tentar de novo
                break; 
            }
        } catch (e: any) {
            lastError = e.message;
            if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    throw new Error(`Erro ao obter token da Alexa: ${lastError}`);
}

/**
 * Cria um lembrete para o usuário que dispara após 10 segundos (para teste/aviso imediato).
 * Esta função é preparada para o futuro: assim que a permissão for liberada no console, funcionará.
 */
export async function sendAlexaNotification(alexaUserId: string, message: string) {
    try {
        const token = await getAlexaAccessToken();
        
        // Endpoint para Reminders
        const endpoint = 'https://api.amazonalexa.com/v1/alerts/reminders';
        
        const payload = {
            displayInformation: [
                {
                    content: [
                        {
                            locale: "pt-BR",
                            text: message
                        }
                    ]
                }
            ],
            trigger: {
                type: "SCHEDULED_RELATIVE",
                offsetInSeconds: 10
            },
            alertInfo: {
                spokenInfo: {
                    content: [
                        {
                            locale: "pt-BR",
                            text: `Olá! Este é um lembrete do F1 Bolão. ${message}`
                        }
                    ]
                }
            },
            pushNotification: {
                status: "ENABLED"
            }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.warn(`Alexa API recusou o lembrete (pode ser falta de permissão no Manifesto): ${response.status} - ${err}`);
            return false;
        }

        console.log(`Lembrete Alexa criado com sucesso para o usuário.`);
        return true;
    } catch (error: any) {
        // Logamos como aviso para não quebrar o fluxo principal do Cron
        console.warn(`Aviso: Não foi possível enviar para Alexa: ${error.message}`);
        return false;
    }
}
