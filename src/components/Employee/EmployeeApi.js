import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Helper function to get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/employee`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch employees' 
    };
  }
};

// Get single employee by ID
export const getEmployee = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/employee/${id}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch employee' 
    };
  }
};

// Add new employee
export const addEmployee = async (employeeData) => {
  try {
    const response = await axios.post(`${API_URL}/employee`, employeeData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add employee'
    };
  }
};

// Update employee
export const updateEmployee = async (employeeData, id) => {
  try {
    const response = await axios.put(`${API_URL}/employee/${id}`, employeeData, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update employee' 
    };
  }
};

// Delete employee
export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/employee/${id}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete employee' 
    };
  }
};