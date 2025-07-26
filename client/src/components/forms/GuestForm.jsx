import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/forms/GuestForm.css';

const GuestForm = ({ initialData = null, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    nationality: '',
    idNumber: '',
    dateOfBirth: '',
    membershipLevel: 'bronze',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    preferences: {
      roomType: '',
      bedType: '',
      smokingPreference: 'non-smoking',
      specialRequests: ''
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        address: { ...formData.address, ...initialData.address },
        emergencyContact: { ...formData.emergencyContact, ...initialData.emergencyContact },
        preferences: { ...formData.preferences, ...initialData.preferences }
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Clean up the data before submitting
    const cleanData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className=\"guest-form-container\">
      <form className=\"guest-form\" onSubmit={handleSubmit}>
        <div className=\"form-section\">
          <h3 className=\"section-title\">Personal Information</h3>
          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"firstName\">First Name *</label>
              <input
                type=\"text\"
                id=\"firstName\"
                name=\"firstName\"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.firstName && <span className=\"error-message\">{errors.firstName}</span>}
            </div>
            
            <div className=\"form-group\">
              <label htmlFor=\"lastName\">Last Name *</label>
              <input
                type=\"text\"
                id=\"lastName\"
                name=\"lastName\"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.lastName && <span className=\"error-message\">{errors.lastName}</span>}
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"email\">Email *</label>
              <input
                type=\"email\"
                id=\"email\"
                name=\"email\"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.email && <span className=\"error-message\">{errors.email}</span>}
            </div>
            
            <div className=\"form-group\">
              <label htmlFor=\"phone\">Phone Number *</label>
              <input
                type=\"tel\"
                id=\"phone\"
                name=\"phone\"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.phone && <span className=\"error-message\">{errors.phone}</span>}
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"dateOfBirth\">Date of Birth</label>
              <input
                type=\"date\"
                id=\"dateOfBirth\"
                name=\"dateOfBirth\"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"nationality\">Nationality</label>
              <input
                type=\"text\"
                id=\"nationality\"
                name=\"nationality\"
                value={formData.nationality}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"idNumber\">ID Number</label>
              <input
                type=\"text\"
                id=\"idNumber\"
                name=\"idNumber\"
                value={formData.idNumber}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"membershipLevel\">Membership Level</label>
              <select
                id=\"membershipLevel\"
                name=\"membershipLevel\"
                value={formData.membershipLevel}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value=\"bronze\">Bronze</option>
                <option value=\"silver\">Silver</option>
                <option value=\"gold\">Gold</option>
                <option value=\"platinum\">Platinum</option>
              </select>
            </div>
          </div>
        </div>

        <div className=\"form-section\">
          <h3 className=\"section-title\">Address Information</h3>
          <div className=\"form-group\">
            <label htmlFor=\"address.street\">Street Address</label>
            <input
              type=\"text\"
              id=\"address.street\"
              name=\"address.street\"
              value={formData.address.street}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"address.city\">City</label>
              <input
                type=\"text\"
                id=\"address.city\"
                name=\"address.city\"
                value={formData.address.city}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"address.state\">State/Province</label>
              <input
                type=\"text\"
                id=\"address.state\"
                name=\"address.state\"
                value={formData.address.state}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"address.country\">Country</label>
              <input
                type=\"text\"
                id=\"address.country\"
                name=\"address.country\"
                value={formData.address.country}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"address.zipCode\">ZIP/Postal Code</label>
              <input
                type=\"text\"
                id=\"address.zipCode\"
                name=\"address.zipCode\"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className=\"form-section\">
          <h3 className=\"section-title\">Emergency Contact</h3>
          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"emergencyContact.name\">Contact Name</label>
              <input
                type=\"text\"
                id=\"emergencyContact.name\"
                name=\"emergencyContact.name\"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"emergencyContact.relationship\">Relationship</label>
              <input
                type=\"text\"
                id=\"emergencyContact.relationship\"
                name=\"emergencyContact.relationship\"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder=\"e.g., Spouse, Parent, Friend\"
              />
            </div>
          </div>

          <div className=\"form-group\">
            <label htmlFor=\"emergencyContact.phone\">Emergency Phone</label>
            <input
              type=\"tel\"
              id=\"emergencyContact.phone\"
              name=\"emergencyContact.phone\"
              value={formData.emergencyContact.phone}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className=\"form-section\">
          <h3 className=\"section-title\">Preferences</h3>
          <div className=\"form-row\">
            <div className=\"form-group\">
              <label htmlFor=\"preferences.roomType\">Preferred Room Type</label>
              <select
                id=\"preferences.roomType\"
                name=\"preferences.roomType\"
                value={formData.preferences.roomType}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value=\"\">No preference</option>
                <option value=\"standard\">Standard</option>
                <option value=\"deluxe\">Deluxe</option>
                <option value=\"suite\">Suite</option>
                <option value=\"presidential\">Presidential Suite</option>
              </select>
            </div>

            <div className=\"form-group\">
              <label htmlFor=\"preferences.bedType\">Bed Type</label>
              <select
                id=\"preferences.bedType\"
                name=\"preferences.bedType\"
                value={formData.preferences.bedType}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value=\"\">No preference</option>
                <option value=\"single\">Single</option>
                <option value=\"double\">Double</option>
                <option value=\"queen\">Queen</option>
                <option value=\"king\">King</option>
              </select>
            </div>
          </div>

          <div className=\"form-group\">
            <label htmlFor=\"preferences.smokingPreference\">Smoking Preference</label>
            <select
              id=\"preferences.smokingPreference\"
              name=\"preferences.smokingPreference\"
              value={formData.preferences.smokingPreference}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value=\"non-smoking\">Non-smoking</option>
              <option value=\"smoking\">Smoking</option>
            </select>
          </div>

          <div className=\"form-group\">
            <label htmlFor=\"preferences.specialRequests\">Special Requests</label>
            <textarea
              id=\"preferences.specialRequests\"
              name=\"preferences.specialRequests\"
              value={formData.preferences.specialRequests}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              placeholder=\"Any special requests or requirements...\"
            />
          </div>
        </div>

        <div className=\"form-section\">
          <div className=\"form-group\">
            <label htmlFor=\"notes\">Additional Notes</label>
            <textarea
              id=\"notes\"
              name=\"notes\"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              placeholder=\"Any additional notes about the guest...\"
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
            {isLoading ? 'Saving...' : (initialData ? 'Update Guest' : 'Create Guest')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestForm;