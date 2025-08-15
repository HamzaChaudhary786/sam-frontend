// PendingStationApprovals.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getPendingApprovals,
  approveStationAssignment,
  deleteStationAssignment,
} from "../StationAssignment/StationAssignmentApi.js";
import { useNavigate } from "react-router-dom";


const PendingStationApprovals = ({ onEdit }) => {
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    employeeName: "",
    fromStation: "",
    toStation: "",
    dateRange: "",
  });

  // Selection state for bulk actions
  const [selectedAssignments, setSelectedAssignments] = useState(new Set());

  // Date range options
  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
  ];

    const navigate = useNavigate();
  

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPendingApprovals();

      if (result.success) {
        let assignmentsData = [];

        if (result.data) {
          if (Array.isArray(result.data)) {
            assignmentsData = result.data;
          } else if (Array.isArray(result.data.data)) {
            assignmentsData = result.data.data;
          } else if (typeof result.data === "object" && result.data._id) {
            assignmentsData = [result.data];
          }
        }

        setPendingAssignments(assignmentsData);
      } else {
        setError(result.error || "Failed to fetch pending approvals");
        setPendingAssignments([]);
      }
    } catch (error) {
      setError(
        error.message || "An error occurred while fetching pending approvals"
      );
      setPendingAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (!Array.isArray(pendingAssignments)) {
      setFilteredAssignments([]);
      return;
    }

    let filtered = [...pendingAssignments];

    // Employee name filter
    if (filters.employeeName) {
      filtered = filtered.filter((assignment) => {
        const firstName = assignment.employee?.firstName || "";
        const lastName = assignment.employee?.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName.toLowerCase().includes(filters.employeeName.toLowerCase());
      });
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter((assignment) => {
        const department = assignment.employee?.department?.name || "";
        return department.toLowerCase().includes(filters.department.toLowerCase());
      });
    }

    // From station filter
    if (filters.fromStation) {
      filtered = filtered.filter((assignment) => {
        // const fromStation = assignment.lastStation?.name || "";
        const fromStation = assignment.lastStation?.[0]?.name || "";

        return fromStation.toLowerCase().includes(filters.fromStation.toLowerCase());
      });
    }

    // To station filter
    if (filters.toStation) {
      filtered = filtered.filter((assignment) => {
        // const toStation = assignment.currentStation?.name || "";
        const toStation = assignment.currentStation?.[0]?.name || "";

        return toStation.toLowerCase().includes(filters.toStation.toLowerCase());
      });
    }

    setFilteredAssignments(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      employeeName: "",
      fromStation: "",
      toStation: "",
      dateRange: "",
    });
  };

  // Approve assignment
  const handleApprove = async (assignment) => {
    const firstName = assignment.employee?.firstName || "";
    const lastName = assignment.employee?.lastName || "";
    const employeeName = `${firstName} ${lastName}`.trim() || "this employee";
    
    if (
      !window.confirm(
        `Are you sure you want to approve the station assignment for ${employeeName}?`
      )
    ) {
      return;
    }

    try {
      const result = await approveStationAssignment(assignment._id);
      if (result.success) {
        toast.success("Station assignment approved successfully");
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Bulk approve selected assignments
  const handleBulkApprove = async (selectedIds) => {
    if (selectedIds.length === 0) {
      toast.warning("Please select assignments to approve");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to approve ${selectedIds.length} selected assignment(s)?`
      )
    ) {
      return;
    }

    try {
      const promises = selectedIds.map(id => approveStationAssignment(id));
      const results = await Promise.all(promises);
      
      const successful = results.filter(result => result.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} assignment(s) approved successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} assignment(s) failed to approve`);
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error("Error occurred during bulk approval");
    }
  };

  // Delete assignment
  const handleDelete = async (assignmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this station assignment request?"
      )
    ) {
      return;
    }

    try {
      const result = await deleteStationAssignment(assignmentId);
      if (result.success) {
        toast.success("Station assignment deleted successfully");
        setRefreshTrigger(prev => prev + 1);
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

  // Check if filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== "");
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAssignments(new Set(filteredAssignments.map(a => a._id)));
    } else {
      setSelectedAssignments(new Set());
    }
  };
  const handleBulkStationAssignment = () => {
    navigate("/bulk-station-assignment");
  };

  const handleSelectAssignment = (assignmentId, checked) => {
    const newSelected = new Set(selectedAssignments);
    if (checked) {
      newSelected.add(assignmentId);
    } else {
      newSelected.delete(assignmentId);
    }
    setSelectedAssignments(newSelected);
  };

  // Effects
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, pendingAssignments, loading]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [refreshTrigger]);

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
          <h2 className="text-xl font-bold text-gray-900">
            Transfer Posting Management
          </h2>
          {/* <div className="flex items-center space-x-4">
            {selectedAssignments.size > 0 && (
              <button
                onClick={() => handleBulkApprove(Array.from(selectedAssignments))}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Approve Selected ({selectedAssignments.size})
              </button>
            )}
              <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
            onClick={handleBulkStationAssignment}
          >
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="hidden lg:inline">Bulk Station Assignment</span>
            <span className="lg:hidden">Bulk Assignment</span>
          </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Showing {filteredAssignments.length} of {pendingAssignments.length} pending
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
          </div> */}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              type="text"
              name="employeeName"
              value={filters.employeeName}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Station
            </label>
            <input
              type="text"
              name="fromStation"
              value={filters.fromStation}
              onChange={handleFilterChange}
              placeholder="Search from station..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Station
            </label>
            <input
              type="text"
              name="toStation"
              value={filters.toStation}
              onChange={handleFilterChange}
              placeholder="Search to station..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Time</option>
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div> */}
        </div>
         <div className="flex items-center justify-end space-x-4 mt-5">
            {selectedAssignments.size > 0 && (
              <button
                onClick={() => handleBulkApprove(Array.from(selectedAssignments))}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Approve Selected ({selectedAssignments.size})
              </button>
            )}
            {/* <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Refresh
            </button> */}
              <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
            onClick={handleBulkStationAssignment}
          >
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="hidden lg:inline">Bulk Station Assignment</span>
            <span className="lg:hidden">Bulk Assignment</span>
          </button>
            <div className="flex items-center space-x-2">
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
      </div>

      {/* Content Section */}
      <div className="p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Approvals Found
            </h3>
            <p className="text-gray-600">
              {hasActiveFilters()
                ? "No pending assignments match the selected filters."
                : "All station assignment requests have been processed."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        filteredAssignments.length > 0 && 
                        selectedAssignments.size === filteredAssignments.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments?.map((assignment) => {
                  const firstName = assignment.employee?.firstName || "";
                  const lastName = assignment.employee?.lastName || "";
                  const employeeName = `${firstName} ${lastName}`.trim() || "Unknown Employee";
                  
                  return (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAssignments.has(assignment._id)}
                          onChange={(e) => handleSelectAssignment(assignment._id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {assignment.employee?.personalNumber || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rank: {assignment.employee?.rank || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Grade: {assignment.employee?.grade || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2 font-medium">
                              From:
                            </span>
                            <span className="text-gray-900">
                              {/* {assignment?.lastStation?.name || "No Previous Station"} */}
                                {assignment?.lastStation?.[0]?.name || "No Previous Station"}

                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2 font-medium">
                              To:
                            </span>
                            <span className="text-blue-900 font-semibold">
                              {/* {assignment?.currentStation?.name || "Unknown Station"} */}
                                {assignment?.currentStation?.[0]?.name || "Unknown Station"}

                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Effective: {formatDate(assignment.fromDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatDate(assignment.createdAt)}
                        </div>
                        {assignment.editBy && (
                          <div className="text-xs text-gray-500">
                            Requested by: {assignment.editBy.firstName} {assignment.editBy.lastName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="text-sm text-gray-500">
                            {assignment.remarks || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
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
                          {onEdit && (
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
                          )}
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingStationApprovals;