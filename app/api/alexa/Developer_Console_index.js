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
                .speak('Opa, tivemos uma rodada na pista! Ocorreu um erro ao acessar o bolão.')
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
                .speak('Tivemos um problema de telemetria! Ocorreu um erro ao acessar as informações da corrida.')
                .reprompt('Aperte o cinto e tente novamente ou pergunte seu ranking.')
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
                    .speak(`Estratégia definida! Seu palpite foi registrado com sucesso: ${piloto1}, ${piloto2} e ${piloto3}. Agora é torcer para que eles cruzem a linha de chegada nessas posições!`)
                    .reprompt('Deseja conferir sua posição no campeonato ou saber quando será a próxima largada?')
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(result.message || 'Houve um erro no reabastecimento! Não consegui registrar seu palpite no momento.')
                    .reprompt('Tente novamente ou pergunte sua pontuação no ranking.')
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
            'Ha, gostou? Diga "me faça rir um pouco" para mais uma! Ou pergunte sobre o "último pódio".',
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
            'O Bolão F1 coloca você no cockpit! Veja o que você pode fazer: ' +

            'Para conferir sua performance no campeonato, diga: ranking. ' +

            'Para saber quando será a próxima largada, diga: próxima corrida. ' +

            'Para definir sua estratégia e registrar um palpite, diga por exemplo: meu palpite é Hamilton, Norris e Piastri. ' +

            'Para relembrar suas escolhas, diga: meus palpites. ' +

            'Para ouvir as notícias do paddock, diga: últimas notícias. ' +

            'Para ver quem tem mais chance de ganhar, diga: probabilidade próxima corrida. ' +

            'E para dar uma risada, diga: Contar Piada! ' +

            'O sinal está verde! O que você gostaria de fazer?';

        const repromptOutput =
            'Diga "ranking", "próxima corrida" ou "meu palpite é" seguido dos três pilotos. O que vai ser?';

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
    .addErrorHandlers({
        canHandle() { return true; },
        handle(handlerInput, error) {
            console.log('Erro Lambda:', error);
            return handlerInput.responseBuilder
                .speak('Tivemos uma falha mecânica! O safety car já está na pista. Tente novamente em instantes.')
                .reprompt('Diga "ranking", "próxima corrida" ou "meu palpite é" para continuar.')
                .getResponse();
        }
    })
    .withApiClient(new Alexa.DefaultApiClient()) // Necessário para acessar o perfil do usuário
    .lambda();
