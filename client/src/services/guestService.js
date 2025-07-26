import api from './api';

export const guestService = {
  // Get all guests with pagination and search
  getAllGuests: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = `/guests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await api.get(url);
  },

  // Get single guest by ID
  getGuestById: async (id) => {
    return await api.get(`/guests/${id}`);
  },

  // Create new guest
  createGuest: async (guestData) => {
    return await api.post('/guests', guestData);
  },

  // Update guest
  updateGuest: async (id, guestData) => {
    return await api.put(`/guests/${id}`, guestData);
  },

  // Delete guest
  deleteGuest: async (id) => {
    return await api.delete(`/guests/${id}`);
  },

  // Get guest statistics
  getGuestStats: async () => {
    return await api.get('/guests/stats');
  },

  // Search guests
  searchGuests: async (searchTerm) => {
    return await api.get(`/guests?search=${encodeURIComponent(searchTerm)}`);
  }
};

export default guestService;