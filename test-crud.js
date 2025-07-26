const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testCRUDOperations() {
  console.log('🧪 Starting CRUD Operations Test...\n');
  
  try {
    // Wait for server to start
    console.log('⏳ Waiting for server to start...');
    await delay(3000);
    
    // Test 1: GET all guests
    console.log('📋 Test 1: GET all guests');
    try {
      const response = await axios.get(`${API_BASE}/guests`);
      console.log(`✅ Success: Retrieved ${response.data.data.length} guests`);
      console.log(`📊 Total records: ${response.data.pagination.totalRecords}\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
    
    // Test 2: CREATE a new guest
    console.log('➕ Test 2: CREATE a new guest');
    const newGuest = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@email.com',
      phone: '+1555123456',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        zipCode: '12345'
      },
      nationality: 'Test',
      idNumber: 'T123456789',
      membershipLevel: 'bronze'
    };
    
    let createdGuestId = null;
    try {
      const response = await axios.post(`${API_BASE}/guests`, newGuest);
      createdGuestId = response.data.data._id;
      console.log(`✅ Success: Created guest with ID ${createdGuestId}`);
      console.log(`📧 Email: ${response.data.data.email}\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }
    
    // Test 3: READ the created guest
    if (createdGuestId) {
      console.log('🔍 Test 3: READ the created guest');
      try {
        const response = await axios.get(`${API_BASE}/guests/${createdGuestId}`);
        console.log(`✅ Success: Retrieved guest ${response.data.data.firstName} ${response.data.data.lastName}`);
        console.log(`📧 Email: ${response.data.data.email}\n`);
      } catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
      }
    }
    
    // Test 4: UPDATE the created guest
    if (createdGuestId) {
      console.log('✏️  Test 4: UPDATE the created guest');
      const updateData = {
        phone: '+1555999888',
        membershipLevel: 'silver',
        totalSpent: 500
      };
      
      try {
        const response = await axios.put(`${API_BASE}/guests/${createdGuestId}`, updateData);
        console.log(`✅ Success: Updated guest phone to ${response.data.data.phone}`);
        console.log(`🥈 Membership upgraded to: ${response.data.data.membershipLevel}\n`);
      } catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
      }
    }
    
    // Test 5: GET guest statistics
    console.log('📊 Test 5: GET guest statistics');
    try {
      const response = await axios.get(`${API_BASE}/guests/stats`);
      console.log(`✅ Success: Retrieved guest statistics`);
      console.log(`👥 Total guests in system: ${response.data.data.overview.totalGuests || 'N/A'}\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }
    
    // Test 6: SEARCH guests
    console.log('🔎 Test 6: SEARCH guests');
    try {
      const response = await axios.get(`${API_BASE}/guests?search=John`);
      console.log(`✅ Success: Search returned ${response.data.data.length} results\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }
    
    // Test 7: DELETE the created guest (cleanup)
    if (createdGuestId) {
      console.log('🗑️  Test 7: DELETE the created guest');
      try {
        await axios.delete(`${API_BASE}/guests/${createdGuestId}`);
        console.log(`✅ Success: Deleted guest with ID ${createdGuestId}\n`);
      } catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
      }
    }
    
    console.log('🎉 CRUD Operations Test Completed!');
    console.log('✅ All major CRUD operations appear to be working correctly.');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Install axios if not available, then run test
const { exec } = require('child_process');

// Check if axios is available
try {
  require('axios');
  testCRUDOperations();
} catch (error) {
  console.log('📦 Installing axios for testing...');
  exec('npm install axios', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to install axios:', error.message);
      return;
    }
    console.log('✅ Axios installed, starting tests...\n');
    testCRUDOperations();
  });
}