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
  const { betLockHours, notif1Hours, notif2Hours, notif3Hours } = body;

  let config = await SystemConfig.findOne();
  if (!config) {
    config = new SystemConfig();
  }

  if (typeof betLockHours === 'number') {
    config.betLockHours = betLockHours;
  }
  if (typeof notif1Hours === 'number') {
    config.notif1Hours = notif1Hours;
  }
  if (typeof notif2Hours === 'number') {
    config.notif2Hours = notif2Hours;
  }
  if (typeof notif3Hours === 'number') {
    config.notif3Hours = notif3Hours;
  }

  await config.save();
  return NextResponse.json(config);
}
