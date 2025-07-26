import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reservationId } = body;
    
    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    // Check if bill already exists for this reservation
    const existingBills = await dbService.getBillsByReservation(reservationId);
    if (existingBills.length > 0) {
      return NextResponse.json({ 
        error: 'Bill already exists for this reservation',
        existingBillId: existingBills[0]._id?.toString()
      }, { status: 400 });
    }

    const result = await dbService.generateBillFromReservation(reservationId);
    
    return NextResponse.json({ 
      success: true, 
      billId: result.insertedId,
      message: 'Bill generated successfully from reservation'
    });
  } catch (error) {
    console.error('Error generating bill:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate bill'
    }, { status: 500 });
  }
}