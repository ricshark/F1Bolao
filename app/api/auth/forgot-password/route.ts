import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    // Avoid leaking whether the email exists
    return NextResponse.json({ message: 'Se este e-mail estiver cadastrado, um código de recuperação foi enviado.' });
  }

  // Gera um código numérico de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes instead of 1 hour

  user.resetToken = code;
  user.resetTokenExpires = expires;
  await user.save();

  // Send the token via email.
  let previewUrl = null;
  try {
    const { sendResetEmail } = await import('@/lib/email');
    previewUrl = await sendResetEmail(email, code);
  } catch (err) {
    console.error('Failed to send email', err);
    // Em produção deveriamos retornar erro 500 se o email não enviasse
  }

  return NextResponse.json({ 
    message: 'Código de recuperação gerado e enviado para o seu e-mail.',
    previewUrl // Somente em DEV para facilitar os testes 
  });
}
