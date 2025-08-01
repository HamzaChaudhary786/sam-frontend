// AuditApi.js - Employee Audit Trail API Functions
import { BACKEND_URL } from "../../constants/api.js";

const API_URL = BACKEND_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken") || localStorage.getItem("token");

// 1. Get employees with recent activity
export const getEmployeesWithRecentActivity = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.days) queryParams.append("days", filters.days);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.action) queryParams.append("action", filters.action);

    const response = await fetch(
      `${API_URL}/audit-employee/audit/recent-activity?${queryParams.toString()}`,
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
        data: data.data || [], 
        filters: data.filters,
        message: data.message 
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch employees with recent activity",
      };
    }
  } catch (error) {
    console.error("Error fetching employees with recent activity:", error);
    return { success: false, error: error.message };
  }
};

// 2. Get employee update records
export const getEmployeeUpdateRecords = async (employeeId, pagination = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (pagination.page) queryParams.append("page", pagination.page);
    if (pagination.limit) queryParams.append("limit", pagination.limit);

    const response = await fetch(
      `${API_URL}/audit-employee/${employeeId}/audit/updates?${queryParams.toString()}`,
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
        data: data.data,
        pagination: data.pagination,
        message: data.message 
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch employee update records",
      };
    }
  } catch (error) {
    console.error("Error fetching employee update records:", error);
    return { success: false, error: error.message };
  }
};

// 3. Get employee delete records
export const getEmployeeDeleteRecords = async (employeeId, pagination = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (pagination.page) queryParams.append("page", pagination.page);
    if (pagination.limit) queryParams.append("limit", pagination.limit);

    const response = await fetch(
      `${API_URL}/audit-employee/${employeeId}/audit/deletes?${queryParams.toString()}`,
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
        data: data.data,
        pagination: data.pagination,
        message: data.message 
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch employee delete records",
      };
    }
  } catch (error) {
    console.error("Error fetching employee delete records:", error);
    return { success: false, error: error.message };
  }
};

// 4. Get employee complete audit history
export const getEmployeeAuditHistory = async (employeeId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.action) queryParams.append("action", filters.action);

    const response = await fetch(
      `${API_URL}/audit-employee/${employeeId}/audit/history?${queryParams.toString()}`,
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
        data: data.data,
        pagination: data.pagination,
        message: data.message 
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch employee audit history",
      };
    }
  } catch (error) {
    console.error("Error fetching employee audit history:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to format date for display
export const formatAuditDate = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid Date";
  }
};

// Helper function to get action badge color
export const getActionBadgeColor = (action) => {
  switch (action?.toLowerCase()) {
    case "create":
      return "bg-green-100 text-green-800 border-green-200";
    case "update":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "delete":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Helper function to format employee name
export const formatEmployeeName = (employee) => {
  if (!employee) return "Unknown Employee";
  
  const firstName = employee.firstName?.trim() || "";
  const lastName = employee.lastName?.trim() || "";
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  }
  
  return employee.personalNumber || employee._id || "Unknown Employee";
};

// Helper function to format user name
export const formatUserName = (user) => {
  if (!user) return "Unknown User";
  
  return user.name || user.username || user.email || "Unknown User";
};