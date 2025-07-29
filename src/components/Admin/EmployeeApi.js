// api/EmployeeApi.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const BASE_URL = 'http://localhost:5000/api/employee';

export const employeeApi = {
  // Get all employees with pagination
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 1000 } = params;
      const response = await axios.get(`${BASE_URL}?page=${page}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.employees || response.data.employee || response.data,
        pagination: response.data.pagination || null,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Employee API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null,
        pagination: null
      };
    }
  },

  // Get employee by ID
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
        data: response.data.employees || response.data.employee || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Employee API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Create employee
  create: async (employeeData) => {
    try {
      const response = await axios.post(BASE_URL, employeeData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.employees || response.data.employee || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Employee API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Update employee
  update: async (id, employeeData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, employeeData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.employees || response.data.employee || response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('Employee API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Delete employee
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
      console.error('Employee API Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  },

  // Get employees as enum for dropdowns
  getAsEnum: async () => {
    try {
      const result = await employeeApi.getAll({ limit: 1000 });
      if (result.success) {
        const enumData = {};
        (result.data || []).forEach(employee => {
          enumData[employee._id] = `${employee.firstName} ${employee.lastName || ''} - ${employee.personalNumber}`;
        });
        return { success: true, data: enumData };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message, data: {} };
    }
  }
};