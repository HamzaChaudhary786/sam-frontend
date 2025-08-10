import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './Login.js';
import { toast } from 'react-toastify';
import logoImage from '../../assets/logobig.jpg';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await loginUser(formData.email, formData.password);

      if (result.success) {
        // Store all login information in localStorage
        const loginData = result.data;
        
        // Store token
        if (loginData.token) {
          localStorage.setItem('authToken', loginData.token);
        }
        
        // Store user information
        if (loginData.user) {
          localStorage.setItem('userData', JSON.stringify(loginData.user));
          localStorage.setItem('userId', loginData.user._id);
          localStorage.setItem('userEmail', loginData.user.email);
          localStorage.setItem('userType', loginData.user.userType);
          
          // Store profile if available
          if (loginData.user.profile) {
            localStorage.setItem('userProfile', loginData.user.profile);
          }
        }
        
        // Store the complete login response (optional, for easy access)
        localStorage.setItem('loginResponse', JSON.stringify(loginData));
        
        // Success toast with user info
        toast.success(`Welcome back, ${loginData.user?.email || 'User'}! Login successful.`);
        
        console.log('✅ Login successful, stored data:', {
          token: loginData.token ? 'Token stored' : 'No token',
          user: loginData.user ? 'User data stored' : 'No user data',
          userType: loginData.user?.userType || 'Unknown'
        });
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error);
        toast.error(`Login failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred during login';
      setError(errorMessage);
      toast.error(`Login error: ${errorMessage}`);
      console.error('Login error:', error);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          {/* <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg> */}
          <img src={logoImage} alt="Balochistan Levies logo image" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login to Balochistan Levies Staff & Asset Management
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access the management system
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;