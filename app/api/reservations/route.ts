import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { dbService } from '@/lib/db/service';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reservations = await dbService.getAllReservations();
    
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reservationData = await request.json();
    
    // Validate required fields
    const requiredFields = ['guestId', 'roomId', 'checkIn', 'checkOut', 'numberOfGuests', 'totalAmount'];
    for (const field of requiredFields) {
      if (!reservationData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check for double-booking conflicts
    const checkInDate = new Date(reservationData.checkIn);
    const checkOutDate = new Date(reservationData.checkOut);
    
    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ error: 'Check-in date must be before check-out date' }, { status: 400 });
    }

    // Check if room is available for the requested dates
    const conflicts = await dbService.checkRoomAvailability(
      reservationData.roomId,
      checkInDate,
      checkOutDate
    );

    if (conflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Room is not available for the selected dates',
        conflicts 
      }, { status: 409 });
    }

    // Create reservation
    const reservation = {
      guestId: new ObjectId(reservationData.guestId),
      roomId: new ObjectId(reservationData.roomId),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: 'confirmed' as const,
      numberOfGuests: reservationData.numberOfGuests,
      totalAmount: reservationData.totalAmount,
      paidAmount: reservationData.paidAmount || 0,
      paymentStatus: reservationData.paymentStatus || 'pending' as const,
      specialRequests: reservationData.specialRequests || '',
      notes: reservationData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await dbService.createReservation(reservation);
    
    // Log the activity
    await dbService.logActivity({
      userId: new ObjectId(user.id),
      action: 'RESERVATION_CREATE',
      resource: 'reservation',
      resourceId: result.insertedId,
      details: { guestId: reservation.guestId, roomId: reservation.roomId },
    });

    return NextResponse.json({ 
      success: true, 
      reservationId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reservationId, ...updateData } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservationId' }, { status: 400 });
    }

    // Update reservation
    const result = await dbService.updateReservation(reservationId, updateData);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Log the activity
    await dbService.logActivity({
      userId: new ObjectId(user.id),
      action: 'RESERVATION_UPDATE',
      resource: 'reservation',
      resourceId: new ObjectId(reservationId),
      details: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reservationId } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservationId' }, { status: 400 });
    }

    // Instead of deleting, mark as cancelled
    const result = await dbService.updateReservation(reservationId, {
      status: 'cancelled',
      updatedAt: new Date(),
    });
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Log the activity
    await dbService.logActivity({
      userId: new ObjectId(user.id),
      action: 'RESERVATION_CANCEL',
      resource: 'reservation',
      resourceId: new ObjectId(reservationId),
      details: { reason: 'cancelled_by_admin' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 });
  }
}