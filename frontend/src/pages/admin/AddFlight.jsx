import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axios';

const AddFlight = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  
  const [flightData, setFlightData] = useState({
    flightNumber: '',
    route: '',
    aircraft: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    price: {
      economy: '',
      business: ''
    },
    seatsAvailable: {
      economy: '',
      business: ''
    },
    status: 'scheduled'
  });

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get('/routes');
        setRoutes(response.data.data);
      } catch (error) {
        console.error('Error fetching routes:', error);
        toast.error('Failed to load routes');
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (price and seatsAvailable)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFlightData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFlightData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateDuration = () => {
    if (flightData.departureTime && flightData.arrivalTime) {
      const departure = new Date(flightData.departureTime);
      const arrival = new Date(flightData.arrivalTime);
      const diff = (arrival - departure) / (1000 * 60); // duration in minutes
      
      setFlightData(prev => ({
        ...prev,
        duration: diff.toString()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!flightData.flightNumber || !flightData.route || !flightData.aircraft) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/flights', flightData);
      toast.success('Flight added successfully');
      navigate('/admin/flights');
    } catch (error) {
      console.error('Error adding flight:', error);
      toast.error(error.response?.data?.error || 'Failed to add flight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-white">Add New Flight</h1>
        
        <div className="bg-gray-900 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flight Number */}
              <div className="space-y-2">
                <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-300">
                  Flight Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="flightNumber"
                  name="flightNumber"
                  value={flightData.flightNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Route */}
              <div className="space-y-2">
                <label htmlFor="route" className="block text-sm font-medium text-gray-300">
                  Route <span className="text-red-500">*</span>
                </label>
                <select
                  id="route"
                  name="route"
                  value={flightData.route}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a route</option>
                  {loadingRoutes ? (
                    <option disabled>Loading routes...</option>
                  ) : (
                    routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.origin.code} ({route.origin.city}) → {route.destination.code} ({route.destination.city})
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {/* Aircraft */}
              <div className="space-y-2">
                <label htmlFor="aircraft" className="block text-sm font-medium text-gray-300">
                  Aircraft <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="aircraft"
                  name="aircraft"
                  value={flightData.aircraft}
                  onChange={handleChange}
                  placeholder="e.g. Boeing 737"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={flightData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="in-air">In Air</option>
                  <option value="landed">Landed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              
              {/* Departure Time */}
              <div className="space-y-2">
                <label htmlFor="departureTime" className="block text-sm font-medium text-gray-300">
                  Departure Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="departureTime"
                  name="departureTime"
                  value={flightData.departureTime}
                  onChange={(e) => {
                    handleChange(e);
                    setTimeout(calculateDuration, 100);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Arrival Time */}
              <div className="space-y-2">
                <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-300">
                  Arrival Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="arrivalTime"
                  name="arrivalTime"
                  value={flightData.arrivalTime}
                  onChange={(e) => {
                    handleChange(e);
                    setTimeout(calculateDuration, 100);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Duration */}
              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={flightData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-300 mb-4">Price Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Economy Price */}
                <div className="space-y-2">
                  <label htmlFor="price.economy" className="block text-sm font-medium text-gray-300">
                    Economy Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price.economy"
                    name="price.economy"
                    value={flightData.price.economy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Business Price */}
                <div className="space-y-2">
                  <label htmlFor="price.business" className="block text-sm font-medium text-gray-300">
                    Business Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price.business"
                    name="price.business"
                    value={flightData.price.business}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-300 mb-4">Seat Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Economy Seats */}
                <div className="space-y-2">
                  <label htmlFor="seatsAvailable.economy" className="block text-sm font-medium text-gray-300">
                    Economy Seats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="seatsAvailable.economy"
                    name="seatsAvailable.economy"
                    value={flightData.seatsAvailable.economy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Business Seats */}
                <div className="space-y-2">
                  <label htmlFor="seatsAvailable.business" className="block text-sm font-medium text-gray-300">
                    Business Seats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="seatsAvailable.business"
                    name="seatsAvailable.business"
                    value={flightData.seatsAvailable.business}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-10">
              <button
                type="button"
                onClick={() => navigate('/admin/flights')}
                className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Adding...
                  </>
                ) : (
                  'Add Flight'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFlight;
