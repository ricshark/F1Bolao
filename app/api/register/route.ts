import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  await dbConnect();

  const { name, email, password } = await request.json();
  
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  // Validação básica do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Máxima segurança: exigir no mínimo 8 caracteres de senha
  if (normalizedPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

  const user = new User({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  await user.save();

  return NextResponse.json({ message: 'User created' });
}