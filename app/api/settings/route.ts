import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SystemConfig from '@/models/SystemConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }

    return NextResponse.json({ betLockHours: config.betLockHours, visits: config.visits });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}
