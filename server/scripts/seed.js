const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');
const Guest = require('../models/Guest');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

// Sample data
const sampleGuests = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    nationality: 'American',
    idType: 'passport',
    idNumber: 'P123456789',
    dateOfBirth: new Date('1985-06-15'),
    preferences: {
      roomType: 'deluxe',
      dietaryRestrictions: ['vegetarian'],
      specialRequests: 'High floor room preferred'
    }
  },
  {
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@email.com',
    phone: '+1987654321',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    nationality: 'American',
    idType: 'driver_license',
    idNumber: 'DL987654321',
    dateOfBirth: new Date('1990-03-22'),
    preferences: {
      roomType: 'suite',
      amenities: ['wifi', 'spa'],
      specialRequests: 'Late checkout preferred'
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1122334455',
    address: {
      street: '789 Pine St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    nationality: 'Chinese',
    idType: 'passport',
    idNumber: 'C987654321',
    dateOfBirth: new Date('1982-11-08'),
    preferences: {
      roomType: 'standard',
      amenities: ['wifi', 'fitness'],
      specialRequests: 'Non-smoking room'
    }
  }
];

const sampleRooms = [
  {
    roomNumber: '101',
    roomType: 'standard',
    floor: 1,
    capacity: 2,
    basePrice: 120,
    amenities: ['wifi', 'air_conditioning', 'tv'],
    description: 'Comfortable standard room with city view',
    images: ['room101-1.jpg', 'room101-2.jpg']
  },
  {
    roomNumber: '102',
    roomType: 'standard',
    floor: 1,
    capacity: 2,
    basePrice: 120,
    amenities: ['wifi', 'air_conditioning', 'tv', 'mini_fridge'],
    description: 'Standard room with mini fridge',
    images: ['room102-1.jpg']
  },
  {
    roomNumber: '201',
    roomType: 'deluxe',
    floor: 2,
    capacity: 3,
    basePrice: 180,
    amenities: ['wifi', 'air_conditioning', 'tv', 'mini_fridge', 'balcony'],
    description: 'Spacious deluxe room with balcony and city view',
    images: ['room201-1.jpg', 'room201-2.jpg', 'room201-3.jpg']
  },
  {
    roomNumber: '202',
    roomType: 'deluxe',
    floor: 2,
    capacity: 4,
    basePrice: 200,
    amenities: ['wifi', 'air_conditioning', 'tv', 'mini_fridge', 'balcony', 'jacuzzi'],
    description: 'Premium deluxe room with jacuzzi',
    images: ['room202-1.jpg', 'room202-2.jpg']
  },
  {
    roomNumber: '301',
    roomType: 'suite',
    floor: 3,
    capacity: 4,
    basePrice: 350,
    amenities: ['wifi', 'air_conditioning', 'tv', 'mini_fridge', 'balcony', 'jacuzzi', 'kitchen'],
    description: 'Luxury suite with separate living area and kitchenette',
    images: ['suite301-1.jpg', 'suite301-2.jpg', 'suite301-3.jpg', 'suite301-4.jpg']
  },
  {
    roomNumber: '302',
    roomType: 'suite',
    floor: 3,
    capacity: 6,
    basePrice: 450,
    amenities: ['wifi', 'air_conditioning', 'tv', 'mini_fridge', 'balcony', 'jacuzzi', 'kitchen', 'spa'],
    description: 'Presidential suite with panoramic view and private spa',
    images: ['suite302-1.jpg', 'suite302-2.jpg', 'suite302-3.jpg']
  }
];

const sampleReservations = [
  {
    guestName: 'John Smith',
    guestEmail: 'john.smith@email.com',
    guestPhone: '+1234567890',
    roomNumber: '201',
    checkIn: new Date('2024-02-15'),
    checkOut: new Date('2024-02-18'),
    nights: 3,
    adults: 2,
    children: 0,
    totalAmount: 540,
    advancePayment: 200,
    status: 'confirmed',
    paymentStatus: 'partial',
    source: 'website',
    specialRequests: 'High floor room, late checkout if possible'
  },
  {
    guestName: 'Emily Johnson',
    guestEmail: 'emily.johnson@email.com',
    guestPhone: '+1987654321',
    roomNumber: '301',
    checkIn: new Date('2024-02-20'),
    checkOut: new Date('2024-02-25'),
    nights: 5,
    adults: 2,
    children: 1,
    totalAmount: 1750,
    advancePayment: 1750,
    status: 'confirmed',
    paymentStatus: 'paid',
    source: 'phone',
    specialRequests: 'Extra bed for child, welcome basket'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Guest.deleteMany({}),
      Room.deleteMany({}),
      Reservation.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Create sample guests
    console.log('👥 Creating sample guests...');
    const createdGuests = await Guest.insertMany(sampleGuests);
    console.log(`✅ Created ${createdGuests.length} guests`);

    // Create sample rooms
    console.log('🏠 Creating sample rooms...');
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // Link reservations with actual guest and room IDs
    const updatedReservations = await Promise.all(
      sampleReservations.map(async (reservation) => {
        const guest = createdGuests.find(g => g.email === reservation.guestEmail);
        const room = createdRooms.find(r => r.roomNumber === reservation.roomNumber);
        
        if (guest && room) {
          return {
            ...reservation,
            guestId: guest._id,
            roomId: room._id
          };
        }
        return reservation;
      })
    );

    // Create sample reservations
    console.log('📅 Creating sample reservations...');
    const createdReservations = await Reservation.insertMany(updatedReservations);
    console.log(`✅ Created ${createdReservations.length} reservations`);

    // Update rooms with current reservations
    for (const reservation of createdReservations) {
      if (reservation.status === 'confirmed' || reservation.status === 'checked-in') {
        await Room.findByIdAndUpdate(reservation.roomId, {
          currentReservation: reservation._id,
          status: reservation.status === 'checked-in' ? 'occupied' : 'available'
        });
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    console.log('📊 Seeding Summary:');
    console.log(`   👥 Guests: ${createdGuests.length}`);
    console.log(`   🏠 Rooms: ${createdRooms.length}`);
    console.log(`   📅 Reservations: ${createdReservations.length}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;