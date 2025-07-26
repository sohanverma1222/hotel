import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }
    const body = await request.json();
    const { status, paidDate } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses = ['draft', 'sent', 'paid', 'overdue'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const result = await dbService.updateBillStatus(
      id, 
      status, 
      paidDate ? new Date(paidDate) : (status === 'paid' ? new Date() : undefined)
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bill status updated to ${status}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating bill status:', error);
    return NextResponse.json({ error: 'Failed to update bill status' }, { status: 500 });
  }
}