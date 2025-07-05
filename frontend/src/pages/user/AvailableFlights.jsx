import React from 'react';
import { FaSearch } from 'react-icons/fa';
import FlightList from '../../components/flights/FlightList';

const AvailableFlights = () => {
  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Available Flights</h1>
          <p className="text-gray-400">Browse all available flights and book your next journey</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button 
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 flex items-center transition-colors"
            onClick={() => window.location.href = '/search-flights'}
          >
            <FaSearch className="mr-2" />
            Search Flights
          </button>
        </div>
      </div>
      
      <div className="bg-dark-800 rounded-lg p-6">
        <FlightList />
      </div>
    </div>
  );
};

export default AvailableFlights;
