// api/GroupApi.js
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';

axios.defaults.withCredentials = true;

const BASE_URL = `${BACKEND_URL}/group`;

export const groupApi = {
  // Create group
  create: async (groupData) => {
    try {
      const response = await axios.post(BASE_URL, groupData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.groups || response.data.group || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Group API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get all groups
  getAll: async () => {
    try {
      const response = await axios.get(BASE_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.groups || response.data.group || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Group API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get group by ID
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
        data: response.data.groups || response.data.group || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Group API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Update group
  update: async (id, groupData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, groupData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.groups || response.data.group || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Group API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Delete group
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
      console.error('Group API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get groups as enum for dropdowns
  getAsEnum: async () => {
    try {
      const result = await groupApi.getAll();
      if (result.success) {
        const enumData = {};
        (result.data || []).forEach(group => {
          enumData[group._id] = group.name;
        });
        return { success: true, data: enumData };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message, data: {} };
    }
  }
};