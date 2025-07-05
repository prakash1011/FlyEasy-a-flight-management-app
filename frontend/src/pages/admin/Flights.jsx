import React, { useState, useEffect } from 'react';
import { FaPlane, FaEdit, FaTrash, FaPlus, FaSync, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { flightAPI } from '../../services/api';

const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch flights from flights.json
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const data = await flightAPI.getStaticFlights();
        setFlights(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Failed to load flights data');
        setLoading(false);
        toast.error('Failed to load flights');
      }
    };

    fetchFlights();
  }, []);

  // Open edit modal
  const handleEditFlight = (flight) => {
    setCurrentFlight(flight);
    setEditForm({
      ...flight,
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  // Update flight
  const handleUpdateFlight = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Normally would call API to update in database
      // const result = await flightAPI.updateFlight(currentFlight.id, editForm);
      
      // For now, we update locally
      const result = await flightAPI.updateStaticFlight(currentFlight.id, editForm);
      
      // Update flights state
      const updatedFlights = flights.map(flight => {
        if (flight.id === currentFlight.id) {
          return { ...editForm };
        }
        return flight;
      });
      
      setFlights(updatedFlights);
      setShowEditModal(false);
      setIsSubmitting(false);
      setCurrentFlight(null);
      toast.success('Flight updated successfully');
    } catch (err) {
      console.error('Error updating flight:', err);
      toast.error('Failed to update flight');
      setIsSubmitting(false);
    }
  };
  
  // Open delete confirmation modal
  const handleDeleteClick = (flight) => {
    setCurrentFlight(flight);
    setShowDeleteModal(true);
  };
  
  // Delete flight
  const handleDeleteFlight = async () => {
    setIsSubmitting(true);
    
    try {
      // Normally would call API to delete from database
      // await flightAPI.deleteFlight(currentFlight.id);
      
      // For now, just remove from local state
      await flightAPI.deleteStaticFlight(currentFlight.id);
      
      const filteredFlights = flights.filter(flight => flight.id !== currentFlight.id);
      setFlights(filteredFlights);
      setShowDeleteModal(false);
      setIsSubmitting(false);
      setCurrentFlight(null);
      toast.success('Flight deleted successfully');
    } catch (err) {
      console.error('Error deleting flight:', err);
      toast.error('Failed to delete flight');
      setIsSubmitting(false);
    }
  };

  // Sample data for reference
  /*
  const [flightsOld] = useState([
    {
      id: 'FL1001',
      airline: 'IndiGo',
      origin: 'Delhi (DEL)',
      destination: 'Mumbai (BOM)',
      departureTime: '2025-06-21T08:00:00Z',
      arrivalTime: '2025-06-21T10:00:00Z',
      status: 'on-time',
      price: 4800
    },
    {
      id: 'FL1002',
      airline: 'Air India',
      origin: 'Mumbai (BOM)',
      destination: 'Bengaluru (BLR)',
      departureTime: '2025-06-22T14:00:00Z',
      arrivalTime: '2025-06-22T16:10:00Z',
      status: 'delayed',
      price: 5300
    },
    {
      id: 'FL1003',
      airline: 'Vistara',
      origin: 'Chennai (MAA)',
      destination: 'Delhi (DEL)',
      departureTime: '2025-06-23T07:30:00Z',
      arrivalTime: '2025-06-23T10:15:00Z',
      status: 'on-time',
      price: 5900
    },
  ]);
  */

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

  // Get status badge class - maintains dark theme styling
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

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Flights</h1>
        
        <div className="flex items-center">
          {loading && (
            <div className="flex items-center mr-4 text-blue-400">
              <FaSync className="animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          )}
          
          <button 
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            onClick={() => {
              const newFlight = {
                id: '', 
                airline: '',
                origin: '',
                destination: '',
                departureTime: '',
                arrivalTime: '',
                price: 0,
                status: 'on-time',
                aircraft: ''
              };
              setCurrentFlight(newFlight);
              setEditForm(newFlight);
              setShowEditModal(true);
            }}
          >
            <FaPlus className="mr-2" />
            Add Flight
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dark-700">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Flight #</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Airline</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Route</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Date & Time</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Price (₹)</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <FaSync className="animate-spin text-blue-500 text-2xl mb-2" />
                      <span>Loading flight data...</span>
                    </div>
                  </td>
                </tr>
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    No flights found.
                  </td>
                </tr>
              ) : (
                flights.map((flight) => (
                <tr key={flight.id} className="hover:bg-dark-700">
                  <td className="py-3 px-4 text-gray-300">
                    <div className="flex items-center">
                      <FaPlane className="mr-2 text-blue-400" />
                      {flight.id}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{flight.airline}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {flight.origin} → {flight.destination}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    <div>
                      <div className="font-medium">{formatDate(flight.departureTime)}</div>
                      <div className="text-sm text-gray-400">{formatTime(flight.departureTime)}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{flight.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(flight.status)}`}>
                      {flight.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-400 hover:text-blue-300" 
                        onClick={() => handleEditFlight(flight)}
                        title="Edit Flight"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="p-1 text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteClick(flight)}
                        title="Delete Flight"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Flight Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center border-b border-gray-700 px-6 py-4">
              <h3 className="text-xl font-medium text-white">
                {currentFlight?.id ? 'Edit Flight' : 'Add New Flight'}
              </h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentFlight(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateFlight} className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Flight ID</label>
                  <input
                    type="text"
                    name="id"
                    value={editForm.id || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    placeholder="FL1234"
                    required
                    disabled={!!currentFlight?.id}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Airline</label>
                  <input
                    type="text"
                    name="airline"
                    value={editForm.airline || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    placeholder="Airline name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Origin</label>
                    <input
                      type="text"
                      name="origin"
                      value={editForm.origin || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      placeholder="City (CODE)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Destination</label>
                    <input
                      type="text"
                      name="destination"
                      value={editForm.destination || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      placeholder="City (CODE)"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Departure Time</label>
                    <input
                      type="datetime-local"
                      name="departureTime"
                      value={editForm.departureTime ? new Date(editForm.departureTime).toISOString().slice(0, 16) : ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Arrival Time</label>
                    <input
                      type="datetime-local"
                      name="arrivalTime"
                      value={editForm.arrivalTime ? new Date(editForm.arrivalTime).toISOString().slice(0, 16) : ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Status</label>
                    <select
                      name="status"
                      value={editForm.status || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      required
                    >
                      <option value="on-time">On Time</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Aircraft</label>
                  <input
                    type="text"
                    name="aircraft"
                    value={editForm.aircraft || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    placeholder="Aircraft type"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={editForm.duration || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    placeholder="e.g. 2h 30m"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentFlight(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <FaSync className="animate-spin mr-2" />}
                  Save Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-700 px-6 py-4">
              <h3 className="text-xl font-medium text-white">
                Delete Flight
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete flight <span className="text-blue-400 font-medium">{currentFlight.id}</span>?
              </p>
              <p className="text-gray-300 mb-6">
                <span className="font-medium">{currentFlight.airline}</span>: {currentFlight.origin} → {currentFlight.destination}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCurrentFlight(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
                  onClick={handleDeleteFlight}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSync className="animate-spin mr-2" /> Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlights;
