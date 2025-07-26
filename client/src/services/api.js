import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message,
      data: error.response?.data
    });

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Report API functions
export const getRevenueReport = async (period = 'month') => {
  try {
    return await api.get(`/reports/revenue?period=${period}`);
  } catch (error) {
    // Return mock data if API fails
    return {
      data: [
        { month: 'Jan', revenue: 45000, bookings: 120 },
        { month: 'Feb', revenue: 52000, bookings: 140 },
        { month: 'Mar', revenue: 48000, bookings: 130 },
        { month: 'Apr', revenue: 61000, bookings: 165 },
        { month: 'May', revenue: 58000, bookings: 155 },
        { month: 'Jun', revenue: 67000, bookings: 180 }
      ]
    };
  }
};

export const getOccupancyReport = async (period = 'month') => {
  try {
    return await api.get(`/reports/occupancy?period=${period}`);
  } catch (error) {
    // Return mock data if API fails
    return {
      data: [
        { name: 'Standard Rooms', value: 65, count: 45 },
        { name: 'Deluxe Rooms', value: 80, count: 32 },
        { name: 'Suites', value: 45, count: 9 },
        { name: 'Premium Suites', value: 70, count: 14 }
      ]
    };
  }
};

export const getGuestStats = async () => {
  try {
    return await api.get('/guests/stats');
  } catch (error) {
    // Return mock data if API fails
    return {
      data: {
        totalGuests: 1250,
        newThisMonth: 180,
        returningGuests: 68,
        averageStay: 3.2,
        satisfaction: 4.2,
        weeklyData: [
          { period: 'Week 1', newGuests: 25, returningGuests: 15 },
          { period: 'Week 2', newGuests: 30, returningGuests: 20 },
          { period: 'Week 3', newGuests: 35, returningGuests: 25 },
          { period: 'Week 4', newGuests: 28, returningGuests: 32 }
        ]
      }
    };
  }
};

export default api;