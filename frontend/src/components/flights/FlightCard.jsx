import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaPlane, FaClock, FaArrowRight, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

import Card from '../ui/Card';
import Button from '../ui/Button';
import { selectFlight } from '../../store/slices/flightSlice';

const FlightCard = ({ flight, flightClass = 'economy', passengers }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Extract properties from flight data, with fallbacks for different key names
  const {
    id,
    _id = id, // Use id or fallback to _id
    airline,
    flightNumber = id, // Use id as flightNumber if not available
    origin = departureCity, // Match flights.json structure
    destination = arrivalCity, // Match flights.json structure
    departureCity = origin?.split(' ')[0], // Extract city name from origin
    arrivalCity = destination?.split(' ')[0], // Extract city name from destination
    departureAirport = origin?.match(/\(([^)]+)\)/)?.[ 1 ] || '', // Extract airport code from origin
    arrivalAirport = destination?.match(/\(([^)]+)\)/)?.[ 1 ] || '', // Extract airport code from destination
    departureTime, // Match flights.json structure
    arrivalTime, // Match flights.json structure
    departureDate = departureTime, // Use departureTime as fallback
    arrivalDate = arrivalTime, // Use arrivalTime as fallback
    duration,
    stops = 0,
    price,
    availableSeats = 100,
    aircraft,
    amenities = []
  } = flight;
  
  // Format date and time (date in dd/mm/yyyy format)
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    
    return {
      date: `${day}/${month}/${year}`,
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      day: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };
  
  const departure = formatDateTime(departureDate);
  const arrival = formatDateTime(arrivalDate);
  
  // Format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Calculate price based on class and passengers
  const getPriceMultiplier = () => {
    switch (flightClass) {
      case 'economy': return 1;
      case 'premiumEconomy': return 1.5;
      case 'business': return 2.5;
      case 'first': return 4;
      default: return 1;
    }
  };
  
  const basePrice = price * getPriceMultiplier();
  const totalPassengers = 
    (passengers?.adults || 1) + 
    (passengers?.children || 0) + 
    (passengers?.infants || 0);
  const totalPrice = basePrice * totalPassengers;
  
  // Handle booking
  const handleSelect = () => {
    dispatch(selectFlight({ flight, flightClass, passengers }));
    // Use id from flights.json or fall back to _id if present
    const flightId = id || _id;
    navigate(`/booking/${flightId}`, { state: { flightClass, passengers } });
  };
  
  return (
    <Card className="mb-4 transition-shadow hover:shadow-lg">
      {/* Airline and Flight Info */}
      <div className="flex flex-wrap items-center justify-between border-b border-dark-700 pb-3 mb-4">
        <div className="flex items-center">
          <div className="rounded-full bg-dark-700 p-2 mr-3">
            <FaPlane className="text-primary-500 h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-medium">{airline}</h3>
            <p className="text-sm text-gray-400">Flight {flightNumber}</p>
          </div>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className={`px-2 py-1 rounded text-xs font-medium 
            ${stops === 0 ? 'bg-green-900 text-green-300' : 
              stops === 1 ? 'bg-blue-900 text-blue-300' : 
              'bg-yellow-900 text-yellow-300'}`}>
            {stops === 0 ? 'Direct' : stops === 1 ? '1 Stop' : `${stops} Stops`}
          </span>
        </div>
      </div>
      
      {/* Flight Route and Time */}
      <div className="flex flex-wrap justify-between mb-4">
        {/* Departure */}
        <div className="w-full md:w-auto mb-3 md:mb-0">
          <p className="text-2xl font-bold text-white">{departure.time}</p>
          <p className="text-gray-400">{departureAirport}</p>
          <p className="text-sm text-gray-500">{departureCity}</p>
        </div>
        
        {/* Duration */}
        <div className="w-full md:w-auto flex flex-col items-center mb-3 md:mb-0">
          <p className="text-sm text-gray-400">{formatDuration(duration)}</p>
          <div className="relative w-32 my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="h-px w-full bg-dark-600"></div>
            </div>
            <div className="relative flex justify-between">
              <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              {stops > 0 && (
                <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              )}
              <div className="h-2 w-2 rounded-full bg-primary-500"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center">
            <FaClock className="mr-1" />
            {departure.day}
          </p>
        </div>
        
        {/* Arrival */}
        <div className="w-full md:w-auto text-right">
          <p className="text-2xl font-bold text-white">{arrival.time}</p>
          <p className="text-gray-400">{arrivalAirport}</p>
          <p className="text-sm text-gray-500">{arrivalCity}</p>
        </div>
      </div>
      
      {/* Price and Book Button */}
      <div className="flex flex-wrap items-center justify-between mt-4">
        <div>
          <p className="text-2xl font-bold text-white">${basePrice.toFixed(2)}</p>
          <p className="text-xs text-gray-400">per passenger</p>
          {totalPassengers > 1 && (
            <p className="text-sm text-primary-400">
              ${totalPrice.toFixed(2)} total
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            icon={<FaInfoCircle />}
          >
            Details
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={availableSeats < totalPassengers}
            icon={<FaArrowRight />}
          >
            Select
          </Button>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-white mb-2">Flight Details</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <FaPlane className="mt-1 mr-2 text-gray-500" /> 
                  <span>Aircraft: {aircraft}</span>
                </li>
                <li className="flex items-start">
                  <FaCalendarAlt className="mt-1 mr-2 text-gray-500" /> 
                  <span>Date: {departure.date}</span>
                </li>
                <li>
                  <span className="block text-gray-500 mt-2">Available seats: {availableSeats}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Selected Class</h4>
              <p className="text-gray-400 capitalize">{flightClass.replace(/([A-Z])/g, ' $1')}</p>
              
              <h4 className="font-medium text-white mt-4 mb-2">Baggage Allowance</h4>
              <p className="text-gray-400">
                {flightClass === 'economy' && '1 x 23kg checked + 7kg cabin'}
                {flightClass === 'premiumEconomy' && '2 x 23kg checked + 7kg cabin'}
                {flightClass === 'business' && '2 x 32kg checked + 10kg cabin'}
                {flightClass === 'first' && '3 x 32kg checked + 10kg cabin'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Amenities</h4>
              {amenities.length > 0 ? (
                <ul className="text-gray-400">
                  {amenities.map((amenity, index) => (
                    <li key={index} className="inline-flex items-center bg-dark-700 rounded-full px-3 py-1 mr-2 mb-2 text-xs">
                      {amenity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No amenities information available</p>
              )}
            </div>
          </div>
          
          {stops > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-white mb-2">Stops</h4>
              <p className="text-gray-400">
                This flight includes {stops} stop(s). Connection details available during booking.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default FlightCard;
