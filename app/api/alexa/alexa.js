// arquivo: /api/alexa.js

export default function handler(req, res) {
    // Alexa envia um JSON com o "intent" solicitado
    const intent = req.body?.request?.intent?.name;

    let resposta = "Desculpe, não entendi sua solicitação.";

    if (intent === "GetRankingIntent") {
        // Aqui você pode buscar dados reais do seu bolão
        resposta = "O líder do bolão é Ricardo com 141 pontos.";
    }

    if (intent === "GetNextRaceIntent") {
        resposta = "A próxima corrida é o GP de Miami no dia 03 de maio.";
    }

    // Estrutura de resposta que a Alexa espera
    res.status(200).json({
        version: "1.0",
        response: {
            shouldEndSession: true,
            outputSpeech: {
                type: "PlainText",
                text: resposta,
            },
        },
    });
}
