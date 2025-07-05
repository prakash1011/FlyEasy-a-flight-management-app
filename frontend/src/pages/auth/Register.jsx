import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiUserCheck, FiLoader } from 'react-icons/fi';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { register } from '../../store/slices/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'passenger', // Default role
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const { confirmPassword, ...registerData } = formData;
        
        // Log the registration data for debugging
        console.log('Submitting registration with data:', { 
          ...registerData, 
          password: registerData.password ? '********' : undefined 
        });
        
        const result = await dispatch(register(registerData)).unwrap();
        console.log('Registration response structure:', Object.keys(result));
        
        // Extract user data with the same pattern used in login
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
            userData = { role: formData.role }; // Use the role from the form if not found in response
            console.log('No user data found in response, using form data');
          }
        }
        
        console.log('Extracted user data:', userData);
        console.log('User role:', userData.role);
        
        // Redirect based on user role
        if (userData.role === 'admin') {
          console.log('Admin user registered, redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('Regular user registered, redirecting to user dashboard');
          navigate('/dashboard');
        }
      } catch (error) {
        // Error is handled by the register thunk and displayed via toast
        console.error('Registration error caught in component:', error);
      }
    }
  };
  
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
        <p className="text-gray-400 mt-1">Join FlyEasy and start your journey</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          icon={<FiUser />}
          error={errors.name}
        />
        
        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          icon={<FiMail />}
          error={errors.email}
        />
        
        <Input
          label="Phone Number"
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="123-456-7890"
          required
          icon={<FiPhone />}
          error={errors.phone}
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
          icon={<FiLock />}
          error={errors.password}
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          icon={<FiLock />}
          error={errors.confirmPassword}
        />
        
        <div className="space-y-1">
          <label htmlFor="role" className="block text-sm font-medium text-gray-300">
            Select Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUserCheck className="h-5 w-5 text-gray-500" />
            </div>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-2.5 text-gray-300 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="passenger">Passenger</option>
              <option value="admin">Administrator</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role}</p>}
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
            I agree to the 
            <Link to="/terms" className="text-blue-400 hover:text-blue-300 ml-1">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
          </label>
        </div>
        
        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </>
  );
};

export default Register;
