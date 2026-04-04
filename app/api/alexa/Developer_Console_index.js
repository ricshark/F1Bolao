const Alexa = require('ask-sdk-core');
const https = require('https');


// =============================
// FUNÇÃO PARA CHAMAR API NEXT.JS
// =============================
function callUsersRankingAPI() {
    return new Promise((resolve, reject) => {
        // Monta a URL com query string opcional
        //const url = `https://f1-bolao-three.vercel.app/api/alexa?user=${encodeURIComponent(userId)}`;
        const url = `https://f1-bolao-three.vercel.app/api/alexa/users-ranking`;

        https.get(url, (res) => {
            let body = '';

            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

function callNextRaceAPI() {
    return new Promise((resolve, reject) => {
        // Monta a URL com query string opcional
        const url = `https://f1-bolao-three.vercel.app/api/alexa/next-race`;

        https.get(url, (res) => {
            let body = '';

            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}


// =============================
// LAUNCH REQUEST
// =============================
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Bem-vindo ao Fórmula Uno Bolão! Você pode perguntar sua pontuação.')
            .reprompt('Diga, por exemplo: "Qual é meu ranking?"')
            .getResponse();
    }
};

// =============================
// GET RANKING INTENT
// =============================
const GetRankingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetRankingIntent';
    },
    async handle(handlerInput) {
        try {
            const userId = handlerInput.requestEnvelope.session.user.userId;

            // 🔥 Chama sua API Next.js
            const data = await callUsersRankingAPI();

            // Verifica se a API retornou sucesso
            if (data.success) {
                return handlerInput.responseBuilder
                    .speak(data.speech)
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak('Não consegui obter sua pontuação no momento.')
                    .getResponse();
            }

        } catch (error) {
            console.log('Erro ao chamar API:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao acessar o bolão.')
                .getResponse();
        }
    }
};


// =============================
// GET NEXT RACE INTENT
// =============================
const GetNextRaceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNextRaceIntent';
    },
    async handle(handlerInput) {
        try {

            // 🔥 Chama sua API Next.js
            const data = await callNextRaceAPI();

            // Verifica se a API retornou sucesso
            if (data.success) {
                return handlerInput.responseBuilder
                    .speak(data.speech)
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak('Não consegui obter a próxima corrida no momento.')
                    .getResponse();
            }

        } catch (error) {
            console.log('Erro ao chamar API:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao acessar o bolão.')
                .getResponse();
        }
    }
};

// =============================
// HELP / CANCEL / STOP / FALLBACK / ERROR
// =============================
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Você pode me pedir sua pontuação ou perguntar quem está liderando o bolão.')
            .reprompt('Por exemplo, diga "Qual é meu ranking?"')
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Até mais! Boa sorte no bolão.')
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Desculpe, não consegui entender. Você pode perguntar sua pontuação.')
            .reprompt('Tente dizer, "Qual é meu ranking?"')
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log('Erro Lambda:', error);
        return handlerInput.responseBuilder
            .speak('Ocorreu um erro ao processar sua solicitação.')
            .getResponse();
    }
};

// =============================
// EXPORT LAMBDA
// =============================
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetRankingIntentHandler,
        GetNextRaceIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
