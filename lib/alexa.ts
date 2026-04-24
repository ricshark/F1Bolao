// lib/alexa.ts

/**
 * Funções para interagir com a Alexa Reminders API.
 * Requer que a permissão "Reminders" esteja ativada no Alexa Developer Console.
 */

let alexaToken = '';
let tokenExpiration = 0;

async function getAlexaAccessToken() {
    if (alexaToken && Date.now() < tokenExpiration) {
        return alexaToken;
    }

    const clientId = process.env.ALEXA_CLIENT_ID;
    const clientSecret = process.env.ALEXA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("ALEXA_CLIENT_ID ou ALEXA_CLIENT_SECRET não configurados.");
    }

    const scopeName = 'alexa::alerts:reminders:skill:readwrite';
    let lastError = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId.trim());
        params.append('client_secret', clientSecret.trim());
        params.append('scope', scopeName);

        console.log(`Tentativa ${attempt}: Solicitando token Alexa (Scope: ${scopeName})`);

        try {
            const response = await fetch('https://api.amazon.com/auth/o2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });

            if (response.ok) {
                const data = await response.json();
                alexaToken = data.access_token;
                tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;
                return alexaToken;
            } else {
                const errText = await response.text();
                lastError = `Status ${response.status}: ${errText}`;
                console.warn(`Tentativa ${attempt} falhou: ${lastError}`);
                
                // Se for 500, espera 5 segundos e tenta de novo
                if (response.status === 500 && attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                break; 
            }
        } catch (e: any) {
            lastError = e.message;
            console.warn(`Erro na tentativa ${attempt}: ${lastError}`);
            if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    throw new Error(`Erro ao obter token da Alexa após 3 tentativas. Último erro: ${lastError}`);
}

/**
 * Cria um lembrete para o usuário que dispara quase imediatamente (10 segundos).
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
            console.error(`Erro ao criar lembrete Alexa: ${response.status} - ${err}`);
            // Se for 403, pode ser falta de permissão ou o usuário não deu consentimento
            return false;
        }

        console.log(`Lembrete Alexa criado com sucesso para ${alexaUserId.substring(0, 20)}...`);
        return true;
    } catch (error) {
        console.error("Falha ao processar lembrete Alexa:", error);
        return false;
    }
}
