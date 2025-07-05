import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaArrowRight, FaClock, FaCalendarAlt, FaMoneyBillWave, FaInfoCircle, FaSync } from 'react-icons/fa';
import { flightAPI } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';

const FlightList = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Define fetchFlights function outside of useEffect but don't memoize it yet
  const fetchFlights = async () => {
    try {
      setLoading(true);
      // First try the API endpoint with the centralized API service
      let response;
      try {
        response = await flightAPI.getStaticFlights();
        setFlights(response.data.data || response.data);
        setLoading(false);
        setError(null);
      } catch (apiError) {
        console.log('API endpoint failed, falling back to static file:', apiError);
        
        // Fall back to static file if API fails
        const fallbackResponse = await fetch('/flights.json');
        
        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch flight data');
        }
        
        const data = await fallbackResponse.json();
        setFlights(data);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError(err.message || 'Failed to load flights');
      setLoading(false);
    }
  };

  // Only fetch flights when component mounts or when retryCount changes
  useEffect(() => {
    // Call fetchFlights only once on mount and when retry is clicked
    fetchFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]); // Only depend on retryCount, not the function itself

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

  // Get status badge class - maintained dark theme with appropriate colors
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-900 text-green-300';
      case 'delayed':
        return 'bg-yellow-900 text-yellow-300';
      case 'cancelled':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Handle retry
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader size="large" text="Loading flights..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 px-4 bg-red-900 bg-opacity-20 rounded-lg text-center">
        <FaInfoCircle className="text-red-400 text-4xl mx-auto mb-3" />
        <h2 className="text-xl text-red-200 mb-2">Error loading flights</h2>
        <p className="text-red-300 mb-4">{error}</p>
        <Button 
          onClick={handleRetry}
          icon={<FaSync />}
          className="bg-red-800 hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="py-10 px-4 bg-dark-800 rounded-lg text-center">
        <FaPlane className="text-primary-400 text-4xl mx-auto mb-3 opacity-50" />
        <h2 className="text-xl text-gray-200 mb-2">No Flights Found</h2>
        <p className="text-gray-400">There are no available flights at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Available Flights</h2>
      
      {flights.map((flight) => (
        <Card key={flight.id} className="p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Flight info section */}
            <div className="flex-grow p-5">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-dark-700 p-2 mr-3">
                  <FaPlane className="text-primary-500 h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{flight.airline}</h3>
                  <p className="text-sm text-gray-400">Flight #{flight.id}</p>
                </div>
                <div className="ml-auto">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(flight.status)}`}
                  >
                    {flight.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Departure */}
                <div>
                  <div className="flex items-center mb-1">
                    <FaCalendarAlt className="text-gray-400 mr-2 text-xs" />
                    <span className="text-xs text-gray-400">{formatDate(flight.departureTime)}</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{formatTime(flight.departureTime)}</p>
                  <p className="text-gray-300">{flight.origin}</p>
                </div>
                
                {/* Duration */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-400 mb-1">
                    <FaClock className="inline mr-1" />
                    {flight.duration}
                  </span>
                  <div className="w-full flex items-center justify-center">
                    <div className="h-[2px] flex-grow bg-gray-700"></div>
                    <FaPlane className="mx-2 text-primary-400" />
                    <div className="h-[2px] flex-grow bg-gray-700"></div>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{flight.aircraft}</span>
                </div>
                
                {/* Arrival */}
                <div>
                  <div className="flex items-center mb-1">
                    <FaCalendarAlt className="text-gray-400 mr-2 text-xs" />
                    <span className="text-xs text-gray-400">{formatDate(flight.arrivalTime)}</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{formatTime(flight.arrivalTime)}</p>
                  <p className="text-gray-300">{flight.destination}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-dark-700">
                <div className="mr-4">
                  <span className="text-gray-400 text-sm">Price:</span>
                  <span className="ml-1 text-xl font-bold text-primary-400">₹{flight.price}</span>
                </div>
                <Button
                  onClick={() => navigate(`/book/${flight.id}`)}
                  icon={<FaArrowRight />}
                  iconPosition="right"
                  className="mt-2 sm:mt-0"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FlightList;
