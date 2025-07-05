import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';

// Get user bookings
export const getUserBookings = createAsyncThunk(
  'bookings/getUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.getUserBookings();
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bookings'
      );
    }
  }
);

// Create new booking
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.createBooking(bookingData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create booking'
      );
    }
  }
);

// Get booking by id
export const getBookingById = createAsyncThunk(
  'bookings/getBookingById',
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.getBookingById(bookingId);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch booking details'
      );
    }
  }
);

// Create alias for fetchBookingDetails used in BookingConfirmation.jsx
export const fetchBookingDetails = getBookingById;

// Cancel booking
export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.cancelBooking(bookingId);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel booking'
      );
    }
  }
);

// Reschedule booking
export const rescheduleBooking = createAsyncThunk(
  'bookings/rescheduleBooking',
  async ({ bookingId, newFlightId }, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.rescheduleBooking(bookingId, { newFlightId });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reschedule booking'
      );
    }
  }
);

// Admin: Get all bookings
export const getAllBookings = createAsyncThunk(
  'bookings/getAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      // Using our configured api instance to ensure auth token is included
      const res = await bookingAPI.getAllBookings ? 
        bookingAPI.getAllBookings() : 
        // Fallback if not defined in bookingAPI
        await import('../../services/api').then(api => api.default.get('/api/bookings'));
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all bookings'
      );
    }
  }
);

// Calculate fare with discount
export const calculateFare = createAsyncThunk(
  'bookings/calculateFare',
  async (fareData, { rejectWithValue }) => {
    try {
      // Using our configured api instance to ensure auth token is included
      const res = await import('../../services/api')
        .then(api => api.default.post('/api/bookings/calculate-fare', fareData));
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to calculate fare'
      );
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  fareDetails: null,
  loading: false,
  error: null,
  message: '',
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingErrors: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    setFareDetails: (state, action) => {
      // For client-side fare calculation
      const { baseFare, selectedClass, isDiscountEligible } = action.payload;
      let classFactor = 1;
      
      // Apply multiplier based on class
      if (selectedClass === 'business') {
        classFactor = 1.6;
      } else if (selectedClass === 'first') {
        classFactor = 2.5;
      }
      
      const calculatedFare = baseFare * classFactor;
      const discount = isDiscountEligible ? calculatedFare * 0.2 : 0; // 20% discount if eligible
      const finalFare = calculatedFare - discount;
      
      state.fareDetails = {
        baseFare,
        classFare: calculatedFare,
        discount,
        finalFare,
        isDiscountEligible,
      };
    },
    clearFareDetails: (state) => {
      state.fareDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User Bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload.booking);
        state.currentBooking = action.payload.booking;
        toast.success('Booking successful!');
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Get Booking By Id
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.booking;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (booking) => booking._id === action.payload.booking._id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload.booking;
        }
        state.currentBooking = action.payload.booking;
        toast.success('Booking cancelled successfully!');
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Reschedule Booking
      .addCase(rescheduleBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(rescheduleBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (booking) => booking._id === action.payload.booking._id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload.booking;
        }
        state.currentBooking = action.payload.booking;
        toast.success('Booking rescheduled successfully!');
      })
      .addCase(rescheduleBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Admin: Get All Bookings
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Calculate Fare
      .addCase(calculateFare.pending, (state) => {
        state.loading = true;
      })
      .addCase(calculateFare.fulfilled, (state, action) => {
        state.loading = false;
        state.fareDetails = action.payload;
      })
      .addCase(calculateFare.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearBookingErrors,
  clearCurrentBooking,
  setFareDetails,
  clearFareDetails,
} = bookingSlice.actions;

export default bookingSlice.reducer;
