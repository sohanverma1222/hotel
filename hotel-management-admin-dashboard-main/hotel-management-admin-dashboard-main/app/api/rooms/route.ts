import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rooms = await dbService.getAllRooms();
    
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, status } = await request.json();

    if (!roomId || !status) {
      return NextResponse.json({ error: 'Missing roomId or status' }, { status: 400 });
    }

    const validStatuses = ['available', 'occupied', 'maintenance', 'cleaning'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const result = await dbService.updateRoomStatus(roomId, status);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Log the activity
    await dbService.logActivity({
      userId: new (require('mongodb').ObjectId)(user.id),
      action: 'ROOM_STATUS_UPDATE',
      resource: 'room',
      resourceId: new (require('mongodb').ObjectId)(roomId),
      details: { oldStatus: 'unknown', newStatus: status }, // In real app, fetch old status
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating room status:', error);
    return NextResponse.json({ error: 'Failed to update room status' }, { status: 500 });
  }
}