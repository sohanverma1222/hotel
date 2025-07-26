import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { dbService } from './service';
import { ObjectId } from 'mongodb';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  // Return the user data from the session (already contains the needed info)
  return sessionData.user;
}

export async function getUserFromDatabase(userId: string) {
  try {
    const { connectToDatabase } = require('./mongodb');
    const connection = await connectToDatabase();
    
    const user = await connection.db.collection('users').findOne({ 
      _id: new ObjectId(userId),
      isActive: true
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { connectToDatabase } = require('./mongodb');
    const connection = await connectToDatabase();
    
    const activities = await connection.db.collection('activity_logs')
      .find({ userId: new ObjectId(user.id) })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    return activities;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

export async function getAllActivityLogs() {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    throw new Error('User not authenticated or not authorized');
  }

  try {
    const { connectToDatabase } = require('./mongodb');
    const connection = await connectToDatabase();
    
    const activities = await connection.db.collection('activity_logs')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            action: 1,
            resource: 1,
            timestamp: 1,
            ipAddress: 1,
            details: 1,
            userName: '$user.name',
            userEmail: '$user.email'
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $limit: 50
        }
      ])
      .toArray();
    
    return activities;
  } catch (error) {
    console.error('Error fetching all activity logs:', error);
    return [];
  }
}