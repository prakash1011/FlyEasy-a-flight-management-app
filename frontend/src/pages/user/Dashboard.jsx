import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaPlane, 
  FaCalendar, 
  FaTicketAlt, 
  FaCreditCard, 
  FaSearch,
  FaArrowRight
} from 'react-icons/fa';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getUserBookings } from '../../store/slices/bookingSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  
  // Format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const { user } = useSelector((state) => state.auth);
  const { bookings = [], loading } = useSelector((state) => state.bookings);
  
  useEffect(() => {
    dispatch(getUserBookings());
  }, [dispatch]);
  
  // Get upcoming bookings (future date)
  const upcomingBookings = bookings && bookings.length > 0 
    ? bookings.filter(
        (booking) => new Date(booking.flight.departureDate) > new Date()
      ).sort(
        (a, b) => new Date(a.flight.departureDate) - new Date(b.flight.departureDate)
      ).slice(0, 3)
    : [];
  
  // Calculate stats
  const totalBookings = bookings?.length || 0;
  const totalSpent = bookings && bookings.length > 0 
    ? bookings.reduce((acc, booking) => acc + booking.totalFare, 0) 
    : 0;
  
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name || 'Traveler'}!</h1>
        <p className="text-gray-400 mt-1">
          Here's an overview of your flight activity and upcoming journeys
        </p>
      </div>
      
      {/* Quick Actions */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/search" className="block">
            <Card className="h-full transform transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-primary-500 bg-opacity-20 flex items-center justify-center text-primary-500">
                  <FaSearch className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Search Flights</h3>
                  <p className="text-sm text-gray-400">Find your next journey</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link to="/my-bookings" className="block">
            <Card className="h-full transform transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center text-green-500">
                  <FaTicketAlt className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">My Bookings</h3>
                  <p className="text-sm text-gray-400">Manage your bookings</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link to="/travel-history" className="block">
            <Card className="h-full transform transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center text-blue-500">
                  <FaCalendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Travel History</h3>
                  <p className="text-sm text-gray-400">View past travels</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link to="/payment-methods" className="block">
            <Card className="h-full transform transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center text-yellow-500">
                  <FaCreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Payment Methods</h3>
                  <p className="text-sm text-gray-400">Manage your cards</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>
      
      {/* Stats Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Your Travel Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-dark-800 to-dark-700">
            <div className="text-center">
              <h3 className="text-gray-400 text-sm mb-1">Total Bookings</h3>
              <p className="text-3xl font-bold text-white">{totalBookings}</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-dark-800 to-dark-700">
            <div className="text-center">
              <h3 className="text-gray-400 text-sm mb-1">Total Spent</h3>
              <p className="text-3xl font-bold text-white">₹{totalSpent.toFixed(2)}</p>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Upcoming Flights */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Upcoming Flights</h2>
          <Link to="/my-bookings" className="text-primary-400 hover:text-primary-300 flex items-center text-sm">
            View All <FaArrowRight className="ml-1" />
          </Link>
        </div>
        
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader />
          </div>
        ) : upcomingBookings.length > 0 ? (
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
                    {formatDate(booking.flight.departureDate)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-1">
                  <div className="text-gray-400">Departure</div>
                  <div className="text-white">
                    {new Date(booking.flight.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        ) : (
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-dark-700 mb-4">
                <FaPlane className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No upcoming flights</h3>
              <p className="text-gray-400 mb-4">
                You don't have any upcoming bookings. Ready to plan your next adventure?
              </p>
              <Link to="/search">
                <Button>Search Flights</Button>
              </Link>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
