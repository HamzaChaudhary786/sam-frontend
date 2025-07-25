import axios from 'axios';

import { BACKEND_URL } from '../../../constants/api.js'; 
const API_URL = BACKEND_URL;

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Helper function to get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get stations from backend with full details
export const getStationsWithDetails = async () => {
  try {
    const response = await axios.get(`${API_URL}/stations`, {
      headers: getAuthHeaders()
    });
    
    // Return both enum format and full station details
    const stationsEnum = {};
    const stationsDetails = {};
    
    if (response.data.stations && Array.isArray(response.data.stations)) {
      response.data.stations.forEach(station => {
        // For dropdown enum
        const formattedName = `${station.name} ( Tehsil: ${station.tehsil}) (District: ${station.district})`;
        stationsEnum[station._id] = formattedName;
        
        // For address auto-fill
        stationsDetails[station._id] = {
          id: station._id,
          name: station.name,
          tehsil: station.tehsil,
          district: station.district,
          address: {
            line1: station.address.line1,
            line2: station.address.line2,
            city: station.address.city
          }
        };
      });
    }
    
    return { 
      success: true, 
      data: {
        enum: stationsEnum,
        details: stationsDetails
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch stations' 
    };
  }
};