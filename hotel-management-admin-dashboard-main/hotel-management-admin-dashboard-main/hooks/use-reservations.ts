import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { Reservation, Guest, Room } from '@/lib/db/models';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useReservations() {
  const { data, error, isLoading, mutate } = useSWR<{ reservations: Reservation[] }>('/api/reservations', fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter reservations based on search and status
  const filteredReservations = useMemo(() => {
    let filtered = data?.reservations || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reservation => 
        // Note: We would need to join with guest data for full name search
        // For now, we'll search by reservation ID or notes
        reservation._id?.toString().includes(searchTerm) ||
        reservation.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.specialRequests?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    return filtered;
  }, [data?.reservations, searchTerm, statusFilter]);

  const createReservation = async (reservationData: any) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create reservation');
      }

      // Refresh the data
      mutate();
      
      return { success: true };
    } catch (error) {
      console.error('Error creating reservation:', error);
      return { success: false, error };
    }
  };

  const updateReservation = async (reservationId: string, updates: Partial<Reservation>) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId, ...updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update reservation');
      }

      // Refresh the data
      mutate();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating reservation:', error);
      return { success: false, error };
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel reservation');
      }

      // Refresh the data
      mutate();
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return { success: false, error };
    }
  };

  const checkIn = async (reservationId: string, notes?: string) => {
    try {
      const response = await fetch('/api/reservations/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId, notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check in guest');
      }

      // Refresh the data
      mutate();
      
      return { success: true };
    } catch (error) {
      console.error('Error checking in guest:', error);
      return { success: false, error };
    }
  };

  const checkOut = async (reservationId: string, notes?: string, roomCondition?: string) => {
    try {
      const response = await fetch('/api/reservations/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId, notes, roomCondition }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check out guest');
      }

      // Refresh the data
      mutate();
      
      return { success: true };
    } catch (error) {
      console.error('Error checking out guest:', error);
      return { success: false, error };
    }
  };

  return {
    reservations: filteredReservations,
    allReservations: data?.reservations || [],
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    createReservation,
    updateReservation,
    cancelReservation,
    checkIn,
    checkOut,
    refresh: mutate,
  };
}

export function useReservationStats(reservations: Reservation[]) {
  const stats = reservations.reduce((acc, reservation) => {
    acc[reservation.status] = (acc[reservation.status] || 0) + 1;
    return acc;
  }, {} as Record<Reservation['status'], number>);

  const totalRevenue = reservations.reduce((sum, reservation) => sum + reservation.totalAmount, 0);
  const pendingPayments = reservations.filter(r => r.paymentStatus === 'pending').length;
  const todaysCheckIns = reservations.filter(r => {
    const today = new Date();
    const checkIn = new Date(r.checkIn);
    return checkIn.toDateString() === today.toDateString() && r.status === 'confirmed';
  }).length;

  return {
    confirmed: stats.confirmed || 0,
    checked_in: stats.checked_in || 0,
    checked_out: stats.checked_out || 0,
    cancelled: stats.cancelled || 0,
    total: reservations.length,
    totalRevenue,
    pendingPayments,
    todaysCheckIns,
  };
}

export function useRoomAvailability() {
  const checkAvailability = async (roomId: string, checkIn: Date, checkOut: Date, excludeReservationId?: string) => {
    try {
      const response = await fetch('/api/reservations/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, checkIn, checkOut, excludeReservationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      return { available: false, error };
    }
  };

  const getAvailableRooms = async (checkIn: Date, checkOut: Date, roomType?: string, guests?: number) => {
    try {
      const params = new URLSearchParams({
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
      });

      if (roomType) params.append('roomType', roomType);
      if (guests) params.append('guests', guests.toString());

      const response = await fetch(`/api/reservations/availability?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get available rooms');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting available rooms:', error);
      return { availableRooms: [], error };
    }
  };

  return {
    checkAvailability,
    getAvailableRooms,
  };
}