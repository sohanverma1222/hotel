import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaBed,
  FaWifi,
  FaSnowflake,
  FaTv,
  FaCoffee,
  FaBath,
  FaBalcony,
  FaEye,
  FaTools,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import roomService from '../services/roomService';
import '../styles/Rooms.css';

const Rooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [filters, setFilters] = useState({
    roomType: '',
    status: '',
    floor: '',
    sortBy: 'roomNumber'
  });

  const queryClient = useQueryClient();

  // Fetch rooms
  const { data: roomsData, isLoading } = useQuery(
    ['rooms', currentPage, searchTerm, filters],
    () => roomService.getAllRooms({
      page: currentPage,
      limit: 12,
      search: searchTerm,
      ...filters
    }),
    { keepPreviousData: true }
  );

  // Status update mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => roomService.updateRoomStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rooms');
        toast.success('Room status updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update room status');
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => roomService.deleteRoom(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rooms');
        toast.success('Room deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete room');
      }
    }
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const openModal = (mode, room = null) => {
    setModalMode(mode);
    setSelectedRoom(room);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setModalMode('create');
  };

  const handleStatusUpdate = (room, newStatus) => {
    updateStatusMutation.mutate({ id: room._id, status: newStatus });
  };

  const handleDelete = (room) => {
    if (window.confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) {
      deleteMutation.mutate(room._id);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#10b981',
      occupied: '#ef4444',
      maintenance: '#f59e0b',
      cleaning: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: FaWifi,
      air_conditioning: FaSnowflake,
      tv: FaTv,
      mini_fridge: FaCoffee,
      balcony: FaBalcony,
      jacuzzi: FaBath
    };
    return icons[amenity] || FaCheck;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const RoomCard = ({ room }) => {
    const StatusIcon = getStatusColor(room.status);
    
    return (
      <div className={`room-card room-status-${room.status}`}>
        <div className=\"room-card-header\">
          <div className=\"room-number\">
            <FaBed className=\"room-icon\" />
            <span>Room {room.roomNumber}</span>
          </div>
          <div className=\"room-actions\">
            <button 
              className=\"action-btn view-btn\"
              onClick={() => openModal('view', room)}
              title=\"View Details\"
            >
              <FaEye />
            </button>
            <button 
              className=\"action-btn edit-btn\"
              onClick={() => openModal('edit', room)}
              title=\"Edit Room\"
            >
              <FaEdit />
            </button>
            <button 
              className=\"action-btn delete-btn\"
              onClick={() => handleDelete(room)}
              title=\"Delete Room\"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        <div className=\"room-image\">
          <div className=\"room-type-badge\">{room.roomType}</div>
          <div className=\"room-floor\">Floor {room.floor}</div>
        </div>

        <div className=\"room-card-body\">
          <div className=\"room-info\">
            <div className=\"room-details\">
              <div className=\"detail-item\">
                <span className=\"detail-label\">Capacity:</span>
                <span className=\"detail-value\">{room.capacity} guests</span>
              </div>
              <div className=\"detail-item\">
                <span className=\"detail-label\">Price:</span>
                <span className=\"detail-value price\">{formatCurrency(room.basePrice)}/night</span>
              </div>
            </div>

            <div className=\"room-amenities\">
              {room.amenities?.slice(0, 4).map((amenity, index) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div key={index} className=\"amenity-item\" title={amenity.replace('_', ' ')}>
                    <Icon />
                  </div>
                );
              })}
              {room.amenities?.length > 4 && (
                <div className=\"amenity-more\">
                  +{room.amenities.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className=\"room-status\">
            <div className={`status-indicator status-${room.status}`}>
              <div className=\"status-dot\"></div>
              <span className=\"status-text\">{room.status}</span>
            </div>

            <div className=\"status-actions\">
              {room.status === 'occupied' && (
                <button 
                  className=\"status-btn cleaning-btn\"
                  onClick={() => handleStatusUpdate(room, 'cleaning')}
                  title=\"Set to Cleaning\"
                >
                  Clean
                </button>
              )}
              {room.status === 'cleaning' && (
                <button 
                  className=\"status-btn available-btn\"
                  onClick={() => handleStatusUpdate(room, 'available')}
                  title=\"Set to Available\"
                >
                  Available
                </button>
              )}
              {room.status === 'available' && (
                <button 
                  className=\"status-btn maintenance-btn\"
                  onClick={() => handleStatusUpdate(room, 'maintenance')}
                  title=\"Set to Maintenance\"
                >
                  <FaTools /> Maintenance
                </button>
              )}
              {room.status === 'maintenance' && (
                <button 
                  className=\"status-btn available-btn\"
                  onClick={() => handleStatusUpdate(room, 'available')}
                  title=\"Set to Available\"
                >
                  <FaCheck /> Fixed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=\"rooms-page\">
      <div className=\"page-header\">
        <div className=\"header-content\">
          <h1>Rooms Management</h1>
          <p>Manage room inventory and status</p>
        </div>
        <button 
          className=\"btn btn-primary\"
          onClick={() => openModal('create')}
        >
          <FaPlus />
          Add New Room
        </button>
      </div>

      {/* Filters and Search */}
      <div className=\"filters-section\">
        <div className=\"search-box\">
          <FaSearch className=\"search-icon\" />
          <input
            type=\"text\"
            placeholder=\"Search rooms by number, type, or floor...\"
            value={searchTerm}
            onChange={handleSearch}
            className=\"search-input\"
          />
        </div>

        <div className=\"filters-group\">
          <div className=\"filter-item\">
            <FaFilter className=\"filter-icon\" />
            <select
              value={filters.roomType}
              onChange={(e) => handleFilterChange('roomType', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"\">All Types</option>
              <option value=\"standard\">Standard</option>
              <option value=\"deluxe\">Deluxe</option>
              <option value=\"suite\">Suite</option>
              <option value=\"presidential\">Presidential</option>
            </select>
          </div>

          <div className=\"filter-item\">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"\">All Status</option>
              <option value=\"available\">Available</option>
              <option value=\"occupied\">Occupied</option>
              <option value=\"maintenance\">Maintenance</option>
              <option value=\"cleaning\">Cleaning</option>
            </select>
          </div>

          <div className=\"filter-item\">
            <select
              value={filters.floor}
              onChange={(e) => handleFilterChange('floor', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"\">All Floors</option>
              <option value=\"1\">Floor 1</option>
              <option value=\"2\">Floor 2</option>
              <option value=\"3\">Floor 3</option>
              <option value=\"4\">Floor 4</option>
              <option value=\"5\">Floor 5</option>
            </select>
          </div>

          <div className=\"filter-item\">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"roomNumber\">Room Number</option>
              <option value=\"roomType\">Room Type</option>
              <option value=\"floor\">Floor</option>
              <option value=\"basePrice\">Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className=\"rooms-content\">
        {isLoading ? (
          <div className=\"loading-grid\">
            {[...Array(8)].map((_, i) => (
              <div key={i} className=\"room-card-skeleton\">
                <div className=\"skeleton-header\"></div>
                <div className=\"skeleton-image\"></div>
                <div className=\"skeleton-body\">
                  <div className=\"skeleton-line\"></div>
                  <div className=\"skeleton-line short\"></div>
                  <div className=\"skeleton-amenities\">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className=\"skeleton-amenity\"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : roomsData?.rooms?.length > 0 ? (
          <>
            <div className=\"rooms-grid\">
              {roomsData.rooms.map(room => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>

            {/* Pagination */}
            {roomsData.totalPages > 1 && (
              <div className=\"pagination\">
                <button
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className=\"pagination-info\">
                  Page {currentPage} of {roomsData.totalPages}
                </div>
                
                <button
                  className={`pagination-btn ${currentPage === roomsData.totalPages ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.min(roomsData.totalPages, prev + 1))}
                  disabled={currentPage === roomsData.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className=\"empty-state\">
            <FaBed className=\"empty-icon\" />
            <h3>No Rooms Found</h3>
            <p>
              {searchTerm || Object.values(filters).some(v => v)
                ? 'No rooms match your current search criteria.'
                : 'Start by adding your first room to the system.'}
            </p>
            <button 
              className=\"btn btn-primary\"
              onClick={() => openModal('create')}
            >
              <FaPlus />
              Add First Room
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className=\"modal-overlay\" onClick={closeModal}>
          <div className=\"modal-content\" onClick={e => e.stopPropagation()}>
            <div className=\"modal-header\">
              <h2>
                {modalMode === 'create' && 'Add New Room'}
                {modalMode === 'edit' && 'Edit Room'}
                {modalMode === 'view' && 'Room Details'}
              </h2>
              <button className=\"modal-close\" onClick={closeModal}>×</button>
            </div>
            <div className=\"modal-body\">
              {modalMode === 'view' && selectedRoom ? (
                <div className=\"room-details\">
                  <div className=\"detail-section\">
                    <h4>Room Information</h4>
                    <div className=\"detail-grid\">
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Room Number:</span>
                        <span className=\"detail-value\">{selectedRoom.roomNumber}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Type:</span>
                        <span className=\"detail-value\">{selectedRoom.roomType}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Floor:</span>
                        <span className=\"detail-value\">{selectedRoom.floor}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Capacity:</span>
                        <span className=\"detail-value\">{selectedRoom.capacity} guests</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Base Price:</span>
                        <span className=\"detail-value\">{formatCurrency(selectedRoom.basePrice)}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Status:</span>
                        <span className={`detail-value status-${selectedRoom.status}`}>
                          {selectedRoom.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className=\"detail-section\">
                    <h4>Amenities</h4>
                    <div className=\"amenities-list\">
                      {selectedRoom.amenities?.map((amenity, index) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div key={index} className=\"amenity-tag\">
                            <Icon />
                            <span>{amenity.replace('_', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedRoom.description && (
                    <div className=\"detail-section\">
                      <h4>Description</h4>
                      <p>{selectedRoom.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>Form component would go here for create/edit mode</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;