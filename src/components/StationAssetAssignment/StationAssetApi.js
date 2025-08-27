// StationAssetApi.js
import { BACKEND_URL } from "../../constants/api.js";
import { role_admin } from "../../constants/Enum.js";

const API_URL = `${BACKEND_URL}/station-asset`;

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

    // Add station filter as query parameter
    queryParams.append('stationId', stationId);

    // Add additional filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    // Construct URL with stationId in the path
    const url = `${API_URL}/station/${stationId}?${queryParams.toString()}`;

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
    const response = await fetch(`${API_URL}/bulk-delete`, {
      method: "POST",
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
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approvalComment: approvalComment || "Station asset assignment approved",
        approvedBy: getCurrentUserId(),

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
          asset && asset.name && asset.name.toLowerCase() === selectedTypeName.toLowerCase()
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
  // Handle case where assets is undefined or null
  if (!assets) {
    return "No assets assigned";
  }

  // Handle single asset object
  if (!Array.isArray(assets) && assets.name) {
    return assets.name;
  }

  // Handle array of assets
  if (Array.isArray(assets) && assets.length > 0) {
    const validAssets = assets.filter(asset => asset && asset.name);
    if (validAssets.length === 0) {
      return "No valid assets";
    }
    return validAssets.map(asset => asset.name).join(", ");
  }

  // Default case
  return "No assets assigned";
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

export const addRoundHistory = async (assignmentId, roundData) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/round-station/${assignmentId}/round-station`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Date: roundData.date || new Date().toISOString(),
          Reason: roundData.reason,
          assignedRounds: roundData.assignedRounds.toString(),
          consumedRounds: roundData.consumedRounds.toString(),
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data || data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to add round history",
      };
    }
  } catch (error) {
    console.error("Error adding round history:", error);
    return { success: false, error: error.message };
  }
};

export const issueRoundsToAssignment = async (assignmentId, issueData) => {
  try {
    // First, add the round history entry
    const roundHistoryResult = await addRoundHistory(assignmentId, {
      date: issueData.date || new Date().toISOString(),
      reason: issueData.reason || "Rounds issued",
      assignedRounds: issueData.roundsIssued,
      consumedRounds: 0, // No consumption when issuing
    });

    if (!roundHistoryResult.success) {
      return roundHistoryResult;
    }

    // Then update the assignment with the new round data
    const updateData = {
      // Add any other fields you need to update
      lastRoundIssueDate: issueData.date || new Date().toISOString(),
      lastRoundIssueReason: issueData.reason || "Rounds issued",
      // You might want to update total available rounds here
      // totalAvailableRounds: existingRounds + issueData.roundsIssued,
    };

    const updateResult = await updateStationAssetAssignment(assignmentId, updateData);

    if (updateResult.success) {
      return {
        success: true,
        data: {
          assignment: updateResult.data,
          roundHistory: roundHistoryResult.data,
        },
        message: `${issueData.roundsIssued} rounds issued successfully`,
      };
    } else {
      return updateResult;
    }
  } catch (error) {
    console.error("Error issuing rounds:", error);
    return { success: false, error: error.message };
  }
};

// Consume rounds from an asset assignment
export const consumeRoundsFromAssignment = async (assignmentId, consumeData) => {
  try {
    // Add the round history entry for consumption
    const roundHistoryResult = await addRoundHistory(assignmentId, {
      date: consumeData.date || new Date().toISOString(),
      reason: consumeData.reason || "Rounds consumed",
      assignedRounds: 0, // No new assignment when consuming
      consumedRounds: consumeData.roundsConsumed,
    });

    if (!roundHistoryResult.success) {
      return roundHistoryResult;
    }

    // Update the assignment with consumption data
    const updateData = {
      lastRoundConsumeDate: consumeData.date || new Date().toISOString(),
      lastRoundConsumeReason: consumeData.reason || "Rounds consumed",
      // Mark as consumed if this is a complete consumption
      ...(consumeData.isCompleteConsumption && {
        consumedDate: consumeData.date || new Date().toISOString(),
        consumedReason: consumeData.reason || "Rounds consumed",
      }),
    };

    const updateResult = await updateStationAssetAssignment(assignmentId, updateData);

    if (updateResult.success) {
      return {
        success: true,
        data: {
          assignment: updateResult.data,
          roundHistory: roundHistoryResult.data,
        },
        message: `${consumeData.roundsConsumed} rounds consumed successfully`,
      };
    } else {
      return updateResult;
    }
  } catch (error) {
    console.error("Error consuming rounds:", error);
    return { success: false, error: error.message };
  }
};

// Transfer asset to another employee
export const transferAssetAssignment = async (assignmentId, transferData) => {
  try {
    // Add round history entry for transfer
    const roundHistoryResult = await addRoundHistory(assignmentId, {
      date: transferData.date || new Date().toISOString(),
      reason: `Asset transferred to ${transferData.newEmployeeName || 'another employee'}`,
      assignedRounds: transferData.transferRounds || 0,
      consumedRounds: 0,
    });

    if (!roundHistoryResult.success) {
      return roundHistoryResult;
    }

    // Update the assignment with transfer information
    const updateData = {
      status: "Transferred",
      transferredDate: transferData.date || new Date().toISOString(),
      transferredTo: transferData.newEmployeeId,
      transferredBy: getCurrentUserId(),
      transferReason: transferData.reason || "Asset transfer",
      condition: transferData.condition || "Good",
      ...(transferData.notes && { notes: transferData.notes }),
    };

    const updateResult = await updateStationAssetAssignment(assignmentId, updateData);

    if (updateResult.success) {
      return {
        success: true,
        data: {
          assignment: updateResult.data,
          roundStation: roundHistoryResult.data,
        },
        message: "Asset transferred successfully",
      };
    } else {
      return updateResult;
    }
  } catch (error) {
    console.error("Error transferring asset:", error);
    return { success: false, error: error.message };
  }
};

// Return asset
export const returnAssetAssignment = async (assignmentId, returnData) => {
  try {
    // Add round history entry for return (if any rounds are being returned)
    if (returnData.returnRounds && returnData.returnRounds > 0) {
      const roundHistoryResult = await addRoundHistory(assignmentId, {
        date: returnData.date || new Date().toISOString(),
        reason: "Asset returned with remaining rounds",
        assignedRounds: 0,
        consumedRounds: 0, // This might need adjustment based on your logic
      });

      if (!roundHistoryResult.success) {
        return roundHistoryResult;
      }
    }

    // Update the assignment with return information
    const updateData = {
      status: "Returned",
      returnedDate: returnData.date || new Date().toISOString(),
      returnedBy: getCurrentUserId(),
      returnReason: returnData.reason || "Asset return",
      condition: returnData.condition || "Good",
      ...(returnData.notes && { notes: returnData.notes }),
      // Add any round history if provided
      ...(returnData.roundHistory && {
        roundStation: Array.isArray(returnData.roundHistory) 
          ? returnData.roundHistory 
          : [returnData.roundHistory]
      }),
    };

    const updateResult = await updateStationAssetAssignment(assignmentId, updateData);

    if (updateResult.success) {
      return {
        success: true,
        data: updateResult.data,
        message: "Asset returned successfully",
      };
    } else {
      return updateResult;
    }
  } catch (error) {
    console.error("Error returning asset:", error);
    return { success: false, error: error.message };
  }
};