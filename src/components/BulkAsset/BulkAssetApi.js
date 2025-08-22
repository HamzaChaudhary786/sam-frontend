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

// Get all maalkhana options for dropdown
export const getMaalkhanaOptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/mallkhana`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch maalkhana options",
    };
  }
};

// Create asset batch with assets
export const createAssetBatch = async (batchData) => {
  try {
    const response = await axios.post(`${API_URL}/asset-batch/create-batch-insertion`, batchData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create asset batch",
    };
  }
};

// Get asset batches with filters
export const getAssetBatches = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.operationType) queryParams.append("operationType", filters.operationType);
    if (filters.receiveDate) queryParams.append("receiveDate", filters.receiveDate);
    if (filters.referenceNumber) queryParams.append("referenceNumber", filters.referenceNumber);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const queryString = queryParams.toString();
    const url = `${API_URL}/asset-batch${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch asset batches",
    };
  }
};

// Get single asset batch by ID
export const getAssetBatch = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/asset-batch/${id}`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch asset batch",
    };
  }
};

// Update asset batch
export const updateAssetBatch = async (id, batchData) => {
  try {
    const response = await axios.put(`${API_URL}/asset-batch/${id}`, batchData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update asset batch",
    };
  }
};

// Delete asset batch
export const deleteAssetBatch = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/asset-batch/${id}`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete asset batch",
    };
  }
};