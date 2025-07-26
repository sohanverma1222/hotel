import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await dbService.getHousekeepingTaskById(id);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get room information
    const room = await dbService.getRoomById(task.roomId.toString());
    
    const enhancedTask = {
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

    return NextResponse.json(enhancedTask);
  } catch (error) {
    console.error('Error fetching housekeeping task:', error);
    return NextResponse.json({ error: 'Failed to fetch housekeeping task' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { assignedTo, taskType, status, priority, description, estimatedDuration, actualDuration, notes, startedAt, completedAt } = body;
    
    const updates: any = {};
    
    if (assignedTo) updates.assignedTo = new ObjectId(assignedTo);
    if (taskType) updates.taskType = taskType;
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (description) updates.description = description;
    if (estimatedDuration) updates.estimatedDuration = estimatedDuration;
    if (actualDuration) updates.actualDuration = actualDuration;
    if (notes !== undefined) updates.notes = notes;
    if (startedAt) updates.startedAt = new Date(startedAt);
    if (completedAt) updates.completedAt = new Date(completedAt);
    
    // Auto-set timestamps based on status
    if (status === 'in_progress' && !startedAt) {
      updates.startedAt = new Date();
    }
    if (status === 'completed' && !completedAt) {
      updates.completedAt = new Date();
      
      // Calculate actual duration if not provided
      if (!actualDuration && updates.startedAt) {
        const task = await dbService.getHousekeepingTaskById(id);
        if (task?.startedAt) {
          updates.actualDuration = Math.floor((updates.completedAt.getTime() - task.startedAt.getTime()) / (1000 * 60));
        }
      }
    }
    
    const result = await dbService.updateHousekeepingTask(id, updates);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Housekeeping task updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating housekeeping task:', error);
    return NextResponse.json({ error: 'Failed to update housekeeping task' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const result = await dbService.deleteHousekeepingTask(id);
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Housekeeping task deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting housekeeping task:', error);
    return NextResponse.json({ error: 'Failed to delete housekeeping task' }, { status: 500 });
  }
}