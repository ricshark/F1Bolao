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

function callGetPalpiteAPI(userId, raceName) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            userId,
            raceName
        });

        const options = {
            hostname: 'f1-bolao-three.vercel.app',
            path: '/api/alexa/get-palpite',
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
            .speak('Bem-vindo ao Fórmula 1 Bolão! Você pode perguntar sua pontuação, a próxima corrida ou registrar seus palpites.')
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
// Dicionário de aliases para normalizar nomes
const pilotoAliases = {
    // Mercedes
    "hamilton": "Lewis Hamilton",
    "reminton": "Lewis Hamilton",
    "amilton": "Lewis Hamilton",
    "luís hamilton": "Lewis Hamilton",
    "lewis hamiltom": "Lewis Hamilton",
    "lewis hamilton": "Lewis Hamilton",
    "russel": "George Russell",
    "jorge russel": "George Russell",
    "george russel": "George Russell",
    "george russell": "George Russell",

    // Ferrari
    "leclerc": "Charles Leclerc",
    "lek": "Charles Leclerc",
    "le clerc": "Charles Leclerc",
    "le clerk": "Charles Leclerc",
    "Charles": "Charles Leclerc",
    "charles leclér": "Charles Leclerc",
    "charles leclerc": "Charles Leclerc",
    "sainz": "Carlos Sainz",
    "carlos sainz": "Carlos Sainz",
    "carlos sainz jr": "Carlos Sainz",

    // Red Bull
    "verstapen": "Max Verstappen",
    "max verstapen": "Max Verstappen",
    "max verstappen": "Max Verstappen",
    "pérez": "Sergio Perez",
    "sergio pérez": "Sergio Perez",
    "checo pérez": "Sergio Perez",

    // McLaren
    "norris": "Lando Norris",
    "lando norris": "Lando Norris",
    "piastri": "Oscar Piastri",
    "piastre": "Oscar Piastri",
    "oscar piastre": "Oscar Piastri",

    // Aston Martin
    "alonso": "Fernando Alonso",
    "fernando alonso": "Fernando Alonso",
    "stroll": "Lance Stroll",
    "lance stroll": "Lance Stroll",

    // Alpine
    "gasly": "Pierre Gasly",
    "Pierre": "Pierre Gasly",
    "pierre gasly": "Pierre Gasly",
    "ocon": "Esteban Ocon",
    "esteban ocon": "Esteban Ocon",

    // Williams
    "Alexander": "Alexander Albon",
    "albon": "Alexander Albon",
    "alex albon": "Alexander Albon",
    "sargeant": "Logan Sargeant",
    "logan sargent": "Logan Sargeant",

    // Haas
    "Nico": "Nico Hulkenberg",
    "hulkenberg": "Nico Hulkenberg",
    "nico hulkenberg": "Nico Hulkenberg",
    "magnussen": "Kevin Magnussen",
    "kevin magnussen": "Kevin Magnussen",

    // Kick Sauber
    "Valtteri": "Valtteri Bottas",
    "bottas": "Valtteri Bottas",
    "valtteri bottas": "Valtteri Bottas",
    "zhou": "Guanyu Zhou",
    "guan yu zhou": "Guanyu Zhou",
    "guanyu zhou": "Guanyu Zhou"
};


function normalizarPiloto(nome) {
    if (!nome) return null;
    const chave = nome.toLowerCase().trim();
    return pilotoAliases[chave] || nome; // se não achar alias, mantém original
}

const RegistrarPalpiteIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegistrarPalpiteIntent';
    },
    async handle(handlerInput) {
        try {
            const userId = handlerInput.requestEnvelope.session.user.userId;
            const slots = handlerInput.requestEnvelope.request.intent.slots;

            // Normaliza os nomes recebidos
            const piloto1 = normalizarPiloto(slots.firstplace.value);
            const piloto2 = normalizarPiloto(slots.secondplace.value);
            const piloto3 = normalizarPiloto(slots.thirdplace.value);

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
// GET PALPITE INTENT
// =============================

const GetPalpiteIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetPalpiteIntent';
    },
    async handle(handlerInput) {
        try {
            const userId = handlerInput.requestEnvelope.session.user.userId;
            const slots = handlerInput.requestEnvelope.request.intent.slots;
            const raceName = slots.race ? slots.race.value : null;

            const result = await callGetPalpiteAPI(userId, raceName);

            if (result.success) {
                return handlerInput.responseBuilder
                    .speak(result.message)
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(result.message || 'Não consegui obter seus palpites no momento.')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao chamar API get-palpite:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao buscar seus palpites.')
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
        GetPalpiteIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
