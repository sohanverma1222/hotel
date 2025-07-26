import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { dbService } from '@/lib/db/service';
import { getUser } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reservationId, notes } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservationId' }, { status: 400 });
    }

    // Get reservation details
    const reservation = await dbService.getReservationById(reservationId);
    
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.status !== 'confirmed') {
      return NextResponse.json({ 
        error: 'Reservation must be confirmed to check in' 
      }, { status: 400 });
    }

    // Check if it's the right date for check-in (allow early check-in)
    const today = new Date();
    const checkInDate = new Date(reservation.checkIn);
    
    if (today < new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ 
        error: 'Check-in is too early. Please wait until the check-in date.' 
      }, { status: 400 });
    }

    // Update reservation status
    const result = await dbService.updateReservation(reservationId, {
      status: 'checked_in',
      actualCheckIn: new Date(),
      notes: notes || reservation.notes,
      updatedAt: new Date(),
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
    }

    // Update room status to occupied
    await dbService.updateRoomStatus(reservation.roomId.toString(), 'occupied');

    // Log the activity
    await dbService.logActivity({
      userId: new ObjectId(user.id),
      action: 'GUEST_CHECK_IN',
      resource: 'reservation',
      resourceId: new ObjectId(reservationId),
      details: {
        guestId: reservation.guestId,
        roomId: reservation.roomId,
        checkInTime: new Date(),
        notes: notes || ''
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Guest checked in successfully' 
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    return NextResponse.json({ error: 'Failed to check in guest' }, { status: 500 });
  }
}