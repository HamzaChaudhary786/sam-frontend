// AssetList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  getAllAssetAssignments, 
  deleteAssetAssignment, 
  bulkDeleteAssetAssignments,
  approveAssetAssignment 
} from "../AssetApi.js";
import { getAssetTypesWithEnum } from "../TypeLookup.js";
import { role_admin } from "../../../constants/Enum.js";

const AssetList = ({ employee, onEdit, refreshTrigger }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [assetTypes, setAssetTypes] = useState({});
  const [loadingAssetTypes, setLoadingAssetTypes] = useState(false);

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    assetType: "",
    approvalStatus: "",
  });

  // Approval status options
  const approvalStatusOptions = [
    { value: "pending", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
  ];

  // Check user role from localStorage
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const storedUserType = localStorage.getItem("userType");
        const userData = localStorage.getItem("userData");
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const currentUserType =
          storedUserType || parsedUserData?.userType || "";

        setUserType(currentUserType);
        setIsAdmin(currentUserType === role_admin);
      } catch (error) {
        console.error("Error checking user role:", error);
        setUserType("");
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // Fetch asset types from lookup
  const fetchAssetTypes = async () => {
    setLoadingAssetTypes(true);
    try {
      const result = await getAssetTypesWithEnum();
      if (result.success) {
        setAssetTypes(result.data);
        console.log("🔧 Asset types loaded:", result.data);
      } else {
        console.error("❌ Failed to fetch asset types:", result.error);
        toast.error("Failed to load asset types: " + result.error);
        // Fallback to empty object
        setAssetTypes({});
      }
    } catch (error) {
      console.error("💥 Error fetching asset types:", error);
      toast.error("Error loading asset types");
      setAssetTypes({});
    } finally {
      setLoadingAssetTypes(false);
    }
  };

  // Fetch asset assignments
  const fetchAssetAssignments = async () => {
    if (!employee?._id) {
      setError("No employee selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getAllAssetAssignments({ employee: employee._id });
      
      console.log("🔍 Raw API Response:", result); // Debug log
      
      if (result.success) {
        // Handle the correct data structure from the API response
        let assignmentsData = [];
        
        if (result.data) {
          // Check if the data has a 'history' property (pagination response)
          if (result.data.history && Array.isArray(result.data.history)) {
            assignmentsData = result.data.history;
          }
          // Check if data itself is an array
          else if (Array.isArray(result.data)) {
            assignmentsData = result.data;
          }
          // Check if data has a 'data' property that's an array
          else if (result.data.data && Array.isArray(result.data.data)) {
            assignmentsData = result.data.data;
          }
          // Single object case
          else if (typeof result.data === "object" && result.data._id) {
            assignmentsData = [result.data];
          }
          // If it's just pagination metadata with empty history
          else {
            assignmentsData = [];
          }
        }
        
        console.log("📊 Processed assignments data:", assignmentsData); // Debug log
        
        // Log first assignment to see structure (only if there are assignments)
        if (assignmentsData.length > 0) {
          console.log("🔬 First assignment structure:", assignmentsData[0]);
          console.log("🎯 First assignment assets:", assignmentsData[0].asset);
        } else {
          console.log("📝 No assignments found for this employee");
        }
        
        setAssignments(assignmentsData);
      } else {
        console.error("❌ API Error:", result.error);
        setError(result.error || "Failed to fetch asset assignments");
        setAssignments([]);
      }
    } catch (error) {
      console.error("💥 Fetch Error:", error);
      setError(error.message || "An error occurred while fetching asset assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (!Array.isArray(assignments)) {
      setFilteredAssignments([]);
      return;
    }

    let filtered = [...assignments];

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

    setFilteredAssignments(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      assetType: "",
      approvalStatus: "",
    });
  };

  // Handle checkbox selection
  const handleSelectItem = (assignmentId) => {
    setSelectedItems(prev => 
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredAssignments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAssignments.map(a => a._id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can delete asset assignments");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Please select items to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} asset assignment(s)?`)) {
      return;
    }

    try {
      const result = await bulkDeleteAssetAssignments(selectedItems);
      if (result.success) {
        toast.success(`${selectedItems.length} asset assignment(s) deleted successfully`);
        setSelectedItems([]);
        fetchAssetAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkApprove = async () => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can approve asset assignments");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Please select items to approve");
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ${selectedItems.length} asset assignment(s)?`)) {
      return;
    }
       alert("under construction");
    // try {
    //   const result = await bulkDeleteAssetAssignments(selectedItems);
    //   if (result.success) {
    //     toast.success(`${selectedItems.length} asset assignment(s) deleted successfully`);
    //     setSelectedItems([]);
    //     fetchAssetAssignments();
    //   } else {
    //     toast.error(result.error);
    //   }
    // } catch (error) {
    //   toast.error(error.message);
    // }
  };

  // Delete single assignment
  const handleDelete = async (assignmentId) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can delete asset assignments");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this asset assignment?")) {
      return;
    }

    try {
      const result = await deleteAssetAssignment(assignmentId);
      if (result.success) {
        toast.success("Asset assignment deleted successfully");
        fetchAssetAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Approve assignment
  const handleApprove = async (assignment) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can approve asset assignments");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to approve this asset assignment?"
      )
    ) {
      return;
    }

    try {
      const result = await approveAssetAssignment(assignment._id);
      if (result.success) {
        toast.success("Asset assignment approved successfully");
        fetchAssetAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
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

  // Get asset names
  const getAssetNames = (assets) => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return "No assets assigned";
    }
    
    // Filter out null/undefined assets and map to names
    const validAssets = assets.filter(asset => asset && asset.name);
    if (validAssets.length === 0) {
      return "No valid assets";
    }
    
    return validAssets.map(asset => asset.name).join(", ");
  };

  // Get asset types
  const getAssetTypes = (assets) => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return [];
    }
    
    // Filter out null/undefined assets and get unique types
    const validTypes = assets
      .filter(asset => asset && asset.type)
      .map(asset => asset.type);
    
    return [...new Set(validTypes)];
  };

  // Get approval status
  const getApprovalStatus = (assignment) => {
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

  // Check if assignment is consumed
  const isConsumed = (assignment) => {
    return assignment.consumedDate && assignment.consumedReason;
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return filters.assetType || filters.approvalStatus;
  };

  // Effects
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, assignments, loading, assetTypes]);

  useEffect(() => {
    fetchAssetAssignments();
    fetchAssetTypes(); // Fetch asset types when component mounts
  }, [employee, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Asset Assignments
            </h2>
            {!isAdmin && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Viewing in read-only mode - Contact administrator for approvals
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </span>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-end mr-10">
              <span className="text-sm text-blue-800 mr-10 ">
                {selectedItems.length} item(s) selected
              </span>
              {isAdmin ? (
                <>
                  <button
                    onClick={handleBulkApprove}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 mr-10"
                  >
                    Approve Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled
                    className="px-3 py-1 text-sm bg-gray-300 text-gray-500 rounded-md cursor-not-allowed mr-10"
                    title="Only administrators can approve assignments"
                  >
                    Approve Selected
                  </button>
                  <button
                    disabled
                    className="px-3 py-1 text-sm bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                    title="Only administrators can delete assignments"
                  >
                    Delete Selected
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              name="assetType"
              value={filters.assetType}
              onChange={handleFilterChange}
              disabled={loadingAssetTypes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
            >
              <option value="">
                {loadingAssetTypes ? "Loading asset types..." : "All Types"}
              </option>
              {Object.entries(assetTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              name="approvalStatus"
              value={filters.approvalStatus}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Status</option>
              {approvalStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Asset Assignments Table */}
      <div className="overflow-x-auto">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {assignments.length === 0
                ? "No assets assigned"
                : hasActiveFilters()
                ? "No assignments match your filter criteria"
                : "No assignments to display"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {assignments.length === 0 
                ? "No assets have been assigned to this employee yet."
                : "Try adjusting your filter criteria to see more results."
              }
            </p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredAssignments.length && filteredAssignments.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rounds (Assigned/Consumed)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => {
                const consumed = isConsumed(assignment);
                const assetTypes = getAssetTypes(assignment.asset);
                const hasWeapons = assetTypes.includes("weapons");
                const approvalStatus = getApprovalStatus(assignment);
                
                return (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(assignment._id)}
                        onChange={() => handleSelectItem(assignment._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getAssetNames(assignment.asset)}
                      </div>
                      {assignment.asset && Array.isArray(assignment.asset) && assignment.asset.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {assignment.asset
                            .filter(asset => asset && (asset.serialNumber || asset.weaponNumber))
                            .map((asset, index) => (
                              <div key={index}>
                                {asset.serialNumber && `Serial: ${asset.serialNumber}`}
                                {asset.weaponNumber && ` | Weapon: ${asset.weaponNumber}`}
                              </div>
                            ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {assignment.assignedRounds || "0"}/{assignment.consumedRounds || "0"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.assignedRounds && assignment.consumedRounds ? 
                            `${Math.max(0, (assignment.assignedRounds - assignment.consumedRounds))} remaining` : 
                            'No rounds data'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(assignment.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${approvalStatus.class}`}
                        >
                          {approvalStatus.label}
                        </span>
                        {assignment.isApproved && assignment.isApprovedBy && (
                          <div className="text-xs text-gray-500">
                            Approved by:{" "}
                            {assignment.isApprovedBy.name ||
                              assignment.isApprovedBy.firstName ||
                              "System"}
                          </div>
                        )}
                         {assignment.approvalDate && (
                          <div className="text-xs text-gray-500">
                            Approved on: {formatDate(assignment.approvalDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!assignment.isApproved && (
                          <>
                            {/* Approve Button - Admin Only */}
                            {isAdmin ? (
                              <button
                                onClick={() => handleApprove(assignment)}
                                className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                title="Approve Assignment"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Approve
                              </button>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                                title="Only administrators can approve assignments"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Approve
                              </button>
                            )}
                            
                            {/* Edit Button */}
                            <button
                              onClick={() => onEdit(assignment)}
                              className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                              title="Edit Assignment"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            
                            {/* Delete Button - Admin Only */}
                            {isAdmin ? (
                              <button
                                onClick={() => handleDelete(assignment._id)}
                                className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                title="Delete Assignment"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                                title="Only administrators can delete assignments"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            )}
                          </>
                        )}
                        {assignment.isApproved && (
                          <span className="inline-flex items-center px-3 py-1 text-xs text-gray-500 bg-gray-50 rounded-md">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Approved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetList;