import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let guests;
    
    if (search) {
      guests = await dbService.searchGuests(search);
    } else if (startDate && endDate) {
      guests = await dbService.getGuestsByDateRange(new Date(startDate), new Date(endDate));
    } else {
      guests = await dbService.getAllGuests();
    }

    // Enhanced guests with basic statistics
    const enhancedGuests = await Promise.all(
      guests.map(async (guest) => {
        const reservations = await dbService.getReservationsByGuest(guest._id!.toString());
        
        // Get bills for all reservations of this guest
        const allBills = [];
        for (const reservation of reservations) {
          const bills = await dbService.getBillsByReservation(reservation._id!.toString());
          allBills.push(...bills);
        }
        
        const totalSpent = allBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.total : 0), 0);
        const lastVisit = reservations.length > 0 ? reservations[0].checkOut : null;
        const visitCount = reservations.filter(r => r.status === 'checked_out').length;
        
        return {
          ...guest,
          id: guest._id?.toString(),
          fullName: `${guest.firstName} ${guest.lastName}`,
          totalSpent,
          lastVisit,
          visitCount,
          status: totalSpent > 1000 ? 'VIP' : visitCount > 1 ? 'Returning' : 'New'
        };
      })
    );

    return NextResponse.json(enhancedGuests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, idDocument, preferences, notes } = body;
    
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if guest already exists
    const existingGuest = await dbService.findGuestByEmail(email);
    if (existingGuest) {
      return NextResponse.json({ error: 'Guest with this email already exists' }, { status: 400 });
    }

    const guestData = {
      firstName,
      lastName,
      email,
      phone,
      address,
      idDocument,
      preferences: preferences || [],
      notes: notes || ''
    };

    const result = await dbService.createGuest(guestData);
    
    return NextResponse.json({ 
      success: true, 
      guestId: result.insertedId,
      message: 'Guest created successfully'
    });
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 });
  }
}