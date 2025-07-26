const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');
const Guest = require('../models/Guest');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up Hotel Management Database...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    
    // Guest indexes
    await Guest.createIndexes();
    console.log('✅ Guest collection indexes created');

    // Room indexes
    await Room.createIndexes();
    console.log('✅ Room collection indexes created');

    // Reservation indexes
    await Reservation.createIndexes();
    console.log('✅ Reservation collection indexes created');

    console.log('🎉 Database setup completed successfully!');
    
    // Display collection stats
    const guestCount = await Guest.countDocuments();
    const roomCount = await Room.countDocuments();
    const reservationCount = await Reservation.countDocuments();
    
    console.log('📈 Current database statistics:');
    console.log(`   Guests: ${guestCount}`);
    console.log(`   Rooms: ${roomCount}`);
    console.log(`   Reservations: ${reservationCount}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

setupDatabase();