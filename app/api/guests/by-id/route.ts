import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 });
    }

    const guest = await dbService.getGuestById(id);
    
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Get guest history
    const history = await dbService.getGuestHistory(id);
    
    const enhancedGuest = {
      ...guest,
      id: guest._id?.toString(),
      fullName: `${guest.firstName} ${guest.lastName}`,
      history
    };

    return NextResponse.json(enhancedGuest);
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json({ error: 'Failed to fetch guest' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, idDocument, preferences, notes } = body;
    
    const updates: any = {};
    
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (idDocument) updates.idDocument = idDocument;
    if (preferences) updates.preferences = preferences;
    if (notes !== undefined) updates.notes = notes;
    
    const result = await dbService.updateGuest(id, updates);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Guest updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 });
    }

    // Check if guest has any reservations
    const reservations = await dbService.getReservationsByGuest(id);
    if (reservations.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete guest with existing reservations' 
      }, { status: 400 });
    }

    const result = await dbService.deleteGuest(id);
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Guest deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}