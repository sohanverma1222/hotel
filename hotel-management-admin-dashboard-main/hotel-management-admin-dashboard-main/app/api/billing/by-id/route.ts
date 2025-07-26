import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }
    const bill = await dbService.getBillById(id);
    
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Enhanced bill with populated guest and room data
    const guest = await dbService.getGuestById(bill.guestId.toString());
    const room = await dbService.getRoomById(bill.roomId.toString());
    const reservation = await dbService.getReservationById(bill.reservationId.toString());
    
    const enhancedBill = {
      ...bill,
      id: bill._id?.toString(),
      guestName: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest',
      roomNumber: room?.roomNumber || 'Unknown Room',
      checkIn: reservation?.checkIn ? reservation.checkIn.toISOString().split('T')[0] : '',
      checkOut: reservation?.checkOut ? reservation.checkOut.toISOString().split('T')[0] : '',
      paymentMethod: bill.paidDate ? 'Credit Card' : null
    };

    return NextResponse.json(enhancedBill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }
    const body = await request.json();
    const { items, subtotal, taxes, total, status, dueDate } = body;
    
    const updates: any = {};
    
    if (items) updates.items = items;
    if (subtotal !== undefined) updates.subtotal = subtotal;
    if (taxes !== undefined) updates.taxes = taxes;
    if (total !== undefined) updates.total = total;
    if (status) updates.status = status;
    if (dueDate) updates.dueDate = new Date(dueDate);
    
    const result = await dbService.updateBill(id, updates);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bill updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }
    const result = await dbService.deleteBill(id);
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bill deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 });
  }
}