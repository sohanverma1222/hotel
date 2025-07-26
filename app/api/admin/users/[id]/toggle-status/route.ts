import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await dbService.toggleUserStatus(params.id);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}