import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { getUserBookings } from '../../store/slices/bookingSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

const TravelHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings = [], loading } = useSelector((state) => state.bookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  
  // Fetch bookings when component mounts
  useEffect(() => {
    dispatch(getUserBookings());
  }, [dispatch]);
  
  // Get completed bookings (past date) - use useMemo to prevent recalculation on every render
  const completedBookings = useMemo(() => {
    return bookings && bookings.length > 0 
      ? bookings.filter(booking => 
          booking.flight && 
          new Date(booking.flight.arrivalDate) < new Date() && 
          booking.status !== 'cancelled'
        ).sort((a, b) => 
          new Date(b.flight.departureDate) - new Date(a.flight.departureDate)
        )
      : [];
  }, [bookings]);
    
  // Filter bookings based on search term
  useEffect(() => {
    if (completedBookings.length > 0) {
      const filtered = completedBookings.filter(booking => 
        booking.flight.departureCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.arrivalCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings([]);
    }
  }, [searchTerm, completedBookings]);
  
  // Handle search flights button click
  const handleSearchFlights = () => {
    navigate('/search');
  };
  
  // Format date as dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Empty state component
  const EmptyState = () => (
    <Card className="w-full">
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-dark-700 rounded-full p-5 mb-4">
          <FaPlane className="h-10 w-10 text-primary-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">You have not travelled to any destination yet</h3>
        <p className="text-gray-400 mb-6 max-w-md">You can book a flight to start your journey and create memories that will appear here.</p>
        <Button 
          variant="primary" 
          size="lg" 
          className="flex items-center"
          onClick={handleSearchFlights}
        >
          <FaSearch className="mr-2" /> Search Flights
        </Button>
      </div>
    </Card>
  );
  
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Travel History</h1>
        <p className="text-gray-400">View your past travels and journeys</p>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by city or flight number..."
            className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Travel History List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : completedBookings.length === 0 ? (
        <EmptyState />
      ) : filteredBookings.length === 0 && searchTerm ? (
        <Card className="w-full">
          <div className="py-10 text-center">
            <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">
              We couldn't find any travel history matching "{searchTerm}"
            </p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="border-l-4 border-primary-500">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center text-blue-500 mr-3">
                      <FaPlane className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-white">
                        {booking.flight.departureCity} to {booking.flight.arrivalCity}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Flight {booking.flight.flightNumber} • {booking.flightClass} Class
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-gray-500 mr-2" />
                      <span className="text-gray-300">
                        {formatDate(booking.flight.departureDate)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-500 mr-2" />
                      <span className="text-gray-300">
                        {booking.flight.departureAirport} ({booking.flight.departureCode})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-500 mr-2" />
                      <span className="text-gray-300">
                        {booking.flight.arrivalAirport} ({booking.flight.arrivalCode})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:items-end">
                  <span className="text-sm text-gray-400 mb-1">Total fare</span>
                  <span className="text-xl font-semibold text-white mb-3">₹{booking.totalFare.toFixed(2)}</span>
                  <Link to={`/ticket/${booking._id}`} className="text-primary-400 hover:text-primary-300 flex items-center text-sm">
                    View Details <FaArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Show search flights CTA at bottom if there are some completed flights */}
      {completedBookings.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Ready for your next adventure?</p>
          <Button variant="primary" onClick={handleSearchFlights}>Search Flights</Button>
        </div>
      )}
    </div>
  );
};

export default TravelHistory;
