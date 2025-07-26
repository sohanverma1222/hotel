import useSWR from 'swr';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Room } from '@/lib/db/models';

type FilterType = 'status' | 'floor' | 'type';

interface ActiveFilter {
  type: FilterType;
  value: string;
  label: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRooms() {
  const { data, error, isLoading, mutate } = useSWR<{ rooms: Room[] }>('/api/rooms', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds for real-time updates
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    // Only establish SSE connection if we have data and are not loading
    if (data && !isLoading) {
      // Create EventSource for real-time updates
      eventSourceRef.current = new EventSource('/api/rooms/stream');
      
      eventSourceRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === 'roomUpdate') {
            // Update the local cache with new room data
            mutate({ rooms: update.rooms }, false);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };
      
      eventSourceRef.current.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSourceRef.current?.close();
      };
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [data, isLoading, mutate]);

  const updateRoomStatus = async (roomId: string, status: Room['status']) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update room status');
      }

      // Optimistically update the local data
      mutate();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating room status:', error);
      return { success: false, error };
    }
  };

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let filtered = data?.rooms || [];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply active filters
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'status':
          filtered = filtered.filter(room => room.status === filter.value);
          break;
        case 'floor':
          filtered = filtered.filter(room => room.floor.toString() === filter.value);
          break;
        case 'type':
          filtered = filtered.filter(room => room.type === filter.value);
          break;
      }
    });
    
    return filtered;
  }, [data?.rooms, searchTerm, activeFilters]);
  
  const addFilter = (type: FilterType, value: string, label: string) => {
    // Remove existing filter of same type
    const newFilters = activeFilters.filter(f => f.type !== type);
    newFilters.push({ type, value, label });
    setActiveFilters(newFilters);
  };

  const removeFilter = (filterToRemove: ActiveFilter) => {
    setActiveFilters(activeFilters.filter(f => f !== filterToRemove));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  return {
    rooms: filteredRooms,
    allRooms: data?.rooms || [],
    isLoading,
    error,
    updateRoomStatus,
    refresh: mutate,
    isRealTimeConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    searchTerm,
    setSearchTerm,
    activeFilters,
    addFilter,
    removeFilter,
    clearAllFilters,
  };
}

export function useRoomStats(rooms: Room[]) {
  const stats = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<Room['status'], number>);

  return {
    available: stats.available || 0,
    occupied: stats.occupied || 0,
    maintenance: stats.maintenance || 0,
    cleaning: stats.cleaning || 0,
    total: rooms.length,
  };
}