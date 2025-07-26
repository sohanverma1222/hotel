const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');
const Guest = require('../models/Guest');

const createSampleData = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing guests
    await Guest.deleteMany({});
    console.log('🗑️  Cleared existing guest data');

    // Create sample guests
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
          country: 'USA',
          zipCode: '10001'
        },
        nationality: 'American',
        idNumber: 'P123456789',
        dateOfBirth: new Date('1985-06-15'),
        membershipLevel: 'gold',
        totalSpent: 1500,
        loyaltyPoints: 150,
        isVip: true
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
          country: 'USA',
          zipCode: '90210'
        },
        nationality: 'American',
        idNumber: 'DL987654321',
        dateOfBirth: new Date('1990-03-22'),
        membershipLevel: 'silver',
        totalSpent: 800,
        loyaltyPoints: 80
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
          country: 'USA',
          zipCode: '94105'
        },
        nationality: 'Chinese',
        idNumber: 'C987654321',
        dateOfBirth: new Date('1982-11-08'),
        membershipLevel: 'bronze',
        totalSpent: 300,
        loyaltyPoints: 30
      }
    ];

    const createdGuests = await Guest.insertMany(sampleGuests);
    console.log(`✅ Created ${createdGuests.length} sample guests`);

    console.log('🎉 Sample data creation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
    process.exit(1);
  }
};

createSampleData();