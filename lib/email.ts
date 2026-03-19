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
