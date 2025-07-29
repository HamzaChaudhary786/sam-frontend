// api/UserApi.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const BASE_URL = 'http://localhost:5000/api/user';

export const userApi = {
  // Create user
  create: async (userData) => {
    try {
      const response = await axios.post(BASE_URL, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.users || response.data.user || response.data,
        pagination: response.data.pagination || null,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('User API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null,
        pagination: null
      };
    }
  },

  // Get all users with pagination and filters
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10, userType } = params;
      let url = `${BASE_URL}?page=${page}&limit=${limit}`;
      
      if (userType) {
        url += `&userType=${userType}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.users || response.data.user || response.data,
        pagination: response.data.pagination || null,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('User API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null,
        pagination: null
      };
    }
  },

  // Get users by type
  getByType: async (userType, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await axios.get(`${BASE_URL}?page=${page}&limit=${limit}&userType=${userType}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.users || response.data.user || response.data,
        pagination: response.data.pagination || null,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('User API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null,
        pagination: null
      };
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.users || response.data.user || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('User API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Update user
  update: async (id, userData) => {
    try {
      // Remove empty password field for updates
      if (userData.password === '') {
        const { password, ...updateData } = userData;
        userData = updateData;
      }
      
      const response = await axios.put(`${BASE_URL}/${id}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.users || response.data.user || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('User API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('User API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get users as enum for dropdowns
  getAsEnum: async () => {
    try {
      const result = await userApi.getAll({ limit: 1000 });
      if (result.success) {
        const enumData = {};
        (result.data || []).forEach(user => {
          enumData[user._id] = `${user.firstName} ${user.lastName} (${user.email})`;
        });
        return { success: true, data: enumData };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message, data: {} };
    }
  }
};