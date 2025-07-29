// AssetApi.js
import { BACKEND_URL } from "../../constants/api.js";
import { role_admin } from "../../constants/Enum.js";

const API_URL = BACKEND_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");
const getCurrentUserId = () => localStorage.getItem("userId");
const getCurrentUserType = () => localStorage.getItem("userType");

// Get all asset assignments for a specific employee
export const getAllAssetAssignments = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/asset-history/employee/${
        filters.employee
      }?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch asset assignments",
      };
    }
  } catch (error) {
    console.error("Error fetching asset assignments:", error);
    return { success: false, error: error.message };
  }
};

// Get all available assets (for dropdown)
export const getAllAssets = async () => {
  try {
    const response = await fetch(`${API_URL}/asset-history/unassigned-asset`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Raw API Response:", data);
    console.log("Response Status:", response.status, response.ok);

    if (response.ok) {
      // Handle different possible response structures
      let assets = data;
      if (data.data) {
        assets = data.data;
      } else if (data.result) {
        assets = data.result;
      } else if (data.assets) {
        assets = data.assets;
      }

      // Ensure we return an array
      if (!Array.isArray(assets)) {
        console.warn("Assets data is not an array:", assets);
        assets = [];
      }

      console.log("Final Assets Array:", assets);
      return { success: true, data: assets };
    } else {
      console.error("API Error Response:", data);
      return {
        success: false,
        error: data.message || "Failed to fetch assets",
      };
    }
  } catch (error) {
    console.error("Error fetching assets:", error);
    return { success: false, error: error.message };
  }
};

// Create asset assignment
export const createAssetAssignment = async (assignmentData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    
    const response = await fetch(`${API_URL}/asset-history`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...assignmentData,
        editBy: getCurrentUserId(),
        // If admin and isApproved is true, add approval data
        ...(isAdmin && assignmentData.isApproved
          ? {
              approvalDate: new Date(),
              isApprovedBy: getCurrentUserId(),
            }
          : {}),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to create asset assignment",
      };
    }
  } catch (error) {
    console.error("Error creating asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Update asset assignment
export const updateAssetAssignment = async (assignmentId, assignmentData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    
    const body = JSON.stringify({
      ...assignmentData,
      ...(isAdmin && assignmentData.isApproved
        ? {
            approvalDate: new Date(),
            isApprovedBy: getCurrentUserId(),
          }
        : {
            editBy: getCurrentUserId(),
          }),
    });

    const response = await fetch(`${API_URL}/asset-history/${assignmentId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to update asset assignment",
      };
    }
  } catch (error) {
    console.error("Error updating asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Delete asset assignment
export const deleteAssetAssignment = async (assignmentId) => {
  try {
    const response = await fetch(`${API_URL}/asset-history/${assignmentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return {
        success: false,
        error: data.message || "Failed to delete asset assignment",
      };
    }
  } catch (error) {
    console.error("Error deleting asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Bulk delete asset assignments
export const bulkDeleteAssetAssignments = async (assignmentIds) => {
  try {
    const response = await fetch(`${API_URL}/asset-history/bulk-delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: assignmentIds,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to delete asset assignments",
      };
    }
  } catch (error) {
    console.error("Error bulk deleting asset assignments:", error);
    return { success: false, error: error.message };
  }
};

// Approve asset assignment - similar to station assignment approve pattern
export const approveAssetAssignment = async (assignmentId) => {
  try {
    const response = await fetch(
      `${API_URL}/asset-history/${assignmentId}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvedBy: getCurrentUserId(),
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to approve asset assignment",
      };
    }
  } catch (error) {
    console.error("Error approving asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Get pending asset assignment approvals
export const getPendingAssetApprovals = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/asset-history/approvals/pending?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch pending asset approvals",
      };
    }
  } catch (error) {
    console.error("Error fetching pending asset approvals:", error);
    return { success: false, error: error.message };
  }
};