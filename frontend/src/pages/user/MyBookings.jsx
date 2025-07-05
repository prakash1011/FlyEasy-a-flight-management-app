import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaPlane, 
  FaCalendarAlt,
  FaSearch
} from 'react-icons/fa';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getUserBookings } from '../../store/slices/bookingSlice';

const MyBookings = () => {
  const dispatch = useDispatch();
  const { bookings = [], loading } = useSelector((state) => state.bookings);
  
  // Format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  useEffect(() => {
    dispatch(getUserBookings());
  }, [dispatch]);
  
  // Get upcoming bookings (future date)
  const upcomingBookings = bookings && bookings.length > 0 
    ? bookings.filter(
        (booking) => new Date(booking.flight.departureDate) > new Date()
      ).sort(
        (a, b) => new Date(a.flight.departureDate) - new Date(b.flight.departureDate)
      )
    : [];
  
  // Get past bookings
  const pastBookings = bookings && bookings.length > 0 
    ? bookings.filter(
        (booking) => new Date(booking.flight.departureDate) <= new Date()
      ).sort(
        (a, b) => new Date(b.flight.departureDate) - new Date(a.flight.departureDate)
      )
    : [];
    
  // Empty state message component - shown at the top when no bookings
  const EmptyBookingsMessage = () => (
    <Card className="mb-6">
      <div className="flex flex-col items-center py-6 text-center">
        <div className="bg-dark-700 p-4 rounded-full mb-4">
          <FaPlane className="text-gray-400 h-8 w-8" />
        </div>
        <h3 className="text-xl text-white font-medium mb-2">Currently you don't have any bookings</h3>
        <p className="text-gray-400 mb-4 max-w-lg">
          Looking for your next adventure? Start by searching for flights to your dream destination.
        </p>
        <Link to="/search">
          <Button variant="primary" className="flex items-center">
            <FaSearch className="mr-2" /> Search Flights to Book
          </Button>
        </Link>
      </div>
    </Card>
  );
  
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Bookings</h1>
        <p className="text-gray-400 mt-1">
          View and manage all your flight bookings
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="large" />
        </div>
      ) : bookings.length === 0 ? (
        // Show empty state message at the top when no bookings
        <EmptyBookingsMessage />
      ) : (
        <>
          {/* Show message at top if no upcoming bookings but has past bookings */}
          {upcomingBookings.length === 0 && pastBookings.length > 0 && (
            <EmptyBookingsMessage />
          )}
          
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4">Upcoming Flights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking._id} className="relative">
                    <div className="absolute top-4 right-4 px-2 py-1 bg-primary-500 rounded text-xs font-medium text-white">
                      {booking.status}
                    </div>
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center text-blue-500">
                        <FaPlane className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-white">
                          {booking.flight.departureCity} to {booking.flight.arrivalCity}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Flight {booking.flight.flightNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-1">
                      <div className="text-gray-400">Date</div>
                      <div className="text-white">
                        {new Date(booking.flight.departureDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-1">
                      <div className="text-gray-400">Departure</div>
                      <div className="text-white">
                        {new Date(booking.flight.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-1">
                      <div className="text-gray-400">Arrival</div>
                      <div className="text-white">
                        {new Date(booking.flight.arrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-4">
                      <div className="text-gray-400">Class</div>
                      <div className="text-white capitalize">{booking.flightClass}</div>
                    </div>
                    
                    <Link to={`/ticket/${booking._id}`}>
                      <Button variant="primary" fullWidth>View Ticket</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}
          
          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Past Flights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastBookings.map((booking) => (
                  <Card key={booking._id} className="relative opacity-80 hover:opacity-100 transition-opacity">
                    <div className="absolute top-4 right-4 px-2 py-1 bg-gray-500 rounded text-xs font-medium text-white">
                      Completed
                    </div>
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-gray-500 bg-opacity-20 flex items-center justify-center text-gray-400">
                        <FaCalendarAlt className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-white">
                          {booking.flight.departureCity} to {booking.flight.arrivalCity}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Flight {booking.flight.flightNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-1">
                      <div className="text-gray-400">Date</div>
                      <div className="text-white">
                        {new Date(booking.flight.departureDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-1">
                      <div className="text-gray-400">Class</div>
                      <div className="text-white capitalize">{booking.flightClass}</div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-4">
                      <div className="text-gray-400">Amount</div>
                      <div className="text-white">${booking.totalFare.toFixed(2)}</div>
                    </div>
                    
                    <Link to={`/ticket/${booking._id}`}>
                      <Button variant="secondary" fullWidth>View Receipt</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookings;
