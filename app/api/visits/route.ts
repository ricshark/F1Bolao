import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SystemConfig from '@/models/SystemConfig';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await dbConnect();

    // Find the config document or create one if it doesn't exist
    const config = await SystemConfig.findOneAndUpdate(
      {},
      { $inc: { visits: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ visits: config.visits });
  } catch (error) {
    console.error('Error incrementing visits:', error);
    return NextResponse.json({ error: 'Failed to update visitor count' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }

    return NextResponse.json({ visits: config.visits });
  } catch (error) {
    console.error('Error getting visits:', error);
    return NextResponse.json({ error: 'Failed to get visitor count' }, { status: 500 });
  }
}
