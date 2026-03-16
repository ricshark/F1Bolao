import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bet from '@/models/Bet';

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
    
    // Delete all bets for the user
    const result = await Bet.deleteMany({ user: params.id });

    return NextResponse.json({ 
      message: 'Bets cleared successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting bets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
