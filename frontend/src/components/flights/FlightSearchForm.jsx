import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaPlane, FaCalendarAlt, FaUser, FaExchangeAlt } from 'react-icons/fa';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import { searchFlights } from '../../store/slices/flightSlice';

const FlightSearchForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = new Date().toISOString().split('T')[0];
  
  const [searchParams, setSearchParams] = useState({
    tripType: 'oneWay',
    departureCity: '',
    arrivalCity: '',
    departureDate: today,
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    flightClass: 'economy'
  });
  
  const [errors, setErrors] = useState({});
  
  // Indian cities for selection with exact format matching flights.json
  const popularCities = [
    { value: 'Mumbai (BOM)', label: 'Mumbai (BOM)' },
    { value: 'Delhi (DEL)', label: 'Delhi (DEL)' },
    { value: 'Bangalore (BLR)', label: 'Bangalore (BLR)' },
    { value: 'Chennai (MAA)', label: 'Chennai (MAA)' },
    { value: 'Hyderabad (HYD)', label: 'Hyderabad (HYD)' },
    { value: 'Kolkata (CCU)', label: 'Kolkata (CCU)' },
    { value: 'Ahmedabad (AMD)', label: 'Ahmedabad (AMD)' },
    { value: 'Goa (GOI)', label: 'Goa (GOI)' },
    { value: 'Jaipur (JAI)', label: 'Jaipur (JAI)' },
    { value: 'Kochi (COK)', label: 'Kochi (COK)' },
    { value: 'Pune (PNQ)', label: 'Pune (PNQ)' },
    { value: 'Lucknow (LKO)', label: 'Lucknow (LKO)' },
    { value: 'Thiruvananthapuram (TRV)', label: 'Thiruvananthapuram (TRV)' }
  ];
  
  const flightClasses = [
    { value: 'economy', label: 'Economy' },
    { value: 'premiumEconomy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'adults' || name === 'children' || name === 'infants') {
      setSearchParams({
        ...searchParams,
        passengers: {
          ...searchParams.passengers,
          [name]: parseInt(value, 10) || 0
        }
      });
    } else {
      setSearchParams({
        ...searchParams,
        [name]: value
      });
      
      // Clear error when field is updated
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };
  
  const swapCities = () => {
    setSearchParams({
      ...searchParams,
      departureCity: searchParams.arrivalCity,
      arrivalCity: searchParams.departureCity
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!searchParams.departureCity) {
      newErrors.departureCity = 'Please select a departure city';
    }
    
    if (!searchParams.arrivalCity) {
      newErrors.arrivalCity = 'Please select an arrival city';
    }
    
    if (searchParams.departureCity === searchParams.arrivalCity && searchParams.departureCity !== '') {
      newErrors.arrivalCity = 'Departure and arrival cities cannot be the same';
    }
    
    if (!searchParams.departureDate) {
      newErrors.departureDate = 'Please select a departure date';
    }
    
    if (searchParams.tripType === 'roundTrip' && !searchParams.returnDate) {
      newErrors.returnDate = 'Please select a return date';
    }
    
    if (
      searchParams.tripType === 'roundTrip' && 
      searchParams.returnDate && 
      new Date(searchParams.returnDate) < new Date(searchParams.departureDate)
    ) {
      newErrors.returnDate = 'Return date must be after departure date';
    }
    
    const totalPassengers = 
      searchParams.passengers.adults + 
      searchParams.passengers.children + 
      searchParams.passengers.infants;
      
    if (totalPassengers < 1) {
      newErrors.adults = 'At least one adult passenger is required';
    }
    
    if (totalPassengers > 9) {
      newErrors.passengers = 'Maximum 9 passengers allowed per booking';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // First, select the current date values
    let depDate = searchParams.departureDate;
    let retDate = searchParams.tripType === 'roundTrip' ? searchParams.returnDate : null;
    
    // Special handling for date inputs that might come from different sources
    try {
      // Try to normalize the date format to YYYY-MM-DD
      if (depDate) {
        // If it's an input date field, it might already be in YYYY-MM-DD format
        if (typeof depDate === 'string' && depDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Already in correct format, keep as is
          console.log('Departure date is already in YYYY-MM-DD format');
        } else {
          // Convert to Date object and then to YYYY-MM-DD
          const dateObj = new Date(depDate);
          depDate = dateObj.toISOString().split('T')[0];
        }
      }
    } catch (err) {
      console.error('Error formatting departure date:', err);
      // Fall back to original value
    }
    
    // Create a clean copy of search params with properly formatted values
    const flightSearchParams = {
      departureCity: searchParams.departureCity.trim(),
      arrivalCity: searchParams.arrivalCity.trim(),
      departureDate: depDate, // Use our normalized date
      returnDate: retDate,
      passengers: {
        adults: parseInt(searchParams.passengers.adults || 1),
        children: parseInt(searchParams.passengers.children || 0),
        infants: parseInt(searchParams.passengers.infants || 0)
      },
      flightClass: searchParams.flightClass || 'economy'
    };
    
    console.log('🔍 Searching for flights:', {
      from: flightSearchParams.departureCity,
      to: flightSearchParams.arrivalCity,
      date: flightSearchParams.departureDate
    });
    
    // Store search parameters in local storage for persistence
    localStorage.setItem('lastFlightSearch', JSON.stringify(searchParams));
    
    // Clear any previous search results before starting a new search
    dispatch({ type: 'flights/clearSearchResults' });
    
    // Dispatch search action with our properly formatted parameters
    dispatch(searchFlights(flightSearchParams));
    
    // Send user to search results page with the search params
    navigate('/search', { state: { searchParams: flightSearchParams } });
  };
  
  return (
    <Card className="mb-6" variant="elevated">
      <form onSubmit={handleSubmit}>
        {/* Trip Type Selection */}
        <div className="mb-4">
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="tripType"
                value="oneWay"
                checked={searchParams.tripType === 'oneWay'}
                onChange={handleChange}
                className="h-4 w-4 border-dark-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-800"
              />
              <span className="ml-2 text-gray-300">One Way</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="tripType"
                value="roundTrip"
                checked={searchParams.tripType === 'roundTrip'}
                onChange={handleChange}
                className="h-4 w-4 border-dark-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-800"
              />
              <span className="ml-2 text-gray-300">Round Trip</span>
            </label>
          </div>
        </div>

        {/* City Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative">
          <Select
            label="From"
            id="departureCity"
            name="departureCity"
            value={searchParams.departureCity}
            onChange={handleChange}
            options={popularCities}
            placeholder="Select departure city"
            required
            error={errors.departureCity}
          />
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <button
              type="button"
              onClick={swapCities}
              className="rounded-full bg-dark-700 border border-dark-600 p-2 hover:bg-dark-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="Swap cities"
            >
              <FaExchangeAlt className="text-primary-500" />
            </button>
          </div>
          
          <Select
            label="To"
            id="arrivalCity"
            name="arrivalCity"
            value={searchParams.arrivalCity}
            onChange={handleChange}
            options={popularCities}
            placeholder="Select arrival city"
            required
            error={errors.arrivalCity}
          />
        </div>
        
        {/* Mobile Swap Button */}
        <div className="md:hidden flex justify-center mb-4">
          <button
            type="button"
            onClick={swapCities}
            className="rounded-full bg-dark-700 border border-dark-600 p-2 hover:bg-dark-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Swap cities"
          >
            <FaExchangeAlt className="text-primary-500" /> 
            <span className="sr-only">Swap cities</span>
          </button>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Departure Date"
            type="date"
            id="departureDate"
            name="departureDate"
            value={searchParams.departureDate}
            onChange={handleChange}
            min={today}
            required
            icon={<FaCalendarAlt />}
            error={errors.departureDate}
          />
          
          {searchParams.tripType === 'roundTrip' && (
            <Input
              label="Return Date"
              type="date"
              id="returnDate"
              name="returnDate"
              value={searchParams.returnDate}
              onChange={handleChange}
              min={searchParams.departureDate || today}
              required={searchParams.tripType === 'roundTrip'}
              icon={<FaCalendarAlt />}
              error={errors.returnDate}
            />
          )}
        </div>
        
        {/* Passenger and Class Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Adults (18+)
            </label>
            <select
              name="adults"
              value={searchParams.passengers.adults}
              onChange={handleChange}
              className="block w-full bg-dark-700 border border-dark-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
            >
              {[...Array(9)].map((_, i) => (
                <option key={i} value={i + 1} className="bg-dark-700">
                  {i + 1}
                </option>
              ))}
            </select>
            {errors.adults && <p className="text-xs text-red-500">{errors.adults}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Children (2-17)
            </label>
            <select
              name="children"
              value={searchParams.passengers.children}
              onChange={handleChange}
              className="block w-full bg-dark-700 border border-dark-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i} value={i} className="bg-dark-700">
                  {i}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Infants (0-2)
            </label>
            <select
              name="infants"
              value={searchParams.passengers.infants}
              onChange={handleChange}
              className="block w-full bg-dark-700 border border-dark-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
            >
              {[...Array(searchParams.passengers.adults + 1)].map((_, i) => (
                <option key={i} value={i} className="bg-dark-700">
                  {i}
                </option>
              ))}
            </select>
          </div>
          
          <Select
            label="Class"
            id="flightClass"
            name="flightClass"
            value={searchParams.flightClass}
            onChange={handleChange}
            options={flightClasses}
            required
          />
        </div>
        
        {errors.passengers && (
          <div className="mb-4 text-sm text-red-500">
            {errors.passengers}
          </div>
        )}
        
        <Button 
          type="submit" 
          fullWidth 
          icon={<FaPlane />}
          className="text-base py-3"
        >
          Search Flights
        </Button>
      </form>
    </Card>
  );
};

export default FlightSearchForm;
