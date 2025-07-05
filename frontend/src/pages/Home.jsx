import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to flights page automatically
    navigate('/flights');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to FlyEasy</h1>
        <p className="text-lg text-gray-300 mb-6">Redirecting to flights page...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default Home;
