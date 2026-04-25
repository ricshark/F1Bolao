import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.isAdmin;

  if (!userId || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const users = await User.find({}).select('-password').sort({ isAdmin: -1, name: 1 });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.isAdmin;

  if (!userId || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { name, email, password, isAdmin: newUserIsAdmin } = await request.json();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // Validação básica do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Validação de força da senha
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,}$/;
  if (!passwordRegex.test(normalizedPassword)) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long, contain one uppercase letter, and one special character (!@#$&*).' }, 
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

  const user = new User({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    isAdmin: newUserIsAdmin || false,
  });

  await user.save();

  return NextResponse.json({ message: 'User created successfully' });
}