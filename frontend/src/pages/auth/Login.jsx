import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { login } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  // For debugging purposes, pre-fill with test credentials
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'password123'
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Clear any previous errors from Redux state
        dispatch({ type: 'auth/clearError' });
        
        // Log the login attempt for debugging
        console.log('LOGIN ATTEMPT:', { 
          email: formData.email, 
          passwordLength: formData.password?.length, 
          timestamp: new Date().toISOString() 
        });
        
        // Attempt login
        const result = await dispatch(login(formData)).unwrap();
        
        // Log successful response
        console.log('LOGIN SUCCESS - Response structure:', Object.keys(result));
        console.log('LOGIN SUCCESS - Full response:', result);
        
        // Enhanced user data extraction
        let userData;
        if (result.user) {
          userData = result.user;
          console.log('User data found in result.user');
        } else if (result.data) {
          userData = result.data;
          console.log('User data found in result.data');
        } else {
          // Try to extract user properties from the top level
          const { token, success, ...restData } = result;
          if (restData.name || restData.email || restData.role) {
            userData = restData;
            console.log('User data found at top level of response');
          } else {
            userData = { role: 'passenger' }; // Default role if not found
            console.warn('No user data found in response, using default role');
          }
        }
        
        // Log extracted user information
        console.log('LOGIN SUCCESS - User data:', userData);
        console.log('LOGIN SUCCESS - User role:', userData.role);
        
        // Redirect based on user role with delay to ensure state is updated
        setTimeout(() => {
          if (userData.role === 'admin') {
            console.log('Redirecting admin to admin dashboard');
            navigate('/admin/dashboard');
          } else {
            console.log('Redirecting user to dashboard');
            navigate('/dashboard');
          }
        }, 500);
        
      } catch (error) {
        // Enhanced error handling
        console.error('LOGIN FAILED:', error);
        toast.error(`Login failed: ${error.toString()}`);
      }
    }
  };
  
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <p className="text-gray-400 mt-1">Sign in to your FlyEasy account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          icon={<FaEnvelope />}
          error={errors.email}
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          icon={<FaLock />}
          error={errors.password}
        />
        
        
        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? <Loader size="small" text="" /> : 'Sign In'}
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
