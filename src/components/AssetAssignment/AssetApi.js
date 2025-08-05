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

// Process and filter assignments (moved from component)
export const processAndFilterAssignments = (rawData, filters, assetTypes) => {
  try {
    // Handle the correct data structure from the API response
    let assignmentsData = [];
    
    if (rawData) {
      // Check if the data has a 'history' property (pagination response)
      if (rawData.history && Array.isArray(rawData.history)) {
        assignmentsData = rawData.history;
      }
      // Check if data itself is an array
      else if (Array.isArray(rawData)) {
        assignmentsData = rawData;
      }
      // Check if data has a 'data' property that's an array
      else if (rawData.data && Array.isArray(rawData.data)) {
        assignmentsData = rawData.data;
      }
      // Single object case
      else if (typeof rawData === "object" && rawData._id) {
        assignmentsData = [rawData];
      }
      // If it's just pagination metadata with empty history
      else {
        assignmentsData = [];
      }
    }

    console.log("📊 Processed assignments data:", assignmentsData);

    // Apply filters
    if (!Array.isArray(assignmentsData)) {
      return [];
    }

    let filtered = [...assignmentsData];

    if (filters.assetType) {
      filtered = filtered.filter(assignment => {
        if (!assignment.asset || !Array.isArray(assignment.asset)) {
          return false;
        }
        // Get the asset type name from the enum
        const selectedTypeName = assetTypes[filters.assetType];
        if (!selectedTypeName) return false;
        
        return assignment.asset.some(asset => 
          asset && asset.type && asset.type.toLowerCase() === selectedTypeName.toLowerCase()
        );
      });
    }

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

    return filtered;
  } catch (error) {
    console.error("Error processing assignments:", error);
    return [];
  }
};

// Bulk approve asset assignments
export const bulkApproveAssetAssignments = async (assignmentIds) => {
  try {
    const response = await fetch(`${API_URL}/asset-history/bulk-approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: assignmentIds,
        approvedBy: getCurrentUserId(),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data };
    } else {
      return {
        success: false,
        error: data.message || "Failed to approve asset assignments",
      };
    }
  } catch (error) {
    console.error("Error bulk approving asset assignments:", error);
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

// Update asset assignment - Enhanced version with more options
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

// ================================
// NEW ROUND HISTORY APIs
// ================================

// Add round history to an asset assignment
export const addRoundHistory = async (assignmentId, roundData) => {
  try {
    const response = await fetch(
      `${API_URL}/round-history/${assignmentId}/round-history`,
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

// ================================
// SPECIALIZED ACTION FUNCTIONS
// ================================

// Issue rounds to an asset assignment
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

    const updateResult = await updateAssetAssignment(assignmentId, updateData);

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

    const updateResult = await updateAssetAssignment(assignmentId, updateData);

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

    const updateResult = await updateAssetAssignment(assignmentId, updateData);

    if (updateResult.success) {
      return {
        success: true,
        data: {
          assignment: updateResult.data,
          roundHistory: roundHistoryResult.data,
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
        roundHistory: Array.isArray(returnData.roundHistory) 
          ? returnData.roundHistory 
          : [returnData.roundHistory]
      }),
    };

    const updateResult = await updateAssetAssignment(assignmentId, updateData);

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