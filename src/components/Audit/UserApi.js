// api/UserApi.js - User API Functions for Audit Trail
import { BACKEND_URL } from "../../constants/api.js";

const API_URL = BACKEND_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken") || localStorage.getItem("token");

// Get all users with pagination and filters
export const getAllUsers = async (params = {}) => {
  try {
    const { page = 1, limit = 1000, userType } = params;
    let url = `${API_URL}/user?page=${page}&limit=${limit}`;
    
    if (userType) {
      url += `&userType=${userType}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data.users || data.user || data.data || [],
        pagination: data.pagination || null,
        message: data.message || 'Success'
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch users",
        data: [],
        pagination: null
      };
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return { 
      success: false, 
      error: error.message,
      data: [],
      pagination: null
    };
  }
};

// Get users by type (admin, clerk, etc.)
export const getUsersByType = async (userType, params = {}) => {
  try {
    const { page = 1, limit = 1000 } = params;
    
    const response = await fetch(
      `${API_URL}/user?page=${page}&limit=${limit}&userType=${userType}`,
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
      return {
        success: true,
        data: data.users || data.user || data.data || [],
        pagination: data.pagination || null,
        message: data.message || 'Success'
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch users by type",
        data: [],
        pagination: null
      };
    }
  } catch (error) {
    console.error("Error fetching users by type:", error);
    return { 
      success: false, 
      error: error.message,
      data: [],
      pagination: null
    };
  }
};

// Get users formatted for dropdown options
export const getUsersForDropdown = async () => {
  try {
    const result = await getAllUsers({ limit: 1000 });
    
    if (result.success) {
      const users = result.data || [];
      
      // Format users for dropdown
      const dropdownOptions = [
        { value: "", label: "All Users" },
        ...users.map(user => ({
          value: user._id,
          label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.username,
          userType: user.userType || 'Unknown',
          email: user.email || '',
          subtitle: `${user.userType || 'Unknown'} - ${user.email || 'No email'}`
        }))
      ];

      return {
        success: true,
        data: dropdownOptions
      };
    } else {
      return {
        success: false,
        error: result.error,
        data: [{ value: "", label: "All Users" }]
      };
    }
  } catch (error) {
    console.error("Error formatting users for dropdown:", error);
    return { 
      success: false, 
      error: error.message,
      data: [{ value: "", label: "All Users" }]
    };
  }
};

// Get unique user types for filter dropdown
export const getUserTypes = async () => {
  try {
    const result = await getAllUsers({ limit: 1000 });
    
    if (result.success) {
      const users = result.data || [];
      
      // Extract unique user types
      const userTypes = [...new Set(users.map(user => user.userType).filter(Boolean))];
      
      // Format for dropdown
      const typeOptions = [
        { value: "", label: "All User Types" },
        ...userTypes.map(type => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1) // Capitalize first letter
        }))
      ];

      return {
        success: true,
        data: typeOptions
      };
    } else {
      return {
        success: false,
        error: result.error,
        data: [{ value: "", label: "All User Types" }]
      };
    }
  } catch (error) {
    console.error("Error fetching user types:", error);
    return { 
      success: false, 
      error: error.message,
      data: [{ value: "", label: "All User Types" }]
    };
  }
};

// Helper function to format user name
export const formatUserNameFromData = (user) => {
  if (!user) return "Unknown User";
  
  const firstName = user.firstName?.trim() || "";
  const lastName = user.lastName?.trim() || "";
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  }
  
  return user.email || user.username || "Unknown User";
};