import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    if (start > end) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    const report = await dbService.getOccupancyReport(start, end);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating occupancy report:', error);
    return NextResponse.json({ error: 'Failed to generate occupancy report' }, { status: 500 });
  }
}