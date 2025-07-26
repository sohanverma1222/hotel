import api from './api';

export const roomService = {
  // Get all rooms with filtering and pagination
  getAllRooms: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = `/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await api.get(url);
  },

  // Get single room by ID
  getRoomById: async (id) => {
    return await api.get(`/rooms/${id}`);
  },

  // Create new room
  createRoom: async (roomData) => {
    return await api.post('/rooms', roomData);
  },

  // Update room
  updateRoom: async (id, roomData) => {
    return await api.put(`/rooms/${id}`, roomData);
  },

  // Delete room
  deleteRoom: async (id) => {
    return await api.delete(`/rooms/${id}`);
  },

  // Update room status
  updateRoomStatus: async (id, status) => {
    return await api.patch(`/rooms/${id}/status`, { status });
  },

  // Add maintenance record
  addMaintenanceRecord: async (id, maintenanceData) => {
    return await api.post(`/rooms/${id}/maintenance`, maintenanceData);
  },

  // Get room statistics
  getRoomStats: async () => {
    return await api.get('/rooms/stats');
  },

  // Get available rooms for date range
  getAvailableRooms: async (checkIn, checkOut, options = {}) => {
    const params = new URLSearchParams({
      checkIn: checkIn,
      checkOut: checkOut,
      ...options
    });
    return await api.get(`/rooms/available?${params.toString()}`);
  }
};

export default roomService;