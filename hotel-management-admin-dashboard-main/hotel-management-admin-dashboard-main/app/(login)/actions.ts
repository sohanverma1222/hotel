'use server';

import { z } from 'zod';
import { dbService } from '@/lib/db/service';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { User } from '@/lib/db/models';

async function logActivity(
  userId: string,
  action: string,
  ipAddress?: string,
  metadata?: string
) {
  await dbService.logActivity({
    userId: new (require('mongodb').ObjectId)(userId),
    action,
    resource: 'auth',
    details: { metadata },
    ipAddress: ipAddress || '',
  });
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const user = await dbService.validateUser(email, password);

  if (!user) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(user),
    logActivity(user._id!.toString(), 'SIGN_IN')
  ]);

  redirect('/admin');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1, 'Name is required')
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name } = data;

  const existingUser = await dbService.findUserByEmail(email);

  if (existingUser) {
    return {
      error: 'User with this email already exists. Please try again.',
      email,
      password,
      name
    };
  }

  try {
    const result = await dbService.createUser({
      email,
      password, // Will be hashed in createUser method
      name,
      role: 'staff', // Default role for new users
      isActive: true
    });

    const newUser = await dbService.findUserByEmail(email);

    if (!newUser) {
      return {
        error: 'Failed to create user. Please try again.',
        email,
        password,
        name
      };
    }

    await Promise.all([
      logActivity(newUser._id!.toString(), 'SIGN_UP'),
      setSession(newUser)
    ]);

    redirect('/admin');
  } catch (error) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
      name
    };
  }
});

export async function signOut() {
  const user = await getUser();
  if (user) {
    await logActivity(user.id, 'SIGN_OUT');
  }
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      return {
        error: 'New passwords do not match.',
        currentPassword,
        newPassword,
        confirmPassword
      };
    }

    const mongoUser = await dbService.findUserByEmail(user.email);
    if (!mongoUser) {
      return {
        error: 'User not found.',
        currentPassword,
        newPassword,
        confirmPassword
      };
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      mongoUser.password
    );

    if (!isPasswordValid) {
      return {
        error: 'Current password is incorrect.',
        currentPassword,
        newPassword,
        confirmPassword
      };
    }

    const hashedNewPassword = await hashPassword(newPassword);

    // Update password in MongoDB
    const { connectToDatabase } = require('@/lib/db/mongodb');
    const { ObjectId } = require('mongodb');
    
    const connection = await connectToDatabase();
    await connection.db.collection('users').updateOne(
      { _id: new ObjectId(mongoUser._id) },
      { $set: { password: hashedNewPassword, updatedAt: new Date() } }
    );

    await logActivity(mongoUser._id!.toString(), 'PASSWORD_UPDATE');

    return {
      success: 'Password updated successfully.',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }
);

export const deleteAccount = validatedActionWithUser(
  z.object({
    password: z.string().min(8).max(100)
  }),
  async (data, _, user) => {
    const { password } = data;

    const mongoUser = await dbService.findUserByEmail(user.email);
    if (!mongoUser) {
      return {
        error: 'User not found.',
        password
      };
    }

    const isPasswordValid = await comparePasswords(
      password,
      mongoUser.password
    );

    if (!isPasswordValid) {
      return {
        error: 'Incorrect password.',
        password
      };
    }

    // Deactivate user instead of deleting
    const { connectToDatabase } = require('@/lib/db/mongodb');
    const { ObjectId } = require('mongodb');
    
    const connection = await connectToDatabase();
    await connection.db.collection('users').updateOne(
      { _id: new ObjectId(mongoUser._id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    await logActivity(mongoUser._id!.toString(), 'ACCOUNT_DELETED');
    (await cookies()).delete('session');
    
    redirect('/sign-in');
  }
);