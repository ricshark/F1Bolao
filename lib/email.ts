import nodemailer from 'nodemailer';

// Funções para criar e obter o transporter do Nodemailer.
// Para ambiente de desenvolvimento, usamos o Ethereal Email que capta os e-mails e gera um link para visualizá-los,
// sem precisar de contas reais ou spam.

let testAccount: nodemailer.TestAccount | null = null;
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (!transporter) {
    // Se você tiver um SMTP de produção (SendGrid, AWS SES, etc), configure aqui:
    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Uso de Ethereal para testes locais
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Ethereal Test account created:', testAccount.user);
    }
  }
  return transporter;
}

export async function sendResetEmail(to: string, code: string) {
  const mailer = await getTransporter();

  const info = await mailer.sendMail({
    from: '"F1 Bolão" <noreply@f1bolao.com>',
    to,
    subject: 'F1 Bolão - Código de Recuperação de Senha',
    text: `Seu código de recuperação de senha é: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #e10600;">F1 Bolão</h2>
        <p>Você solicitou a recuperação de sua senha.</p>
        <p>Para criar uma nova senha, utilize o código de 6 dígitos abaixo na tela de redefinição de senha:</p>
        <div style="background-color: #e10600; color: white; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 4px;">${code}</strong>
        </div>
        <p>Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin-top: 30px;" />
        <p style="font-size: 12px; color: #666; text-align: center;">Equipe F1 Bolão</p>
      </div>
    `,
  });

  console.log('Message sent: %s', info.messageId);
  // Apenas no ambiente de dev, logamos a URL para abrir o email fake facilmente
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('Preview URL: %s', previewUrl);
  }
  
  return previewUrl || null;
}
