import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/forms/RoomForm.css';

const RoomForm = ({ initialData = null, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'standard',
    floor: 1,
    status: 'available',
    size: '',
    bedConfiguration: 'single',
    capacity: {
      adults: 1,
      children: 0,
      maxOccupancy: 2
    },
    pricing: {
      basePrice: '',
      seasonalMultiplier: 1,
      currency: 'USD'
    },
    amenities: [],
    description: '',
    images: [],
    housekeeping: {
      lastCleaned: '',
      cleaningStatus: 'clean',
      maintenanceNotes: ''
    }
  });

  const [errors, setErrors] = useState({});

  const availableAmenities = [
    { value: 'wifi', label: 'Wi-Fi' },
    { value: 'tv', label: 'Television' },
    { value: 'minibar', label: 'Mini Bar' },
    { value: 'ac', label: 'Air Conditioning' },
    { value: 'balcony', label: 'Balcony' },
    { value: 'jacuzzi', label: 'Jacuzzi' },
    { value: 'safe', label: 'Safe' },
    { value: 'kitchen', label: 'Kitchenette' },
    { value: 'workspace', label: 'Work Desk' },
    { value: 'ocean_view', label: 'Ocean View' },
    { value: 'city_view', label: 'City View' },
    { value: 'parking', label: 'Parking' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        housekeeping: { ...formData.housekeeping, ...initialData.housekeeping },
        capacity: { ...formData.capacity, ...initialData.capacity },
        pricing: { ...formData.pricing, ...initialData.pricing }
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (!formData.size.trim()) newErrors.size = 'Room size is required';
    if (!formData.pricing.basePrice || formData.pricing.basePrice <= 0) {
      newErrors.basePrice = 'Valid base price is required';
    }
    if (!formData.capacity.adults || formData.capacity.adults <= 0) {
      newErrors.adults = 'Adult capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const cleanData = {
      ...formData,
      pricing: {
        ...formData.pricing,
        basePrice: parseFloat(formData.pricing.basePrice)
      },
      capacity: {
        ...formData.capacity,
        adults: parseInt(formData.capacity.adults),
        children: parseInt(formData.capacity.children),
        maxOccupancy: parseInt(formData.capacity.maxOccupancy)
      },
      floor: parseInt(formData.floor)
    };

    onSubmit(cleanData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAmenityChange = (amenityValue, isChecked) => {
    setFormData(prev => ({
      ...prev,
      amenities: isChecked 
        ? [...prev.amenities, amenityValue]
        : prev.amenities.filter(a => a !== amenityValue)
    }));
  };

  return (
    <div className=\"room-form-container\">
      <form className=\"room-form\" onSubmit={handleSubmit}>
        <div className=\"form-section\">
          <h3 className=\"section-title\">Basic Information</h3>
          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"roomNumber\">Room Number *</label>
              <input
                type=\"text\"
                id=\"roomNumber\"
                name=\"roomNumber\"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className={errors.roomNumber ? 'error' : ''}
                disabled={isLoading}
                placeholder=\"e.g., 101, A-202\"
              />
              {errors.roomNumber && <span className=\"error-message\">{errors.roomNumber}</span>}
            </div>
            
            <div className=\"form-group\">
              <label htmlFor=\"roomType\">Room Type</label>
              <select
                id=\"roomType\"
                name=\"roomType\"
                value={formData.roomType}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value=\"standard\">Standard</option>
                <option value=\"deluxe\">Deluxe</option>
                <option value=\"suite\">Suite</option>
                <option value=\"presidential\">Presidential Suite</option>
              </select>
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"floor\">Floor</label>
              <input
                type=\"number\"
                id=\"floor\"
                name=\"floor\"
                value={formData.floor}
                onChange={handleInputChange}
                min=\"1\"
                max=\"50\"
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"status\">Status</label>
              <select
                id=\"status\"
                name=\"status\"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value=\"available\">Available</option>
                <option value=\"occupied\">Occupied</option>
                <option value=\"maintenance\">Under Maintenance</option>
                <option value=\"cleaning\">Being Cleaned</option>
                <option value=\"out_of_order\">Out of Order</option>
              </select>
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"size\">Room Size *</label>
              <input
                type=\"text\"
                id=\"size\"
                name=\"size\"
                value={formData.size}
                onChange={handleInputChange}
                className={errors.size ? 'error' : ''}
                disabled={isLoading}
                placeholder=\"e.g., 25 sqm, 300 sqft\"
              />
              {errors.size && <span className=\"error-message\">{errors.size}</span>}
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"bedConfiguration\">Bed Configuration</label>
              <select
                id=\"bedConfiguration\"
                name=\"bedConfiguration\"
                value={formData.bedConfiguration}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value=\"single\">Single Bed</option>
                <option value=\"twin\">Twin Beds</option>
                <option value=\"double\">Double Bed</option>
                <option value=\"queen\">Queen Bed</option>
                <option value=\"king\">King Bed</option>
                <option value=\"multiple\">Multiple Beds</option>
              </select>
            </div>
          </div>
        </div>

        <div className=\"form-section\">
          <h3 className=\"section-title\">Capacity & Pricing</h3>
          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"capacity.adults\">Adult Capacity *</label>
              <input
                type=\"number\"
                id=\"capacity.adults\"
                name=\"capacity.adults\"
                value={formData.capacity.adults}
                onChange={handleInputChange}
                className={errors.adults ? 'error' : ''}
                min=\"1\"
                max=\"10\"
                disabled={isLoading}
              />
              {errors.adults && <span className=\"error-message\">{errors.adults}</span>}
            </div>
            
            <div className=\"form-group\">
              <label htmlFor=\"capacity.children\">Children Capacity</label>
              <input
                type=\"number\"
                id=\"capacity.children\"
                name=\"capacity.children\"
                value={formData.capacity.children}
                onChange={handleInputChange}
                min=\"0\"
                max=\"6\"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"capacity.maxOccupancy\">Max Occupancy</label>
              <input
                type=\"number\"
                id=\"capacity.maxOccupancy\"
                name=\"capacity.maxOccupancy\"
                value={formData.capacity.maxOccupancy}
                onChange={handleInputChange}
                min=\"1\"
                max=\"12\"
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"pricing.basePrice\">Base Price (USD) *</label>
              <input
                type=\"number\"
                id=\"pricing.basePrice\"
                name=\"pricing.basePrice\"
                value={formData.pricing.basePrice}
                onChange={handleInputChange}
                className={errors.basePrice ? 'error' : ''}
                min=\"0\"
                step=\"0.01\"
                disabled={isLoading}
                placeholder=\"0.00\"
              />
              {errors.basePrice && <span className=\"error-message\">{errors.basePrice}</span>}
            </div>
          </div>
        </div>

        <div className=\"form-section\">
          <h3 className=\"section-title\">Amenities</h3>
          <div className=\"amenities-grid\">
            {availableAmenities.map(amenity => (
              <label key={amenity.value} className=\"amenity-checkbox\">
                <input
                  type=\"checkbox\"
                  checked={formData.amenities.includes(amenity.value)}
                  onChange={(e) => handleAmenityChange(amenity.value, e.target.checked)}
                  disabled={isLoading}
                />
                <span className=\"checkmark\"></span>
                {amenity.label}
              </label>
            ))}
          </div>
        </div>

        <div className=\"form-section\">
          <h3 className=\"section-title\">Description & Images</h3>
          <div className=\"form-group\">
            <label htmlFor=\"description\">Description</label>
            <textarea
              id=\"description\"
              name=\"description\"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={4}
              placeholder=\"Describe the room features, view, and any special characteristics...\"
            />
          </div>

          <div className=\"form-group\">
            <label htmlFor=\"images\">Image URLs (one per line)</label>
            <textarea
              id=\"images\"
              name=\"images\"
              value={Array.isArray(formData.images) ? formData.images.join('\\n') : ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                images: e.target.value.split('\\n').filter(url => url.trim())
              }))}
              disabled={isLoading}
              rows={3}
              placeholder=\"https://example.com/room1.jpg&#10;https://example.com/room2.jpg\"
            />
          </div>
        </div>

        <div className=\"form-section\">
          <h3 className=\"section-title\">Housekeeping</h3>
          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"housekeeping.lastCleaned\">Last Cleaned</label>
              <input
                type=\"datetime-local\"
                id=\"housekeeping.lastCleaned\"
                name=\"housekeeping.lastCleaned\"
                value={formData.housekeeping.lastCleaned}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"housekeeping.cleaningStatus\">Cleaning Status</label>
              <select
                id=\"housekeeping.cleaningStatus\"
                name=\"housekeeping.cleaningStatus\"
                value={formData.housekeeping.cleaningStatus}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value=\"clean\">Clean</option>
                <option value=\"dirty\">Needs Cleaning</option>
                <option value=\"in_progress\">Cleaning in Progress</option>
                <option value=\"inspected\">Inspected</option>
              </select>
            </div>
          </div>

          <div className=\"form-group\">
            <label htmlFor=\"housekeeping.maintenanceNotes\">Maintenance Notes</label>
            <textarea
              id=\"housekeeping.maintenanceNotes\"
              name=\"housekeeping.maintenanceNotes\"
              value={formData.housekeeping.maintenanceNotes}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              placeholder=\"Any maintenance issues, repairs needed, or special notes...\"
            />
          </div>
        </div>

        <div className=\"form-actions\">
          <button 
            type=\"button\" 
            onClick={onCancel}
            className=\"btn btn-secondary\"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type=\"submit\" 
            className=\"btn btn-primary\"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (initialData ? 'Update Room' : 'Create Room')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;