// StatusAssignmentList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getEmployeeStatusHistory,
  deleteStatusAssignment,
  approveStatusAssignment,
} from "../StatusAssignmentApi.js";
import { getStatusWithEnum } from "../../Employee/AddEmployee/Status.js";
import { role_admin } from "../../../constants/Enum.js";
import { usePermissions } from "../../../hook/usePermission.js";

const StatusAssignmentList = ({ employee, onEdit, refreshTrigger }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const permissions = usePermissions();
  // Dynamic status options from API
  const [statusOptions, setStatusOptions] = useState({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    approvalStatus: "",
    year: "",
    status: "",
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

  // Fetch status options from API
  const fetchStatusOptions = async () => {
    setIsLoadingStatuses(true);
    try {
      const result = await getStatusWithEnum();
      if (result.success) {
        setStatusOptions(result.data);
        console.log("✅ Status options loaded for list:", result.data);
      } else {
        toast.error("Failed to load status options");
        console.error("❌ Failed to fetch status options:", result.error);
      }
    } catch (error) {
      toast.error("Error loading status options");
      console.error("❌ Error fetching status options:", error);
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  // Get status display name (from API lookup or fallback to original value)
  const getStatusDisplayName = (statusId) => {
    if (!statusId) return "N/A";
    return statusOptions[statusId] || statusId;
  };

  // Fetch status assignments
  const fetchStatusAssignments = async () => {
    if (!employee?._id) {
      setError("No employee selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getEmployeeStatusHistory(employee._id);

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
        setError(result.error || "Failed to fetch status assignments");
        setAssignments([]);
      }
    } catch (error) {
      setError(
        error.message || "An error occurred while fetching status assignments"
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
          return (
            assignment.isApproved === null || assignment.isApproved === false
          );
        } else if (filters.approvalStatus === "approved") {
          return assignment.isApproved === true;
        }
        return true;
      });
    }

    if (filters.status) {
      filtered = filtered.filter((assignment) => {
        return assignment.currentStatus === filters.status;
      });
    }

    if (filters.year) {
      const year = parseInt(filters.year);
      filtered = filtered.filter((assignment) => {
        if (!assignment.from) return false;
        const assignmentYear = new Date(assignment.from).getFullYear();
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
      status: "",
    });
  };

  // Delete assignment
  const handleDelete = async (assignmentId) => {
    if (!isAdmin) {
      toast.error(
        "Access denied: Only administrators can delete status assignments"
      );
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete this status assignment?")
    ) {
      return;
    }

    try {
      const result = await deleteStatusAssignment(assignmentId);
      if (result.success) {
        toast.success("Status assignment deleted successfully");
        fetchStatusAssignments();
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
      toast.error(
        "Access denied: Only administrators can approve status assignments"
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to approve this status assignment?"
      )
    ) {
      return;
    }

    try {
      const result = await approveStatusAssignment(assignment._id);
      if (result.success) {
        toast.success("Status assignment approved successfully");
        fetchStatusAssignments();
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
    if (assignment.isApproved === true) {
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

  // Get status color class
  const getStatusColorClass = (status) => {
    // Get the display name for color mapping
    const displayName = getStatusDisplayName(status);

    switch (displayName?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "probation":
        return "bg-blue-100 text-blue-800";
      case "on leave":
        return "bg-purple-100 text-purple-800";
      case "suspended":
        return "bg-orange-100 text-orange-800";
      case "terminated":
      case "resigned":
        return "bg-red-100 text-red-800";
      case "retired":
        return "bg-gray-100 text-gray-800";
      case "contract":
        return "bg-indigo-100 text-indigo-800";
      case "intern":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return filters.approvalStatus || filters.year || filters.status;
  };

  // Effects
  useEffect(() => {
    fetchStatusOptions();
  }, []);

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, assignments, loading]);

  useEffect(() => {
    fetchStatusAssignments();
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
              Employee Status History
            </h2>
            {!isAdmin && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Viewing in read-only mode - Contact administrator for approvals
              </p>
            )}
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Status Type
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              disabled={isLoadingStatuses}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingStatuses ? "Loading statuses..." : "All Types"}
              </option>
              {Object.entries(statusOptions).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Status Assignments Found
            </h3>
            <p className="text-gray-600">
              {hasActiveFilters()
                ? "No assignments match the selected filters."
                : "This employee has no status assignment history yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2 font-medium">
                              From:
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClass(
                                assignment.lastStatus
                              )}`}
                            >
                              {getStatusDisplayName(assignment.lastStatus)}
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
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClass(
                                assignment.currentStatus
                              )}`}
                            >
                              {getStatusDisplayName(assignment.currentStatus) ||
                                "Unknown Status"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            From: {formatDate(assignment.from)}
                          </div>
                          <div className="text-gray-500">
                            To:{" "}
                            {assignment.to
                              ? formatDate(assignment.to)
                              : "Ongoing"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
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
                          {assignment.disciplinaryAction && (
                            <div className="text-xs text-red-500">
                              Disciplinary Action
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="mb-2">{assignment.description}</div>
                          {assignment.approvalComment && (
                            <div className="text-xs text-gray-500 border-l-2 border-gray-200 pl-2">
                              <span className="font-medium">
                                Admin Comment:
                              </span>{" "}
                              {assignment.approvalComment}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {!assignment.isApproved && (
                            <>
                              {/* Approve Button - Admin Only */}
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

                              {/* Edit Button */}
                              {permissions?.userData?.roles?.some((role) =>
                                role.accessRequirement?.some(
                                  (access) =>
                                    access.resourceName.toLowerCase() ===
                                      "employee" && access.canEdit === true
                                )
                              ) && (
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

                              {/* Delete Button - Admin Only */}
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

export default StatusAssignmentList;
