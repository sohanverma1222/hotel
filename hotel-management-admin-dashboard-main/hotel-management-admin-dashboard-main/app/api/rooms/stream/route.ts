import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a ReadableStream for Server-Sent Events
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode('data: {"type":"connected","message":"Room status stream connected"}\n\n'));
        
        // Function to send room updates
        const sendRoomUpdate = async () => {
          try {
            const rooms = await dbService.getAllRooms();
            const updateData = {
              type: 'roomUpdate',
              timestamp: new Date().toISOString(),
              rooms: rooms.map(room => ({
                id: room._id?.toString(),
                roomNumber: room.roomNumber,
                status: room.status,
                type: room.type,
                floor: room.floor,
                price: room.price,
                updatedAt: room.updatedAt
              }))
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`));
          } catch (error) {
            console.error('Error sending room update:', error);
          }
        };
        
        // Send initial room data
        sendRoomUpdate();
        
        // Send updates every 10 seconds
        const intervalId = setInterval(sendRoomUpdate, 10000);
        
        // Cleanup when connection closes
        return () => {
          clearInterval(intervalId);
        };
      },
      cancel() {
        // Client disconnected
        console.log('Room status stream disconnected');
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in room stream:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}