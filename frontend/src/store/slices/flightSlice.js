import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Get all flights - fetch from local flights.json file
export const getAllFlights = createAsyncThunk(
  'flights/getAllFlights',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/flights.json');
      if (!res.ok) {
        throw new Error('Failed to fetch flights data');
      }
      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch flights');
    }
  }
);

// Search flights - using local flights.json data
export const searchFlights = createAsyncThunk(
  'flights/searchFlights',
  async (searchParams, { rejectWithValue }) => {
    try {
      // Show exactly what parameters are coming in to help debugging
      console.log('🚀 searchFlights received params:', JSON.stringify(searchParams, null, 2));
      const res = await fetch('/flights.json');
      if (!res.ok) {
        throw new Error('Failed to fetch flights data');
      }
      
      const allFlights = await res.json();
      console.log(`📊 Retrieved ${allFlights.length} total flights from JSON`);
      
      // Start with all flights
      let filteredFlights = [...allFlights];
      
      // FIRST PASS: Filter by origin city with robust matching that handles "Delhi (DEL)" format
      if (searchParams.departureCity) {
        const departureCityLower = searchParams.departureCity.toLowerCase().trim();
        console.log('Filtering by departure city:', departureCityLower);
        
        // Extract airport code if present (DEL)
        let departureCode = '';
        if (departureCityLower.includes('(') && departureCityLower.includes(')')) {
          const codeMatch = departureCityLower.match(/\(([^)]+)\)/);
          if (codeMatch && codeMatch[1]) {
            departureCode = codeMatch[1].toLowerCase();
            console.log('Extracted departure airport code:', departureCode);
          }
        }
        
        // Also extract just the city name without code
        const cityNameOnly = departureCityLower.split('(')[0].trim();
        
        filteredFlights = filteredFlights.filter(flight => {
          if (!flight.origin) return false;
          
          const originLower = flight.origin.toLowerCase();
          
          // Strong match if full strings match exactly
          if (originLower === departureCityLower) return true;
          
          // Extract origin city and code parts for better matching
          const originCityPart = originLower.split('(')[0].trim();
          let originCodePart = '';
          if (originLower.includes('(')) {
            const originCodeMatch = originLower.match(/\(([^)]+)\)/);
            if (originCodeMatch && originCodeMatch[1]) {
              originCodePart = originCodeMatch[1].toLowerCase();
            }
          }
          
          // Match any component (full city, just city name, just code)
          const isMatch = originLower.includes(departureCityLower) || 
                         departureCityLower.includes(originLower) ||
                         (departureCode && originLower.includes(departureCode)) ||
                         (departureCode && originCodePart === departureCode) ||
                         (cityNameOnly && originCityPart === cityNameOnly);
          
          if (isMatch) {
            console.log(`✓ Departure city match: ${flight.origin} with ${departureCityLower}`);
          }
          
          return isMatch;
        });
        
        console.log(`After departure city filter (${searchParams.departureCity}): ${filteredFlights.length} flights remaining`);
        // Debug info for first flight match
        if (filteredFlights.length > 0) {
          console.log('First matching departure city flight:', filteredFlights[0].id, 'with origin:', filteredFlights[0].origin);
        }
      }
      
      // Filter by arrival city with robust matching that handles "Mumbai (BOM)" format
      if (searchParams.arrivalCity) {
        const arrivalCityLower = searchParams.arrivalCity.toLowerCase().trim();
        console.log('Filtering by arrival city:', arrivalCityLower);
        
        // Extract airport code if present (BOM)
        let arrivalCode = '';
        if (arrivalCityLower.includes('(') && arrivalCityLower.includes(')')) {
          const codeMatch = arrivalCityLower.match(/\(([^)]+)\)/);
          if (codeMatch && codeMatch[1]) {
            arrivalCode = codeMatch[1].toLowerCase();
            console.log('Extracted arrival airport code:', arrivalCode);
          }
        }
        
        // Also extract just the city name without code
        const cityNameOnly = arrivalCityLower.split('(')[0].trim();
        
        filteredFlights = filteredFlights.filter(flight => {
          if (!flight.destination) return false;
          
          const destinationLower = flight.destination.toLowerCase();
          
          // Strong match if full strings match exactly
          if (destinationLower === arrivalCityLower) return true;
          
          // Extract destination city and code parts for better matching
          const destCityPart = destinationLower.split('(')[0].trim();
          let destCodePart = '';
          if (destinationLower.includes('(')) {
            const destCodeMatch = destinationLower.match(/\(([^)]+)\)/);
            if (destCodeMatch && destCodeMatch[1]) {
              destCodePart = destCodeMatch[1].toLowerCase();
            }
          }
          
          // Match any component (full city, just city name, just code)
          const isMatch = destinationLower.includes(arrivalCityLower) || 
                        arrivalCityLower.includes(destinationLower) ||
                        (arrivalCode && destinationLower.includes(arrivalCode)) ||
                        (arrivalCode && destCodePart === arrivalCode) ||
                        (cityNameOnly && destCityPart === cityNameOnly);
          
          if (isMatch) {
            console.log(`✓ Arrival city match: ${flight.destination} with ${arrivalCityLower}`);
          }
          
          return isMatch;
        });
        
        console.log(`After arrival city filter (${searchParams.arrivalCity}): ${filteredFlights.length} flights remaining`);
      }
      // After city filters are applied, store route-matched flights for potential fallback
      const routeMatchedFlights = [...filteredFlights];
      console.log(`Stored ${filteredFlights.length} route-matched flights for potential fallback`);
      
      if (filteredFlights.length === 0) {
        console.log('No flights found matching the route criteria');
        return [];
      }
      
      // SECOND PASS: Date filtering with multiple formats
      if (searchParams.departureDate) {
        try {
          // Log the raw search date for debugging
          console.log('Raw search date from params:', searchParams.departureDate, typeof searchParams.departureDate);
          
          // Format search date for comparison
          const searchDate = new Date(searchParams.departureDate);
          console.log('Parsed search date object:', searchDate);
          
          // Ensure valid date
          if (isNaN(searchDate.getTime())) {
            console.error('Invalid search date:', searchParams.departureDate);
            console.log('❗ Skipping date filter due to invalid date - showing all route matches');
            return routeMatchedFlights; // Return route matches if date is invalid
          }
          
          // Format the search date to YYYY-MM-DD for consistency in comparison
          const searchDateYMD = searchDate.toISOString().split('T')[0];
          console.log('🔍 Filtering flights by departure date:', searchDateYMD);
          
          const dateFilteredFlights = filteredFlights.filter(flight => {
            const flightDateStr = flight.departureTime || flight.departureDate;
            if (!flightDateStr) return false;
            
            try {
              // Log the flight date for debugging
              console.log(`Checking flight ${flight.id} date:`, flightDateStr);
              
              // Try direct string comparison first (for exact YYYY-MM-DD formats)
              if (flightDateStr === searchParams.departureDate || flightDateStr === searchDateYMD) {
                console.log(`✅ Direct string match for flight ${flight.id}`);
                return true;
              }
              
              // Parse flight date for comparison
              const flightDate = new Date(flightDateStr);
              if (isNaN(flightDate.getTime())) {
                console.log(`⚠️ Invalid date format in flight ${flight.id}:`, flightDateStr);
                return false;
              }
              
              // Format to YYYY-MM-DD for normalized comparison
              const flightDateYMD = flightDate.toISOString().split('T')[0];
              
              // Compare just the date components (ignore time)
              const searchDay = searchDate.getDate();
              const searchMonth = searchDate.getMonth();
              const searchYear = searchDate.getFullYear();
              
              const flightDay = flightDate.getDate();
              const flightMonth = flightDate.getMonth();
              const flightYear = flightDate.getFullYear();
              
              // Match if year, month, and day match exactly
              const isMatch = (flightDateYMD === searchDateYMD) || 
                             (flightDay === searchDay && 
                              flightMonth === searchMonth && 
                              flightYear === searchYear);
              
              if (isMatch) {
                console.log(`✓ Date match for flight ${flight.id}: ${flightDateYMD}`);
              }
              
              return isMatch;
            } catch (err) {
              console.error(`Error comparing dates for flight ${flight.id}:`, err);
              return false;
            }
          });
          
          // Log detailed info about search results
          console.log(`Date filter results: ${dateFilteredFlights.length} flights match the date ${searchDateYMD}`);
          if (dateFilteredFlights.length > 0) {
            console.log('First matching flight:', dateFilteredFlights[0].id, 
                       'from', dateFilteredFlights[0].origin, 
                       'to', dateFilteredFlights[0].destination);
          }
          
          // Check if we found any flights with matching dates
          if (dateFilteredFlights.length === 0) {
            console.log('No exact date matches found. Checking for flights on nearby dates...');
            
            // Check if we have route matches at least
            if (routeMatchedFlights.length > 0) {
              console.log(`Found ${routeMatchedFlights.length} flights on the same route on different dates.`);
              
              // Set a flag to show a user-friendly message
              localStorage.setItem('flightSearchDateFallback', 'true');
              localStorage.setItem('searchedDate', searchDateYMD);
              
              // Sort by closest date to requested date for best user experience
              routeMatchedFlights.sort((a, b) => {
                const dateA = new Date(a.departureTime || a.departureDate);
                const dateB = new Date(b.departureTime || b.departureDate);
                
                // Calculate days difference from search date
                const diffA = Math.abs(dateA - searchDate) / (1000 * 60 * 60 * 24);
                const diffB = Math.abs(dateB - searchDate) / (1000 * 60 * 60 * 24);
                
                return diffA - diffB; // Sort by closest date first
              });
              
              return routeMatchedFlights;
            } else {
              console.log('No flights found for this route on any date.');
              return [];
            }
          }
          
          // We found date matches, use those
          console.log(`Found ${dateFilteredFlights.length} flights matching exact date ${searchDateYMD}`);
          return dateFilteredFlights;
          
        } catch (error) {
          console.error('Error during date filtering:', error);
          // Fall back to route matches on error
          return routeMatchedFlights.length > 0 ? routeMatchedFlights : [];
        }
      }
      
      // If no date was specified, just return the route matches
      // Save search parameters for reference
      localStorage.setItem('flightSearchParams', JSON.stringify(searchParams));
      
      console.log(`Search complete! Found ${filteredFlights.length} matching flights`);
      return filteredFlights;
    } catch (error) {
      console.error('Flight search failed:', error);
      return rejectWithValue(error.message || 'Failed to search flights');
    }
  }
);

// Get flight by ID
export const getFlightById = createAsyncThunk(
  'flights/getFlightById',
  async (flightId, { rejectWithValue }) => {
    try {
      // Fetch from local flights.json instead of API
      const res = await fetch('/flights.json');
      if (!res.ok) {
        throw new Error('Failed to fetch flights data');
      }
      
      const allFlights = await res.json();
      console.log(`Searching for flight with ID: ${flightId}`);
      console.log(`Available flight IDs:`, allFlights.map(f => f.id || f._id));
      
      // Try to find flight by id or _id
      const flight = allFlights.find(flight => 
        // Convert both to strings for safe comparison
        String(flight._id) === String(flightId) || 
        String(flight.id) === String(flightId)
      );
      
      if (!flight) {
        throw new Error(`Flight not found with ID: ${flightId}`);
      }
      
      console.log('Found flight:', flight);
      return flight;
    } catch (error) {
      console.error('Error getting flight by ID:', error);
      return rejectWithValue(error.message || 'Failed to fetch flight details');
    }
  }
);

// Admin: Create new flight
export const createFlight = createAsyncThunk(
  'flights/createFlight',
  async (flightData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/flights', flightData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create flight'
      );
    }
  }
);

// Admin: Update flight
export const updateFlight = createAsyncThunk(
  'flights/updateFlight',
  async ({ flightId, flightData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/flights/${flightId}`, flightData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update flight'
      );
    }
  }
);

// Admin: Delete flight
export const deleteFlight = createAsyncThunk(
  'flights/deleteFlight',
  async (flightId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/flights/${flightId}`);
      return flightId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete flight'
      );
    }
  }
);

const initialState = {
  flights: [],
  filteredFlights: [],
  currentFlight: null,
  loading: false,
  error: null,
  searchParams: null,
  selectedFlight: null,
  selectedFlightClass: 'economy',
  selectedPassengers: null,
};

const flightSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    setFlights: (state, action) => {
      state.flights = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearCurrentFlight: (state) => {
      state.currentFlight = null;
    },
    setSearchParams: (state, action) => {
      state.searchParams = action.payload;
    },
    clearSearchResults: (state) => {
      state.filteredFlights = [];
      state.searchParams = null;
      console.log('Cleared previous search results');
    },
    selectFlight: (state, action) => {
      state.selectedFlight = action.payload.flight;
      state.selectedFlightClass = action.payload.flightClass || 'economy';
      state.selectedPassengers = action.payload.passengers || { adults: 1, children: 0, infants: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllFlights.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = action.payload; // Direct reference to flights array from flights.json
      })
      .addCase(getAllFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(searchFlights.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredFlights = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;

        // Log the successful search results with detailed info
        console.log(` Search complete with ${state.filteredFlights.length} results:`, {
          resultsFound: state.filteredFlights.length > 0,
          firstResult: state.filteredFlights[0] ? {
            id: state.filteredFlights[0].id,
            route: `${state.filteredFlights[0].origin} → ${state.filteredFlights[0].destination}`,
            date: state.filteredFlights[0].departureTime || state.filteredFlights[0].departureDate
          } : null
        });
        if (action.payload.length === 0) {
          toast.info('No flights found matching your search criteria.');
        }
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      .addCase(getFlightById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFlightById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFlight = action.payload; // Direct flight object from flights.json
      })
      .addCase(getFlightById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      .addCase(createFlight.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFlight.fulfilled, (state, action) => {
        state.loading = false;
        state.flights.push(action.payload.flight);
        toast.success('Flight created successfully!');
      })
      .addCase(createFlight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      .addCase(updateFlight.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFlight.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.flights.findIndex(
          (flight) => flight._id === action.payload.flight._id
        );
        if (index !== -1) {
          state.flights[index] = action.payload.flight;
        }
        toast.success('Flight updated successfully!');
      })
      .addCase(updateFlight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      .addCase(deleteFlight.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFlight.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = state.flights.filter(
          (flight) => flight._id !== action.payload
        );
        toast.success('Flight deleted successfully!');
      })
      .addCase(deleteFlight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearFlightErrors,
  clearCurrentFlight,
  setSearchParams,
  clearSearchResults,
  selectFlight,
} = flightSlice.actions;

export default flightSlice.reducer;
