import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const stats = await dbService.getGuestStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching guest stats:', error);
    return NextResponse.json({ error: 'Failed to fetch guest statistics' }, { status: 500 });
  }
}