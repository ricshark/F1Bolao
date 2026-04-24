const Alexa = require('ask-sdk-core');
const https = require('https');

// =============================
// FUNÇÕES PARA CHAMAR SUAS APIS
// =============================
function callUsersRankingAPI(userId, email) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ userId, email });
        const options = {
            hostname: 'f1-bolao-three.vercel.app',
            path: '/api/alexa/users-ranking',
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
                try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callNextRaceAPI(userId, email) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ userId, email });
        const options = {
            hostname: 'f1-bolao-three.vercel.app',
            path: '/api/alexa/next-race',
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
                try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callRegisterPalpiteAPI(userId, email, piloto1, piloto2, piloto3) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            userId,
            email,
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
                try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callGetPalpiteAPI(userId, email, raceName) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            userId,
            email,
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
                try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callLastRacePodiumAPI(userId, email) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ userId, email });
        const options = {
            hostname: 'f1-bolao-three.vercel.app',
            path: '/api/alexa/last-race-podium',
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
                try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callNextRaceProbabilityAPI(userId, email) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ userId, email });
        const options = {
            hostname: 'f1-bolao-three.vercel.app',
            path: '/api/alexa/next-race-probability',
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
                try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callNewsAPI(userId, email) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ userId, email });
        const options = {
            hostname: 'f1-bolao-three.vercel.app',
            path: '/api/alexa/news',
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
                try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
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
            const userId = handlerInput.requestEnvelope.context.System.user.userId;
            let email = null;
            try {
                const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
                email = await upsServiceClient.getProfileEmail();
            } catch (e) {
                console.log('E-mail não disponível');
            }

            const data = await callUsersRankingAPI(userId, email);

            if (data.success) {
                return handlerInput.responseBuilder
                    .speak(data.speech)
                    .reprompt('Você pode perguntar também sobre a próxima corrida ou registrar seus palpites.')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak('Não consegui obter sua pontuação no momento.')
                    .reprompt('Tente perguntar novamente ou peça para registrar seus palpites.')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao chamar API:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao acessar o bolão.')
                .reprompt('Você pode tentar novamente ou perguntar sobre a próxima corrida.')
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
            const userId = handlerInput.requestEnvelope.context.System.user.userId;
            let email = null;
            try {
                const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
                email = await upsServiceClient.getProfileEmail();
            } catch (e) { }

            const data = await callNextRaceAPI(userId, email);

            if (data.success) {
                return handlerInput.responseBuilder
                    .speak(data.speech)
                    .reprompt('Você pode registrar seus palpites ou perguntar seu ranking.')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak('Não consegui obter a próxima corrida no momento.')
                    .reprompt('Você pode tentar novamente ou perguntar seu ranking.')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao chamar API:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao acessar o bolão.')
                .reprompt('Você pode tentar novamente ou perguntar seu ranking.')
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
            const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
            const email = await upsServiceClient.getProfileEmail();
            const userId = handlerInput.requestEnvelope.context.System.user.userId;

            if (!email) {
                return handlerInput.responseBuilder
                    .speak('Não consegui acessar seu e-mail. Por favor, habilite a permissão de e-mail na Skill do aplicativo Alexa.')
                    .reprompt('Você pode habilitar a permissão e depois registrar seus palpites novamente.')
                    .getResponse();
            }

            const slots = handlerInput.requestEnvelope.request.intent.slots;
            const piloto1 = normalizarPiloto(slots.firstplace.value);
            const piloto2 = normalizarPiloto(slots.secondplace.value);
            const piloto3 = normalizarPiloto(slots.thirdplace.value);

            const result = await callRegisterPalpiteAPI(userId, email, piloto1, piloto2, piloto3);

            if (result.success) {
                return handlerInput.responseBuilder
                    .speak(`Seu palpite foi registrado: ${piloto1}, ${piloto2} e ${piloto3}.`)
                    .reprompt('Você pode perguntar seu ranking ou a próxima corrida.')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(result.message || 'Não consegui registrar seu palpite no momento.')
                    .reprompt('Tente novamente ou pergunte seu ranking.')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao registrar palpite:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao registrar seu palpite.')
                .reprompt('Você pode tentar novamente ou perguntar a próxima corrida.')
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
            const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
            const email = await upsServiceClient.getProfileEmail();

            if (!email) {
                return handlerInput.responseBuilder
                    .speak('Não consegui acessar seu e-mail. Por favor, habilite a permissão de e-mail na Skill do aplicativo Alexa.')
                    .reprompt('Você pode habilitar a permissão e depois perguntar seus palpites novamente.')
                    .getResponse();
            }

            const slots = handlerInput.requestEnvelope.request.intent.slots;
            const raceName = slots.race ? slots.race.value : null;
            const userId = handlerInput.requestEnvelope.context.System.user.userId;

            const result = await callGetPalpiteAPI(userId, email, raceName);

            if (result.success) {
                return handlerInput.responseBuilder
                    .speak(result.message)
                    .reprompt('Você pode perguntar também seu ranking ou registrar novos palpites.')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(result.message || 'Não consegui obter seus palpites no momento.')
                    .reprompt('Tente novamente ou pergunte sobre a próxima corrida.')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao chamar API get-palpite:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao buscar seus palpites.')
                .reprompt('Você pode tentar novamente ou perguntar seu ranking.')
                .getResponse();
        }
    }
};

// =============================
// NOVIDADES INTENTS
// =============================

const GetLastRacePodiumIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetLastRacePodiumIntent';
    },
    async handle(handlerInput) {
        try {
            const userId = handlerInput.requestEnvelope.context.System.user.userId;
            let email = null;
            try {
                const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
                email = await upsServiceClient.getProfileEmail();
            } catch (e) { }

            const data = await callLastRacePodiumAPI(userId, email);
            return handlerInput.responseBuilder
                .speak(data.speech)
                .reprompt('Deseja saber mais alguma coisa?')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao buscar o pódio.')
                .getResponse();
        }
    }
};

const GetNextRaceProbabilityIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNextRaceProbabilityIntent';
    },
    async handle(handlerInput) {
        try {
            const userId = handlerInput.requestEnvelope.context.System.user.userId;
            let email = null;
            try {
                const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
                email = await upsServiceClient.getProfileEmail();
            } catch (e) { }

            const data = await callNextRaceProbabilityAPI(userId, email);
            return handlerInput.responseBuilder
                .speak(data.speech)
                .reprompt('Você pode registrar seu palpite agora. Diga quem você acha que vai ganhar.')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao buscar as probabilidades.')
                .getResponse();
        }
    }
};

const GetFOneNewsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetFOneNewsIntent';
    },
    async handle(handlerInput) {
        try {
            const userId = handlerInput.requestEnvelope.context.System.user.userId;
            let email = null;
            try {
                const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
                email = await upsServiceClient.getProfileEmail();
            } catch (e) { }

            const data = await callNewsAPI(userId, email);
            return handlerInput.responseBuilder
                .speak(data.speech)
                .reprompt('Deseja realizar mais alguma ação?')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao buscar as notícias.')
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
        const speakOutput =
            'Aqui estão algumas coisas que você pode fazer no Fórmula 1 Bolão. ' +

            'Para saber sua pontuação no ranking, diga: ranking. ' +

            'Para saber a próxima corrida, diga: próxima corrida. ' +

            'Para registrar seu palpite, diga por exemplo: meu palpite é Hamilton, Russell e Piastri. ' +

            'Para consultar seu palpite já registrado, diga: meus palpites. ' +

            'Você também pode especificar a corrida, dizendo por exemplo: qual é o meu palpite para o Grande Prêmio do Brasil. ' +

            'Para se interar das notícias da Fórmula 1, diga: últimas notícias. ' +

            'O que você gostaria de fazer?';

        const repromptOutput =
            'Por exemplo, diga: qual é meu ranking, ou: meu palpite é Hamilton, Russell e Piastri.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
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
        GetLastRacePodiumIntentHandler,
        GetNextRaceProbabilityIntentHandler,
        GetFOneNewsIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler
    )
    .addErrorHandlers({
        canHandle() { return true; },
        handle(handlerInput, error) {
            console.log('Erro Lambda:', error);
            return handlerInput.responseBuilder
                .speak('Ocorreu um erro ao processar sua solicitação.')
                .getResponse();
        }
    })
    .withApiClient(new Alexa.DefaultApiClient()) // Necessário para acessar o perfil do usuário
    .lambda();
