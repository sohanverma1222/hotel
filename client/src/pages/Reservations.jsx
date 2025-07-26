import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaEye,
  FaSearch,
  FaFilter,
  FaCalendarCheck,
  FaCalendarTimes,
  FaCreditCard,
  FaUser,
  FaBed,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaSignInAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import reservationService from '../services/reservationService';
import '../styles/Reservations.css';

const Reservations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [filters, setFilters] = useState({
    status: '',
    roomNumber: '',
    sortBy: 'checkIn'
  });

  const queryClient = useQueryClient();

  // Fetch reservations
  const { data: reservationsData, isLoading } = useQuery(
    ['reservations', currentPage, searchTerm, filters],
    () => reservationService.getAllReservations({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      ...filters
    }),
    { keepPreviousData: true }
  );

  // Check-in mutation
  const checkInMutation = useMutation(
    (id) => reservationService.checkIn(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reservations');
        toast.success('Guest checked in successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to check in guest');
      }
    }
  );

  // Check-out mutation
  const checkOutMutation = useMutation(
    (id) => reservationService.checkOut(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reservations');
        toast.success('Guest checked out successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to check out guest');
      }
    }
  );

  // Cancel mutation
  const cancelMutation = useMutation(
    (id) => reservationService.cancelReservation(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reservations');
        toast.success('Reservation cancelled successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to cancel reservation');
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

  const openModal = (mode, reservation = null) => {
    setModalMode(mode);
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
    setModalMode('create');
  };

  const handleCheckIn = (reservation) => {
    if (window.confirm(`Check in ${reservation.guestName}?`)) {
      checkInMutation.mutate(reservation._id);
    }
  };

  const handleCheckOut = (reservation) => {
    if (window.confirm(`Check out ${reservation.guestName}?`)) {
      checkOutMutation.mutate(reservation._id);
    }
  };

  const handleCancel = (reservation) => {
    if (window.confirm(`Cancel reservation for ${reservation.guestName}?`)) {
      cancelMutation.mutate(reservation._id);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: FaCheckCircle,
      'checked-in': FaSignInAlt,
      'checked-out': FaSignOutAlt,
      cancelled: FaBan
    };
    return icons[status] || FaClock;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDaysFromNow = (date) => {
    const targetDate = new Date(date);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const ReservationCard = ({ reservation }) => {
    const StatusIcon = getStatusIcon(reservation.status);
    const isToday = new Date(reservation.checkIn).toDateString() === new Date().toDateString();
    const isCheckInDay = reservation.status === 'confirmed' && isToday;
    const isCheckOutDay = reservation.status === 'checked-in' && 
                         new Date(reservation.checkOut).toDateString() === new Date().toDateString();

    return (
      <div className={`reservation-card status-${reservation.status} ${isCheckInDay ? 'check-in-today' : ''} ${isCheckOutDay ? 'check-out-today' : ''}`}>
        <div className=\"reservation-card-header\">
          <div className=\"guest-info\">
            <div className=\"guest-avatar\">
              <FaUser />
            </div>
            <div>
              <h4 className=\"guest-name\">{reservation.guestName}</h4>
              <p className=\"guest-contact\">{reservation.guestEmail}</p>
            </div>
          </div>
          <div className=\"reservation-actions\">
            <button 
              className=\"action-btn view-btn\"
              onClick={() => openModal('view', reservation)}
              title=\"View Details\"
            >
              <FaEye />
            </button>
            <button 
              className=\"action-btn edit-btn\"
              onClick={() => openModal('edit', reservation)}
              title=\"Edit Reservation\"
            >
              <FaEdit />
            </button>
          </div>
        </div>

        <div className=\"reservation-card-body\">
          <div className=\"reservation-details\">
            <div className=\"detail-row\">
              <div className=\"detail-item\">
                <FaBed className=\"detail-icon\" />
                <div>
                  <span className=\"detail-label\">Room</span>
                  <span className=\"detail-value\">{reservation.roomNumber}</span>
                </div>
              </div>
              <div className=\"detail-item\">
                <StatusIcon className={`detail-icon status-icon status-${reservation.status}`} />
                <div>
                  <span className=\"detail-label\">Status</span>
                  <span className={`detail-value status-${reservation.status}`}>
                    {reservation.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className=\"date-range\">
              <div className=\"date-item check-in\">
                <FaCalendarCheck className=\"date-icon\" />
                <div>
                  <span className=\"date-label\">Check-in</span>
                  <span className=\"date-value\">{formatDate(reservation.checkIn)}</span>
                  <span className=\"date-relative\">{getDaysFromNow(reservation.checkIn)}</span>
                </div>
              </div>
              <div className=\"date-separator\">
                <div className=\"nights-count\">{reservation.nights} nights</div>
              </div>
              <div className=\"date-item check-out\">
                <FaCalendarTimes className=\"date-icon\" />
                <div>
                  <span className=\"date-label\">Check-out</span>
                  <span className=\"date-value\">{formatDate(reservation.checkOut)}</span>
                  <span className=\"date-relative\">{getDaysFromNow(reservation.checkOut)}</span>
                </div>
              </div>
            </div>

            <div className=\"reservation-meta\">
              <div className=\"meta-item\">
                <span className=\"meta-label\">Guests:</span>
                <span className=\"meta-value\">
                  {reservation.adults} adult{reservation.adults !== 1 ? 's' : ''}
                  {reservation.children > 0 && `, ${reservation.children} child${reservation.children !== 1 ? 'ren' : ''}`}
                </span>
              </div>
              <div className=\"meta-item\">
                <FaCreditCard className=\"meta-icon\" />
                <span className=\"meta-label\">Total:</span>
                <span className=\"meta-value amount\">{formatCurrency(reservation.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className=\"reservation-status-actions\">
            {reservation.status === 'confirmed' && isCheckInDay && (
              <button 
                className=\"status-action-btn checkin-btn\"
                onClick={() => handleCheckIn(reservation)}
              >
                <FaSignInAlt />
                Check In
              </button>
            )}
            
            {reservation.status === 'checked-in' && isCheckOutDay && (
              <button 
                className=\"status-action-btn checkout-btn\"
                onClick={() => handleCheckOut(reservation)}
              >
                <FaSignOutAlt />
                Check Out
              </button>
            )}
            
            {['confirmed', 'checked-in'].includes(reservation.status) && (
              <button 
                className=\"status-action-btn cancel-btn\"
                onClick={() => handleCancel(reservation)}
              >
                <FaBan />
                Cancel
              </button>
            )}

            {reservation.paymentStatus === 'partial' && (
              <button className=\"status-action-btn payment-btn\">
                <FaCreditCard />
                Add Payment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=\"reservations-page\">
      <div className=\"page-header\">
        <div className=\"header-content\">
          <h1>Reservations Management</h1>
          <p>Manage bookings, check-ins, and check-outs</p>
        </div>
        <button 
          className=\"btn btn-primary\"
          onClick={() => openModal('create')}
        >
          <FaPlus />
          New Reservation
        </button>
      </div>

      {/* Filters and Search */}
      <div className=\"filters-section\">
        <div className=\"search-box\">
          <FaSearch className=\"search-icon\" />
          <input
            type=\"text\"
            placeholder=\"Search by guest name, email, or room number...\"
            value={searchTerm}
            onChange={handleSearch}
            className=\"search-input\"
          />
        </div>

        <div className=\"filters-group\">
          <div className=\"filter-item\">
            <FaFilter className=\"filter-icon\" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"\">All Status</option>
              <option value=\"confirmed\">Confirmed</option>
              <option value=\"checked-in\">Checked In</option>
              <option value=\"checked-out\">Checked Out</option>
              <option value=\"cancelled\">Cancelled</option>
            </select>
          </div>

          <div className=\"filter-item\">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className=\"filter-select\"
            >
              <option value=\"checkIn\">Check-in Date</option>
              <option value=\"-checkIn\">Check-in (Latest)</option>
              <option value=\"guestName\">Guest Name</option>
              <option value=\"roomNumber\">Room Number</option>
              <option value=\"totalAmount\">Amount</option>
            </select>
          </div>

          <button className=\"btn btn-secondary btn-sm\">
            Today's Check-ins
          </button>
        </div>
      </div>

      {/* Reservations Grid */}
      <div className=\"reservations-content\">
        {isLoading ? (
          <div className=\"loading-grid\">
            {[...Array(6)].map((_, i) => (
              <div key={i} className=\"reservation-card-skeleton\">
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
                  <div className=\"skeleton-actions\">
                    <div className=\"skeleton-button\"></div>
                    <div className=\"skeleton-button\"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reservationsData?.reservations?.length > 0 ? (
          <>
            <div className=\"reservations-grid\">
              {reservationsData.reservations.map(reservation => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))}
            </div>

            {/* Pagination */}
            {reservationsData.totalPages > 1 && (
              <div className=\"pagination\">
                <button
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className=\"pagination-info\">
                  Page {currentPage} of {reservationsData.totalPages}
                </div>
                
                <button
                  className={`pagination-btn ${currentPage === reservationsData.totalPages ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.min(reservationsData.totalPages, prev + 1))}
                  disabled={currentPage === reservationsData.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className=\"empty-state\">
            <FaCalendarCheck className=\"empty-icon\" />
            <h3>No Reservations Found</h3>
            <p>
              {searchTerm || Object.values(filters).some(v => v)
                ? 'No reservations match your current search criteria.'
                : 'Start by creating your first reservation.'}
            </p>
            <button 
              className=\"btn btn-primary\"
              onClick={() => openModal('create')}
            >
              <FaPlus />
              Create First Reservation
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
                {modalMode === 'create' && 'New Reservation'}
                {modalMode === 'edit' && 'Edit Reservation'}
                {modalMode === 'view' && 'Reservation Details'}
              </h2>
              <button className=\"modal-close\" onClick={closeModal}>×</button>
            </div>
            <div className=\"modal-body\">
              {modalMode === 'view' && selectedReservation ? (
                <div className=\"reservation-details-view\">
                  <div className=\"detail-section\">
                    <h4>Guest Information</h4>
                    <div className=\"detail-grid\">
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Name:</span>
                        <span className=\"detail-value\">{selectedReservation.guestName}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Email:</span>
                        <span className=\"detail-value\">{selectedReservation.guestEmail}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Phone:</span>
                        <span className=\"detail-value\">{selectedReservation.guestPhone}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Adults:</span>
                        <span className=\"detail-value\">{selectedReservation.adults}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Children:</span>
                        <span className=\"detail-value\">{selectedReservation.children || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className=\"detail-section\">
                    <h4>Booking Details</h4>
                    <div className=\"detail-grid\">
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Room Number:</span>
                        <span className=\"detail-value\">{selectedReservation.roomNumber}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Check-in:</span>
                        <span className=\"detail-value\">{formatDate(selectedReservation.checkIn)}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Check-out:</span>
                        <span className=\"detail-value\">{formatDate(selectedReservation.checkOut)}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Nights:</span>
                        <span className=\"detail-value\">{selectedReservation.nights}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Status:</span>
                        <span className={`detail-value status-${selectedReservation.status}`}>
                          {selectedReservation.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className=\"detail-section\">
                    <h4>Payment Information</h4>
                    <div className=\"detail-grid\">
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Total Amount:</span>
                        <span className=\"detail-value\">{formatCurrency(selectedReservation.totalAmount)}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Advance Payment:</span>
                        <span className=\"detail-value\">{formatCurrency(selectedReservation.advancePayment || 0)}</span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Payment Status:</span>
                        <span className={`detail-value payment-${selectedReservation.paymentStatus}`}>
                          {selectedReservation.paymentStatus}
                        </span>
                      </div>
                      <div className=\"detail-item\">
                        <span className=\"detail-label\">Source:</span>
                        <span className=\"detail-value\">{selectedReservation.source || 'direct'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedReservation.specialRequests && (
                    <div className=\"detail-section\">
                      <h4>Special Requests</h4>
                      <p>{selectedReservation.specialRequests}</p>
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

export default Reservations;