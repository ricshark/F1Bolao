import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SystemConfig from '@/models/SystemConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  
  let config = await SystemConfig.findOne();
  if (!config) {
    config = new SystemConfig();
    await config.save();
  }

  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const body = await request.json();
  const { betLockHours } = body;

  let config = await SystemConfig.findOne();
  if (!config) {
    config = new SystemConfig();
  }

  if (typeof betLockHours === 'number') {
    config.betLockHours = betLockHours;
  }

  await config.save();
  return NextResponse.json(config);
}
