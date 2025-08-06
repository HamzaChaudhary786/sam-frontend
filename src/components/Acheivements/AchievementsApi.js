// AchievementAPI.js - Updated with Approval Functionality
import { BACKEND_URL } from "../../constants/api.js";
import { role_admin } from "../../constants/Enum.js";

const API_URL = BACKEND_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");
const getCurrentUserId = () => localStorage.getItem("userId");
const getCurrentUserType = () => localStorage.getItem("userType");

// Get all achievements
export const getAllAchievements = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/achievements?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch achievements' };
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return { success: false, error: error.message };
  }
};

export const getEmployeeAchievement = async (employeeId, filters = {}) => {
  try {
    // Validate employeeId
    if (!employeeId) {
      return {
        success: false,
        error: "Employee ID is required",
      };
    }

    let validEmployeeId;

    // Handle different formats of employeeId
    if (typeof employeeId === 'string') {
      validEmployeeId = employeeId;
    } else if (typeof employeeId === 'object') {
      // Handle case where employeeId is an object like {employee: 'id'} or {_id: 'id'}
      validEmployeeId = employeeId.employee || employeeId._id || employeeId.id;
    }
    
    if (!validEmployeeId || typeof validEmployeeId !== 'string') {
      console.error("Invalid employee ID format:", employeeId);
      return {
        success: false,
        error: "Invalid employee ID format - expected string but got: " + typeof employeeId,
      };
    }

    console.log("Fetching deductions for employee ID:", validEmployeeId); // Debug log

    const queryParams = new URLSearchParams();

    // Add other filters to query params (excluding employeeId since it's in the path)
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    // Build URL with employee ID in the path
    const queryString = queryParams.toString();
    const url = queryString 
      ? `${API_URL}/achievements/${validEmployeeId}?${queryString}`
      : `${API_URL}/achievements/${validEmployeeId}`;

    console.log("API URL:", url); // Debug log

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch employee salary deductions",
      };
    }
  } catch (error) {
    console.error("Error fetching employee salary deductions:", error);
    return { success: false, error: error.message };
  }
};

// Create achievement
export const createAchievement = async (achievementData) => {
  try {
    const response = await fetch(`${API_URL}/achievements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...achievementData,
        editBy: getCurrentUserId()
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data };
    } else {
      return { success: false, error: data.message || 'Failed to create achievement' };
    }
  } catch (error) {
    console.error('Error creating achievement:', error);
    return { success: false, error: error.message };
  }
};

// Update achievement
export const updateAchievement = async (achievementId, achievementData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    console.log(isAdmin, "this is my boolean value for achievement");
    
    const body = JSON.stringify({
      ...achievementData,
      ...(isAdmin
        ? {
            approvalDate: new Date(),
            isApprovedBy: getCurrentUserId(),
          }
        : {
            editBy: getCurrentUserId(),
          }),
    });

    const response = await fetch(`${API_URL}/achievements/${achievementId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data };
    } else {
      return { success: false, error: data.message || 'Failed to update achievement' };
    }
  } catch (error) {
    console.error('Error updating achievement:', error);
    return { success: false, error: error.message };
  }
};

// Delete achievement
export const deleteAchievement = async (achievementId) => {
  try {
    const response = await fetch(`${API_URL}/achievements/${achievementId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.message || 'Failed to delete achievement' };
    }
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return { success: false, error: error.message };
  }
};

// Approve achievement
export const approveAchievement = async (achievementId, approvalComment) => {
  try {
    const response = await fetch(
      `${API_URL}/achievements/${achievementId}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: getCurrentUserId(),
          approvalComment: approvalComment || "Approved"
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to approve achievement",
      };
    }
  } catch (error) {
    console.error("Error approving achievement:", error);
    return { success: false, error: error.message };
  }
};