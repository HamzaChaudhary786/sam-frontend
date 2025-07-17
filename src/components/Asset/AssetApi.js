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

// Get all assets with optional filters
export const getAssets = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.type) queryParams.append('type', filters.type);
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/assets${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch assets'
    };
  }
};

// Get single asset by ID
export const getAsset = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/assets/${id}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch asset'
    };
  }
};

// Add new asset
export const addAsset = async (assetData) => {
  try {
    const response = await axios.post(`${API_URL}/assets`, assetData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add asset'
    };
  }
};

// Update asset
export const updateAsset = async (assetData, id) => {
  try {
    const response = await axios.put(`${API_URL}/assets/${id}`, assetData, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update asset'
    };
  }
};

// Delete asset
export const deleteAsset = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/assets/${id}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete asset'
    };
  }
};