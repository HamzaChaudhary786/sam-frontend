// api/RoleApi.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const BASE_URL = 'http://localhost:5000/api/roles';

export const roleApi = {
  // Create role
  create: async (roleData) => {
    try {
      const response = await axios.post(`${BASE_URL}/roles`, roleData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.roles || response.data.role || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Role API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get all roles
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/roles`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.roles || response.data.role || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Role API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get role by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/roles/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.roles || response.data.role || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Role API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Update role
  update: async (id, roleData) => {
    try {
      const response = await axios.put(`${BASE_URL}/roles/${id}`, roleData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.roles || response.data.role || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Role API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Delete role
  delete: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/roles/${id}`, {
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
      console.error('Role API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get roles as enum for dropdowns
  getAsEnum: async () => {
    try {
      const result = await roleApi.getAll();
      if (result.success) {
        const enumData = {};
        (result.data || []).forEach(role => {
          enumData[role._id] = role.name;
        });
        return { success: true, data: enumData };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message, data: {} };
    }
  }
};