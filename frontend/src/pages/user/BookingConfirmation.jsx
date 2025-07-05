import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaPrint, FaEnvelope, FaPlane, FaCalendar, FaUser, FaTicketAlt, FaClock } from 'react-icons/fa';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { fetchBookingDetails } from '../../store/slices/bookingSlice';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentBooking, loading, error } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingDetails(bookingId));
    }
  }, [dispatch, bookingId]);
  
  // Format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader size="large" text="Loading your booking details..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-red-900 border-red-800 text-center py-12 my-8">
        <h2 className="text-xl text-red-200 mb-4">Failed to load booking details</h2>
        <p className="text-red-300 mb-6">{error}</p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Card>
    );
  }
  
  if (!currentBooking) {
    return null;
  }
  
  const { 
    bookingReference,
    flight,
    passengers,
    flightClass,
    bookingDate,
    totalAmount,
    paymentMethod,
    status
  } = currentBooking;
  
  return (
    <div className="py-8">
      {/* Success Message */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-900 p-4">
            <FaCheckCircle className="text-green-400 h-12 w-12" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-gray-300">
          Thank you for booking with FlyEasy. Your flight is confirmed and ready to go!
        </p>
        <p className="text-primary-400 mt-2 text-lg font-semibold">
          Booking Reference: {bookingReference}
        </p>
      </div>
      
      {/* Booking Summary Card */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Booking Summary</h2>
            <p className="text-gray-400">
              Booked on {formatDate(bookingDate)} • {status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              icon={<FaDownload />}
              onClick={() => window.print()}
            >
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              icon={<FaPrint />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              icon={<FaEnvelope />}
              onClick={() => alert('Confirmation email sent!')}
            >
              Email
            </Button>
          </div>
        </div>
        
        {/* Flight Details */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaPlane className="text-primary-500 mr-2" />
            <h3 className="text-lg font-medium text-white">Flight Details</h3>
          </div>
          
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-5 mb-4">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="rounded-full bg-dark-700 p-2 mr-3">
                  <FaPlane className="text-primary-500 h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{flight?.airline}</h4>
                  <p className="text-sm text-gray-400">
                    Flight {flight?.flightNumber} • {formatDuration(flight?.duration)} • 
                    {flight?.stops === 0 ? ' Direct' : flight?.stops === 1 ? ' 1 Stop' : ` ${flight?.stops} Stops`}
                  </p>
                </div>
              </div>
              <div className="bg-dark-700 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-primary-400 capitalize">
                  {flightClass?.replace(/([A-Z])/g, ' $1')}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Departure */}
              <div>
                <div className="flex items-center mb-2">
                  <FaCalendar className="text-gray-400 mr-2" />
                  <span className="text-gray-300">{formatDate(flight?.departureDate)}</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-900 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                    <span className="text-primary-400 font-bold">D</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{formatTime(flight?.departureDate)}</p>
                    <p className="text-gray-400">{flight?.departureAirport}</p>
                    <p className="text-sm text-gray-500">{flight?.departureCity}</p>
                  </div>
                </div>
              </div>
              
              {/* Arrival */}
              <div>
                <div className="flex items-center mb-2">
                  <FaCalendar className="text-gray-400 mr-2" />
                  <span className="text-gray-300">{formatDate(flight?.arrivalDate)}</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-900 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                    <span className="text-primary-400 font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{formatTime(flight?.arrivalDate)}</p>
                    <p className="text-gray-400">{flight?.arrivalAirport}</p>
                    <p className="text-sm text-gray-500">{flight?.arrivalCity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Passenger Information */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaUser className="text-primary-500 mr-2" />
            <h3 className="text-lg font-medium text-white">Passenger Information</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-dark-800 border-collapse">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Document</th>
                </tr>
              </thead>
              <tbody>
                {passengers?.map((passenger, index) => (
                  <tr key={index} className="border-b border-dark-700 last:border-0">
                    <td className="py-3 px-4 text-white">
                      {passenger.title}. {passenger.firstName} {passenger.lastName}
                    </td>
                    <td className="py-3 px-4 text-gray-300 capitalize">
                      {passenger.passengerType || 'Adult'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {passenger.documentType}: {passenger.documentNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaTicketAlt className="text-primary-500 mr-2" />
            <h3 className="text-lg font-medium text-white">Payment Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-800 border border-dark-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">Payment Method</p>
              <p className="text-white font-medium capitalize">
                {paymentMethod?.replace(/([A-Z])/g, ' $1') || 'Credit Card'}
              </p>
            </div>
            <div className="bg-dark-800 border border-dark-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">Total Paid</p>
              <p className="text-xl font-bold text-primary-400">
                ${totalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Travel Information */}
        <div>
          <div className="flex items-center mb-4">
            <FaClock className="text-primary-500 mr-2" />
            <h3 className="text-lg font-medium text-white">Important Travel Information</h3>
          </div>
          
          <div className="bg-dark-800 border border-dark-700 p-4 rounded-lg">
            <ul className="space-y-3 text-gray-300">
              <li>• Please arrive at the airport at least 2 hours before your flight departure time.</li>
              <li>• Don't forget to bring your valid identification and travel documents.</li>
              <li>• Check in online 24 hours before your flight for a smoother experience.</li>
              <li>• Check your baggage allowance based on your ticket class.</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
        <Button 
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
        <Button 
          onClick={() => navigate('/search-flights')}
        >
          Book Another Flight
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
