import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import flightReducer from './slices/flightSlice';
import bookingReducer from './slices/bookingSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    flights: flightReducer,
    bookings: bookingReducer,
    users: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
