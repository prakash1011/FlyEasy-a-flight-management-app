import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const LoginTest = () => {
  const [credentials, setCredentials] = useState({
    email: 'test@example.com',
    password: 'password123'
  });
  
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const testDirectLogin = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Sending direct login request to backend:', credentials);
      
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct login response:', res.data);
      setResponse(res.data);
      
      // Check for token
      if (res.data.token) {
        toast.success('Login successful with token!');
        // Store token to localStorage
        localStorage.setItem('token', res.data.token);
        
        // Extract user data
        let userData;
        if (res.data.user) {
          userData = res.data.user;
        } else if (res.data.data) {
          userData = res.data.data;
        } else {
          const { token, success, ...rest } = res.data;
          userData = rest;
        }
        
        // Log user data
        console.log('Extracted user data:', userData);
        console.log('User role:', userData.role);
      } else {
        toast.error('No token in response');
      }
    } catch (err) {
      console.error('Login test error:', err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error(`Login failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-white mb-6">Login Test Tool</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-gray-300 mb-1">Email:</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-300 mb-1">Password:</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
      </div>
      
      <button
        onClick={testDirectLogin}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium"
      >
        {isLoading ? 'Testing...' : 'Test Direct Login'}
      </button>
      
      {response && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-white mb-2">Response:</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-60 text-gray-300 text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Error:</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-60 text-red-300 text-sm">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LoginTest;
