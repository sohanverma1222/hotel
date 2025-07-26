import { connectToDatabase } from './mongodb';
import { z } from 'zod';

// Zod schemas for validation
const UserSchema = z.object({
  _id: z.any().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['admin', 'staff']),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
});

const RoomSchema = z.object({
  _id: z.any().optional(),
  roomNumber: z.string().min(1),
  type: z.enum(['single', 'double', 'suite', 'deluxe']),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']),
  price: z.number().positive(),
  amenities: z.array(z.string()),
  floor: z.number().positive(),
  maxOccupancy: z.number().positive(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const GuestSchema = z.object({
  _id: z.any().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  idDocument: z.object({
    type: z.enum(['passport', 'license', 'national_id']),
    number: z.string(),
  }).optional(),
  preferences: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const ReservationSchema = z.object({
  _id: z.any().optional(),
  guestId: z.any(),
  roomId: z.any(),
  checkIn: z.date(),
  checkOut: z.date(),
  status: z.enum(['confirmed', 'checked_in', 'checked_out', 'cancelled']),
  numberOfGuests: z.number().positive(),
  totalAmount: z.number().positive(),
  paidAmount: z.number().min(0),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const BillSchema = z.object({
  _id: z.any().optional(),
  reservationId: z.any(),
  guestId: z.any(),
  roomId: z.any(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    category: z.enum(['room', 'service', 'amenity', 'tax']),
  })),
  subtotal: z.number().positive(),
  taxes: z.number().min(0),
  total: z.number().positive(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  dueDate: z.date(),
  paidDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const HousekeepingTaskSchema = z.object({
  _id: z.any().optional(),
  roomId: z.any(),
  assignedTo: z.any().optional(),
  taskType: z.enum(['cleaning', 'maintenance', 'inspection']),
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().min(1),
  estimatedDuration: z.number().positive(),
  actualDuration: z.number().positive().optional(),
  notes: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const ActivityLogSchema = z.object({
  _id: z.any().optional(),
  userId: z.any(),
  action: z.string().min(1),
  resource: z.string().min(1),
  resourceId: z.any().optional(),
  details: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date(),
});

export async function validateDatabaseSchema() {
  try {
    console.log('🔍 Validating database schema...');
    
    const connection = await connectToDatabase();
    const db = connection.db;
    
    // Check if all required collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = [
      'users', 'rooms', 'guests', 'reservations', 
      'bills', 'housekeeping_tasks', 'activity_logs'
    ];
    
    console.log('📋 Checking required collections...');
    for (const collectionName of requiredCollections) {
      if (collectionNames.includes(collectionName)) {
        console.log(`✅ Collection '${collectionName}' exists`);
      } else {
        console.log(`❌ Collection '${collectionName}' missing`);
      }
    }
    
    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const userIndexes = await db.collection('users').listIndexes().toArray();
    const roomIndexes = await db.collection('rooms').listIndexes().toArray();
    const guestIndexes = await db.collection('guests').listIndexes().toArray();
    const reservationIndexes = await db.collection('reservations').listIndexes().toArray();
    
    console.log('📊 Index summary:');
    console.log(`- Users: ${userIndexes.length} indexes`);
    console.log(`- Rooms: ${roomIndexes.length} indexes`);
    console.log(`- Guests: ${guestIndexes.length} indexes`);
    console.log(`- Reservations: ${reservationIndexes.length} indexes`);
    
    // Sample data validation
    console.log('\n🔍 Validating sample data...');
    
    const sampleUser = await db.collection('users').findOne({});
    const sampleRoom = await db.collection('rooms').findOne({});
    
    if (sampleUser) {
      try {
        UserSchema.parse(sampleUser);
        console.log('✅ User schema validation passed');
      } catch (error) {
        console.log('❌ User schema validation failed:', error);
      }
    }
    
    if (sampleRoom) {
      try {
        RoomSchema.parse(sampleRoom);
        console.log('✅ Room schema validation passed');
      } catch (error) {
        console.log('❌ Room schema validation failed:', error);
      }
    }
    
    // Document counts
    console.log('\n📊 Document counts:');
    console.log(`- Users: ${await db.collection('users').countDocuments()}`);
    console.log(`- Rooms: ${await db.collection('rooms').countDocuments()}`);
    console.log(`- Guests: ${await db.collection('guests').countDocuments()}`);
    console.log(`- Reservations: ${await db.collection('reservations').countDocuments()}`);
    console.log(`- Bills: ${await db.collection('bills').countDocuments()}`);
    console.log(`- Housekeeping Tasks: ${await db.collection('housekeeping_tasks').countDocuments()}`);
    console.log(`- Activity Logs: ${await db.collection('activity_logs').countDocuments()}`);
    
    console.log('\n✅ Database schema validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Database schema validation failed:', error);
    throw error;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  validateDatabaseSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}