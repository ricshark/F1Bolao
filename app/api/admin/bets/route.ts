import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bet from '@/models/Bet';
// Import models for side-effects (prevents Next.js tree-shaking)
import '@/models/User';
import '@/models/Race';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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
  } catch (err: any) {
    console.error('Admin Bets Error:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}