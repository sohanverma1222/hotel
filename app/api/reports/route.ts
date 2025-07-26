import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type');
    
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

    let report;
    
    switch (reportType) {
      case 'occupancy':
        report = await dbService.getOccupancyReport(start, end);
        break;
      case 'revenue':
        report = await dbService.getRevenueReport(start, end);
        break;
      case 'utilization':
        report = await dbService.getRoomUtilizationReport(start, end);
        break;
      case 'comprehensive':
        report = await dbService.getComprehensiveReport(start, end);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}