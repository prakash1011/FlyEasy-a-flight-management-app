import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-lg p-6 max-w-lg w-full shadow-lg">
        <h1 className="text-2xl font-bold text-blue-400 mb-4">FlyEasy Route Testing Page</h1>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-2">If you can see this page, React Router is working correctly.</p>
          <div className="h-1 bg-blue-500 w-full opacity-20 my-4"></div>
          
          <h2 className="text-lg font-semibold text-white mb-2">Try these routes:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>
              <Link to="/" className="text-blue-400 hover:underline">
                Home (/) - Should redirect to /flights
              </Link>
            </li>
            <li>
              <Link to="/flights" className="text-blue-400 hover:underline">
                Flights (/flights) - Should display flight listings
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-blue-400 hover:underline">
                Login (/login) - Authentication page
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-dark-700 rounded p-4 mb-6">
          <h3 className="font-semibold text-white mb-2">Debugging Tips:</h3>
          <ol className="list-decimal list-inside text-gray-300 space-y-1">
            <li>Ensure both frontend and backend servers are running</li>
            <li>Check browser console for React or JavaScript errors</li>
            <li>Verify components are being loaded properly</li>
            <li>Confirm API requests are reaching the backend</li>
          </ol>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="/test.html" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-center"
          >
            View Static Test Page
          </a>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-center"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
