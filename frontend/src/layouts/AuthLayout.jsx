import { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlaneDeparture } from 'react-icons/fa';
import { setDarkTheme } from '../store/slices/uiSlice';

const AuthLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Apply dark theme on load (based on user preference)
    dispatch(setDarkTheme());
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-dark-800 to-dark-900">
      {/* Left side - Logo and welcome message */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 bg-dark-900 bg-opacity-50">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <FaPlaneDeparture className="text-6xl text-primary-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold mb-6 text-white">
            Welcome to <span className="text-primary-400">FlyEasy</span>
          </h1>
          <div className="space-y-6">
            <p className="text-lg text-gray-300">
              Your premium flight booking platform
            </p>
            <div className="h-1 w-20 bg-primary-500 mx-auto"></div>
            <p className="text-gray-400">
              Book flights, manage reservations, and enjoy seamless travel planning
              with our easy-to-use platform.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <div className="flex justify-center mb-4">
              <FaPlaneDeparture className="text-4xl text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Welcome to <span className="text-primary-400">FlyEasy</span>
            </h1>
          </div>
          
          {/* Auth forms are rendered here via Outlet */}
          <div className="bg-dark-700 rounded-xl p-6 shadow-lg border border-dark-600">
            <Outlet />
          </div>
          
          {/* Footer links */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} FlyEasy. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link to="/terms" className="hover:text-primary-400 transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <Link to="/support" className="hover:text-primary-400 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
