import { useState, useCallback } from 'react';
import useSWR from 'swr';

interface GuestAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface GuestIdDocument {
  type: 'passport' | 'license' | 'national_id';
  number: string;
}

interface GuestHistory {
  reservations: any[];
  bills: any[];
  totalSpent: number;
  lastVisit: Date | null;
  visitCount: number;
  preferredRoomType: string | null;
}

interface Guest {
  _id?: string;
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address?: GuestAddress;
  idDocument?: GuestIdDocument;
  preferences?: string[];
  notes?: string;
  totalSpent: number;
  lastVisit: Date | null;
  visitCount: number;
  status: 'New' | 'Returning' | 'VIP';
  createdAt: string;
  updatedAt: string;
  history?: GuestHistory;
}

interface GuestStats {
  totalGuests: number;
  newGuestsThisMonth: number;
  vipGuests: number;
  returningGuests: number;
  averageSpending: number;
}

interface GuestsResponse {
  guests: Guest[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export function useGuests(search?: string, startDate?: string, endDate?: string): GuestsResponse {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const { data, error, mutate, isLoading } = useSWR<Guest[]>(
    `/api/guests?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    guests: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useGuestById(guestId: string) {
  const { data, error, mutate, isLoading } = useSWR<Guest>(
    guestId ? `/api/guests/by-id?id=${guestId}` : null,
    fetcher
  );

  return {
    guest: data || null,
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useGuestStats() {
  const { data, error, mutate, isLoading } = useSWR<GuestStats>(
    '/api/guests/stats',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    stats: data || {
      totalGuests: 0,
      newGuestsThisMonth: 0,
      vipGuests: 0,
      returningGuests: 0,
      averageSpending: 0
    },
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useGuestActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGuest = useCallback(async (guestData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create guest');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create guest';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGuest = useCallback(async (guestId: string, updates: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/guests/by-id?id=${guestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update guest');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update guest';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGuest = useCallback(async (guestId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/guests/by-id?id=${guestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete guest');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete guest';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createGuest,
    updateGuest,
    deleteGuest,
    isLoading,
    error,
  };
}