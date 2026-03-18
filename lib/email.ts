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
    subject: 'Password Reset',
    text: `To reset your password, click on the following link: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return null; // Return null instead of preview URL
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};