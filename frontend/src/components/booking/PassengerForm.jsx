  import React from 'react';
import PropTypes from 'prop-types';
import { FaUser, FaIdCard, FaPassport, FaBirthdayCake, FaPhone, FaEnvelope } from 'react-icons/fa';

import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

const PassengerForm = ({ 
  passenger, 
  index, 
  onChange, 
  passengerType = 'adult',
  errors = {}
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(index, name, value);
  };

  // Generate title options based on passenger type
  const getTitleOptions = () => {
    const options = [];
    
    if (passengerType === 'adult' || passengerType === 'child') {
      options.push(
        { value: 'mr', label: 'Mr.' },
        { value: 'ms', label: 'Ms.' },
        { value: 'mrs', label: 'Mrs.' }
      );
    }
    
    if (passengerType === 'child') {
      options.push({ value: 'mstr', label: 'Master' });
      options.push({ value: 'miss', label: 'Miss' });
    }
    
    if (passengerType === 'infant') {
      options.push({ value: 'infant', label: 'Infant' });
    }
    
    return options;
  };

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-medium text-white mb-4 border-b border-dark-700 pb-2">
        {passengerType === 'adult' 
          ? `Adult Passenger ${index + 1}` 
          : passengerType === 'child' 
            ? `Child Passenger ${index + 1}`
            : `Infant Passenger ${index + 1}`}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Title */}
        <div>
          <Select
            name="title"
            label="Title"
            value={passenger.title || ''}
            onChange={handleChange}
            options={getTitleOptions()}
            error={errors.title}
            required
          />
        </div>
        
        {/* Nationality */}
        <div>
          <Select
            name="nationality"
            label="Nationality"
            value={passenger.nationality || ''}
            onChange={handleChange}
            options={[
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'au', label: 'Australia' },
              { value: 'in', label: 'India' },
              { value: 'other', label: 'Other' }
            ]}
            error={errors.nationality}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* First Name */}
        <div>
          <Input
            type="text"
            name="firstName"
            label="First Name"
            value={passenger.firstName || ''}
            onChange={handleChange}
            placeholder="Enter first name"
            icon={<FaUser />}
            error={errors.firstName}
            required
          />
        </div>
        
        {/* Last Name */}
        <div>
          <Input
            type="text"
            name="lastName"
            label="Last Name"
            value={passenger.lastName || ''}
            onChange={handleChange}
            placeholder="Enter last name"
            icon={<FaUser />}
            error={errors.lastName}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Date of Birth */}
        <div>
          <Input
            type="date"
            name="dateOfBirth"
            label="Date of Birth"
            value={passenger.dateOfBirth || ''}
            onChange={handleChange}
            icon={<FaBirthdayCake />}
            error={errors.dateOfBirth}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        {/* Document Type */}
        <div>
          <Select
            name="documentType"
            label="Document Type"
            value={passenger.documentType || ''}
            onChange={handleChange}
            options={[
              { value: 'passport', label: 'Passport' },
              { value: 'nationalId', label: 'National ID' },
              { value: 'drivingLicense', label: 'Driving License' }
            ]}
            error={errors.documentType}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Number */}
        <div>
          <Input
            type="text"
            name="documentNumber"
            label="Document Number"
            value={passenger.documentNumber || ''}
            onChange={handleChange}
            placeholder="Enter document number"
            icon={<FaIdCard />}
            error={errors.documentNumber}
            required
          />
        </div>
        
        {/* Document Expiry (not required for infants) */}
        {passengerType !== 'infant' && (
          <div>
            <Input
              type="date"
              name="documentExpiry"
              label="Document Expiry Date"
              value={passenger.documentExpiry || ''}
              onChange={handleChange}
              icon={<FaPassport />}
              error={errors.documentExpiry}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}
      </div>
      
      {/* Contact Information (only required for the first adult passenger) */}
      {passengerType === 'adult' && index === 0 && (
        <div className="mt-6 pt-4 border-t border-dark-700">
          <h4 className="text-md font-medium text-white mb-4">Contact Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                label="Email"
                value={passenger.email || ''}
                onChange={handleChange}
                placeholder="Enter email address"
                icon={<FaEnvelope />}
                error={errors.email}
                required
              />
            </div>
            
            {/* Phone Number */}
            <div>
              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                value={passenger.phone || ''}
                onChange={handleChange}
                placeholder="Enter phone number"
                icon={<FaPhone />}
                error={errors.phone}
                required
              />
            </div>
          </div>
          
          {/* Emergency Contact */}
          <div>
            <h5 className="text-sm font-medium text-gray-400 mb-2">Emergency Contact</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                name="emergencyContact"
                label="Emergency Contact Name"
                value={passenger.emergencyContact || ''}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
                error={errors.emergencyContact}
                required
              />
              <Input
                type="tel"
                name="emergencyPhone"
                label="Emergency Contact Phone"
                value={passenger.emergencyPhone || ''}
                onChange={handleChange}
                placeholder="Enter emergency contact phone"
                error={errors.emergencyPhone}
                required
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

PassengerForm.propTypes = {
  passenger: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  passengerType: PropTypes.oneOf(['adult', 'child', 'infant']),
  errors: PropTypes.object
};

export default PassengerForm;
