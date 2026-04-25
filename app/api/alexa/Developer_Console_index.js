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
            .speak('Luzes apagadas e lá vamos nós! Bem-vindo ao Fórmula 1 Bolão, o lugar onde a emoção das pistas encontra seus palpites certeiros! Você pode conferir sua posição no campeonato, descobrir o próximo destino do circo da F1 ou acelerar e registrar seus palpites agora mesmo!')
            .reprompt('O grid está esperando! Diga, por exemplo: "ranking", "próxima corrida" ou "meu palpite é Hamilton, Norris e Piastri". O que você deseja fazer?')
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
                    .reprompt('O campeonato não para! Você pode perguntar também sobre a próxima corrida ou acelerar registrando seus palpites.')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak('Parece que tivemos uma falha nos boxes e não consegui obter sua pontuação no momento.')
                    .reprompt('Tente perguntar novamente ou peça para registrar seus palpites para a próxima etapa!')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao chamar API:', error);
            return handlerInput.responseBuilder
                .speak('Opa, tivemos uma rodada na pista! O sistema de cronometragem falhou. Tente novamente em instantes.')
                .reprompt('Recupere o controle e tente novamente ou pergunte sobre a próxima corrida.')
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
                    .reprompt('Acelere sua estratégia! Você pode registrar seus palpites agora ou conferir como está o campeonato perguntando seu ranking.')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak('A pista está com bandeira amarela! Não consegui obter informações da próxima corrida no momento.')
                    .reprompt('Tente novamente em alguns instantes ou confira sua posição no ranking.')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao chamar API:', error);
            return handlerInput.responseBuilder
                .speak('Tivemos um problema de telemetria! Não consegui captar o sinal da pista agora. Tente de novo em instantes.')
                .reprompt('Aperte o cinto e tente novamente ou pergunte seu ranking.')
                .getResponse();
        }
    }
};

// =============================
// REGISTRAR PALPITE INTENT
// =============================

// Dicionário de aliases para normalizar nomes dos pilotos
const pilotoAliases = {

    // LEWIS HAMILTON (Ferrari)
    "hamilton": "Lewis Hamilton", "lewis hamilton": "Lewis Hamilton",
    "lewis": "Lewis Hamilton", "lewis hamiltom": "Lewis Hamilton",
    "lewis hamiltton": "Lewis Hamilton", "luís hamilton": "Lewis Hamilton",
    "luis hamilton": "Lewis Hamilton", "louiz hamilton": "Lewis Hamilton",
    "hamiltonn": "Lewis Hamilton", "amilton": "Lewis Hamilton",
    "reminton": "Lewis Hamilton", "hamilton lewis": "Lewis Hamilton",

    // GEORGE RUSSELL (Mercedes)
    "russell": "George Russell", "russel": "George Russell",
    "george russell": "George Russell", "george russel": "George Russell",
    "jorge russel": "George Russell", "jorge russell": "George Russell",
    "jorje russell": "George Russell", "george rassel": "George Russell",
    "rassel": "George Russell",

    // CHARLES LECLERC (Ferrari)
    "leclerc": "Charles Leclerc", "charles leclerc": "Charles Leclerc",
    "charles": "Charles Leclerc", "charles leclér": "Charles Leclerc",
    "charles leclerk": "Charles Leclerc", "charles leclerque": "Charles Leclerc",
    "le clerc": "Charles Leclerc", "le clerk": "Charles Leclerc",
    "lek": "Charles Leclerc", "xarles leclerc": "Charles Leclerc",
    "xarles": "Charles Leclerc", "leclerk": "Charles Leclerc",
    "leclerque": "Charles Leclerc",

    // MAX VERSTAPPEN (Red Bull)
    "verstappen": "Max Verstappen", "max verstappen": "Max Verstappen",
    "max verstapen": "Max Verstappen", "verstapen": "Max Verstappen",
    "max verstepen": "Max Verstappen", "verstepen": "Max Verstappen",
    "max ferstapen": "Max Verstappen", "ferstapen": "Max Verstappen",
    "max ferstappen": "Max Verstappen", "max": "Max Verstappen",

    // YUKI TSUNODA (Red Bull)
    "tsunoda": "Yuki Tsunoda", "yuki tsunoda": "Yuki Tsunoda",
    "yuki": "Yuki Tsunoda", "tsounoda": "Yuki Tsunoda",
    "tunoda": "Yuki Tsunoda", "junoda": "Yuki Tsunoda",
    "tsunoda yuki": "Yuki Tsunoda",

    // LANDO NORRIS (McLaren)
    "norris": "Lando Norris", "lando norris": "Lando Norris",
    "lando": "Lando Norris", "lando nóris": "Lando Norris",
    "lando noris": "Lando Norris", "norris lando": "Lando Norris",

    // OSCAR PIASTRI (McLaren)
    "piastri": "Oscar Piastri", "oscar piastri": "Oscar Piastri",
    "piastre": "Oscar Piastri", "oscar piastre": "Oscar Piastri",
    "piástri": "Oscar Piastri", "piástre": "Oscar Piastri",
    "oscar piástri": "Oscar Piastri", "oscar": "Oscar Piastri",

    // FERNANDO ALONSO (Aston Martin)
    "alonso": "Fernando Alonso", "fernando alonso": "Fernando Alonso",
    "fernando": "Fernando Alonso", "alonsso": "Fernando Alonso",
    "allonso": "Fernando Alonso", "alônso": "Fernando Alonso",

    // LANCE STROLL (Aston Martin)
    "stroll": "Lance Stroll", "lance stroll": "Lance Stroll",
    "lance": "Lance Stroll", "lance estrole": "Lance Stroll",
    "estrole": "Lance Stroll", "estrool": "Lance Stroll",
    "lance estrool": "Lance Stroll",

    // PIERRE GASLY (Alpine)
    "gasly": "Pierre Gasly", "pierre gasly": "Pierre Gasly",
    "pierre": "Pierre Gasly", "piere gasly": "Pierre Gasly",
    "gásli": "Pierre Gasly", "gazly": "Pierre Gasly",
    "gásly": "Pierre Gasly", "pierre gásli": "Pierre Gasly",

    // JACK DOOHAN (Alpine)
    "doohan": "Jack Doohan", "jack doohan": "Jack Doohan",
    "jack": "Jack Doohan", "jack duan": "Jack Doohan",
    "duan": "Jack Doohan", "duham": "Jack Doohan",
    "duhan": "Jack Doohan", "jack duhan": "Jack Doohan",

    // ALEXANDER ALBON (Williams)
    "albon": "Alexander Albon", "alex albon": "Alexander Albon",
    "alexander albon": "Alexander Albon", "alexander": "Alexander Albon",
    "alex": "Alexander Albon", "álbon": "Alexander Albon",
    "albon alex": "Alexander Albon",

    // CARLOS SAINZ (Williams)
    "sainz": "Carlos Sainz", "carlos sainz": "Carlos Sainz",
    "carlos sainz jr": "Carlos Sainz", "carlos": "Carlos Sainz",
    "sainze": "Carlos Sainz", "saínz": "Carlos Sainz",
    "sainz jr": "Carlos Sainz",

    // ESTEBAN OCON (Haas)
    "ocon": "Esteban Ocon", "esteban ocon": "Esteban Ocon",
    "esteban": "Esteban Ocon", "occon": "Esteban Ocon",
    "ocón": "Esteban Ocon", "estebã ocon": "Esteban Ocon",

    // OLIVER BEARMAN (Haas)
    "bearman": "Oliver Bearman", "oliver bearman": "Oliver Bearman",
    "oliver": "Oliver Bearman", "bearmann": "Oliver Bearman",
    "berman": "Oliver Bearman", "oliver berman": "Oliver Bearman",
    "béarman": "Oliver Bearman",

    // NICO HÜLKENBERG (Kick Sauber)
    "hulkenberg": "Nico Hulkenberg", "nico hulkenberg": "Nico Hulkenberg",
    "nico": "Nico Hulkenberg", "hülkenberg": "Nico Hulkenberg",
    "nico hülkenberg": "Nico Hulkenberg",
    "hulkemberg": "Nico Hulkenberg", "nico hulkemberg": "Nico Hulkenberg",
    "hulquenberg": "Nico Hulkenberg", "hulke": "Nico Hulkenberg",

    // GABRIEL BORTOLETO (Kick Sauber) 🇧🇷
    "bortoleto": "Gabriel Bortoleto", "gabriel bortoleto": "Gabriel Bortoleto",
    "gabriel": "Gabriel Bortoleto", "bortoleto": "Gabriel Bortoleto",
    "bortoletto": "Gabriel Bortoleto", "gabriel bortoletto": "Gabriel Bortoleto",
    "gabi bortoleto": "Gabriel Bortoleto", "gabi": "Gabriel Bortoleto",

    // ISACK HADJAR (Racing Bulls)
    "hadjar": "Isack Hadjar", "isack hadjar": "Isack Hadjar",
    "isack": "Isack Hadjar", "isaac hadjar": "Isack Hadjar",
    "hajar": "Isack Hadjar", "isac hadjar": "Isack Hadjar",

    // LIAM LAWSON (Racing Bulls)
    "lawson": "Liam Lawson", "liam lawson": "Liam Lawson",
    "liam": "Liam Lawson", "liam loson": "Liam Lawson",
    "loson": "Liam Lawson", "lison": "Liam Lawson",
    "liom lawson": "Liam Lawson",

    // KIMI ANTONELLI (Mercedes)
    "antonelli": "Kimi Antonelli", "kimi antonelli": "Kimi Antonelli",
    "kimi": "Kimi Antonelli", "antoñelli": "Kimi Antonelli",
    "antonielli": "Kimi Antonelli", "andrea antonelli": "Kimi Antonelli",
    "andrea kimi antonelli": "Kimi Antonelli",

    // PILOTOS ANTERIORES (retrocompatibilidade)
    "pérez": "Sergio Perez", "sergio pérez": "Sergio Perez",
    "checo pérez": "Sergio Perez", "checo": "Sergio Perez",
    "perez": "Sergio Perez", "sergio perez": "Sergio Perez",
    "bottas": "Valtteri Bottas", "valtteri bottas": "Valtteri Bottas",
    "valtteri": "Valtteri Bottas",
    "zhou": "Guanyu Zhou", "guanyu zhou": "Guanyu Zhou",
    "guan yu zhou": "Guanyu Zhou",
    "magnussen": "Kevin Magnussen", "kevin magnussen": "Kevin Magnussen",
    "sargeant": "Logan Sargeant", "logan sargent": "Logan Sargeant"
};




function normalizarPiloto(nome) {
    if (!nome) return null;
    const chave = nome.toLowerCase().trim();
    return pilotoAliases[chave] || nome; // se não achar alias, mantém original
}

// Conjunto de todos os nomes oficiais reconhecidos
const pilotosValidos = new Set(Object.values(pilotoAliases));

function validarPiloto(nomeSlot) {
    if (!nomeSlot) return null;
    const normalizado = normalizarPiloto(nomeSlot);
    return pilotosValidos.has(normalizado) ? normalizado : null;
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
            const rawP1 = slots.firstplace?.value;
            const rawP2 = slots.secondplace?.value;
            const rawP3 = slots.thirdplace?.value;

            const piloto1 = validarPiloto(rawP1);
            const piloto2 = validarPiloto(rawP2);
            const piloto3 = validarPiloto(rawP3);

            // Verifica pilotos não reconhecidos
            const naoReconhecidos = [];
            if (!piloto1 && rawP1) naoReconhecidos.push(`"${rawP1}"`);
            if (!piloto2 && rawP2) naoReconhecidos.push(`"${rawP2}"`);
            if (!piloto3 && rawP3) naoReconhecidos.push(`"${rawP3}"`);

            if (naoReconhecidos.length > 0) {
                const reconhecidos = [
                    piloto1 ? `primeiro: ${piloto1}` : null,
                    piloto2 ? `segundo: ${piloto2}` : null,
                    piloto3 ? `terceiro: ${piloto3}` : null
                ].filter(Boolean);
                const reconhecidosStr = reconhecidos.length > 0
                    ? ` Reconheci ${reconhecidos.join(', ')}.`
                    : '';
                return handlerInput.responseBuilder
                    .speak(`Bandeira vermelha! Não reconheci ${naoReconhecidos.join(' e ')} como piloto da Fórmula 1.${reconhecidosStr} Por favor, tente novamente dizendo o sobrenome completo de cada piloto.`)
                    .reprompt('Diga "meu palpite é" seguido dos três sobrenomes. Por exemplo: "meu palpite é Norris, Piastri e Hamilton".')
                    .getResponse();
            }

            const result = await callRegisterPalpiteAPI(userId, email, piloto1, piloto2, piloto3);

            if (result.success) {
                return handlerInput.responseBuilder
                    .speak(`Estratégia definida! Palpite registrado: ${piloto1} em primeiro, ${piloto2} em segundo e ${piloto3} em terceiro. Agora é torcer para que eles cruzem a linha de chegada nessas posições!`)
                    .reprompt('Quer conferir sua posição no campeonato? Diga "ranking". Ou pergunte sobre a "próxima corrida".')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(result.message || 'Houve um erro no reabastecimento! Não consegui registrar seu palpite no momento.')
                    .reprompt('Tente novamente ou pergunte sua pontuação dizendo "ranking".')
                    .getResponse();
            }
        } catch (error) {
            console.log('Erro ao registrar palpite:', error);
            return handlerInput.responseBuilder
                .speak('Tivemos uma falha mecânica ao registrar seu palpite! Verifique se você deu permissão de e-mail e tente novamente.')
                .reprompt('Você pode tentar novamente ou perguntar a data da próxima corrida.')
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
                .speak('Pit stop forçado! Tivemos uma falha ao buscar seus palpites. Tente novamente em instantes.')
                .reprompt('Diga "meus palpites" para tentar novamente ou "ranking" para ver sua pontuação.')
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
                .reprompt('Quer mais emoção? Diga "próxima corrida", "ranking" ou "últimas notícias".')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('Rádio do carro falhando! Não consegui buscar o pódio agora. Tente novamente em instantes.')
                .reprompt('Diga "último pódio" para tentar de novo ou "ranking" para ver a classificação.')
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
                .reprompt('Hora de definir sua estratégia! Diga "meu palpite é" seguido dos três pilotos que você aposta no pódio. Ou diga "probabilidade próxima corrida" para ouvir novamente.')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('Falha na telemetria! Não consegui carregar as probabilidades agora. Mas você ainda pode registrar seu palpite!')
                .reprompt('Diga "meu palpite é Hamilton, Norris e Piastri" ou pergunte "próxima corrida".')
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
                .reprompt('Quer continuar no paddock? Diga "ranking", "próxima corrida" ou "meu palpite é" seguido dos três pilotos.')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('A conexão com o paddock caiu! Não consegui buscar as notícias agora. Tente de novo em instantes!')
                .reprompt('Diga "últimas notícias" para tentar novamente ou "ranking" para ver sua pontuação.')
                .getResponse();
        }
    }
};



// =============================
// CONTAR PIADA INTENT
// =============================
const piadasF1 = [
    'Por que a Ferrari pintou o carro de vermelho? Para que as chamas combinem com a pintura! 🔥',
    'O que o Alonso disse depois de 20 anos na Fórmula 1? Ainda estou aquecendo os pneus!',
    'Por que o Max Verstappen é tão bom? Porque ele tem Max-imo talento, é claro!',
    'Qual a diferença entre a Haas e um táxi? O táxi às vezes chega no destino!',
    'Por que os pilotos de F1 são péssimos no supermercado? Porque sempre querem ultrapassar no corredor errado!',
    'O que a Ferrari e um celular com bateria fraca têm em comum? Os dois ficam sem energia na pior hora!',
    'Por que o Lewis Hamilton usa sempre preto? Para combinar com a trilha de borracha que ele deixa na pista!',
    'O que o mecânico disse ao piloto antes da largada? Vá lá, acelera! Mas o carro quebrou antes mesmo de sair do pit!',
    'Por que o Leclerc não usa GPS? Porque a Ferrari sempre o manda pelo caminho errado no pit stop!',
    'Qual é o esporte favorito do mecânico de F1? Box-e!',
    'O que um piloto de F1 pediu na padaria? Uma pole position de sonho e um pit stop de café!',
    'Por que os pilotos dormem bem antes de cada corrida? Porque sabem que depois de uma curva, sempre vem uma reta!',
    'O que tem 20 pilotos e 1 vencedor? Uma corrida de Fórmula 1! Mas se perguntar à Ferrari, eles dizem que tem 20 pilotos e zero vencedores!',
    'Por que a Williams é como uma festa surpresa? Porque nunca se sabe o que vai acontecer!',
    'O que um pit stop e um casamento têm em comum? Tudo depende de uma boa equipe e de bom tempo!'
];

const ContarPiadaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ContarPiadaIntent';
    },
    handle(handlerInput) {
        const piada = piadasF1[Math.floor(Math.random() * piadasF1.length)];
        const reprompts = [
            'Quer ouvir mais uma? Diga "Contar Piada" para mais uma risada! Ou posso te ajudar com "ranking" ou "próxima corrida".',
            'Ha, gostou? Diga "me faça rir um pouco" para mais uma! Ou pergunte seu "ranking" para ver como está no campeonato.',
            'Boa essa! Diga "Contar Piada de Formula um" para mais uma ou "ranking" para ver sua pontuação!'
        ];
        const reprompt = reprompts[Math.floor(Math.random() * reprompts.length)];

        return handlerInput.responseBuilder
            .speak(piada)
            .reprompt(reprompt)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput =
            'O Bolão F1 é o seu rádio de equipe! Aqui estão todos os comandos que você pode usar: ' +
            
            '1. Para ver sua pontuação e posição, diga: "ranking". ' +
            
            '2. Para saber os detalhes da próxima etapa, diga: "próxima corrida". ' +
            
            '3. Para registrar sua aposta, diga: "meu palpite é", seguido do nome de três pilotos. ' +
            
            '4. Para relembrar suas apostas feitas, diga: "meus palpites". ' +
            
            '5. Para saber quem subiu no pódio na última etapa, diga: "último pódio". ' +
            
            '6. Para ouvir as fofocas e novidades do paddock, diga: "últimas notícias". ' +
            
            '7. Para ver quem a comunidade acha que vai ganhar, diga: "probabilidade próxima corrida". ' +
            
            '8. E para relaxar um pouco, diga: "Contar Piada". ' +

            'Ficou com alguma dúvida sobre algum desses comandos ou quer acelerar com um deles agora?';

        const repromptOutput =
            'Estou à disposição nos boxes! Qual desses comandos você quer usar agora? Ranking, próxima corrida, palpite ou quem sabe uma piada?';

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
            .speak('Bandeira quadriculada! Sua sessão terminou por agora, mas os motores continuam roncando. Volte logo para não perder a pole position no bolão! Até mais!')
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
            .speak('Desculpe, saímos da pista! Não consegui entender o que você disse. Você pode perguntar sua pontuação ou registrar palpites para a próxima etapa.')
            .reprompt('Tente dizer: "ranking", "próxima corrida" ou "meus palpites".')
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
            .speak('Tivemos uma falha mecânica grave! Mas o safety car já está na pista. Tente novamente em instantes.')
            .reprompt('Diga "ranking", "próxima corrida" ou "meu palpite é" para continuar.')
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
        ContarPiadaIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient()) // Necessário para acessar o perfil do usuário
    .lambda();
