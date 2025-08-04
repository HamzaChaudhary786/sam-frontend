import axios from 'axios';
import { BACKEND_URL } from "../../constants/api.js";

const API_URL = BACKEND_URL;

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Helper function to get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all stations with optional filters and pagination
export const getStations = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    // Add filter parameters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.tehsil) queryParams.append('tehsil', filters.tehsil);
    if (filters.city) queryParams.append('city', filters.city);
    
    // Add pagination parameters
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/stations${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stations'
    };
  }
};

// Get single station by ID
export const getStation = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/stations/${id}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch station'
    };
  }
};

// Add new station
export const addStation = async (stationData) => {
  try {
    const response = await axios.post(`${API_URL}/stations`, stationData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add station'
    };
  }
};

// Update station
export const updateStation = async (stationData, id) => {
  try {
    const response = await axios.put(`${API_URL}/stations/${id}`, stationData, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update station'
    };
  }
};

// Delete station
export const deleteStation = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/stations/${id}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete station'
    };
  }
};