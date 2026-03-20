import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bet from '@/models/Bet';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.isAdmin;

  if (!userId || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const bets = await Bet.find({})
    .populate('user', 'name email')
    .populate('race', 'round name date circuit')
    .sort({ createdAt: -1 });
  return NextResponse.json(bets);
}