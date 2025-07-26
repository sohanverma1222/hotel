import api from './api';

export const reservationService = {
  // Get all reservations with filtering and pagination
  getAllReservations: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = `/reservations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await api.get(url);
  },

  // Get single reservation by ID
  getReservationById: async (id) => {
    return await api.get(`/reservations/${id}`);
  },

  // Create new reservation
  createReservation: async (reservationData) => {
    return await api.post('/reservations', reservationData);
  },

  // Update reservation
  updateReservation: async (id, reservationData) => {
    return await api.put(`/reservations/${id}`, reservationData);
  },

  // Cancel reservation
  cancelReservation: async (id) => {
    return await api.patch(`/reservations/${id}/cancel`);
  },

  // Check-in guest
  checkIn: async (id) => {
    return await api.patch(`/reservations/${id}/checkin`);
  },

  // Check-out guest
  checkOut: async (id, checkoutData = {}) => {
    return await api.patch(`/reservations/${id}/checkout`, checkoutData);
  },

  // Add payment
  addPayment: async (id, paymentData) => {
    return await api.post(`/reservations/${id}/payments`, paymentData);
  },

  // Get reservation statistics
  getReservationStats: async () => {
    return await api.get('/reservations/stats');
  },

  // Get today's check-ins
  getTodayCheckIns: async () => {
    const today = new Date().toISOString().split('T')[0];
    return await api.get(`/reservations?checkInStart=${today}&checkInEnd=${today}`);
  },

  // Get today's check-outs
  getTodayCheckOuts: async () => {
    const today = new Date().toISOString().split('T')[0];
    return await api.get(`/reservations?checkOutStart=${today}&checkOutEnd=${today}&status=checked-in`);
  }
};

export default reservationService;