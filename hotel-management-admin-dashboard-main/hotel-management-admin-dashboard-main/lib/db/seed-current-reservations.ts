import { dbService } from './service';

async function seedCurrentReservations() {
  try {
    console.log('Seeding current reservations...');
    
    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get rooms and guests
    const rooms = await dbService.getAllRooms();
    const guests = await dbService.getAllGuests();
    
    if (rooms.length === 0 || guests.length === 0) {
      console.log('No rooms or guests found. Please seed basic data first.');
      return;
    }
    
    // Create reservations for current month
    const reservations = [
      {
        roomId: rooms[0]._id!, // Single room
        guestId: guests[0]._id!,
        checkIn: new Date(currentYear, currentMonth, 20), // July 20, 2025
        checkOut: new Date(currentYear, currentMonth, 25), // July 25, 2025
        status: 'confirmed' as const,
        numberOfGuests: 1,
        totalAmount: 500,
        paidAmount: 500,
        paymentStatus: 'paid' as const,
        notes: 'Business trip - current reservation'
      },
      {
        roomId: rooms[1]._id!, // Double room
        guestId: guests[1]._id!,
        checkIn: new Date(currentYear, currentMonth, 22), // July 22, 2025
        checkOut: new Date(currentYear, currentMonth, 28), // July 28, 2025
        status: 'checked_in' as const,
        numberOfGuests: 2,
        totalAmount: 750,
        paidAmount: 750,
        paymentStatus: 'paid' as const,
        notes: 'Family vacation - currently checked in'
      },
      {
        roomId: rooms[2]._id!, // Suite
        guestId: guests[2]._id!,
        checkIn: new Date(currentYear, currentMonth, 24), // July 24, 2025
        checkOut: new Date(currentYear, currentMonth, 30), // July 30, 2025
        status: 'confirmed' as const,
        numberOfGuests: 2,
        totalAmount: 1200,
        paidAmount: 600,
        paymentStatus: 'partial' as const,
        notes: 'Honeymoon suite - arriving soon'
      },
      {
        roomId: rooms[3]._id!, // Deluxe
        guestId: guests[3]._id!,
        checkIn: new Date(currentYear, currentMonth, 26), // July 26, 2025
        checkOut: new Date(currentYear, currentMonth, 31), // July 31, 2025
        status: 'confirmed' as const,
        numberOfGuests: 1,
        totalAmount: 1000,
        paidAmount: 0,
        paymentStatus: 'pending' as const,
        notes: 'Executive stay - future booking'
      }
    ];
    
    // Insert reservations
    for (const reservation of reservations) {
      await dbService.createReservation(reservation);
      console.log(`Created reservation for ${reservation.guestId} in room ${reservation.roomId}`);
    }
    
    // Generate bills for these reservations
    const allReservations = await dbService.getAllReservations();
    const recentReservations = allReservations.filter(r => r.checkIn.getFullYear() === currentYear);
    
    for (const reservation of recentReservations) {
      try {
        await dbService.generateBillFromReservation(reservation._id!.toString());
        console.log(`Generated bill for reservation ${reservation._id}`);
      } catch (error) {
        console.log(`Bill already exists for reservation ${reservation._id}`);
      }
    }
    
    console.log('Current reservations seeded successfully!');
  } catch (error) {
    console.error('Error seeding current reservations:', error);
  }
}

seedCurrentReservations();