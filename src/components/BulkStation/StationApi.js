// Updated StationAssignmentApi.js with bulk functions
import { BACKEND_URL } from "../../constants/api.js";
import { role_admin } from "../../constants/Enum.js";

const API_URL = BACKEND_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");
const getCurrentUserId = () => localStorage.getItem("userId");
const getCurrentUserType = () => localStorage.getItem("userType");

// Get all station history for a specific employee
export const getEmployeeStationHistory = async (employeeId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/station-history/employee/${employeeId}?${queryParams.toString()}`,
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
        error: data.message || "Failed to fetch station history",
      };
    }
  } catch (error) {
    console.error("Error fetching station history:", error);
    return { success: false, error: error.message };
  }
};

// Get employee's current station
export const getEmployeeCurrentStation = async (employeeId) => {
  try {
    const response = await fetch(
      `${API_URL}/station-history/employee/${employeeId}/current`,
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
        error: data.message || "Failed to fetch current station",
      };
    }
  } catch (error) {
    console.error("Error fetching current station:", error);
    return { success: false, error: error.message };
  }
};

// Create station assignment - UPDATED VERSION
export const createStationAssignment = async (assignmentData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    
    // Debug logging
    console.log("Creating station assignment with data:", assignmentData);
    console.log("Current user type:", getCurrentUserType());
    console.log("Is admin:", isAdmin);
    
    // Ensure employeeId is present and valid
    if (!assignmentData.employeeId) {
      console.error("Employee ID is missing in assignment data");
      return {
        success: false,
        error: "Employee ID is required"
      };
    }
    
    // Prepare the request body
    const requestBody = {
      employeeId: assignmentData.employeeId,
      currentStation: assignmentData.currentStation,
      fromDate: assignmentData.fromDate,
      approvalComment: assignmentData.approvalComment || "",
      isApproved: assignmentData.isApproved || false,
      editBy: getCurrentUserId(),
      // If admin and isApproved is true, add approval data
      ...(isAdmin && assignmentData.isApproved
        ? {
            approvalDate: new Date().toISOString(),
            isApprovedBy: getCurrentUserId(),
          }
        : {}),
    };
    
    console.log("Final request body:", requestBody);
    
    const response = await fetch(`${API_URL}/station-history`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    console.log("API Response:", data);
    console.log("Response status:", response.status);

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      console.error("API Error Response:", data);
      return {
        success: false,
        error: data.message || "Failed to create station assignment",
      };
    }
  } catch (error) {
    console.error("Error creating station assignment:", error);
    return { success: false, error: error.message };
  }
};

// BULK CREATE STATION ASSIGNMENTS - NEW FUNCTION
export const bulkCreateStationAssignments = async (assignmentData) => {
  try {
    console.log("=== BULK CREATE API CALL ===");
    console.log("Assignment data:", assignmentData);
    
    // assignmentData is already formatted correctly from the component
    const formattedData = {
      editBy: getCurrentUserId(),
      employees: assignmentData // This is already in the correct format
    };
    
    console.log("Formatted data for bulk API:", formattedData);
    console.log("API URL:", `${API_URL}/station-history/bulk-create`);
    
    const response = await fetch(`${API_URL}/station-history/bulk-create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    const data = await response.json();
    
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to create bulk station assignments",
      };
    }
  } catch (error) {
    console.error("Error in bulk create:", error);
    return { success: false, error: error.message };
  }
};

// GET STATIONS WITH ENUM - NEW FUNCTION FOR BULK COMPONENT
export const getStationsWithEnum = async () => {
  try {
    const response = await fetch(`${API_URL}/stations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Handle different response structures
      let stations = [];
      
      if (data.stations && Array.isArray(data.stations)) {
        // Your API structure: { stations: [...] }
        stations = data.stations;
      } else if (data.data && Array.isArray(data.data)) {
        // Alternative structure: { data: [...] }
        stations = data.data;
      } else if (Array.isArray(data)) {
        // Direct array structure: [...]
        stations = data;
      }
      
      return { success: true, data: stations };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch stations",
      };
    }
  } catch (error) {
    console.error("Error fetching stations:", error);
    return { success: false, error: error.message };
  }
};

// Update station assignment
export const updateStationAssignment = async (assignmentId, assignmentData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    
    const body = JSON.stringify({
      ...assignmentData,
      ...(isAdmin && assignmentData.isApproved
        ? {
            approvalDate: new Date().toISOString(),
            isApprovedBy: getCurrentUserId(),
          }
        : {
            editBy: getCurrentUserId(),
          }),
    });

    const response = await fetch(`${API_URL}/station-history/${assignmentId}`, {
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
        error: data.message || "Failed to update station assignment",
      };
    }
  } catch (error) {
    console.error("Error updating station assignment:", error);
    return { success: false, error: error.message };
  }
};

// Delete station assignment
export const deleteStationAssignment = async (assignmentId) => {
  try {
    const response = await fetch(`${API_URL}/station-history/${assignmentId}`, {
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
        error: data.message || "Failed to delete station assignment",
      };
    }
  } catch (error) {
    console.error("Error deleting station assignment:", error);
    return { success: false, error: error.message };
  }
};

// Approve station assignment - similar to salary deduction approve pattern
export const approveStationAssignment = async (assignmentId) => {
  try {
    const response = await fetch(
      `${API_URL}/station-history/${assignmentId}/approve`,
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
        error: data.message || "Failed to approve station assignment",
      };
    }
  } catch (error) {
    console.error("Error approving station assignment:", error);
    return { success: false, error: error.message };
  }
};

// Get pending approvals
export const getPendingApprovals = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/station-history/approvals/pending?${queryParams.toString()}`,
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
        error: data.message || "Failed to fetch pending approvals",
      };
    }
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return { success: false, error: error.message };
  }
};