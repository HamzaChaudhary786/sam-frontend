// AchievementList.jsx - Updated with Dynamic Lookup and Admin-Only Approval Functionality
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getEmployeeAchievement, deleteAchievement, approveAchievement } from "../AchievementsApi.js";
import { getStatusWithEnum } from "../LookUp.js";
import { role_admin } from "../../../constants/Enum.js";

const AchievementList = ({ employee, onEdit, refreshTrigger }) => {
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Dynamic achievement types from API
  const [achievementTypes, setAchievementTypes] = useState({});
  const [isLoadingAchievementTypes, setIsLoadingAchievementTypes] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    achievementType: "",
    month: "",
    year: "",
  });

  // Months
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Years
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 9; i++) {
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

  // Fetch achievement types from API
  const fetchAchievementTypes = async () => {
    setIsLoadingAchievementTypes(true);
    try {
      const result = await getStatusWithEnum(); // Using your existing API function
      
      if (result.success) {
        setAchievementTypes(result.data);
        console.log("✅ Achievement types loaded:", result.data);
      } else {
        toast.error("Failed to load achievement types");
        console.error("❌ Failed to fetch achievement types:", result.error);
      }
    } catch (error) {
      toast.error("Error loading achievement types");
      console.error("❌ Error fetching achievement types:", error);
    } finally {
      setIsLoadingAchievementTypes(false);
    }
  };

  // Get achievement type display name
  const getAchievementTypeLabel = (typeId) => {
    if (!typeId) return "N/A";
    return achievementTypes[typeId] || typeId;
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    if (!employee?._id) {
      setError("No employee selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getEmployeeAchievement({ employee: employee._id });

      if (result.success) {
        let achievementsData = [];

        // Handle response based on API documentation structure
        if (result.data && result.data.achievements) {
          achievementsData = result.data.achievements;
        } else if (Array.isArray(result.data)) {
          achievementsData = result.data;
        } else if (result.data && result.data._id) {
          achievementsData = [result.data];
        }

        achievementsData = achievementsData.filter((item) => item != null && item._id);
        setAchievements(achievementsData);
      } else {
        setError(result.error || "Failed to fetch achievements");
        setAchievements([]);
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching achievements");
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (!Array.isArray(achievements)) {
      setFilteredAchievements([]);
      return;
    }

    let filtered = achievements.filter(
      (achievement) => achievement != null && typeof achievement === "object" && achievement._id
    );

    if (filters.achievementType) {
      filtered = filtered.filter((a) => a.achievementType === filters.achievementType);
    }

    if (filters.month) {
      filtered = filtered.filter((a) => {
        if (!a.createdAt) return false;
        const achievementDate = new Date(a.createdAt);
        const achievementMonth = (achievementDate.getMonth() + 1).toString().padStart(2, '0');
        return achievementMonth === filters.month;
      });
    }

    if (filters.year) {
      filtered = filtered.filter((a) => {
        if (!a.createdAt) return false;
        const achievementDate = new Date(a.createdAt);
        const achievementYear = achievementDate.getFullYear().toString();
        return achievementYear === filters.year;
      });
    }

    setFilteredAchievements(filtered);
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
      achievementType: "",
      month: "",
      year: "",
    });
  };

  // Delete achievement
  const handleDelete = async (achievementId) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can delete achievements");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this achievement?")) {
      return;
    }

    try {
      const result = await deleteAchievement(achievementId);
      if (result.success) {
        toast.success("Achievement deleted successfully");
        fetchAchievements();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Approve achievement
  const handleApprove = async (achievementId) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can approve achievements");
      return;
    }

    if (!window.confirm("Are you sure you want to approve this achievement?")) {
      return;
    }

    try {
      const result = await approveAchievement(achievementId, "Approved from list");
      if (result.success) {
        toast.success("Achievement approved successfully");
        fetchAchievements();
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
    return filters.achievementType || filters.month || filters.year;
  };

  // Effects
  useEffect(() => {
    fetchAchievementTypes();
  }, []);

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, achievements, loading]);

  useEffect(() => {
    fetchAchievements();
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
              Achievements List
            </h2>
            {!isAdmin && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Viewing in read-only mode - Contact administrator for approvals
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredAchievements.length} of {achievements.length} achievements
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
              Achievement Type
            </label>
            <select
              name="achievementType"
              value={filters.achievementType}
              onChange={handleFilterChange}
              disabled={isLoadingAchievementTypes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingAchievementTypes ? "Loading types..." : "All Types"}
              </option>
              {Object.entries(achievementTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
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

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Achievements Table */}
      <div className="overflow-x-auto">
        {filteredAchievements.length === 0 ? (
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {achievements.length === 0
                ? "No achievements found"
                : hasActiveFilters()
                ? "No achievements match your filter criteria"
                : "No achievements to display"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {achievements.length === 0 
                ? "No achievements have been recorded yet."
                : "Try adjusting your filter criteria to see more results."
              }
            </p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benefit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monitory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAchievements.map((achievement) => (
                <tr key={achievement._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getAchievementTypeLabel(achievement.achievementType)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {achievement.benefit || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        achievement.isMonitor
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {achievement.isMonitor ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {achievement.amount ? `PKR ${achievement.amount.toLocaleString()}` : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(achievement.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          achievement?.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {achievement?.isApproved ? "Approved" : "Pending"}
                      </span>
                      {achievement?.isApproved && achievement?.isApprovedBy && (
                        <div className="text-xs text-gray-500">
                          Approved by:{" "}
                          {achievement.isApprovedBy.name ||
                            achievement.isApprovedBy.firstName ||
                            "System"}
                        </div>
                      )}
                      {achievement.approvalDate && (
                        <div className="text-xs text-gray-500">
                          Approved on: {formatDate(achievement.approvalDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {!achievement?.isApproved && (
                        <>
                          {/* Approve Button - Admin Only */}
                          {isAdmin ? (
                            <button
                              onClick={() => handleApprove(achievement._id)}
                              className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                              title="Approve Achievement"
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
                              title="Only administrators can approve achievements"
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
                            onClick={() => onEdit(achievement)}
                            className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            title="Edit Achievement"
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
                              onClick={() => handleDelete(achievement._id)}
                              className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                              title="Delete Achievement"
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
                              title="Only administrators can delete achievements"
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
                      {achievement?.isApproved && (
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AchievementList;