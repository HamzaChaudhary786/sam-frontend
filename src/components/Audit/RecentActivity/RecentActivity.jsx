// RecentActivityComponent.jsx - Recent Activity List with User Filter
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  getEmployeesWithRecentActivity,
  formatAuditDate,
  getActionBadgeColor,
  formatEmployeeName,
  formatUserName
} from "../AuditApi.js";
import { 
  getUsersForDropdown,
  getUserTypes
} from "../UserApi.js";

const RecentActivityComponent = ({ onEmployeeSelect }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    days: 7,
    limit: 20,
    action: "",
    userId: "", // New user filter
  });

  // User-related state
  const [userOptions, setUserOptions] = useState([{ value: "", label: "All Users" }]);
  const [userTypesOptions, setUserTypesOptions] = useState([{ value: "", label: "All User Types" }]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const result = await getUsersForDropdown();
      
      if (result.success) {
        setUserOptions(result.data);
      } else {
        console.error("Failed to fetch users:", result.error);
        toast.error("Failed to load users for filter");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch user types for future use (optional)
  const fetchUserTypes = async () => {
    try {
      const result = await getUserTypes();
      
      if (result.success) {
        setUserTypesOptions(result.data);
      }
    } catch (error) {
      console.error("Error fetching user types:", error);
    }
  };

  // Fetch employees with recent activity
  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError("");

      // Prepare filters for API call
      const apiFilters = {
        days: filters.days,
        limit: filters.limit,
        action: filters.action || undefined,
        userId: filters.userId || undefined, // Include user filter if selected
      };

      const result = await getEmployeesWithRecentActivity(apiFilters);
      
      if (result.success) {
        setEmployees(result.data || []);
      } else {
        setError(result.error || "Failed to fetch recent activity");
        setEmployees([]);
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching recent activity");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchRecentActivity();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      days: 7,
      limit: 20,
      action: "",
      userId: "",
    });
  };

  // Handle employee selection
  const handleEmployeeClick = (employee) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    }
  };

  // Get selected user name for display
  const getSelectedUserName = () => {
    if (!filters.userId) return "All Users";
    const selectedUser = userOptions.find(user => user.value === filters.userId);
    return selectedUser ? selectedUser.label : "Unknown User";
  };

  // Effects
  useEffect(() => {
    fetchUsers();
    fetchUserTypes();
    fetchRecentActivity();
  }, []); // Initial load

  // Auto-apply filters when they change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.days !== 7 || filters.limit !== 20 || filters.action !== "" || filters.userId !== "") {
        fetchRecentActivity();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Employee Activity
          </h2>
          <div className="text-sm text-gray-600">
            {employees.length} employees found
            {filters.userId && ` (filtered by: ${getSelectedUserName()})`}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={filters.days}
              onChange={(e) => handleFilterChange("days", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Results Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10 results</option>
              <option value={20}>20 results</option>
              <option value={50}>50 results</option>
              <option value={100}>100 results</option>
            </select>
          </div>

          {/* Updated Users Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by User
            </label>
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={usersLoading}
            >
              {usersLoading ? (
                <option value="">Loading users...</option>
              ) : (
                userOptions.map((user) => (
                  <option key={user.value} value={user.value}>
                    {user.label}
                  </option>
                ))
              )}
            </select>
            {usersLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading users...</p>
            )}
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              disabled={loading}
            >
              {loading ? "Loading..." : "Apply"}
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.userId || filters.action) && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filters.userId && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                User: {getSelectedUserName()}
                <button
                  onClick={() => handleFilterChange("userId", "")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.action && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Action: {filters.action}
                <button
                  onClick={() => handleFilterChange("action", "")}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Employee List */}
      <div className="p-6">
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No recent activity found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((item) => (
              <div
                key={item.employee._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                onClick={() => handleEmployeeClick(item.employee)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatEmployeeName(item.employee)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({item.employee.personalNumber})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">CNIC:</span> {item.employee.cnic || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Designation:</span> {item.employee.designation || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            item.employee.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.employee.status || "Unknown"}
                          </span>
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Last Activity:</span> {formatAuditDate(item.lastActivity)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Activity Count:</span> {item.activityCount}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Last Modified By:</span> {formatUserName(item.lastUser)}
                        </p>
                      </div>
                    </div>

                    {/* Action badges */}
                    <div className="flex flex-wrap gap-2">
                      {item.actions?.map((action, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionBadgeColor(action)}`}
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmployeeClick(item.employee);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={fetchRecentActivity}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Loading..." : "Refresh Activity"}
        </button>
      </div>
    </div>
  );
};

export default RecentActivityComponent;