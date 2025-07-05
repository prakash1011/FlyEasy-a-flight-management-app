import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api, { authAPI } from '../../services/api';

// Utility function to set auth token
const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Utility function to set auth headers
const setAuthHeaders = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Check if user is already authenticated
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token found in localStorage');
      return rejectWithValue('No token found');
    }
    try {
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token set for /api/auth/me request:', token.substring(0, 10) + '...');
      
      const res = await authAPI.getCurrentUser();
      console.log('User data retrieved successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error.response?.data || error.message);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return rejectWithValue(
        error.response?.data?.message || 'Authentication failed'
      );
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Register payload:', userData);
      const response = await authAPI.register(userData);
      console.log('Register response:', response.data);
      
      if (!response.data || !response.data.token) {
        throw new Error('No token received from server during registration');
      }
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set auth token header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      console.log('Registration successful, token set:', response.data.token.substring(0, 10) + '...');
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Improved error handling to match the login error handling
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      
      // Add detailed logging for debugging
      console.log('Registration error details:', {
        responseData: error.response?.data,
        errorMessage
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authAPI.login(formData);
      
      if (!res.data || !res.data.token) {
        throw new Error('No token received from server');
      }
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      console.log('Login successful, token set:', res.data.token.substring(0, 10) + '...');
      
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      // The backend sends errors in the 'error' field not 'message'
      const errorMessage = error.response?.data?.error || 'Failed to login';
      console.log('Login error details:', { 
        responseData: error.response?.data,
        errorMessage 
      });
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    setToken(null);
    return null;
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Handle different response formats that might come from the API
        state.user = action.payload.user || action.payload.data || action.payload;
        console.log('User data from checkAuthStatus:', state.user);
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Register User
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        
        // Ensure user data is properly stored and handle different API response formats
        if (action.payload.user) {
          state.user = action.payload.user;
        } else if (action.payload.data) {
          state.user = action.payload.data;
        } else {
          // If user data is at the top level of the response
          const { token, ...userData } = action.payload;
          if (userData.name || userData.email || userData.role) {
            state.user = userData;
          }
        }
        
        // Debug the user data that was received
        console.log('User data from registration:', state.user);
        
        toast.success('Registration successful!');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Login User
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        
        // Ensure we have a token
        if (!action.payload.token) {
          console.error('No token in login response:', action.payload);
          toast.error('Invalid login response from server');
          return;
        }
        
        state.token = action.payload.token;
        
        // More robust user data extraction
        console.log('Full login response payload:', action.payload);
        
        // Use the same improved pattern for handling user data from different API response formats
        if (action.payload.user) {
          state.user = action.payload.user;
          console.log('Auth slice: User data extracted from payload.user');
        } else if (action.payload.data) {
          state.user = action.payload.data;
          console.log('Auth slice: User data extracted from payload.data');
        } else {
          // If user data is at the top level of the response
          const { token, success, ...userData } = action.payload;
          if (userData.name || userData.email || userData.role) {
            state.user = userData;
            console.log('Auth slice: User data extracted from top level');
          } else {
            console.error('Auth slice: No user data found in login response');
          }
        }
        
        // Ensure role is properly set
        if (!state.user?.role) {
          console.warn('Auth slice: User role missing, defaulting to passenger');
          if (state.user) {
            state.user.role = 'passenger';
          }
        }
        
        // Debug the user data that was received
        console.log('User data from login:', state.user);
        console.log('User role from login:', state.user?.role);
        
        toast.success('Login successful!');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        toast.success('Logged out successfully');
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
