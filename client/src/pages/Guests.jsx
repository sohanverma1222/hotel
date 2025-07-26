import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import guestService from '../services/guestService';
import '../styles/Guests.css';

const Guests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [filters, setFilters] = useState({
    nationality: '',
    sortBy: 'createdAt'
  });

  const queryClient = useQueryClient();

  // Fetch guests
  const { data: guestsData, isLoading } = useQuery(
    ['guests', currentPage, searchTerm, filters],
    () => guestService.getAllGuests({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      nationality: filters.nationality,
      sortBy: filters.sortBy
    }),
    { keepPreviousData: true }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => guestService.deleteGuest(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('guests');
        toast.success('Guest deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete guest');
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

  const openModal = (mode, guest = null) => {
    setModalMode(mode);
    setSelectedGuest(guest);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGuest(null);
    setModalMode('create');
  };

  const handleDelete = (guest) => {
    if (window.confirm(`Are you sure you want to delete ${guest.name}?`)) {
      deleteMutation.mutate(guest._id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const GuestCard = ({ guest }) => (
    <div className=\"guest-card\">
      <div className=\"guest-card-header\">
        <div className=\"guest-avatar\">
          <FaUserCircle />
        </div>
        <div className=\"guest-info\">
          <h4 className=\"guest-name\">{guest.name}</h4>
          <p className=\"guest-nationality\">{guest.nationality}</p>
        </div>
        <div className=\"guest-actions\">
          <button 
            className=\"action-btn view-btn\"
            onClick={() => openModal('view', guest)}
            title=\"View Details\"
          >
            <FaEye />
          </button>
          <button 
            className=\"action-btn edit-btn\"
            onClick={() => openModal('edit', guest)}
            title=\"Edit Guest\"
          >
            <FaEdit />
          </button>
          <button 
            className=\"action-btn delete-btn\"
            onClick={() => handleDelete(guest)}
            title=\"Delete Guest\"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      <div className=\"guest-card-body\">
        <div className=\"guest-contact\">
          <div className=\"contact-item\">
            <FaEnvelope className=\"contact-icon\" />
            <span>{guest.email}</span>
          </div>
          <div className=\"contact-item\">
            <FaPhone className=\"contact-icon\" />
            <span>{guest.phone}</span>
          </div>
          <div className=\"contact-item\">
            <FaMapMarkerAlt className=\"contact-icon\" />
            <span>{guest.address?.city || 'N/A'}, {guest.address?.country || 'N/A'}</span>
          </div>
        </div>
        
        <div className=\"guest-meta\">
          <div className=\"meta-item\">
            <span className=\"meta-label\">ID Type:</span>
            <span className=\"meta-value\">{guest.idType}</span>
          </div>
          <div className=\"meta-item\">
            <span className=\"meta-label\">Registered:</span>
            <span className=\"meta-value\">{formatDate(guest.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className=\"guests-page\">
      <div className=\"page-header\">
        <div className=\"header-content\">
          <h1>Guests Management</h1>
          <p>Manage guest information and profiles</p>
        </div>
        <button 
          className=\"btn btn-primary\"
          onClick={() => openModal('create')}
        >
          <FaPlus />
          Add New Guest
        </button>
      </div>

      {/* Filters and Search */}
      <div className=\"filters-section\">
        <div className=\"search-box\">
          <FaSearch className=\"search-icon\" />
          <input
            type=\"text\"
            placeholder=\"Search guests by name, email, or phone...\"
            value={searchTerm}
            onChange={handleSearch}
            className=\"search-input\"
          />
        </div>

        <div className=\"filters-group\">
          <div className=\"filter-item\">
            <FaFilter className=\"filter-icon\" />
            <select
              value={filters.nationality}
              onChange={(e) => handleFilterChange('nationality', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"\">All Nationalities</option>
              <option value=\"American\">American</option>
              <option value=\"British\">British</option>
              <option value=\"Canadian\">Canadian</option>
              <option value=\"Chinese\">Chinese</option>
              <option value=\"German\">German</option>
              <option value=\"Japanese\">Japanese</option>
            </select>
          </div>

          <div className=\"filter-item\">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"createdAt\">Recently Added</option>
              <option value=\"name\">Name A-Z</option>
              <option value=\"-name\">Name Z-A</option>
              <option value=\"email\">Email A-Z</option>
            </select>
          </div>

          <button className=\"btn btn-secondary btn-sm\">
            <FaDownload />
            Export
          </button>
        </div>
      </div>

      {/* Guests Grid */}
      <div className=\"guests-content\">
        {isLoading ? (
          <div className=\"loading-grid\">
            {[...Array(6)].map((_, i) => (
              <div key={i} className=\"guest-card-skeleton\">
                <div className=\"skeleton-header\">
                  <div className=\"skeleton-avatar\"></div>
                  <div className=\"skeleton-info\">
                    <div className=\"skeleton-line\"></div>
                    <div className=\"skeleton-line short\"></div>
                  </div>
                </div>
                <div className=\"skeleton-body\">
                  <div className=\"skeleton-line\"></div>
                  <div className=\"skeleton-line\"></div>
                  <div className=\"skeleton-line short\"></div>
                </div>
              </div>
            ))}
          </div>
        ) : guestsData?.guests?.length > 0 ? (
          <>
            <div className=\"guests-grid\">
              {guestsData.guests.map(guest => (
                <GuestCard key={guest._id} guest={guest} />
              ))}
            </div>

            {/* Pagination */}
            {guestsData.totalPages > 1 && (
              <div className=\"pagination\">
                <button
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className=\"pagination-info\">
                  Page {currentPage} of {guestsData.totalPages}
                </div>
                
                <button
                  className={`pagination-btn ${currentPage === guestsData.totalPages ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.min(guestsData.totalPages, prev + 1))}
                  disabled={currentPage === guestsData.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className=\"empty-state\">
            <FaUserCircle className=\"empty-icon\" />
            <h3>No Guests Found</h3>
            <p>
              {searchTerm || filters.nationality
                ? 'No guests match your current search criteria.'
                : 'Start by adding your first guest to the system.'}
            </p>
            <button 
              className=\"btn btn-primary\"
              onClick={() => openModal('create')}
            >
              <FaPlus />
              Add First Guest
            </button>
          </div>
        )}
      </div>

      {/* Modal would go here */}
      {showModal && (
        <div className=\"modal-overlay\" onClick={closeModal}>
          <div className=\"modal-content\" onClick={e => e.stopPropagation()}>
            <div className=\"modal-header\">
              <h2>
                {modalMode === 'create' && 'Add New Guest'}
                {modalMode === 'edit' && 'Edit Guest'}
                {modalMode === 'view' && 'Guest Details'}
              </h2>
              <button className=\"modal-close\" onClick={closeModal}>×</button>
            </div>
            <div className=\"modal-body\">
              {modalMode === 'view' && selectedGuest ? (
                <div className=\"guest-details\">
                  <div className=\"detail-section\">
                    <h4>Personal Information</h4>
                    <div className=\"detail-grid\">
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Name:</span>
                        <span className=\"detail-value\">{selectedGuest.name}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Email:</span>
                        <span className=\"detail-value\">{selectedGuest.email}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Phone:</span>
                        <span className=\"detail-value\">{selectedGuest.phone}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Nationality:</span>
                        <span className=\"detail-value\">{selectedGuest.nationality}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">ID Type:</span>
                        <span className=\"detail-value\">{selectedGuest.idType}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">ID Number:</span>
                        <span className=\"detail-value\">{selectedGuest.idNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedGuest.address && (
                    <div className=\"detail-section\">
                      <h4>Address</h4>
                      <div className=\"detail-grid\">
                        <div className=\"detail-item\">
                          <span className=\"detail-label\">Street:</span>
                          <span className=\"detail-value\">{selectedGuest.address.street || 'N/A'}</span>
                        </div>
                        <div className=\"detail-item\">
                          <span className=\"detail-label\">City:</span>
                          <span className=\"detail-value\">{selectedGuest.address.city || 'N/A'}</span>
                        </div>
                        <div className=\"detail-item\">
                          <span className=\"detail-label\">State:</span>
                          <span className=\"detail-value\">{selectedGuest.address.state || 'N/A'}</span>
                        </div>
                        <div className=\"detail-item\">
                          <span className=\"detail-label\">Country:</span>
                          <span className=\"detail-value\">{selectedGuest.address.country || 'N/A'}</span>
                        </div>
                      </div>
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

export default Guests;