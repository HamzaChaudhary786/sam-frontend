// StatusAssignmentApi.js
import { BACKEND_URL } from "../../constants/api.js";
import { role_admin } from "../../constants/Enum.js";

const API_URL = BACKEND_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");
const getCurrentUserId = () => localStorage.getItem("userId");
const getCurrentUserType = () => localStorage.getItem("userType");

// Get all status history for a specific employee
export const getEmployeeStatusHistory = async (employeeId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/employee-status-history/employee/${employeeId}?${queryParams}`,
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
      return { success: true, data: data.history || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch status history",
      };
    }
  } catch (error) {
    console.error("Error fetching status history:", error);
    return { success: false, error: error.message };
  }
};

// Get employee's current status
export const getEmployeeCurrentStatus = async (employeeId) => {
  try {
    const response = await fetch(
      `${API_URL}/employee-status-history/employee/${employeeId}/current`,
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
      return { success: true, data: data.currentStatus || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch current status",
      };
    }
  } catch (error) {
    console.error("Error fetching current status:", error);
    return { success: false, error: error.message };
  }
};

// Create status assignment
export const createStatusAssignment = async (statusData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    
    const response = await fetch(`${API_URL}/employee-status-history`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...statusData,
        editBy: getCurrentUserId(),
        // If admin and isApproved is true, add approval data
        ...(isAdmin && statusData.isApproved
          ? {
              approvalDate: new Date(),
              isApprovedBy: getCurrentUserId(),
            }
          : {}),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.history || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to create status assignment",
      };
    }
  } catch (error) {
    console.error("Error creating status assignment:", error);
    return { success: false, error: error.message };
  }
};

// Update status assignment
export const updateStatusAssignment = async (statusId, statusData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    
    const body = JSON.stringify({
      ...statusData,
      ...(isAdmin && statusData.isApproved
        ? {
            approvalDate: new Date(),
            isApprovedBy: getCurrentUserId(),
          }
        : {
            editBy: getCurrentUserId(),
          }),
    });

    const response = await fetch(`${API_URL}/employee-status-history/${statusId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.updatedHistory || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to update status assignment",
      };
    }
  } catch (error) {
    console.error("Error updating status assignment:", error);
    return { success: false, error: error.message };
  }
};

// Delete status assignment
export const deleteStatusAssignment = async (statusId) => {
  try {
    const response = await fetch(`${API_URL}/employee-status-history/${statusId}`, {
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
        error: data.message || "Failed to delete status assignment",
      };
    }
  } catch (error) {
    console.error("Error deleting status assignment:", error);
    return { success: false, error: error.message };
  }
};

// Approve status assignment
export const approveStatusAssignment = async (statusId) => {
  try {
    const response = await fetch(
      `${API_URL}/employee-status-history/${statusId}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvedBy: getCurrentUserId(),
          approvalComment: "Status change approved by administrator",
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.approvedHistory || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to approve status assignment",
      };
    }
  } catch (error) {
    console.error("Error approving status assignment:", error);
    return { success: false, error: error.message };
  }
};

// Get pending approvals
export const getPendingStatusApprovals = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/employee-status-history/approvals/pending?${queryParams.toString()}`,
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
      return { success: true, data: data.pendingApprovals || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch pending approvals",
      };
    }
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return { success: false, error: error.message };
  }
};