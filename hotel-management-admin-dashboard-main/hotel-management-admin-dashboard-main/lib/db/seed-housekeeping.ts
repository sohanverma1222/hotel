import { dbService } from './service';
import { ObjectId } from 'mongodb';

export async function seedHousekeepingTasks() {
  try {
    // Get all rooms
    const rooms = await dbService.getAllRooms();
    
    if (rooms.length === 0) {
      console.log('No rooms found. Please seed rooms first.');
      return;
    }

    // Check if tasks already exist
    const existingTasks = await dbService.getHousekeepingTasks();
    if (existingTasks.length > 0) {
      console.log('Housekeeping tasks already exist. Skipping seeding.');
      return;
    }

    // Sample housekeeping tasks
    const sampleTasks = [
      {
        roomId: new ObjectId(rooms[0]._id),
        taskType: 'cleaning' as const,
        status: 'pending' as const,
        priority: 'high' as const,
        description: 'Deep cleaning after checkout - guest reported issues with bathroom',
        estimatedDuration: 45,
        notes: 'Pay special attention to bathroom tiles and fixtures'
      },
      {
        roomId: new ObjectId(rooms[1]._id),
        taskType: 'maintenance' as const,
        status: 'in_progress' as const,
        priority: 'urgent' as const,
        description: 'Fix leaky faucet in bathroom sink',
        estimatedDuration: 30,
        actualDuration: 25,
        startedAt: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
        notes: 'Guest complained about constant dripping'
      },
      {
        roomId: new ObjectId(rooms[2]._id),
        taskType: 'inspection' as const,
        status: 'completed' as const,
        priority: 'medium' as const,
        description: 'Pre-arrival inspection and preparation',
        estimatedDuration: 20,
        actualDuration: 18,
        startedAt: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
        completedAt: new Date(Date.now() - 12 * 60 * 1000), // Completed 12 minutes ago
        notes: 'Room ready for VIP guest arrival'
      },
      {
        roomId: new ObjectId(rooms[3]._id),
        taskType: 'maintenance' as const,
        status: 'on_hold' as const,
        priority: 'low' as const,
        description: 'Replace air conditioning filter',
        estimatedDuration: 15,
        notes: 'Waiting for new filters to arrive'
      },
      {
        roomId: new ObjectId(rooms[0]._id),
        taskType: 'cleaning' as const,
        status: 'pending' as const,
        priority: 'medium' as const,
        description: 'Standard post-checkout cleaning',
        estimatedDuration: 35,
        notes: 'Standard cleaning protocol'
      },
      {
        roomId: new ObjectId(rooms[1]._id),
        taskType: 'inspection' as const,
        status: 'completed' as const,
        priority: 'high' as const,
        description: 'Quality inspection after maintenance work',
        estimatedDuration: 25,
        actualDuration: 22,
        startedAt: new Date(Date.now() - 45 * 60 * 1000), // Started 45 minutes ago
        completedAt: new Date(Date.now() - 23 * 60 * 1000), // Completed 23 minutes ago
        notes: 'All maintenance issues resolved'
      }
    ];

    // Create tasks
    for (const task of sampleTasks) {
      await dbService.createHousekeepingTask(task);
    }

    console.log(`✅ Created ${sampleTasks.length} sample housekeeping tasks`);
  } catch (error) {
    console.error('Error seeding housekeeping tasks:', error);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedHousekeepingTasks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}