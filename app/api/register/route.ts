import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  await dbConnect();

  const { name, email, password } = await request.json();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

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