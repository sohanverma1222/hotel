import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reservationId = searchParams.get('reservationId');
    
    let bills;
    
    if (reservationId) {
      bills = await dbService.getBillsByReservation(reservationId);
    } else if (status && status !== 'all') {
      bills = await dbService.getBillsByStatus(status as any);
    } else if (startDate && endDate) {
      bills = await dbService.getBillsByDateRange(new Date(startDate), new Date(endDate));
    } else {
      bills = await dbService.getAllBills();
    }

    // Enhanced bills with populated guest and room data
    const enhancedBills = await Promise.all(
      bills.map(async (bill) => {
        const guest = await dbService.getGuestById(bill.guestId.toString());
        const room = await dbService.getRoomById(bill.roomId.toString());
        const reservation = await dbService.getReservationById(bill.reservationId.toString());
        
        return {
          ...bill,
          id: bill._id?.toString(),
          guestName: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest',
          roomNumber: room?.roomNumber || 'Unknown Room',
          checkIn: reservation?.checkIn ? reservation.checkIn.toISOString().split('T')[0] : '',
          checkOut: reservation?.checkOut ? reservation.checkOut.toISOString().split('T')[0] : '',
          paymentMethod: bill.paidDate ? 'Credit Card' : null // Default payment method
        };
      })
    );

    return NextResponse.json(enhancedBills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reservationId, items, subtotal, taxes, total, dueDate } = body;
    
    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    const reservation = await dbService.getReservationById(reservationId);
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const billData = {
      reservationId: new ObjectId(reservationId),
      guestId: reservation.guestId,
      roomId: reservation.roomId,
      items: items || [],
      subtotal: subtotal || 0,
      taxes: taxes || 0,
      total: total || 0,
      status: 'draft' as const,
      dueDate: dueDate ? new Date(dueDate) : reservation.checkOut
    };

    const result = await dbService.createBill(billData);
    
    return NextResponse.json({ 
      success: true, 
      billId: result.insertedId,
      message: 'Bill created successfully'
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}