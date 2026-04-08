// lib/alexa.ts
export async function getAlexaUserEmail(consentToken: string): Promise<string | null> {
    try {
        const response = await fetch(
            "https://api.amazonalexa.com/v2/accounts/~current/settings/Profile.email",
            {
                headers: {
                    Authorization: `Bearer ${consentToken}`
                }
            }
        );

        if (!response.ok) {
            console.error("Erro ao buscar email do usuário Alexa:", response.statusText);
            return null;
        }

        const email = await response.text();
        return email;
    } catch (err) {
        console.error("Erro na chamada ao Profile API:", err);
        return null;
    }
}
