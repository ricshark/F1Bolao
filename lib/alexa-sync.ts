import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Sincroniza ou cria um usuário a partir dos dados enviados pela Alexa.
 * @param email E-mail do usuário capturado pela Alexa.
 * @param alexaId ID único do usuário na Alexa.
 * @param name Nome opcional capturado pela Alexa.
 */
export async function syncAlexaUser(email: string, alexaId: string, name?: string) {
    if (!email || !alexaId) return null;

    try {
        await dbConnect();
        
        let user = await User.findOne({ email });

        if (user) {
            // Se o usuário existe, apenas atualiza o alexaId se for diferente
            if (user.alexaId !== alexaId) {
                user.alexaId = alexaId;
                await user.save();
                console.log(`alexaId vinculado ao usuário existente: ${email}`);
            }
            return user;
        } else {
            // Se o usuário não existe, cria um novo
            const tempPass = Math.random().toString(36).slice(-8) + "!A1"; // Gera senha provisória válida (atende a regex)
            const hashedPassword = await bcrypt.hash(tempPass, 10);
            
            const newUser = new User({
                name: name || email.split('@')[0],
                email: email,
                password: hashedPassword,
                alexaId: alexaId,
                isAdmin: false,
                points: 0
            });

            await newUser.save();
            console.log(`Novo usuário criado via Alexa: ${email}`);

            // Envia e-mail de boas vindas com a senha provisória
            try {
                await sendWelcomeEmail(email, newUser.name, tempPass);
                console.log(`E-mail de boas vindas enviado para: ${email}`);
            } catch (emailErr) {
                console.error(`Falha ao enviar e-mail de boas vindas para ${email}:`, emailErr);
            }

            return newUser;
        }
    } catch (error) {
        console.error("Erro no syncAlexaUser:", error);
        return null;
    }
}
