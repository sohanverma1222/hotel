import { dbService } from './service';
import { ObjectId } from 'mongodb';

async function seedReservations() {
  console.log('🌱 Seeding reservations...');

  try {
    // First, let's get some existing rooms and guests
    const rooms = await dbService.getAllRooms();
    const guests = await dbService.getAllGuests();

    if (rooms.length === 0) {
      console.log('❌ No rooms found. Please seed rooms first.');
      return;
    }

    if (guests.length === 0) {
      console.log('❌ No guests found. Creating sample guests...');
      
      // Create sample guests
      const sampleGuests = [
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0101',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          idDocument: {
            type: 'passport' as const,
            number: 'P123456789'
          },
          preferences: ['WiFi', 'Late checkout'],
          notes: 'Business traveler'
        },
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0102',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          idDocument: {
            type: 'license' as const,
            number: 'DL987654321'
          },
          preferences: ['Extra towels', 'Room service'],
          notes: 'VIP guest'
        },
        {
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@example.com',
          phone: '+1-555-0103',
          address: {
            street: '789 Pine Rd',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          },
          idDocument: {
            type: 'passport' as const,
            number: 'P987654321'
          },
          preferences: ['Ground floor', 'Early checkin'],
          notes: 'Family vacation'
        },
        {
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@example.com',
          phone: '+1-555-0104',
          address: {
            street: '321 Elm St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            country: 'USA'
          },
          idDocument: {
            type: 'license' as const,
            number: 'DL456789123'
          },
          preferences: ['Ocean view', 'Late checkout'],
          notes: 'Honeymoon'
        }
      ];

      for (const guest of sampleGuests) {
        await dbService.createGuest(guest);
      }

      console.log('✅ Created sample guests');
    }

    // Get the updated guest list
    const allGuests = await dbService.getAllGuests();

    // Create sample reservations
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const sampleReservations = [
      {
        guestId: allGuests[0]._id!,
        roomId: rooms[0]._id!,
        checkIn: today,
        checkOut: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'confirmed' as const,
        numberOfGuests: 1,
        totalAmount: 297,
        paidAmount: 297,
        paymentStatus: 'paid' as const,
        specialRequests: 'Extra towels',
        notes: 'Business traveler',
      },
      {
        guestId: allGuests[1]._id!,
        roomId: rooms[1]._id!,
        checkIn: tomorrow,
        checkOut: new Date(tomorrow.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from tomorrow
        status: 'checked_in' as const,
        numberOfGuests: 2,
        totalAmount: 1196,
        paidAmount: 800,
        paymentStatus: 'partial' as const,
        specialRequests: 'Late checkout',
        notes: 'VIP guest - Suite upgrade',
      },
      {
        guestId: allGuests[2]._id!,
        roomId: rooms[2] ? rooms[2]._id! : rooms[0]._id!,
        checkIn: nextWeek,
        checkOut: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from next week
        status: 'confirmed' as const,
        numberOfGuests: 2,
        totalAmount: 298,
        paidAmount: 0,
        paymentStatus: 'pending' as const,
        specialRequests: 'Ground floor room',
        notes: 'Family with children',
      },
      {
        guestId: allGuests[3]._id!,
        roomId: rooms[3] ? rooms[3]._id! : rooms[1]._id!,
        checkIn: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        checkOut: today,
        status: 'checked_out' as const,
        numberOfGuests: 1,
        totalAmount: 198,
        paidAmount: 198,
        paymentStatus: 'paid' as const,
        specialRequests: 'Early checkin',
        notes: 'Honeymoon - decorated room',
      }
    ];

    for (const reservation of sampleReservations) {
      const result = await dbService.createReservation(reservation);
      console.log(`✅ Created reservation: ${result.insertedId}`);
    }

    console.log('✅ Reservations seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding reservations:', error);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedReservations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedReservations };