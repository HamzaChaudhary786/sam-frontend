import axios from 'axios';
import { BACKEND_URL } from "../../constants/api.js";
import { toast } from 'react-toastify';

const API_URL = BACKEND_URL;

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Helper function to get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all employees with optional filters and pagination
export const getEmployees = async (filters = {}) => {
  try {
    // Build query string from filters and pagination
    const queryParams = new URLSearchParams();
    
    // Add filter parameters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.address) queryParams.append('address', filters.address);
    if (filters.personalNumber) queryParams.append('personalNumber', filters.personalNumber);
    if (filters.cnic) queryParams.append('cnic', filters.cnic);
    if (filters.designation) queryParams.append('designation', filters.designation);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.cast) queryParams.append('cast', filters.cast);
    if (filters.grade) queryParams.append('grade', filters.grade);
    if (filters.rank) queryParams.append('rank', filters.rank);
    if (filters.tehsil) queryParams.append('tehsil', filters.tehsil);
    if (filters.district) queryParams.append('district', filters.district);
    if (filters.station) queryParams.append('station', filters.station);








    
    // Add pagination parameters
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/employee${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch employees';
    // toast.error(`Error fetching employees: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const getEmployeesAll = async (filters = {}) => {
  try {
    // Build query string from filters and pagination
    const queryParams = new URLSearchParams();
    
    // Add filter parameters
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.address) queryParams.append('address', filters.address);
    if (filters.personalNumber) queryParams.append('personalNumber', filters.personalNumber);
    if (filters.cnic) queryParams.append('cnic', filters.cnic);
    if (filters.designation) queryParams.append('designation', filters.designation);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.cast) queryParams.append('cast', filters.cast);
    if (filters.grade) queryParams.append('grade', filters.grade);
    if (filters.rank) queryParams.append('rank', filters.rank);





    
    // Add pagination parameters
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/employee${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch employees';
    // toast.error(`Error fetching employees: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
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
    const errorMessage = error.response?.data?.message || 'Failed to fetch employee';
    // toast.error(`Error fetching employee: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
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
    
    // Success toast with employee name if available
    const employeeName = `${employeeData.firstName || 'New'} ${employeeData.lastName || 'Employee'}`.trim();
    toast.success(`Employee "${employeeName}" created successfully!`);
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to add employee';
    toast.error(`Failed to create employee: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Update employee
export const updateEmployee = async (employeeData, id) => {
  try {
    const response = await axios.put(`${API_URL}/employee/${id}`, employeeData, {
      headers: getAuthHeaders()
    });
    
    // Success toast with employee name if available
    const employeeName = `${employeeData.firstName || 'Employee'} ${employeeData.lastName || ''}`.trim();
    toast.success(`Employee "${employeeName}" updated successfully!`);
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update employee';
    toast.error(`Failed to update employee: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Delete employee
export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/employee/${id}`, {
      headers: getAuthHeaders()
    });
    
    toast.success("Employee deleted successfully!");
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete employee';
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Optional: Get employees with custom pagination (if you want a separate method)
export const getEmployeesWithPagination = async (page = 1, limit = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination first
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    // Add filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_URL}/employee?${queryParams.toString()}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch employees';
    // toast.error(`Error fetching employees: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
};