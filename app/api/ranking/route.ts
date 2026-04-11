import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({})
      .select('name points photo')
      .sort({ points: -1 })
      .lean();

    return NextResponse.json(users);
  } catch (err) {
    console.error('Failed to fetch ranking', err);
    return NextResponse.json({ error: 'Failed to fetch ranking' }, { status: 500 });
  }
}
