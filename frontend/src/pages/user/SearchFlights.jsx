import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { FaFilter, FaSort, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import FlightSearchForm from '../../components/flights/FlightSearchForm';
import FlightCard from '../../components/flights/FlightCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { searchFlights, getAllFlights } from '../../store/slices/flightSlice';

const SearchFlights = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { flights, filteredFlights: reduxFilteredFlights, loading, error } = useSelector((state) => state.flights);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortType, setSortType] = useState('price');
  const [filters, setFilters] = useState({
    airlines: [],
    maxPrice: 2000,
    stops: 'all',
    departureTime: 'all',
    arrivalTime: 'all',
  });
  
  // Get search params from location state or localStorage
  const [searchParams, setSearchParams] = useState(() => {
    // First try to get from location state (from the search form)
    if (location.state?.searchParams) {
      return location.state.searchParams;
    }
    
    // Then try to get from localStorage (for persistence)
    const savedSearch = localStorage.getItem('lastFlightSearch');
    if (savedSearch) {
      try {
        return JSON.parse(savedSearch);
      } catch (e) {
        console.error('Failed to parse saved search params:', e);
      }
    }
    
    // Default search params if nothing found
    return {
      flightClass: 'economy',
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      }
    };
  });
  
  // On component mount, search flights if params are available
  useEffect(() => {
    if (searchParams?.departureCity && searchParams?.arrivalCity) {
      console.log('Searching flights with params:', searchParams);
      dispatch(searchFlights(searchParams));
    } else {
      // If no search params, load all flights as a fallback
      dispatch(getAllFlights());
    }
    
    // Clear any previous date fallback flag
    localStorage.removeItem('flightSearchDateFallback');
  }, [dispatch, searchParams]);
  
  // Debug the data coming from Redux
  useEffect(() => {
    console.log('Redux data:', { 
      reduxFlights: flights?.length, 
      reduxFiltered: reduxFilteredFlights?.length,
      componentFiltered: filteredFlights?.length
    });
  }, [flights, reduxFilteredFlights, filteredFlights]);
  
  // Handle fallback scenarios only after we're sure the search is complete
  useEffect(() => {
    // Don't process anything while still loading
    if (loading) return;
    
    // Check if we have search parameters but no results
    if (searchParams?.departureCity && searchParams?.arrivalCity) {
      // If Redux has no filtered flights after a search is complete
      if (reduxFilteredFlights?.length === 0 && !loading && !error) {
        console.log('Search completed with no matching flights. Showing all available flights as fallback.');
        
        // Only dispatch getAllFlights if we don't already have flights data
        if (!flights || flights.length === 0) {
          dispatch(getAllFlights());
        }
        
        // Show a user-friendly message
        toast.info(`No flights found from ${searchParams.departureCity} to ${searchParams.arrivalCity}. Showing all available flights.`, {
          autoClose: 7000,
          theme: 'dark' // Use dark theme for toast to match the UI
        });
      }
      // If we have search results, update the filtered flights
      else if (reduxFilteredFlights?.length > 0 && !loading) {
        console.log(`Found ${reduxFilteredFlights.length} flights matching search criteria.`);
      }
    }
  }, [reduxFilteredFlights, searchParams, loading, error, dispatch, flights]);
  
  // Process search results and apply filters immediately when they change in Redux
  useEffect(() => {
    // Skip processing if we don't have data yet
    if (!reduxFilteredFlights && !flights) {
      console.log('No flight data available yet');
      return;
    }
    
    console.log('Processing flights data:', {
      hasReduxFiltered: Boolean(reduxFilteredFlights?.length),
      reduxFilteredCount: reduxFilteredFlights?.length || 0,
      hasAllFlights: Boolean(flights?.length),
      allFlightsCount: flights?.length || 0
    });
    
    // ALWAYS apply filters and sort, regardless of which dataset we're using
    // This ensures that whenever reduxFilteredFlights or flights changes, we update the UI
    applyFiltersAndSort();
    
  }, [reduxFilteredFlights, flights, sortType, filters]);
  
  const applyFiltersAndSort = () => {
    console.log('Applying filters and sort with data:', {
      reduxFilteredFlights: reduxFilteredFlights?.length || 0,
      allFlights: flights?.length || 0,
      activeFilters: Object.keys(filters).filter(key => {
        if (Array.isArray(filters[key])) return filters[key].length > 0;
        return filters[key] !== 'all';
      }).length
    });
    
    let result = [];
    
    try {
      // CRITICAL: Prioritize search results from Redux when we have them
      if (Array.isArray(reduxFilteredFlights) && reduxFilteredFlights.length > 0) {
        // Make a safe copy of the filtered flight data
        result = [...reduxFilteredFlights];
        console.log(`Processing ${result.length} flights from search results`);
      }
      // Fall back to all flights if we don't have filtered results
      else if (Array.isArray(flights) && flights.length > 0) {
        // Make a safe copy of all flight data
        result = [...flights];
        console.log(`No search results, showing ${result.length} flights from complete catalog`);
      }
      // Handle case with no flight data at all
      else {
        console.log('No flight data available');
        setFilteredFlights([]);
        return;
      }
      
      // Highlight the source of data to help debugging
      console.log('Data source for filtering:', 
        reduxFilteredFlights?.length > 0 ? 'Search Results' : 'All Flights');
    } catch (err) {
      console.error('Error processing flight data:', err);
      setFilteredFlights([]);
      return;
    }
    
    // Apply airline filter
    if (filters.airlines.length > 0) {
      result = result.filter(flight => filters.airlines.includes(flight.airline));
    }
    
    // Apply price filter
    result = result.filter(flight => flight.price <= filters.maxPrice);
    
    // Apply stops filter
    if (filters.stops !== 'all') {
      const stopsValue = parseInt(filters.stops, 10);
      result = result.filter(flight => flight.stops === stopsValue);
    }
    
    // Apply departure time filter
    if (filters.departureTime !== 'all') {
      result = result.filter(flight => {
        const hour = new Date(flight.departureTime).getHours();
        if (filters.departureTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.departureTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.departureTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }
    
    // Apply arrival time filter
    if (filters.arrivalTime !== 'all') {
      result = result.filter(flight => {
        const hour = new Date(flight.arrivalTime || flight.arrivalDate).getHours();
        if (filters.arrivalTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.arrivalTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.arrivalTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }
    
    // Sort results
    result.sort((a, b) => {
      switch (sortType) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          // For duration, handle both string format (e.g., "2h") and numeric format
          const getDurationMinutes = (dur) => {
            if (typeof dur === 'number') return dur;
            if (typeof dur !== 'string') return 0;
            
            const hoursMatch = dur.match(/(\d+)h/);
            const minutesMatch = dur.match(/(\d+)m/);
            
            const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
            const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
            
            return (hours * 60) + minutes;
          };
          
          return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
        case 'departure':
          return new Date(a.departureTime || a.departureDate) - new Date(b.departureTime || b.departureDate);
        case 'arrival':
          return new Date(a.arrivalTime || a.arrivalDate) - new Date(b.arrivalTime || b.arrivalDate);
        default:
          return a.price - b.price;
      }
    });
    
    // Update the state with filtered flights
    setFilteredFlights(result);
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSortChange = (sortValue) => {
    setSortType(sortValue);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <div className="py-6">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <h1 className="text-2xl font-bold text-white mb-6">Find Your Flight</h1>
      
      <FlightSearchForm />
      
      {loading ? (
        <div className="flex justify-center my-20">
          <Loader size="large" text="Searching for the best flights..." />
        </div>
      ) : error ? (
        <Card className="bg-red-900 border-red-800 text-center py-8">
          <h2 className="text-xl text-red-200 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-300">{error}</p>
        </Card>
      ) : flights.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-white mr-2">
                {filteredFlights.length} {filteredFlights.length === 1 ? 'Flight' : 'Flights'} Found
              </h2>
              <button
                onClick={toggleFilters}
                className="md:hidden flex items-center text-primary-400 text-sm"
              >
                <FaFilter className="mr-1" />
                Filters
              </button>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-2 hidden sm:inline">Sort by:</span>
              <select
                value={sortType}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-dark-700 border border-dark-600 text-gray-300 rounded py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="price" className="bg-dark-700">Price</option>
                <option value="duration" className="bg-dark-700">Duration</option>
                <option value="departure" className="bg-dark-700">Departure Time</option>
                <option value="arrival" className="bg-dark-700">Arrival Time</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 lg:w-72 flex-shrink-0 mb-6 md:mb-0`}>
              <Card className="sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Filters</h3>
                  <button 
                    className="md:hidden text-gray-400 hover:text-white"
                    onClick={toggleFilters}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {/* Price Filter */}
                <div className="mb-6">
                  <h4 className="text-gray-300 mb-2">Price Range</h4>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">$0</span>
                    <span className="text-xs text-gray-400">${filters.maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value, 10))}
                    className="w-full bg-dark-600"
                  />
                </div>
                
                {/* Stops Filter */}
                <div className="mb-6">
                  <h4 className="text-gray-300 mb-2">Stops</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stops"
                        value="all"
                        checked={filters.stops === 'all'}
                        onChange={(e) => handleFilterChange('stops', e.target.value)}
                        className="mr-2 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-900 border-dark-500"
                      />
                      <span className="text-gray-400">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stops"
                        value="0"
                        checked={filters.stops === '0'}
                        onChange={(e) => handleFilterChange('stops', e.target.value)}
                        className="mr-2 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-900 border-dark-500"
                      />
                      <span className="text-gray-400">Non-stop only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stops"
                        value="1"
                        checked={filters.stops === '1'}
                        onChange={(e) => handleFilterChange('stops', e.target.value)}
                        className="mr-2 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-900 border-dark-500"
                      />
                      <span className="text-gray-400">1 stop</span>
                    </label>
                  </div>
                </div>
                
                {/* Reset Button */}
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setFilters({
                    airlines: [],
                    maxPrice: 2000,
                    stops: 'all',
                    departureTime: 'all',
                    arrivalTime: 'all',
                  })}
                >
                  Reset Filters
                </Button>
              </Card>
            </div>
            
            {/* Flight Results */}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-white">
                  {loading ? (
                    'Searching flights...'
                  ) : (
                    `Found ${filteredFlights.length} flights matching your criteria`
                  )}
                </p>
                {/* Debug Info - Can be removed in production */}
                <p className="text-xs text-gray-500">
                  Redux data: {reduxFilteredFlights?.length || 0} filtered | {flights?.length || 0} total
                </p>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader size="large" />
                </div>
              ) : filteredFlights.length > 0 ? (
                <div className="space-y-4">
                  {filteredFlights.map((flight) => (
                    <FlightCard
                      key={flight.id || flight._id}
                      flight={flight}
                      flightClass={searchParams.flightClass || 'economy'}
                      passengers={searchParams.passengers || {adults: 1, children: 0, infants: 0}}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <h3 className="text-xl font-medium text-white mb-2">No flights match your filters</h3>
                  <p className="text-gray-400 mb-4">Try adjusting your filters or searching for different dates</p>
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({
                      airlines: [],
                      maxPrice: 2000,
                      stops: 'all',
                      departureTime: 'all',
                      arrivalTime: 'all',
                    })}
                  >
                    Reset Filters
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : (
        <Card className="text-center py-12 mt-6">
          <h2 className="text-xl font-medium text-white mb-2">Search for Flights</h2>
          <p className="text-gray-400">
            Use the search form above to find flights for your next journey
          </p>
        </Card>
      )}
    </div>
  );
};

export default SearchFlights;
