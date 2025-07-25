import axios from 'axios';

// Set global defaults
axios.defaults.withCredentials = true;

// Fixed API URL to match your backend
import { BACKEND_URL } from "../../constants/api.js";
const API_URL = BACKEND_URL;

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    }, {
      withCredentials: true  // Correct syntax: inside config object
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed'
    };
  }
};