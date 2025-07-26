import { ObjectId } from 'mongodb';

// User interface for admin authentication
export interface User {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  name: string;
  role: 'admin' | 'staff';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Room interface
export interface Room {
  _id?: ObjectId;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  price: number;
  amenities: string[];
  floor: number;
  maxOccupancy: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Guest interface
export interface Guest {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  idDocument?: {
    type: 'passport' | 'license' | 'national_id';
    number: string;
  };
  preferences?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reservation interface
export interface Reservation {
  _id?: ObjectId;
  guestId: ObjectId;
  roomId: ObjectId;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  numberOfGuests: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  specialRequests?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Billing interface
export interface Bill {
  _id?: ObjectId;
  reservationId: ObjectId;
  guestId: ObjectId;
  roomId: ObjectId;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: 'room' | 'service' | 'amenity' | 'tax';
  }[];
  subtotal: number;
  taxes: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Housekeeping interface
export interface HousekeepingTask {
  _id?: ObjectId;
  roomId: ObjectId;
  assignedTo?: ObjectId; // staff user ID
  taskType: 'cleaning' | 'maintenance' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Activity log interface for tracking user actions
export interface ActivityLog {
  _id?: ObjectId;
  userId: ObjectId;
  action: string;
  resource: string;
  resourceId?: ObjectId;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// User interface for admin users
export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// System settings interface
export interface SystemSettings {
  _id?: ObjectId;
  category: 'general' | 'hotel' | 'notification' | 'security' | 'billing';
  key: string;
  value: any;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  isEditable: boolean;
  updatedBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Notification interface
export interface Notification {
  _id?: ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: ObjectId[]; // user IDs
  readBy: { userId: ObjectId; readAt: Date }[];
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
  createdBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Hotel configuration interface
export interface HotelConfig {
  _id?: ObjectId;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    checkInTime: string;
    checkOutTime: string;
    currency: string;
    timeZone: string;
    taxRate: number;
    maxAdvanceBooking: number; // days
    cancellationPolicy: string;
  };
  features: {
    wifi: boolean;
    parking: boolean;
    breakfast: boolean;
    spa: boolean;
    pool: boolean;
    gym: boolean;
    restaurant: boolean;
    roomService: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}