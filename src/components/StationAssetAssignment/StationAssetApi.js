// StationAssetApi.js
import { BACKEND_URL } from "../../constants/api.js";
import { role_admin } from "../../constants/Enum.js";

const API_URL = `${BACKEND_URL}/asset-assignments`;

// Get auth token and user info from localStorage
const getAuthToken = () => localStorage.getItem("authToken") || localStorage.getItem("token");
const getCurrentUserId = () => localStorage.getItem("userId");
const getCurrentUserType = () => localStorage.getItem("userType");

// ================================
// CORE CRUD OPERATIONS
// ================================

// Get all asset assignments for a specific station
export const getStationAssetAssignments = async (stationId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add station filter
    queryParams.append('station', stationId);

    // Add additional filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}?${queryParams.toString()}`,
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
        data: data.data?.assetAssignments || data.data || data,
        pagination: data.data?.pagination || null
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch station asset assignments",
      };
    }
  } catch (error) {
    console.error("Error fetching station asset assignments:", error);
    return { success: false, error: error.message };
  }
};

// Get single asset assignment by ID
export const getAssetAssignmentById = async (assignmentId) => {
  try {
    const response = await fetch(`${API_URL}/${assignmentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to fetch asset assignment",
      };
    }
  } catch (error) {
    console.error("Error fetching asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Create station asset assignment
export const createStationAssetAssignment = async (assignmentData) => {
  try {
    const isAdmin = getCurrentUserType() === role_admin;
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...assignmentData,
        // Track creation metadata
        createdBy: getCurrentUserId(),
        createDate: new Date().toISOString(),
        // If admin and isApproved is true, add approval data
        ...(isAdmin && assignmentData.isApproved
          ? {
              approvalDate: new Date().toISOString(),
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
        error: data.message || "Failed to create station asset assignment",
      };
    }
  } catch (error) {
    console.error("Error creating station asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Update asset assignment
export const updateStationAssetAssignment = async (assignmentId, assignmentData) => {
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

    const response = await fetch(`${API_URL}/${assignmentId}`, {
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
        error: data.message || "Failed to update station asset assignment",
      };
    }
  } catch (error) {
    console.error("Error updating station asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Delete single asset assignment
export const deleteStationAssetAssignment = async (assignmentId) => {
  try {
    const response = await fetch(`${API_URL}/${assignmentId}`, {
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
        error: data.message || "Failed to delete station asset assignment",
      };
    }
  } catch (error) {
    console.error("Error deleting station asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// ================================
// BULK OPERATIONS
// ================================

// Bulk delete asset assignments
export const bulkDeleteStationAssetAssignments = async (assignmentIds) => {
  try {
    const response = await fetch(`${API_URL}/bulk/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: assignmentIds }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to delete station asset assignments",
      };
    }
  } catch (error) {
    console.error("Error bulk deleting station asset assignments:", error);
    return { success: false, error: error.message };
  }
};

// Bulk approve asset assignments
export const bulkApproveStationAssetAssignments = async (assignmentIds, approvalComment = "") => {
  try {
    const response = await fetch(`${API_URL}/bulk/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: assignmentIds,
        approvalComment: approvalComment || "Bulk approval for station asset assignments",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to approve station asset assignments",
      };
    }
  } catch (error) {
    console.error("Error bulk approving station asset assignments:", error);
    return { success: false, error: error.message };
  }
};

// Bulk reject asset assignments
export const bulkRejectStationAssetAssignments = async (assignmentIds, approvalComment = "") => {
  try {
    const response = await fetch(`${API_URL}/bulk/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: assignmentIds,
        approvalComment: approvalComment || "Bulk rejection for station asset assignments",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to reject station asset assignments",
      };
    }
  } catch (error) {
    console.error("Error bulk rejecting station asset assignments:", error);
    return { success: false, error: error.message };
  }
};

// ================================
// APPROVAL OPERATIONS
// ================================

// Approve single asset assignment
export const approveStationAssetAssignment = async (assignmentId, approvalComment = "") => {
  try {
    const response = await fetch(`${API_URL}/${assignmentId}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approvalComment: approvalComment || "Station asset assignment approved",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to approve station asset assignment",
      };
    }
  } catch (error) {
    console.error("Error approving station asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// Reject single asset assignment
export const rejectStationAssetAssignment = async (assignmentId, approvalComment = "") => {
  try {
    const response = await fetch(`${API_URL}/${assignmentId}/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approvalComment: approvalComment || "Station asset assignment rejected",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to reject station asset assignment",
      };
    }
  } catch (error) {
    console.error("Error rejecting station asset assignment:", error);
    return { success: false, error: error.message };
  }
};

// ================================
// UTILITY FUNCTIONS
// ================================

// Get all available assets (for dropdown)
export const getAllAvailableAssets = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/assets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

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
        assets = [];
      }

      return { success: true, data: assets };
    } else {
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

// Process and filter assignments (similar to employee asset assignments)
export const processAndFilterStationAssignments = (rawData, filters, assetTypes) => {
  try {
    let assignmentsData = [];
    
    if (rawData) {
      if (Array.isArray(rawData)) {
        assignmentsData = rawData;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        assignmentsData = rawData.data;
      } else if (typeof rawData === "object" && rawData._id) {
        assignmentsData = [rawData];
      } else {
        assignmentsData = [];
      }
    }

    if (!Array.isArray(assignmentsData)) {
      return [];
    }

    let filtered = [...assignmentsData];

    // Filter by asset type
    if (filters.assetType) {
      filtered = filtered.filter(assignment => {
        if (!assignment.asset || !Array.isArray(assignment.asset)) {
          return false;
        }
        const selectedTypeName = assetTypes[filters.assetType];
        if (!selectedTypeName) return false;
        
        return assignment.asset.some(asset => 
          asset && asset.type && asset.type.toLowerCase() === selectedTypeName.toLowerCase()
        );
      });
    }

    // Filter by approval status
    if (filters.approvalStatus) {
      filtered = filtered.filter((assignment) => {
        if (filters.approvalStatus === "pending") {
          return !assignment.isApproved;
        } else if (filters.approvalStatus === "approved") {
          return assignment.isApproved === true;
        }
        return true;
      });
    }

    // Filter by date range
    if (filters.fromDate) {
      filtered = filtered.filter(assignment => 
        new Date(assignment.fromDate) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(assignment => 
        !assignment.toDate || new Date(assignment.toDate) <= new Date(filters.toDate)
      );
    }

    return filtered;
  } catch (error) {
    console.error("Error processing station assignments:", error);
    return [];
  }
};

// Get asset names helper
export const getAssetNames = (assets) => {
  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    return "No assets assigned";
  }
  
  const validAssets = assets.filter(asset => asset && asset.name);
  if (validAssets.length === 0) {
    return "No valid assets";
  }
  
  return validAssets.map(asset => asset.name).join(", ");
};

// Get asset types helper
export const getAssetTypes = (assets) => {
  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    return [];
  }
  
  const validTypes = assets
    .filter(asset => asset && asset.type)
    .map(asset => asset.type);
  
  return [...new Set(validTypes)];
};

// Get approval status helper
export const getApprovalStatus = (assignment) => {
  if (assignment.isApproved) {
    return {
      status: "approved",
      label: "Approved",
      class: "bg-green-100 text-green-800",
    };
  } else {
    return {
      status: "pending",
      label: "Pending",
      class: "bg-yellow-100 text-yellow-800",
    };
  }
};

// Format date helper
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};