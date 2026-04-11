import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (!data.photo) {
      return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
    }

    await dbConnect();
    
    // find user by email since session doesn't always have ID reliably typed depending on next-auth config
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.photo = data.photo;
    await user.save();

    return NextResponse.json({ success: true, photo: user.photo });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.photo = null;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing profile photo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
