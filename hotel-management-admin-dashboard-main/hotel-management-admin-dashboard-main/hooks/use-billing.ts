import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'room' | 'service' | 'amenity' | 'tax';
}

interface Bill {
  _id?: string;
  id: string;
  reservationId: string;
  guestId: string;
  roomId: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  items: BillItem[];
  subtotal: number;
  taxes: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillsResponse {
  bills: Bill[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

interface BillingStats {
  totalBills: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  draftBills: number;
  sentBills: number;
  paidBills: number;
  overdueBills: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch bills');
  }
  return response.json();
};

export function useBilling(status?: string, startDate?: string, endDate?: string): BillsResponse {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const { data, error, mutate, isLoading } = useSWR<Bill[]>(
    `/api/billing?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    bills: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useBillById(billId: string) {
  const { data, error, mutate, isLoading } = useSWR<Bill>(
    billId ? `/api/billing/by-id?id=${billId}` : null,
    fetcher
  );

  return {
    bill: data || null,
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useBillingActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBill = useCallback(async (billData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bill');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bill';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBill = useCallback(async (billId: string, updates: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/billing/by-id?id=${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bill');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bill';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBillStatus = useCallback(async (billId: string, status: string, paidDate?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/billing/by-id/status?id=${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, paidDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bill status');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bill status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateBill = useCallback(async (reservationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/billing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate bill');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate bill';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBill = useCallback(async (billId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/billing/by-id?id=${billId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bill');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bill';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createBill,
    updateBill,
    updateBillStatus,
    generateBill,
    deleteBill,
    isLoading,
    error,
  };
}

export function useBillingStats(bills: Bill[]): BillingStats {
  return {
    totalBills: bills.length,
    totalRevenue: bills.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.total : 0), 0),
    pendingAmount: bills.reduce((sum, bill) => sum + (bill.status !== 'paid' ? bill.total : 0), 0),
    overdueAmount: bills.reduce((sum, bill) => sum + (bill.status === 'overdue' ? bill.total : 0), 0),
    draftBills: bills.filter(b => b.status === 'draft').length,
    sentBills: bills.filter(b => b.status === 'sent').length,
    paidBills: bills.filter(b => b.status === 'paid').length,
    overdueBills: bills.filter(b => b.status === 'overdue').length,
  };
}