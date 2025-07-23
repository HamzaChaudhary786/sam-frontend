// SalaryDeductionAPI.js
import { BACKEND_URL } from "../../constants/api.js";

const API_URL = BACKEND_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");
const getCurrentUserId = () => localStorage.getItem("userId");
const getCurrentUserType = () => localStorage.getItem("userType");

// Get all salary deductions
export const getAllSalaryDeductions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/salary-deductions?${queryParams.toString()}`,
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
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch salary deductions",
      };
    }
  } catch (error) {
    console.error("Error fetching salary deductions:", error);
    return { success: false, error: error.message };
  }
};

// Create salary deduction
export const createSalaryDeduction = async (deductionData) => {
  try {
    const response = await fetch(`${API_URL}/salary-deductions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...deductionData,
        editBy: getCurrentUserId(),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to create salary deduction",
      };
    }
  } catch (error) {
    console.error("Error creating salary deduction:", error);
    return { success: false, error: error.message };
  }
};

// Update salary deduction
export const updateSalaryDeduction = async (deductionId, deductionData) => {
  try {
    const isAdmin = getCurrentUserType() === "admin";
    console.log(isAdmin,"this is my boolean value")
    const body = JSON.stringify({
      ...deductionData,
      ...(isAdmin
        ? {
            approvalDate: new Date(),
            isApprovedBy: getCurrentUserId(),
          }
        : {
            editBy: getCurrentUserId(),
          }),
    });
    const response = await fetch(
      `${API_URL}/salary-deductions/${deductionId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body,
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to update salary deduction",
      };
    }
  } catch (error) {
    console.error("Error updating salary deduction:", error);
    return { success: false, error: error.message };
  }
};

// Delete salary deduction
export const deleteSalaryDeduction = async (deductionId) => {
  try {
    const response = await fetch(
      `${API_URL}/salary-deductions/${deductionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return {
        success: false,
        error: data.message || "Failed to delete salary deduction",
      };
    }
  } catch (error) {
    console.error("Error deleting salary deduction:", error);
    return { success: false, error: error.message };
  }
};

export const approveSalaryDeduction = async (deductionId) => {
  try {
    const response = await fetch(
      `${API_URL}/salary-deductions/approve/${deductionId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: getCurrentUserId(),
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to update salary deduction",
      };
    }
  } catch (error) {
    console.error("Error updating salary deduction:", error);
    return { success: false, error: error.message };
  }
};
