// StationAssignmentList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getEmployeeStationHistory,
  deleteStationAssignment,
  approveStationAssignment,
} from "../StationAssignmentApi.js";
import ClickableStationName from "../../Station/ClickableStationView.jsx"; // Adjust path as needed
import { usePermissions } from "../../../hook/usePermission.js";

const StationAssignmentList = ({ employee, onEdit, refreshTrigger }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const permissions = usePermissions()

  // Filter state
  const [filters, setFilters] = useState({
    approvalStatus: "",
    year: "",
  });

  // Approval status options
  const approvalStatusOptions = [
    { value: "pending", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
  ];

  // Years for filtering
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  // Fetch station assignments
  const fetchStationAssignments = async () => {
    if (!employee?._id) {
      setError("No employee selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getEmployeeStationHistory(employee._id);

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

        setAssignments(assignmentsData);
      } else {
        setError(result.error || "Failed to fetch station assignments");
        setAssignments([]);
      }
    } catch (error) {
      setError(
        error.message || "An error occurred while fetching station assignments"
      );
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

    if (filters.year) {
      const year = parseInt(filters.year);
      filtered = filtered.filter((assignment) => {
        if (!assignment.fromDate) return false;
        const assignmentYear = new Date(assignment.fromDate).getFullYear();
        return assignmentYear === year;
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
      approvalStatus: "",
      year: "",
    });
  };

  // Delete assignment
  const handleDelete = async (assignmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this station assignment?"
      )
    ) {
      return;
    }

    try {
      const result = await deleteStationAssignment(assignmentId);
      if (result.success) {
        toast.success("Station assignment deleted successfully");
        fetchStationAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Approve assignment - simplified without popup
  const handleApprove = async (assignment) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this station assignment?"
      )
    ) {
      return;
    }

    try {
      const result = await approveStationAssignment(assignment._id);
      if (result.success) {
        toast.success("Station assignment approved successfully");
        fetchStationAssignments();
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

  // Check if filters are active
  const hasActiveFilters = () => {
    return filters.approvalStatus || filters.year;
  };

  // Effects
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, assignments, loading]);

  useEffect(() => {
    fetchStationAssignments();
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
          <h2 className="text-xl font-bold text-gray-900">
            Employee Transfer Posting
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredAssignments.length} of {assignments.length}{" "}
              assignments
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

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Years</option>
              {getYearOptions().map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Station Assignments Found
            </h3>
            <p className="text-gray-600">
              {hasActiveFilters()
                ? "No assignments match the selected filters."
                : "This employee has no station assignment history yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {filteredAssignments.map((assignment) => {
                  const approvalStatus = getApprovalStatus(assignment);
                  return (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2 font-medium">
                              From:
                            </span>
                            <ClickableStationName
                              station={assignment.lastStation}
                              className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                            >
                              {assignment.lastStation?.name ||
                                "No Previous Station"}
                            </ClickableStationName>
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
                            <ClickableStationName
                              station={assignment.currentStation}
                              className="text-blue-900 font-semibold hover:text-blue-700 cursor-pointer hover:underline"
                            >
                              {assignment.currentStation?.name ||
                                "Unknown Station"}
                            </ClickableStationName>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatDate(assignment.fromDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(assignment.createdAt)}
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
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="mt-1 text-md text-gray-500 border-gray-200 pl-2">
                            {assignment.approvalComment
                              ? assignment.approvalComment
                              : "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {!assignment.isApproved && (
                            <>
                              {permissions?.userData?.roles?.some((role) =>
                                role.accessRequirement?.some(
                                  (access) =>
                                    access.resourceName.toLowerCase() ===
                                    "employee" && access.canApprove === true
                                )
                              ) && (
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
                                )}
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
                              {permissions?.userData?.roles?.some((role) =>
                                role.accessRequirement?.some(
                                  (access) =>
                                    access.resourceName.toLowerCase() ===
                                    "employee" && access.canDelete === true
                                )
                              ) && (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default StationAssignmentList;
