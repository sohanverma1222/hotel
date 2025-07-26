import { dbService } from './service';
import { closeDatabaseConnection } from './mongodb';

async function seed() {
  console.log('\n=== Admin Account Setup ===');
  console.log('Creating default admin account...\n');
  
  const email = 'test@test.com';
  const password = 'admin123';
  const name = 'Admin User';
  
  console.log(`Creating admin account with email: ${email}`);

  const result = await dbService.createUser({
    email: email,
    password: password,
    name: name,
    role: 'admin',
    permissions: ['all'],
    isActive: true,
  });

  console.log('\n=== Admin Account Created Successfully ===');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Name: ${name}`);
  console.log('\nYou can now login to the admin panel with these credentials.');
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seed process finished. Exiting...');
    await closeDatabaseConnection();
    process.exit(0);
  });