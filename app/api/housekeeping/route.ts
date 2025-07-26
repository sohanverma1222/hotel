import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'in_progress' | 'completed' | 'on_hold' | null;
    const roomId = searchParams.get('roomId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let tasks;
    
    if (roomId) {
      tasks = await dbService.getHousekeepingTasksByRoom(roomId);
    } else if (startDate && endDate) {
      tasks = await dbService.getHousekeepingTasksByDateRange(new Date(startDate), new Date(endDate));
    } else if (status) {
      tasks = await dbService.getHousekeepingTasks(status);
    } else {
      tasks = await dbService.getHousekeepingTasks();
    }

    // Enhanced tasks with room information
    const enhancedTasks = await Promise.all(
      tasks.map(async (task) => {
        const room = await dbService.getRoomById(task.roomId.toString());
        return {
          ...task,
          id: task._id?.toString(),
          roomNumber: room?.roomNumber || 'Unknown',
          roomType: room?.type || 'Unknown',
          roomFloor: room?.floor || 0,
          formattedDuration: task.actualDuration 
            ? `${Math.floor(task.actualDuration / 60)}h ${task.actualDuration % 60}m`
            : task.estimatedDuration 
              ? `~${Math.floor(task.estimatedDuration / 60)}h ${task.estimatedDuration % 60}m`
              : 'N/A'
        };
      })
    );

    return NextResponse.json(enhancedTasks);
  } catch (error) {
    console.error('Error fetching housekeeping tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch housekeeping tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, assignedTo, taskType, priority, description, estimatedDuration, notes } = body;
    
    if (!roomId || !taskType || !priority || !description || !estimatedDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate task type
    const validTaskTypes = ['cleaning', 'maintenance', 'inspection'];
    if (!validTaskTypes.includes(taskType)) {
      return NextResponse.json({ error: 'Invalid task type' }, { status: 400 });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority level' }, { status: 400 });
    }

    // Validate room exists
    const room = await dbService.getRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const taskData = {
      roomId: new ObjectId(roomId),
      assignedTo: assignedTo ? new ObjectId(assignedTo) : undefined,
      taskType,
      status: 'pending' as const,
      priority,
      description,
      estimatedDuration,
      notes: notes || ''
    };

    const result = await dbService.createHousekeepingTask(taskData);
    
    return NextResponse.json({ 
      success: true, 
      taskId: result.insertedId,
      message: 'Housekeeping task created successfully'
    });
  } catch (error) {
    console.error('Error creating housekeeping task:', error);
    return NextResponse.json({ error: 'Failed to create housekeeping task' }, { status: 500 });
  }
}