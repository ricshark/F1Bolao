// lib/alexa.ts
export async function getAlexaUserEmail(apiAccessToken: string): Promise<string | null> {
    try {
        const response = await fetch(
            "https://api.amazonalexa.com/v2/accounts/~current/settings/Profile.email",
            {
                headers: {
                    Authorization: `Bearer ${apiAccessToken}`
                }
            }
        );

        if (!response.ok) {
            console.error("Erro ao buscar email do usuário Alexa:", response.statusText);
            return null;
        }

        const email = await response.text();
        console.log("Email do usuário Alexa:", email);
        return email;
    } catch (err) {
        console.error("Erro na chamada ao Profile API:", err);
        return null;
    }
}
