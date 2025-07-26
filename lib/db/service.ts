import { Db, Collection, ObjectId, InsertOneResult, UpdateResult, DeleteResult } from 'mongodb';
import { connectToDatabase } from './mongodb';
import { User, Room, Guest, Reservation, Bill, HousekeepingTask, ActivityLog, SystemSettings, Notification, HotelConfig } from './models';
import bcryptjs from 'bcryptjs';

export class DatabaseService {
  private db: Db | null = null;

  private async getDb(): Promise<Db> {
    if (!this.db) {
      const connection = await connectToDatabase();
      this.db = connection.db;
    }
    return this.db;
  }

  // User operations
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const hashedPassword = await bcryptjs.hash(userData.password, 12);
    
    const user: Omit<User, '_id'> = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<User>('users').insertOne(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDb();
    return await db.collection<User>('users').findOne({ email });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    // Check for hardcoded admin credentials first
    if (email === 'admin@hotel.com' && password === 'admin123') {
      // Return a mock admin user object for the hardcoded credentials
      return {
        _id: new ObjectId('507f1f77bcf86cd799439011'), // Fixed ObjectId for admin
        email: 'admin@hotel.com',
        password: '', // Not needed for hardcoded admin
        name: 'System Administrator',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      } as User;
    }

    // For all other credentials, check the database
    const user = await this.findUserByEmail(email);
    if (!user || !user.isActive) return null;

    const isValid = await bcryptjs.compare(password, user.password);
    return isValid ? user : null;
  }

  // Room operations
  async createRoom(roomData: Omit<Room, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const room: Omit<Room, '_id'> = {
      ...roomData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<Room>('rooms').insertOne(room);
  }

  async getAllRooms(): Promise<Room[]> {
    const db = await this.getDb();
    return await db.collection<Room>('rooms').find({}).sort({ roomNumber: 1 }).toArray();
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    const db = await this.getDb();
    return await db.collection<Room>('rooms').findOne({ _id: new ObjectId(roomId) });
  }

  async updateRoomStatus(roomId: string, status: Room['status']): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<Room>('rooms').updateOne(
      { _id: new ObjectId(roomId) },
      { $set: { status, updatedAt: new Date() } }
    );
  }

  // Guest operations
  async createGuest(guestData: Omit<Guest, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const guest: Omit<Guest, '_id'> = {
      ...guestData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<Guest>('guests').insertOne(guest);
  }

  async findGuestById(guestId: string): Promise<Guest | null> {
    const db = await this.getDb();
    return await db.collection<Guest>('guests').findOne({ _id: new ObjectId(guestId) });
  }

  async getGuestById(guestId: string): Promise<Guest | null> {
    const db = await this.getDb();
    return await db.collection<Guest>('guests').findOne({ _id: new ObjectId(guestId) });
  }

  async getAllGuests(): Promise<Guest[]> {
    const db = await this.getDb();
    return await db.collection<Guest>('guests').find({}).sort({ lastName: 1, firstName: 1 }).toArray();
  }

  async getGuestsPaginated(page: number = 1, limit: number = 10, searchQuery?: string): Promise<{
    guests: Guest[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const db = await this.getDb();
    const skip = (page - 1) * limit;
    
    let query = {};
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      query = {
        $or: [
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
          { email: { $regex: regex } },
          { phone: { $regex: regex } }
        ]
      };
    }

    const [guests, totalCount] = await Promise.all([
      db.collection<Guest>('guests')
        .find(query)
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<Guest>('guests').countDocuments(query)
    ]);

    return {
      guests,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  async searchGuests(query: string): Promise<Guest[]> {
    const db = await this.getDb();
    const regex = new RegExp(query, 'i');
    return await db.collection<Guest>('guests').find({
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } }
      ]
    }).toArray();
  }

  async updateGuest(guestId: string, updates: Partial<Guest>): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<Guest>('guests').updateOne(
      { _id: new ObjectId(guestId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async deleteGuest(guestId: string): Promise<DeleteResult> {
    const db = await this.getDb();
    return await db.collection<Guest>('guests').deleteOne({ _id: new ObjectId(guestId) });
  }

  async findGuestByEmail(email: string): Promise<Guest | null> {
    const db = await this.getDb();
    return await db.collection<Guest>('guests').findOne({ email });
  }

  async getGuestHistory(guestId: string): Promise<{
    reservations: Reservation[];
    bills: Bill[];
    totalSpent: number;
    lastVisit: Date | null;
    visitCount: number;
    preferredRoomType: string | null;
  }> {
    const db = await this.getDb();
    const objectId = new ObjectId(guestId);
    
    // Get reservations
    const reservations = await db.collection<Reservation>('reservations')
      .find({ guestId: objectId })
      .sort({ checkIn: -1 })
      .toArray();
    
    // Get bills
    const bills = await db.collection<Bill>('bills')
      .find({ guestId: objectId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate statistics
    const totalSpent = bills.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.total : 0), 0);
    const lastVisit = reservations.length > 0 ? reservations[0].checkOut : null;
    const visitCount = reservations.filter(r => r.status === 'checked_out').length;
    
    // Find preferred room type
    const roomTypeCounts: { [key: string]: number } = {};
    for (const reservation of reservations) {
      const room = await this.getRoomById(reservation.roomId.toString());
      if (room) {
        roomTypeCounts[room.type] = (roomTypeCounts[room.type] || 0) + 1;
      }
    }
    
    const preferredRoomType = Object.keys(roomTypeCounts).length > 0 
      ? Object.entries(roomTypeCounts).sort(([,a], [,b]) => b - a)[0][0]
      : null;
    
    return {
      reservations,
      bills,
      totalSpent,
      lastVisit,
      visitCount,
      preferredRoomType
    };
  }

  async getGuestsByDateRange(startDate: Date, endDate: Date): Promise<Guest[]> {
    const db = await this.getDb();
    return await db.collection<Guest>('guests').find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 }).toArray();
  }

  async getGuestStats(): Promise<{
    totalGuests: number;
    newGuestsThisMonth: number;
    vipGuests: number;
    returningGuests: number;
    averageSpending: number;
  }> {
    const db = await this.getDb();
    
    const totalGuests = await db.collection<Guest>('guests').countDocuments();
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newGuestsThisMonth = await db.collection<Guest>('guests').countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    // Get all reservations to calculate returning guests
    const reservations = await db.collection<Reservation>('reservations').find({}).toArray();
    const guestReservationCounts: { [key: string]: number } = {};
    
    reservations.forEach(reservation => {
      const guestId = reservation.guestId.toString();
      guestReservationCounts[guestId] = (guestReservationCounts[guestId] || 0) + 1;
    });
    
    const returningGuests = Object.values(guestReservationCounts).filter(count => count > 1).length;
    
    // Calculate VIP guests (guests with total spending > $1000)
    const bills = await db.collection<Bill>('bills').find({ status: 'paid' }).toArray();
    const guestSpending: { [key: string]: number } = {};
    
    bills.forEach(bill => {
      const guestId = bill.guestId.toString();
      guestSpending[guestId] = (guestSpending[guestId] || 0) + bill.total;
    });
    
    const vipGuests = Object.values(guestSpending).filter(spending => spending > 1000).length;
    const averageSpending = Object.values(guestSpending).reduce((sum, spending) => sum + spending, 0) / Object.keys(guestSpending).length || 0;
    
    return {
      totalGuests,
      newGuestsThisMonth,
      vipGuests,
      returningGuests,
      averageSpending
    };
  }

  // Reservation operations
  async createReservation(reservationData: Omit<Reservation, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const reservation: Omit<Reservation, '_id'> = {
      ...reservationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<Reservation>('reservations').insertOne(reservation);
  }

  async getReservationsByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]> {
    const db = await this.getDb();
    return await db.collection<Reservation>('reservations').find({
      $or: [
        { checkIn: { $gte: startDate, $lte: endDate } },
        { checkOut: { $gte: startDate, $lte: endDate } },
        { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
      ]
    }).toArray();
  }

  async updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<Reservation>('reservations').updateOne(
      { _id: new ObjectId(reservationId) },
      { $set: { status, updatedAt: new Date() } }
    );
  }

  async updateReservation(reservationId: string, updates: Partial<Reservation>): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<Reservation>('reservations').updateOne(
      { _id: new ObjectId(reservationId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async getAllReservations(): Promise<Reservation[]> {
    const db = await this.getDb();
    return await db.collection<Reservation>('reservations').find({}).sort({ createdAt: -1 }).toArray();
  }

  async getReservationsPaginated(page: number = 1, limit: number = 10, filters?: {
    status?: string;
    searchQuery?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<{
    reservations: Reservation[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const db = await this.getDb();
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.dateRange) {
      query.checkIn = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }
    
    // Note: For searchQuery, we'd need to populate guest/room data
    // This is a simplified version
    
    const [reservations, totalCount] = await Promise.all([
      db.collection<Reservation>('reservations')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<Reservation>('reservations').countDocuments(query)
    ]);

    return {
      reservations,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  async getReservationById(reservationId: string): Promise<Reservation | null> {
    const db = await this.getDb();
    return await db.collection<Reservation>('reservations').findOne({ _id: new ObjectId(reservationId) });
  }

  async checkRoomAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeReservationId?: string
  ): Promise<Reservation[]> {
    const db = await this.getDb();
    const query: any = {
      roomId: new ObjectId(roomId),
      status: { $in: ['confirmed', 'checked_in'] },
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn }
        }
      ]
    };

    if (excludeReservationId) {
      query._id = { $ne: new ObjectId(excludeReservationId) };
    }

    return await db.collection<Reservation>('reservations').find(query).toArray();
  }

  async getReservationsByRoom(roomId: string): Promise<Reservation[]> {
    const db = await this.getDb();
    return await db.collection<Reservation>('reservations')
      .find({ roomId: new ObjectId(roomId) })
      .sort({ checkIn: 1 })
      .toArray();
  }

  async getReservationsByGuest(guestId: string): Promise<Reservation[]> {
    const db = await this.getDb();
    return await db.collection<Reservation>('reservations')
      .find({ guestId: new ObjectId(guestId) })
      .sort({ checkIn: -1 })
      .toArray();
  }

  // Bill operations
  async createBill(billData: Omit<Bill, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const bill: Omit<Bill, '_id'> = {
      ...billData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<Bill>('bills').insertOne(bill);
  }

  async getBillsByReservation(reservationId: string): Promise<Bill[]> {
    const db = await this.getDb();
    return await db.collection<Bill>('bills').find({
      reservationId: new ObjectId(reservationId)
    }).toArray();
  }

  async getAllBills(): Promise<Bill[]> {
    const db = await this.getDb();
    return await db.collection<Bill>('bills').find({}).sort({ createdAt: -1 }).toArray();
  }

  async getBillsPaginated(page: number = 1, limit: number = 10, filters?: {
    status?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<{
    bills: Bill[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const db = await this.getDb();
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.dateRange) {
      query.createdAt = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }
    
    const [bills, totalCount] = await Promise.all([
      db.collection<Bill>('bills')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<Bill>('bills').countDocuments(query)
    ]);

    return {
      bills,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  async getBillById(billId: string): Promise<Bill | null> {
    const db = await this.getDb();
    return await db.collection<Bill>('bills').findOne({ _id: new ObjectId(billId) });
  }

  async updateBillStatus(billId: string, status: Bill['status'], paidDate?: Date): Promise<UpdateResult> {
    const db = await this.getDb();
    const updateData: any = { status, updatedAt: new Date() };
    if (paidDate) {
      updateData.paidDate = paidDate;
    }
    return await db.collection<Bill>('bills').updateOne(
      { _id: new ObjectId(billId) },
      { $set: updateData }
    );
  }

  async updateBill(billId: string, updates: Partial<Bill>): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<Bill>('bills').updateOne(
      { _id: new ObjectId(billId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async getBillsByStatus(status: Bill['status']): Promise<Bill[]> {
    const db = await this.getDb();
    return await db.collection<Bill>('bills').find({ status }).sort({ createdAt: -1 }).toArray();
  }

  async getBillsByDateRange(startDate: Date, endDate: Date): Promise<Bill[]> {
    const db = await this.getDb();
    return await db.collection<Bill>('bills').find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 }).toArray();
  }

  async deleteBill(billId: string): Promise<DeleteResult> {
    const db = await this.getDb();
    return await db.collection<Bill>('bills').deleteOne({ _id: new ObjectId(billId) });
  }

  async generateBillFromReservation(reservationId: string): Promise<InsertOneResult> {
    const reservation = await this.getReservationById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const room = await this.getRoomById(reservation.roomId.toString());
    if (!room) {
      throw new Error('Room not found');
    }

    const guest = await this.getGuestById(reservation.guestId.toString());
    if (!guest) {
      throw new Error('Guest not found');
    }

    const nights = Math.ceil((reservation.checkOut.getTime() - reservation.checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const roomCharge = room.price * nights;
    const taxRate = 0.1; // 10% tax rate
    const taxes = roomCharge * taxRate;
    const total = roomCharge + taxes;

    const billData: Omit<Bill, '_id' | 'createdAt' | 'updatedAt'> = {
      reservationId: reservation._id!,
      guestId: reservation.guestId,
      roomId: reservation.roomId,
      items: [
        {
          description: `${room.type} room charges (${nights} nights)`,
          quantity: nights,
          unitPrice: room.price,
          totalPrice: roomCharge,
          category: 'room'
        }
      ],
      subtotal: roomCharge,
      taxes: taxes,
      total: total,
      status: 'draft',
      dueDate: reservation.checkOut
    };

    return await this.createBill(billData);
  }

  // Housekeeping operations
  async createHousekeepingTask(taskData: Omit<HousekeepingTask, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const task: Omit<HousekeepingTask, '_id'> = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<HousekeepingTask>('housekeeping_tasks').insertOne(task);
  }

  async getHousekeepingTasks(status?: HousekeepingTask['status']): Promise<HousekeepingTask[]> {
    const db = await this.getDb();
    const filter = status ? { status } : {};
    return await db.collection<HousekeepingTask>('housekeeping_tasks').find(filter).toArray();
  }

  async updateHousekeepingTask(taskId: string, updates: Partial<HousekeepingTask>): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<HousekeepingTask>('housekeeping_tasks').updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async getHousekeepingTasksByRoom(roomId: string): Promise<HousekeepingTask[]> {
    const db = await this.getDb();
    return await db.collection<HousekeepingTask>('housekeeping_tasks')
      .find({ roomId: new ObjectId(roomId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getHousekeepingTaskById(taskId: string): Promise<HousekeepingTask | null> {
    const db = await this.getDb();
    return await db.collection<HousekeepingTask>('housekeeping_tasks')
      .findOne({ _id: new ObjectId(taskId) });
  }

  async deleteHousekeepingTask(taskId: string): Promise<DeleteResult> {
    const db = await this.getDb();
    return await db.collection<HousekeepingTask>('housekeeping_tasks')
      .deleteOne({ _id: new ObjectId(taskId) });
  }

  async getHousekeepingStats(): Promise<{
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    onHoldTasks: number;
    urgentTasks: number;
    averageCompletionTime: number;
  }> {
    const db = await this.getDb();
    
    const totalTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').countDocuments();
    const pendingTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').countDocuments({ status: 'pending' });
    const inProgressTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').countDocuments({ status: 'in_progress' });
    const completedTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').countDocuments({ status: 'completed' });
    const onHoldTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').countDocuments({ status: 'on_hold' });
    const urgentTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').countDocuments({ priority: 'urgent' });
    
    // Calculate average completion time
    const completedTasksWithDuration = await db.collection<HousekeepingTask>('housekeeping_tasks')
      .find({ status: 'completed', actualDuration: { $exists: true } })
      .toArray();
    
    const averageCompletionTime = completedTasksWithDuration.length > 0
      ? completedTasksWithDuration.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasksWithDuration.length
      : 0;
    
    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      onHoldTasks,
      urgentTasks,
      averageCompletionTime
    };
  }

  async getHousekeepingTasksByDateRange(startDate: Date, endDate: Date): Promise<HousekeepingTask[]> {
    const db = await this.getDb();
    return await db.collection<HousekeepingTask>('housekeeping_tasks')
      .find({
        createdAt: { $gte: startDate, $lte: endDate }
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Reports operations
  async getOccupancyReport(startDate: Date, endDate: Date): Promise<{
    totalRooms: number;
    averageOccupancy: number;
    occupancyByDate: { date: string; occupied: number; available: number; occupancyRate: number }[];
    occupancyByRoomType: { roomType: string; totalRooms: number; averageOccupancy: number }[];
    peakOccupancyDate: string;
    lowestOccupancyDate: string;
  }> {
    const db = await this.getDb();
    
    // Get all rooms
    const rooms = await db.collection<Room>('rooms').find({}).toArray();
    const totalRooms = rooms.length;
    
    // Get reservations within date range
    const reservations = await db.collection<Reservation>('reservations').find({
      $or: [
        { checkIn: { $gte: startDate, $lte: endDate } },
        { checkOut: { $gte: startDate, $lte: endDate } },
        { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
      ]
    }).toArray();
    
    // Calculate occupancy by date
    const occupancyByDate: { date: string; occupied: number; available: number; occupancyRate: number }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const occupiedRooms = reservations.filter(r => 
        r.checkIn <= currentDate && r.checkOut > currentDate
      ).length;
      
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
      
      occupancyByDate.push({
        date: dateStr,
        occupied: occupiedRooms,
        available: totalRooms - occupiedRooms,
        occupancyRate: parseFloat(occupancyRate.toFixed(2))
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate average occupancy
    const averageOccupancy = occupancyByDate.reduce((sum, day) => sum + day.occupancyRate, 0) / occupancyByDate.length;
    
    // Find peak and lowest occupancy dates
    const peakDay = occupancyByDate.reduce((max, day) => day.occupancyRate > max.occupancyRate ? day : max);
    const lowestDay = occupancyByDate.reduce((min, day) => day.occupancyRate < min.occupancyRate ? day : min);
    
    // Calculate occupancy by room type
    const roomTypeStats: { [key: string]: { total: number; occupied: number } } = {};
    
    rooms.forEach(room => {
      if (!roomTypeStats[room.type]) {
        roomTypeStats[room.type] = { total: 0, occupied: 0 };
      }
      roomTypeStats[room.type].total++;
    });
    
    // Count occupied days by room type
    reservations.forEach(reservation => {
      const room = rooms.find(r => r._id!.toString() === reservation.roomId.toString());
      if (room) {
        const days = Math.ceil((Math.min(reservation.checkOut.getTime(), endDate.getTime()) - Math.max(reservation.checkIn.getTime(), startDate.getTime())) / (1000 * 60 * 60 * 24));
        roomTypeStats[room.type].occupied += days;
      }
    });
    
    const occupancyByRoomType = Object.entries(roomTypeStats).map(([roomType, stats]) => {
      const totalDays = stats.total * occupancyByDate.length;
      const averageOccupancy = totalDays > 0 ? (stats.occupied / totalDays) * 100 : 0;
      
      return {
        roomType,
        totalRooms: stats.total,
        averageOccupancy: parseFloat(averageOccupancy.toFixed(2))
      };
    });
    
    return {
      totalRooms,
      averageOccupancy: parseFloat(averageOccupancy.toFixed(2)),
      occupancyByDate,
      occupancyByRoomType,
      peakOccupancyDate: peakDay.date,
      lowestOccupancyDate: lowestDay.date
    };
  }

  async getRevenueReport(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    revenueByDate: { date: string; revenue: number; bookings: number }[];
    revenueByRoomType: { roomType: string; revenue: number; bookings: number; averageRate: number }[];
    paymentStatusBreakdown: { status: string; revenue: number; count: number }[];
    topRevenueDate: string;
    averageDailyRevenue: number;
    totalBookings: number;
  }> {
    const db = await this.getDb();
    
    // Get paid bills within date range
    const bills = await db.collection<Bill>('bills').find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.total, 0);
    const totalBookings = bills.length;
    
    // Revenue by date
    const revenueByDate: { date: string; revenue: number; bookings: number }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBills = bills.filter(b => {
        const billDate = b.createdAt.toISOString().split('T')[0];
        return billDate === dateStr;
      });
      
      const dayRevenue = dayBills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.total, 0);
      
      revenueByDate.push({
        date: dateStr,
        revenue: dayRevenue,
        bookings: dayBills.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Revenue by room type
    const rooms = await db.collection<Room>('rooms').find({}).toArray();
    const roomTypeRevenue: { [key: string]: { revenue: number; bookings: number } } = {};
    
    for (const bill of bills) {
      const room = rooms.find(r => r._id!.toString() === bill.roomId.toString());
      if (room) {
        if (!roomTypeRevenue[room.type]) {
          roomTypeRevenue[room.type] = { revenue: 0, bookings: 0 };
        }
        
        if (bill.status === 'paid') {
          roomTypeRevenue[room.type].revenue += bill.total;
        }
        roomTypeRevenue[room.type].bookings++;
      }
    }
    
    const revenueByRoomType = Object.entries(roomTypeRevenue).map(([roomType, stats]) => ({
      roomType,
      revenue: stats.revenue,
      bookings: stats.bookings,
      averageRate: stats.bookings > 0 ? stats.revenue / stats.bookings : 0
    }));
    
    // Payment status breakdown
    const statusBreakdown: { [key: string]: { revenue: number; count: number } } = {};
    
    bills.forEach(bill => {
      if (!statusBreakdown[bill.status]) {
        statusBreakdown[bill.status] = { revenue: 0, count: 0 };
      }
      statusBreakdown[bill.status].revenue += bill.total;
      statusBreakdown[bill.status].count++;
    });
    
    const paymentStatusBreakdown = Object.entries(statusBreakdown).map(([status, stats]) => ({
      status,
      revenue: stats.revenue,
      count: stats.count
    }));
    
    // Find top revenue date
    const topDay = revenueByDate.reduce((max, day) => day.revenue > max.revenue ? day : max);
    const averageDailyRevenue = revenueByDate.reduce((sum, day) => sum + day.revenue, 0) / revenueByDate.length;
    
    return {
      totalRevenue,
      revenueByDate,
      revenueByRoomType,
      paymentStatusBreakdown,
      topRevenueDate: topDay.date,
      averageDailyRevenue,
      totalBookings
    };
  }

  async getRoomUtilizationReport(startDate: Date, endDate: Date): Promise<{
    roomUtilization: { roomNumber: string; roomType: string; utilizationRate: number; totalDays: number; occupiedDays: number; revenue: number }[];
    averageUtilization: number;
    topPerformingRooms: { roomNumber: string; utilizationRate: number; revenue: number }[];
    underutilizedRooms: { roomNumber: string; utilizationRate: number; revenue: number }[];
    maintenanceImpact: { roomNumber: string; maintenanceDays: number; lostRevenue: number }[];
  }> {
    const db = await this.getDb();
    
    // Get all rooms
    const rooms = await db.collection<Room>('rooms').find({}).toArray();
    
    // Get reservations and bills within date range
    const reservations = await db.collection<Reservation>('reservations').find({
      $or: [
        { checkIn: { $gte: startDate, $lte: endDate } },
        { checkOut: { $gte: startDate, $lte: endDate } },
        { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
      ]
    }).toArray();
    
    const bills = await db.collection<Bill>('bills').find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    // Get housekeeping tasks (maintenance impact)
    const housekeepingTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').find({
      createdAt: { $gte: startDate, $lte: endDate },
      taskType: 'maintenance'
    }).toArray();
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate room utilization
    const roomUtilization = rooms.map(room => {
      const roomReservations = reservations.filter(r => r.roomId.toString() === room._id!.toString());
      const roomBills = bills.filter(b => b.roomId.toString() === room._id!.toString());
      
      // Calculate occupied days
      let occupiedDays = 0;
      roomReservations.forEach(reservation => {
        const checkIn = new Date(Math.max(reservation.checkIn.getTime(), startDate.getTime()));
        const checkOut = new Date(Math.min(reservation.checkOut.getTime(), endDate.getTime()));
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        occupiedDays += Math.max(0, days);
      });
      
      const utilizationRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;
      const revenue = roomBills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.total, 0);
      
      return {
        roomNumber: room.roomNumber,
        roomType: room.type,
        utilizationRate: parseFloat(utilizationRate.toFixed(2)),
        totalDays,
        occupiedDays,
        revenue
      };
    });
    
    // Calculate average utilization
    const averageUtilization = roomUtilization.reduce((sum, room) => sum + room.utilizationRate, 0) / roomUtilization.length;
    
    // Top performing rooms (top 5 by utilization)
    const topPerformingRooms = roomUtilization
      .sort((a, b) => b.utilizationRate - a.utilizationRate)
      .slice(0, 5)
      .map(room => ({
        roomNumber: room.roomNumber,
        utilizationRate: room.utilizationRate,
        revenue: room.revenue
      }));
    
    // Underutilized rooms (bottom 5 by utilization)
    const underutilizedRooms = roomUtilization
      .sort((a, b) => a.utilizationRate - b.utilizationRate)
      .slice(0, 5)
      .map(room => ({
        roomNumber: room.roomNumber,
        utilizationRate: room.utilizationRate,
        revenue: room.revenue
      }));
    
    // Maintenance impact
    const maintenanceImpact = rooms.map(room => {
      const roomTasks = housekeepingTasks.filter(t => t.roomId.toString() === room._id!.toString());
      const maintenanceDays = roomTasks.reduce((sum, task) => {
        if (task.completedAt && task.startedAt) {
          const duration = Math.ceil((task.completedAt.getTime() - task.startedAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + duration;
        }
        return sum;
      }, 0);
      
      // Estimate lost revenue (room price * maintenance days)
      const lostRevenue = maintenanceDays * room.price;
      
      return {
        roomNumber: room.roomNumber,
        maintenanceDays,
        lostRevenue
      };
    }).filter(room => room.maintenanceDays > 0);
    
    return {
      roomUtilization,
      averageUtilization: parseFloat(averageUtilization.toFixed(2)),
      topPerformingRooms,
      underutilizedRooms,
      maintenanceImpact
    };
  }

  async getComprehensiveReport(startDate: Date, endDate: Date): Promise<{
    summary: {
      totalRevenue: number;
      totalBookings: number;
      averageOccupancy: number;
      averageUtilization: number;
      totalGuests: number;
      completedTasks: number;
    };
    trends: {
      revenueGrowth: number;
      occupancyGrowth: number;
      bookingGrowth: number;
    };
  }> {
    const db = await this.getDb();
    
    // Get current period data
    const currentRevenue = await this.getRevenueReport(startDate, endDate);
    const currentOccupancy = await this.getOccupancyReport(startDate, endDate);
    const currentUtilization = await this.getRoomUtilizationReport(startDate, endDate);
    
    // Get total guests in period
    const totalGuests = await db.collection<Guest>('guests').countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get completed housekeeping tasks
    const completedTasks = await db.collection<HousekeepingTask>('housekeeping_tasks').countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });
    
    // Calculate previous period for trends
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime() - 1);
    
    const prevRevenue = await this.getRevenueReport(prevStartDate, prevEndDate);
    const prevOccupancy = await this.getOccupancyReport(prevStartDate, prevEndDate);
    const prevBookings = await db.collection<Reservation>('reservations').countDocuments({
      createdAt: { $gte: prevStartDate, $lte: prevEndDate }
    });
    
    // Calculate growth rates
    const revenueGrowth = prevRevenue.totalRevenue > 0 
      ? ((currentRevenue.totalRevenue - prevRevenue.totalRevenue) / prevRevenue.totalRevenue) * 100 
      : 0;
    
    const occupancyGrowth = prevOccupancy.averageOccupancy > 0 
      ? ((currentOccupancy.averageOccupancy - prevOccupancy.averageOccupancy) / prevOccupancy.averageOccupancy) * 100 
      : 0;
    
    const bookingGrowth = prevBookings > 0 
      ? ((currentRevenue.totalBookings - prevBookings) / prevBookings) * 100 
      : 0;
    
    return {
      summary: {
        totalRevenue: currentRevenue.totalRevenue,
        totalBookings: currentRevenue.totalBookings,
        averageOccupancy: currentOccupancy.averageOccupancy,
        averageUtilization: currentUtilization.averageUtilization,
        totalGuests,
        completedTasks
      },
      trends: {
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        occupancyGrowth: parseFloat(occupancyGrowth.toFixed(2)),
        bookingGrowth: parseFloat(bookingGrowth.toFixed(2))
      }
    };
  }

  // Activity log operations
  async logActivity(activityData: Omit<ActivityLog, '_id' | 'timestamp'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const activity: Omit<ActivityLog, '_id'> = {
      ...activityData,
      timestamp: new Date(),
    };

    return await db.collection<ActivityLog>('activity_logs').insertOne(activity);
  }

  // Utility methods
  async initializeCollections(): Promise<void> {
    const db = await this.getDb();
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('rooms').createIndex({ roomNumber: 1 }, { unique: true });
    await db.collection('guests').createIndex({ email: 1 });
    await db.collection('reservations').createIndex({ checkIn: 1, checkOut: 1 });
    await db.collection('reservations').createIndex({ guestId: 1 });
    await db.collection('reservations').createIndex({ roomId: 1 });
    await db.collection('bills').createIndex({ reservationId: 1 });
    await db.collection('housekeeping_tasks').createIndex({ roomId: 1 });
    await db.collection('activity_logs').createIndex({ timestamp: -1 });
    
    console.log('✅ Database collections and indexes initialized');
  }

  async seedDefaultData(): Promise<void> {
    const db = await this.getDb();
    
    // Check if admin user exists
    const existingAdmin = await this.findUserByEmail('admin@hotel.com');
    if (!existingAdmin) {
      await this.createUser({
        email: 'admin@hotel.com',
        password: 'admin123',
        name: 'Hotel Admin',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Default admin user created: admin@hotel.com / admin123');
    }

    // Check if sample rooms exist
    const roomCount = await db.collection('rooms').countDocuments();
    if (roomCount === 0) {
      const sampleRooms = [
        { roomNumber: '101', type: 'single' as const, status: 'available' as const, price: 99, amenities: ['WiFi', 'TV'], floor: 1, maxOccupancy: 1 },
        { roomNumber: '102', type: 'double' as const, status: 'available' as const, price: 149, amenities: ['WiFi', 'TV', 'Mini Bar'], floor: 1, maxOccupancy: 2 },
        { roomNumber: '201', type: 'suite' as const, status: 'available' as const, price: 299, amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcony'], floor: 2, maxOccupancy: 4 },
        { roomNumber: '202', type: 'deluxe' as const, status: 'maintenance' as const, price: 399, amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi'], floor: 2, maxOccupancy: 4 },
      ];

      for (const room of sampleRooms) {
        await this.createRoom(room);
      }
      console.log('✅ Sample rooms created');
    }
  }

  // User management operations
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const user: Omit<User, '_id'> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<User>('users').insertOne(user);
  }

  async getAllUsers(): Promise<User[]> {
    const db = await this.getDb();
    return await db.collection<User>('users').find({}).sort({ createdAt: -1 }).toArray();
  }

  async getUserById(userId: string): Promise<User | null> {
    const db = await this.getDb();
    return await db.collection<User>('users').findOne({ _id: new ObjectId(userId) });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDb();
    return await db.collection<User>('users').findOne({ email });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<User>('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async updateUserLastLogin(userId: string): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<User>('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );
  }

  async toggleUserStatus(userId: string): Promise<UpdateResult> {
    const db = await this.getDb();
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return await db.collection<User>('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isActive: !user.isActive, updatedAt: new Date() } }
    );
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    const db = await this.getDb();
    return await db.collection<User>('users').deleteOne({ _id: new ObjectId(userId) });
  }

  // System settings operations
  async createSetting(settingData: Omit<SystemSettings, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const setting: Omit<SystemSettings, '_id'> = {
      ...settingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<SystemSettings>('settings').insertOne(setting);
  }

  async getAllSettings(): Promise<SystemSettings[]> {
    const db = await this.getDb();
    return await db.collection<SystemSettings>('settings').find({}).sort({ category: 1, key: 1 }).toArray();
  }

  async getSettingsByCategory(category: SystemSettings['category']): Promise<SystemSettings[]> {
    const db = await this.getDb();
    return await db.collection<SystemSettings>('settings').find({ category }).sort({ key: 1 }).toArray();
  }

  async getSettingByKey(key: string): Promise<SystemSettings | null> {
    const db = await this.getDb();
    return await db.collection<SystemSettings>('settings').findOne({ key });
  }

  async updateSetting(settingId: string, updates: Partial<SystemSettings>): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<SystemSettings>('settings').updateOne(
      { _id: new ObjectId(settingId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async updateSettingByKey(key: string, value: any, updatedBy?: ObjectId): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<SystemSettings>('settings').updateOne(
      { key },
      { $set: { value, updatedBy, updatedAt: new Date() } }
    );
  }

  async deleteSetting(settingId: string): Promise<DeleteResult> {
    const db = await this.getDb();
    return await db.collection<SystemSettings>('settings').deleteOne({ _id: new ObjectId(settingId) });
  }

  // Notification operations
  async createNotification(notificationData: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const notification: Omit<Notification, '_id'> = {
      ...notificationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<Notification>('notifications').insertOne(notification);
  }

  async getAllNotifications(): Promise<Notification[]> {
    const db = await this.getDb();
    return await db.collection<Notification>('notifications').find({}).sort({ createdAt: -1 }).toArray();
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const db = await this.getDb();
    return await db.collection<Notification>('notifications').find({
      recipients: new ObjectId(userId)
    }).sort({ createdAt: -1 }).toArray();
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const db = await this.getDb();
    return await db.collection<Notification>('notifications').find({
      recipients: new ObjectId(userId),
      'readBy.userId': { $ne: new ObjectId(userId) }
    }).sort({ createdAt: -1 }).toArray();
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<Notification>('notifications').updateOne(
      { _id: new ObjectId(notificationId) },
      { 
        $push: { readBy: { userId: new ObjectId(userId), readAt: new Date() } },
        $set: { updatedAt: new Date() }
      }
    );
  }

  async deleteNotification(notificationId: string): Promise<DeleteResult> {
    const db = await this.getDb();
    return await db.collection<Notification>('notifications').deleteOne({ _id: new ObjectId(notificationId) });
  }

  // Hotel configuration operations
  async createHotelConfig(configData: Omit<HotelConfig, '_id' | 'createdAt' | 'updatedAt'>): Promise<InsertOneResult> {
    const db = await this.getDb();
    const config: Omit<HotelConfig, '_id'> = {
      ...configData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.collection<HotelConfig>('hotel_config').insertOne(config);
  }

  async getHotelConfig(): Promise<HotelConfig | null> {
    const db = await this.getDb();
    return await db.collection<HotelConfig>('hotel_config').findOne({});
  }

  async updateHotelConfig(configId: string, updates: Partial<HotelConfig>): Promise<UpdateResult> {
    const db = await this.getDb();
    return await db.collection<HotelConfig>('hotel_config').updateOne(
      { _id: new ObjectId(configId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async initializeDefaultSettings(): Promise<void> {
    const db = await this.getDb();
    const settingsCount = await db.collection<SystemSettings>('settings').countDocuments();
    
    if (settingsCount === 0) {
      const defaultSettings: Omit<SystemSettings, '_id' | 'createdAt' | 'updatedAt'>[] = [
        {
          category: 'general',
          key: 'app_name',
          value: 'Hotel Management System',
          description: 'Application name',
          type: 'string',
          isEditable: true
        },
        {
          category: 'general',
          key: 'maintenance_mode',
          value: false,
          description: 'Enable maintenance mode',
          type: 'boolean',
          isEditable: true
        },
        {
          category: 'hotel',
          key: 'check_in_time',
          value: '15:00',
          description: 'Default check-in time',
          type: 'string',
          isEditable: true
        },
        {
          category: 'hotel',
          key: 'check_out_time',
          value: '11:00',
          description: 'Default check-out time',
          type: 'string',
          isEditable: true
        },
        {
          category: 'hotel',
          key: 'currency',
          value: 'USD',
          description: 'Default currency',
          type: 'string',
          isEditable: true
        },
        {
          category: 'hotel',
          key: 'tax_rate',
          value: 0.1,
          description: 'Default tax rate (10%)',
          type: 'number',
          isEditable: true
        },
        {
          category: 'notification',
          key: 'email_notifications',
          value: true,
          description: 'Enable email notifications',
          type: 'boolean',
          isEditable: true
        },
        {
          category: 'notification',
          key: 'sms_notifications',
          value: false,
          description: 'Enable SMS notifications',
          type: 'boolean',
          isEditable: true
        },
        {
          category: 'security',
          key: 'session_timeout',
          value: 3600,
          description: 'Session timeout in seconds',
          type: 'number',
          isEditable: true
        },
        {
          category: 'security',
          key: 'max_login_attempts',
          value: 5,
          description: 'Maximum login attempts',
          type: 'number',
          isEditable: true
        }
      ];

      for (const setting of defaultSettings) {
        await this.createSetting(setting);
      }
    }
  }
}

// Export a singleton instance
export const dbService = new DatabaseService();