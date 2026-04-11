import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bet from '@/models/Bet';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    await dbConnect();
    
    const updateData: any = {};
    if (data.prediction) {
        updateData.prediction = {
            first: data.prediction.first || '',
            second: data.prediction.second || '',
            third: data.prediction.third || '',
        };
    }

    const updatedBet = await Bet.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedBet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBet);
  } catch (error) {
    console.error('Error updating bet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const deletedBet = await Bet.findByIdAndDelete(params.id);
    
    if (!deletedBet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
