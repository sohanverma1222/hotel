import { dbService } from './service';
import { closeDatabaseConnection } from './mongodb';

async function setupDatabase() {
  try {
    console.log('🔄 Setting up MongoDB database...');
    
    // Initialize collections and indexes
    await dbService.initializeCollections();
    
    // Seed default data
    await dbService.seedDefaultData();
    
    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('Default admin credentials:');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run the setup
setupDatabase();