import React from 'react';
import { FaPlane, FaClock, FaCalendarAlt, FaTicketAlt, FaLuggageCart } from 'react-icons/fa';
import PropTypes from 'prop-types';

import Card from '../ui/Card';

const BookingFlightDetails = ({ flight, flightClass, passengers }) => {
  if (!flight) return null;

  const {
    _id,
    airline,
    flightNumber,
    departureCity,
    arrivalCity,
    departureAirport,
    arrivalAirport,
    departureDate,
    arrivalDate,
    duration,
    stops,
    price,
    aircraft
  } = flight;

  // Format date and time (date in dd/mm/yyyy format)
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    
    return {
      date: `${day}/${month}/${year}`,
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
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

  // Calculate fare details
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
  const adultCount = passengers?.adults || 1;
  const childCount = passengers?.children || 0;
  const infantCount = passengers?.infants || 0;
  const totalPassengers = adultCount + childCount + infantCount;

  // Calculate individual and total fares
  const adultFare = basePrice * adultCount;
  const childFare = basePrice * 0.7 * childCount;
  const infantFare = basePrice * 0.1 * infantCount;
  
  const subtotal = adultFare + childFare + infantFare;
  const taxes = subtotal * 0.12;
  const fees = 29.99 * totalPassengers;
  const totalFare = subtotal + taxes + fees;

  return (
    <Card className="mb-6">
      <div className="border-b border-dark-700 pb-4 mb-4">
        <h3 className="text-xl font-semibold text-white mb-1">Flight Details</h3>
        <div className="flex items-center text-gray-400">
          <span className="mr-2 text-primary-500">
            <FaTicketAlt />
          </span>
          Confirmation pending
        </div>
      </div>

      {/* Flight Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="rounded-full bg-dark-700 p-2 mr-3">
            <FaPlane className="text-primary-500 h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-medium">{airline}</h3>
            <p className="text-sm text-gray-400">
              Flight {flightNumber} • {formatDuration(duration)} • 
              {stops === 0 ? ' Direct' : stops === 1 ? ' 1 Stop' : ` ${stops} Stops`}
            </p>
          </div>
        </div>
        <div className="bg-dark-700 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-primary-400 capitalize">
            {flightClass.replace(/([A-Z])/g, ' $1')}
          </span>
        </div>
      </div>

      {/* Flight Route Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Departure */}
        <div>
          <div className="flex items-center mb-2">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <span className="text-gray-300">{departure.date}</span>
          </div>
          <div className="flex items-start">
            <div className="bg-primary-900 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
              <span className="text-primary-400 font-bold">D</span>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{departure.time}</p>
              <p className="text-gray-400">{departureAirport}</p>
              <p className="text-sm text-gray-500">{departureCity}</p>
            </div>
          </div>
        </div>

        {/* Arrival */}
        <div>
          <div className="flex items-center mb-2">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <span className="text-gray-300">{arrival.date}</span>
          </div>
          <div className="flex items-start">
            <div className="bg-primary-900 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
              <span className="text-primary-400 font-bold">A</span>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{arrival.time}</p>
              <p className="text-gray-400">{arrivalAirport}</p>
              <p className="text-sm text-gray-500">{arrivalCity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-dark-700">
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Duration</h4>
          <div className="flex items-center">
            <FaClock className="text-primary-400 mr-2" />
            <p className="text-white">{formatDuration(duration)}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Aircraft</h4>
          <div className="flex items-center">
            <FaPlane className="text-primary-400 mr-2" />
            <p className="text-white">{aircraft}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Baggage Allowance</h4>
          <div className="flex items-center">
            <FaLuggageCart className="text-primary-400 mr-2" />
            <p className="text-white">
              {flightClass === 'economy' && '1 x 23kg'}
              {flightClass === 'premiumEconomy' && '2 x 23kg'}
              {flightClass === 'business' && '2 x 32kg'}
              {flightClass === 'first' && '3 x 32kg'}
            </p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <h4 className="text-white font-medium mb-4">Price Breakdown</h4>
      <div className="space-y-2 mb-4">
        {adultCount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Adult (x{adultCount})</span>
            <span className="text-white">${adultFare.toFixed(2)}</span>
          </div>
        )}
        {childCount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Child (x{childCount})</span>
            <span className="text-white">${childFare.toFixed(2)}</span>
          </div>
        )}
        {infantCount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Infant (x{infantCount})</span>
            <span className="text-white">${infantFare.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-400">Taxes</span>
          <span className="text-white">${taxes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Fees</span>
          <span className="text-white">${fees.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex justify-between py-3 border-t border-dark-700">
        <span className="text-lg font-semibold text-white">Total</span>
        <span className="text-lg font-semibold text-primary-400">${totalFare.toFixed(2)}</span>
      </div>
    </Card>
  );
};

BookingFlightDetails.propTypes = {
  flight: PropTypes.object.isRequired,
  flightClass: PropTypes.string.isRequired,
  passengers: PropTypes.shape({
    adults: PropTypes.number,
    children: PropTypes.number,
    infants: PropTypes.number
  }).isRequired
};

export default BookingFlightDetails;
