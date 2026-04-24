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

    const scopeName = 'alexa::proactive_events';
    let lastError = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        const url = `https://api.amazon.com/auth/o2/token?grant_type=client_credentials&client_id=${encodeURIComponent(clientId.trim())}&client_secret=${encodeURIComponent(clientSecret.trim())}&scope=${encodeURIComponent(scopeName)}`;

        console.log(`Tentativa ${attempt}: Solicitando token Alexa via Query String (Scope: ${scopeName})`);

        try {
            const response = await fetch(url, {
                method: 'POST'
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
 * Envia uma notificação de evento proativo (Yellow Ring) para a Alexa.
 */
export async function sendAlexaNotification(alexaUserId: string, message: string) {
    try {
        const token = await getAlexaAccessToken();
        
        // Endpoint para Proactive Events (mude para produção se a skill estiver LIVE)
        // stages/development ou apis/proactiveEvents/ (produção)
        const endpoint = 'https://api.amazonalexa.com/v1/proactiveEvents/stages/development';
        
        const payload = {
            timestamp: new Date().toISOString(),
            referenceId: `f1bolao-notif-${Date.now()}`,
            expiryTime: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hora
            event: {
                name: "AMAZON.MessageAlert.Activated",
                payload: {
                    state: {
                        status: "UNREAD"
                    },
                    messageGroup: {
                        creator: {
                            name: "Fórmula 1 Bolão"
                        },
                        count: 1
                    }
                }
            },
            relevantAudience: {
                type: "UNICAST",
                payload: {
                    user: alexaUserId
                }
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
            console.error(`Erro ao enviar notificação Alexa: ${response.status} - ${err}`);
            return false;
        }

        console.log(`Notificação Alexa enviada com sucesso para ${alexaUserId.substring(0, 20)}...`);
        return true;
    } catch (error) {
        console.error("Falha ao processar notificação Alexa:", error);
        return false;
    }
}
