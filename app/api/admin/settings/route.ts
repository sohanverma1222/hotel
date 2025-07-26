import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let settings;
    if (category) {
      settings = await dbService.getSettingsByCategory(category as any);
    } else {
      settings = await dbService.getAllSettings();
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const settingData = await request.json();
    const { category, key, value, description, type = 'string', isEditable = true } = settingData;
    
    // Validate required fields
    if (!category || !key || value === undefined) {
      return NextResponse.json({ error: 'Category, key, and value are required' }, { status: 400 });
    }
    
    // Check if setting already exists
    const existingSetting = await dbService.getSettingByKey(key);
    if (existingSetting) {
      return NextResponse.json({ error: 'Setting with this key already exists' }, { status: 400 });
    }
    
    const newSetting = {
      category,
      key,
      value,
      description,
      type,
      isEditable
    };
    
    const result = await dbService.createSetting(newSetting);
    
    return NextResponse.json({ 
      message: 'Setting created successfully', 
      settingId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
  }
}