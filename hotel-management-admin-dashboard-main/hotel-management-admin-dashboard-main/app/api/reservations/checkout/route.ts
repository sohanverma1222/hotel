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

    const { reservationId, notes, roomCondition } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservationId' }, { status: 400 });
    }

    // Get reservation details
    const reservation = await dbService.getReservationById(reservationId);
    
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.status !== 'checked_in') {
      return NextResponse.json({ 
        error: 'Guest must be checked in to check out' 
      }, { status: 400 });
    }

    // Check if payment is complete (optional - depends on hotel policy)
    if (reservation.paymentStatus === 'pending') {
      return NextResponse.json({ 
        error: 'Payment must be completed before check-out',
        warning: true // This could be a warning instead of error
      }, { status: 400 });
    }

    // Update reservation status
    const result = await dbService.updateReservation(reservationId, {
      status: 'checked_out',
      actualCheckOut: new Date(),
      notes: notes || reservation.notes,
      updatedAt: new Date(),
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
    }

    // Update room status based on condition
    const newRoomStatus = roomCondition === 'clean' ? 'available' : 'cleaning';
    await dbService.updateRoomStatus(reservation.roomId.toString(), newRoomStatus);

    // If room needs cleaning, create a housekeeping task
    if (roomCondition !== 'clean') {
      await dbService.createHousekeepingTask({
        roomId: reservation.roomId,
        taskType: 'cleaning',
        status: 'pending',
        priority: 'medium',
        description: 'Post-checkout cleaning',
        estimatedDuration: 45, // 45 minutes
        notes: 'Standard post-checkout cleaning',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Log the activity
    await dbService.logActivity({
      userId: new ObjectId(user.id),
      action: 'GUEST_CHECK_OUT',
      resource: 'reservation',
      resourceId: new ObjectId(reservationId),
      details: {
        guestId: reservation.guestId,
        roomId: reservation.roomId,
        checkOutTime: new Date(),
        roomCondition: roomCondition || 'unknown',
        notes: notes || ''
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Guest checked out successfully',
      roomStatus: newRoomStatus
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    return NextResponse.json({ error: 'Failed to check out guest' }, { status: 500 });
  }
}