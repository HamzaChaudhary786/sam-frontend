import axios from "axios";
import { BACKEND_URL } from "../../constants/api.js";

const API_URL = BACKEND_URL;

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem("authToken");

// Helper function to get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get assets from a specific Mallkhana
export const getMallkhanaAssets = async (mallkhanaId) => {
  try {
    const response = await axios.get(
      `${API_URL}/mallkhana/get-mallkhana-assets/${mallkhanaId}`,
      { headers: getAuthHeaders() }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch mallkhana assets",
    };
  }
};

// Bulk create asset assignments
export const bulkCreateAssetAssignments = async (assignmentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/asset-assignment/bulk-assign`,
      assignmentData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create bulk asset assignments",
    };
  }
};

// Get asset assignments with filters
export const getAssetAssignments = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.assetId) queryParams.append("assetId", filters.assetId);
    if (filters.employeeId) queryParams.append("employeeId", filters.employeeId);
    if (filters.stationId) queryParams.append("stationId", filters.stationId);
    if (filters.mallkhanaId) queryParams.append("mallkhanaId", filters.mallkhanaId);
    if (filters.assignmentDate) queryParams.append("assignmentDate", filters.assignmentDate);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const queryString = queryParams.toString();
    const url = `${API_URL}/asset-assignment${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch asset assignments",
    };
  }
};

// Get single asset assignment by ID
export const getAssetAssignment = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/asset-assignment/${id}`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch asset assignment",
    };
  }
};

// Update asset assignment
export const updateAssetAssignment = async (id, assignmentData) => {
  try {
    const response = await axios.put(
      `${API_URL}/asset-assignment/${id}`,
      assignmentData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update asset assignment",
    };
  }
};

// Delete asset assignment
export const deleteAssetAssignment = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/asset-assignment/${id}`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete asset assignment",
    };
  }
};

// Get available assets for assignment (not already assigned)
export const getAvailableAssets = async (mallkhanaId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const queryString = queryParams.toString();
    const url = `${API_URL}/asset-assignment/available-assets/${mallkhanaId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch available assets",
    };
  }
};

// Transfer asset assignment (from one employee/station to another)
export const transferAssetAssignment = async (assignmentId, transferData) => {
  try {
    const response = await axios.post(
      `${API_URL}/asset-assignment/${assignmentId}/transfer`,
      transferData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to transfer asset assignment",
    };
  }
};

// Return asset assignment (return to mallkhana)
export const returnAssetAssignment = async (assignmentId, returnData) => {
  try {
    const response = await axios.post(
      `${API_URL}/asset-assignment/${assignmentId}/return`,
      returnData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to return asset assignment",
    };
  }
};

// Get assignment history for an asset
export const getAssetAssignmentHistory = async (assetId) => {
  try {
    const response = await axios.get(
      `${API_URL}/asset-assignment/history/asset/${assetId}`,
      { headers: getAuthHeaders() }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch asset assignment history",
    };
  }
};

// Get assignment history for an employee
export const getEmployeeAssignmentHistory = async (employeeId) => {
  try {
    const response = await axios.get(
      `${API_URL}/asset-assignment/history/employee/${employeeId}`,
      { headers: getAuthHeaders() }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch employee assignment history",
    };
  }
};

// Get assignment history for a station
export const getStationAssignmentHistory = async (stationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/asset-assignment/history/station/${stationId}`,
      { headers: getAuthHeaders() }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch station assignment history",
    };
  }
};

// Get current assignments for an employee
export const getEmployeeCurrentAssignments = async (employeeId) => {
  try {
    const response = await axios.get(
      `${API_URL}/asset-assignment/current/employee/${employeeId}`,
      { headers: getAuthHeaders() }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch employee current assignments",
    };
  }
};

// Get current assignments for a station
export const getStationCurrentAssignments = async (stationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/asset-assignment/current/station/${stationId}`,
      { headers: getAuthHeaders() }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch station current assignments",
    };
  }
};

// Bulk transfer assets (transfer multiple assets at once)
export const bulkTransferAssetAssignments = async (transferData) => {
  try {
    const response = await axios.post(
      `${API_URL}/asset-assignment/bulk-transfer`,
      transferData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to bulk transfer asset assignments",
    };
  }
};

// Bulk return assets (return multiple assets at once)
export const bulkReturnAssetAssignments = async (returnData) => {
  try {
    const response = await axios.post(
      `${API_URL}/asset-assignment/bulk-return`,
      returnData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to bulk return asset assignments",
    };
  }
};