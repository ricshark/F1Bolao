import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send reset email
export const sendResetEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'F1 Bolão - Password Recovery Code',
    text: `Your password recovery code is: ${resetLink}\n\nYou can also reset your password directly here: https://f1-bolao-d0p06p4zb-ricshark-2569s-projects.vercel.app/reset-password`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #e10600;">F1 Bolão</h2>
        <p>You requested to recover your password.</p>
        <p>To create a new password, use the 6-digit code below on the password reset screen:</p>
        <div style="background-color: #e10600; color: white; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 4px;">${resetLink}</strong>
        </div>
        <p>Alternatively, you can reset your password directly by clicking the link below:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="https://f1-bolao-d0p06p4zb-ricshark-2569s-projects.vercel.app/reset-password" 
             style="background-color: #e10600; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this change, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin-top: 30px;" />
        <p style="font-size: 12px; color: #666; text-align: center;">F1 Bolão Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return null; // Return null instead of preview URL
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Function to send reminder email
export const sendBetReminderEmail = async (to: string, userName: string, raceName: string, daysRemaining: number) => {
  const timeText = daysRemaining === 0 ? "HOJE" : `em ${daysRemaining} dias`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: `[F1 Bolão] Alerta: Palpite Pendente para o ${raceName}`,
    text: `Olá ${userName}, a corrida do ${raceName} está chegando e você ainda não fez seu palpite! Acesse o site do F1 Bolão agora ou diga "Alexa, pedir para Fórmula 1 Bolão registrar meu palpite".`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #e10600;">F1 Bolão - Alerta de Palpite</h2>
        <p>Olá <strong>${userName}</strong>,</p>
        <p>A largada do <strong>${raceName}</strong> está se aproximando e notamos que você ainda não registrou seu palpite.</p>
        <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-left: 4px solid #ffeeba; margin: 20px 0;">
          A corrida acontece <strong>${timeText}</strong>. Não deixe para a última hora!
        </div>
        <p>Você pode registrar seu palpite de duas formas:</p>
        <ul>
          <li><strong>Pelo Site:</strong> Acesse o F1 Bolão e faça seu palpite pela área de apostas.</li>
          <li><strong>Pela Alexa:</strong> Diga <em>"Alexa, abrir Fórmula 1 Bolão"</em> ou <em>"Alexa, pedir para Fórmula 1 Bolão registrar meu palpite Hamilton, Russell e Norris"</em>.</li>
        </ul>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://f1-bolao-three.vercel.app/" 
             style="background-color: #e10600; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
            Registrar Palpite Agora
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #ccc; margin-top: 30px;" />
        <p style="font-size: 12px; color: #666; text-align: center;">Equipe F1 Bolão</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};
