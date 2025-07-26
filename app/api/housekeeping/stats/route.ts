import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const stats = await dbService.getHousekeepingStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching housekeeping statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch housekeeping statistics' }, { status: 500 });
  }
}