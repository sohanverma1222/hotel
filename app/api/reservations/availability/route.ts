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

    const { roomId, checkIn, checkOut, excludeReservationId } = await request.json();

    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json({ 
        error: 'Missing required fields: roomId, checkIn, checkOut' 
      }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ 
        error: 'Check-in date must be before check-out date' 
      }, { status: 400 });
    }

    if (checkInDate < new Date()) {
      return NextResponse.json({ 
        error: 'Check-in date cannot be in the past' 
      }, { status: 400 });
    }

    // Check for conflicts
    const conflicts = await dbService.checkRoomAvailability(
      roomId,
      checkInDate,
      checkOutDate,
      excludeReservationId
    );

    const isAvailable = conflicts.length === 0;

    if (isAvailable) {
      // Also check if room is not under maintenance
      const room = await dbService.getRoomById(roomId);
      const roomAvailable = room && room.status !== 'maintenance';

      return NextResponse.json({
        available: roomAvailable,
        conflicts: [],
        roomStatus: room?.status || 'unknown',
        message: roomAvailable ? 'Room is available' : 'Room is under maintenance'
      });
    }

    // Get detailed conflict information
    const detailedConflicts = await Promise.all(
      conflicts.map(async (conflict) => {
        const guest = await dbService.getGuestById(conflict.guestId.toString());
        const room = await dbService.getRoomById(conflict.roomId.toString());
        
        return {
          reservationId: conflict._id,
          guestName: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest',
          roomNumber: room?.roomNumber || 'Unknown',
          checkIn: conflict.checkIn,
          checkOut: conflict.checkOut,
          status: conflict.status,
          overlap: {
            start: new Date(Math.max(checkInDate.getTime(), conflict.checkIn.getTime())),
            end: new Date(Math.min(checkOutDate.getTime(), conflict.checkOut.getTime()))
          }
        };
      })
    );

    return NextResponse.json({
      available: false,
      conflicts: detailedConflicts,
      message: `Room has ${conflicts.length} conflicting reservation(s)`
    });

  } catch (error) {
    console.error('Error checking room availability:', error);
    return NextResponse.json({ error: 'Failed to check room availability' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const roomType = searchParams.get('roomType');
    const guests = searchParams.get('guests');

    if (!checkIn || !checkOut) {
      return NextResponse.json({ 
        error: 'Missing required parameters: checkIn, checkOut' 
      }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Get all rooms
    const allRooms = await dbService.getAllRooms();
    
    // Filter by room type if specified
    let filteredRooms = allRooms;
    if (roomType && roomType !== 'all') {
      filteredRooms = allRooms.filter(room => room.type.toLowerCase() === roomType.toLowerCase());
    }

    // Filter by guest capacity if specified
    if (guests) {
      const guestCount = parseInt(guests);
      filteredRooms = filteredRooms.filter(room => room.maxOccupancy >= guestCount);
    }

    // Check availability for each room
    const availableRooms = [];
    const unavailableRooms = [];

    for (const room of filteredRooms) {
      const conflicts = await dbService.checkRoomAvailability(
        room._id!.toString(),
        checkInDate,
        checkOutDate
      );

      const isAvailable = conflicts.length === 0 && room.status !== 'maintenance';

      if (isAvailable) {
        availableRooms.push({
          _id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price,
          maxOccupancy: room.maxOccupancy,
          amenities: room.amenities,
          floor: room.floor,
          status: room.status
        });
      } else {
        unavailableRooms.push({
          _id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          reason: room.status === 'maintenance' ? 'Under maintenance' : 'Already booked',
          conflicts: conflicts.length
        });
      }
    }

    return NextResponse.json({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalNights: Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)),
      availableRooms,
      unavailableRooms,
      summary: {
        total: filteredRooms.length,
        available: availableRooms.length,
        unavailable: unavailableRooms.length
      }
    });

  } catch (error) {
    console.error('Error getting room availability:', error);
    return NextResponse.json({ error: 'Failed to get room availability' }, { status: 500 });
  }
}