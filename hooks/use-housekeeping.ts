import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useHousekeeping(status?: string, roomId?: string) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (roomId) params.append('roomId', roomId);
  
  const { data, error, mutate } = useSWR(
    `/api/housekeeping?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const createTask = async (taskData: {
    roomId: string;
    assignedTo?: string;
    taskType: 'cleaning' | 'maintenance' | 'inspection';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    estimatedDuration: number;
    notes?: string;
  }) => {
    const response = await fetch('/api/housekeeping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    await mutate();
    return response.json();
  };

  const updateTask = async (taskId: string, updates: {
    assignedTo?: string;
    taskType?: 'cleaning' | 'maintenance' | 'inspection';
    status?: 'pending' | 'in_progress' | 'completed' | 'on_hold';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    description?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    notes?: string;
    startedAt?: string;
    completedAt?: string;
  }) => {
    const response = await fetch(`/api/housekeeping/by-id?id=${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    await mutate();
    return response.json();
  };

  const deleteTask = async (taskId: string) => {
    const response = await fetch(`/api/housekeeping/by-id?id=${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    await mutate();
    return response.json();
  };

  return {
    tasks: data,
    isLoading: !error && !data,
    error,
    mutate,
    createTask,
    updateTask,
    deleteTask,
  };
}

export function useHousekeepingTask(taskId?: string) {
  const { data, error, mutate } = useSWR(
    taskId ? `/api/housekeeping/by-id?id=${taskId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    task: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useHousekeepingStats() {
  const { data, error, mutate } = useSWR(
    '/api/housekeeping/stats',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}