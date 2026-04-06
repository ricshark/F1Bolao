const Alexa = require('ask-sdk-core');
const https = require('https');

// =============================
// FUNÇÕES PARA CHAMAR SUAS APIS
// =============================
function callUsersRankingAPI() {
    return new Promise((resolve, reject) => {
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

function callRegisterPalpiteAPI(userId, piloto1, piloto2, piloto3) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            userId,
            piloto1,
            piloto2,
            piloto3
        });

        const options = {
            hostname: 'f1-bolao-three.vercel.app',
            path: '/api/alexa/register-palpite',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
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
            .speak('Bem-vindo ao Fórmula Uno Bolão! Você pode perguntar sua pontuação, a próxima corrida ou registrar seus palpites.')
            .reprompt('Diga, por exemplo: "Qual é meu ranking?" ou "Meu palpite é Hamilton, Russell e Piastri".')
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
            const data = await callUsersRankingAPI();

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
            const data = await callNextRaceAPI();

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
// REGISTRAR PALPITE INTENT
// =============================
const RegistrarPalpiteIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegistrarPalpiteIntent';
    },
    async handle(handlerInput) {
        try {
            const userId = handlerInput.requestEnvelope.session.user.userId;
            const slots = handlerInput.requestEnvelope.request.intent.slots;

            const piloto1 = slots.firstplace.value;
            const piloto2 = slots.secondplace.value;
            const piloto3 = slots.thirdplace.value;

            const result = await callRegisterPalpiteAPI(userId, piloto1, piloto2, piloto3);

            if (result.success) {
                return handlerInput.responseBuilder
                    .speak(`Seu palpite foi registrado: ${piloto1}, ${piloto2} e ${piloto3}.`)
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(result.message || 'Não consegui registrar seu palpite no momento.')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao registrar palpite:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao registrar seu palpite.')
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
            .speak('Você pode me pedir sua pontuação, perguntar a próxima corrida ou registrar seus palpites.')
            .reprompt('Por exemplo, diga "Qual é meu ranking?" ou "Meu palpite é Hamilton, Russell e Piastri".')
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
            .speak('Desculpe, não consegui entender. Você pode perguntar sua pontuação ou registrar palpites.')
            .reprompt('Tente dizer, "Qual é meu ranking?" ou "Meu palpite é Hamilton, Russell e Piastri".')
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
        RegistrarPalpiteIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
