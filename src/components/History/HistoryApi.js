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

// ===== EMPLOYEE STATUS HISTORY =====

// Get all employee status history with optional filters
export const getEmployeeStatusHistory = async (filters = {}) => {
  try {
    console.log('🔍 Fetching status history with filters:', filters);
    
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.employee) queryParams.append('employee', filters.employee);
    if (filters.description) queryParams.append('description', filters.description);
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/employee-status-history${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Status History API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch employee status history'
    };
  }
};

// Create new employee status history record
export const addEmployeeStatusHistory = async (historyData) => {
  try {
    console.log('➕ Creating status history record:', historyData);
    
    const response = await axios.post(`${API_URL}/employee-status-history`, historyData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Create status history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add employee status history'
    };
  }
};

// Update employee status history record
export const updateEmployeeStatusHistory = async (historyData, id) => {
  try {
    console.log('✏️ Updating status history record ID:', id, 'with data:', historyData);
    
    const response = await axios.put(`${API_URL}/employee-status-history/${id}`, historyData, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Update status history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update employee status history'
    };
  }
};

// Delete employee status history record
export const deleteEmployeeStatusHistory = async (id) => {
  try {
    console.log('🗑️ Deleting status history record ID:', id);
    
    const response = await axios.delete(`${API_URL}/employee-status-history/${id}`, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Delete status history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete employee status history'
    };
  }
};

// ===== ASSET HISTORY =====

// Get asset history by employee (updated to match your API structure)
export const getAssetHistory = async (filters = {}) => {
  try {
    console.log('🔍 Fetching asset history with filters:', filters);
    
    let url;
    
    if (filters.employee) {
      // Use the specific employee endpoint as per your API guide
      url = `${API_URL}/asset-history/employee/${filters.employee}`;
    } else {
      // Fallback to general endpoint for all history
      url = `${API_URL}/asset-history`;
      
      // Add query params for non-employee filters
      const queryParams = new URLSearchParams();
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.asset) queryParams.append('asset', filters.asset);
      if (filters.remarks) queryParams.append('remarks', filters.remarks);
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    console.log('📡 Asset History API Request URL:', url);
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Asset History API Response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Asset History API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch asset history'
    };
  }
};

// Get last asset for employee (before adding new one)
export const getLastAssetHistory = async (employeeId) => {
  try {
    console.log('🔍 Fetching last asset history for employee:', employeeId);
    
    const url = `${API_URL}/asset-history/employee/${employeeId}/last`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Last Asset History API Response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Last Asset History API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch last asset history'
    };
  }
};

// Get previous asset history (for context before adding new)
export const getPreviousAssetHistory = async (employeeId) => {
  try {
    console.log('🔍 Fetching previous asset history for employee:', employeeId);
    
    const url = `${API_URL}/asset-history/employee/${employeeId}/previous`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Previous Asset History API Response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Previous Asset History API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch previous asset history'
    };
  }
};

// Create new asset history record
export const addAssetHistory = async (historyData) => {
  try {
    console.log('➕ Creating asset history record:', historyData);
    
    // Follow your API guide - don't send lastAsset, system handles it
    const payload = {
      employee: historyData.employee,
      currentAsset: historyData.currentAsset,
      action: historyData.action,
      remarks: historyData.remarks
    };
    
    // Add optional fields if they exist
    if (historyData.from) payload.from = historyData.from;
    if (historyData.to) payload.to = historyData.to;
    
    console.log('📤 Sending asset history payload:', payload);
    
    const response = await axios.post(`${API_URL}/asset-history`, payload, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Create asset history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add asset history'
    };
  }
};

// Update asset history record
export const updateAssetHistory = async (historyData, id) => {
  try {
    console.log('✏️ Updating asset history record ID:', id, 'with data:', historyData);
    
    const response = await axios.put(`${API_URL}/asset-history/update/${id}`, historyData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Update asset history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update asset history'
    };
  }
};

// Delete asset history record
export const deleteAssetHistory = async (id) => {
  try {
    console.log('🗑️ Deleting asset history record ID:', id);
    
    const response = await axios.delete(`${API_URL}/asset-history/employee/${id}`, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Delete asset history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete asset history'
    };
  }
};

// ===== STATION HISTORY =====

// Get station history by employee (updated to match your API structure)
export const getStationHistory = async (filters = {}) => {
  try {
    console.log('🔍 Fetching station history with filters:', filters);
    
    let url;
    
    if (filters.employee) {
      // Use the specific employee endpoint as per your API guide
      url = `${API_URL}/station-history/employee/${filters.employee}`;
    } else {
      // Fallback to general endpoint for all history
      url = `${API_URL}/station-history`;
      
      // Add query params for non-employee filters
      const queryParams = new URLSearchParams();
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.station) queryParams.append('station', filters.station);
      if (filters.remarks) queryParams.append('remarks', filters.remarks);
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    console.log('📡 Station History API Request URL:', url);
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Station History API Response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Station History API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch station history'
    };
  }
};

// Get last station for employee (before adding new one)
export const getLastStationHistory = async (employeeId) => {
  try {
    console.log('🔍 Fetching last station history for employee:', employeeId);
    
    const url = `${API_URL}/station-history/${employeeId}/last`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Last Station History API Response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Last Station History API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch last station history'
    };
  }
};

// Get previous station history (for context before adding new)
export const getPreviousStationHistory = async (employeeId) => {
  try {
    console.log('🔍 Fetching previous station history for employee:', employeeId);
    
    const url = `${API_URL}/station-history/${employeeId}/previous`;
    
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Previous Station History API Response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Previous Station History API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch previous station history'
    };
  }
};

// Create new station history record
export const addStationHistory = async (historyData) => {
  try {
    console.log('➕ Creating station history record:', historyData);
    
    // Follow your API guide - don't send lastStation, system handles it
    const payload = {
      employee: historyData.employee,
      currentStation: historyData.currentStation,
      action: historyData.action,
      remarks: historyData.remarks
    };
    
    // Add optional fields if they exist
    if (historyData.from) payload.from = historyData.from;
    if (historyData.to) payload.to = historyData.to;
    
    console.log('📤 Sending station history payload:', payload);
    
    const response = await axios.post(`${API_URL}/station-history`, payload, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Create station history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add station history'
    };
  }
};

// Update station history record
export const updateStationHistory = async (historyData, id) => {
  try {
    console.log('✏️ Updating station history record ID:', id, 'with data:', historyData);
    
    const response = await axios.put(`${API_URL}/station-history/update/${id}`, historyData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Update station history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update station history'
    };
  }
};

// Delete station history record
export const deleteStationHistory = async (id) => {
  try {
    console.log('🗑️ Deleting station history record ID:', id);
    
    const response = await axios.delete(`${API_URL}/station-history/employee/${id}`, {
      headers: getAuthHeaders()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Delete station history error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete station history'
    };
  }
};