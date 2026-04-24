// lib/alexa.ts

/**
 * Funções para interagir com a Alexa Proactive Events API.
 * Requer configuração de ALEXA_CLIENT_ID e ALEXA_CLIENT_SECRET.
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

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'alexa::proactive_events');

    const response = await fetch('https://api.amazon.com/auth/o2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Erro ao obter token da Alexa: ${response.status} - ${err}`);
    }

    const data = await response.json();
    alexaToken = data.access_token;
    // Expira em: expires_in (segundos). Subtrair 60s para margem de segurança.
    tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;

    return alexaToken;
}

export async function sendAlexaNotification(alexaUserId: string, message: string) {
    try {
        const token = await getAlexaAccessToken();
        
        // Usamos o ambiente de desenvolvimento por padrão (mude para produção quando aprovar a skill)
        const endpoint = 'https://api.amazonalexa.com/v1/proactiveEvents/stages/development';
        
        const payload = {
            timestamp: new Date().toISOString(),
            referenceId: `f1bolao-notif-${Date.now()}`,
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
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
                type: "Unicast",
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
