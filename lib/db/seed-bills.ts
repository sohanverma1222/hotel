import { dbService } from './service';
import { ObjectId } from 'mongodb';

export async function seedBills() {
  try {
    console.log('🌱 Starting bill seeding...');
    
    // Get existing reservations to generate bills for
    const reservations = await dbService.getAllReservations();
    
    if (reservations.length === 0) {
      console.log('⚠️  No reservations found. Please seed reservations first.');
      return;
    }

    // Generate bills for each reservation
    for (const reservation of reservations) {
      try {
        // Check if bill already exists
        const existingBills = await dbService.getBillsByReservation(reservation._id!.toString());
        
        if (existingBills.length > 0) {
          console.log(`⏭️  Bill already exists for reservation ${reservation._id}`);
          continue;
        }

        // Generate bill from reservation
        const result = await dbService.generateBillFromReservation(reservation._id!.toString());
        console.log(`✅ Generated bill for reservation ${reservation._id}: ${result.insertedId}`);
        
        // Update some bills to different statuses for testing
        const billId = result.insertedId.toString();
        const randomStatus = Math.random();
        
        if (randomStatus < 0.25) {
          // 25% chance to be paid
          await dbService.updateBillStatus(billId, 'paid', new Date());
          console.log(`💰 Bill ${billId} marked as paid`);
        } else if (randomStatus < 0.5) {
          // 25% chance to be sent
          await dbService.updateBillStatus(billId, 'sent');
          console.log(`📧 Bill ${billId} marked as sent`);
        } else if (randomStatus < 0.75) {
          // 25% chance to be overdue
          const pastDue = new Date();
          pastDue.setDate(pastDue.getDate() - 5); // 5 days ago
          await dbService.updateBill(billId, { 
            status: 'overdue', 
            dueDate: pastDue 
          });
          console.log(`⏰ Bill ${billId} marked as overdue`);
        }
        // 25% remain as draft
        
      } catch (error) {
        console.error(`❌ Error generating bill for reservation ${reservation._id}:`, error);
      }
    }
    
    console.log('✅ Bill seeding completed');
    
  } catch (error) {
    console.error('❌ Error seeding bills:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedBills()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to seed bills:', error);
      process.exit(1);
    });
}