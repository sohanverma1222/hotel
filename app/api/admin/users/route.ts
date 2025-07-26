import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const users = await dbService.getAllUsers();
    
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user as any;
      return safeUser;
    });
    
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const { email, name, role = 'staff', permissions = [], phone, isActive = true } = userData;
    
    // Validate required fields
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Create user with default password
    const newUser = {
      email,
      name,
      role,
      permissions,
      phone,
      isActive,
      password: 'temp123' // Default password that must be changed
    };
    
    const result = await dbService.createUser(newUser);
    
    return NextResponse.json({ 
      message: 'User created successfully', 
      userId: result.insertedId,
      defaultPassword: 'temp123'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}