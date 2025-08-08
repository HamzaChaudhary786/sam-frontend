// SalaryDeductionList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getEmployeeSalaryDeductions, deleteSalaryDeduction, approveSalaryDeduction } from "../SalaryDeductionApi.js";
import { getStatusWithEnum } from "../Lookup.js"; // Update with correct path to your deduction lookup file
import { role_admin } from "../../../constants/Enum.js";

const SalaryDeductionList = ({ employee, onEdit, refreshTrigger }) => {
  const [deductions, setDeductions] = useState([]);
  const [filteredDeductions, setFilteredDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Dynamic deduction types from API
  const [deductionTypes, setDeductionTypes] = useState({});
  const [isLoadingDeductionTypes, setIsLoadingDeductionTypes] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    deductionType: "",
    month: "",
    year: "",
  });

  // Months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Years (current year ± 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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

  // Fetch deduction types from API
  const fetchDeductionTypes = async () => {
    setIsLoadingDeductionTypes(true);
    try {
      const result = await getStatusWithEnum(); // Using your existing API function
      
      if (result.success) {
        setDeductionTypes(result.data);
        console.log("✅ Deduction types loaded:", result.data);
      } else {
        toast.error("Failed to load deduction types");
        console.error("❌ Failed to fetch deduction types:", result.error);
      }
    } catch (error) {
      toast.error("Error loading deduction types");
      console.error("❌ Error fetching deduction types:", error);
    } finally {
      setIsLoadingDeductionTypes(false);
    }
  };

  // Get deduction type display name
  const getDeductionTypeLabel = (typeId) => {
    if (!typeId) return "Unknown";
    return deductionTypes[typeId] || typeId;
  };

  // Fetch salary deductions
  const fetchSalaryDeductions = async () => {
    if (!employee?._id) {
      setError("No employee selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getEmployeeSalaryDeductions({ employee: employee._id });
      
      if (result.success) {
        // Ensure data is always an array
        const deductionsData = Array.isArray(result.data) ? result.data : 
                              Array.isArray(result.data?.deductions) ? result.data.deductions :
                              result.data ? [result.data] : [];
        
        setDeductions(deductionsData);
      } else {
        setError(result.error || "Failed to fetch salary deductions");
        setDeductions([]);
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching salary deductions");
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (!Array.isArray(deductions)) {
      setFilteredDeductions([]);
      return;
    }

    let filtered = [...deductions];

    if (filters.deductionType) {
      filtered = filtered.filter(d => d.deductionType === filters.deductionType);
    }

    if (filters.month) {
      filtered = filtered.filter(d => d.month === filters.month);
    }

    if (filters.year) {
      const year = parseInt(filters.year);
      filtered = filtered.filter(d => d.year === year);
    }

    setFilteredDeductions(filtered);
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
      deductionType: "",
      month: "",
      year: "",
    });
  };

  // Delete deduction
  const handleDelete = async (deductionId) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can delete salary deductions");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this salary deduction?")) {
      return;
    }

    try {
      const result = await deleteSalaryDeduction(deductionId);
      if (result.success) {
        toast.success("Salary deduction deleted successfully");
        fetchSalaryDeductions();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

   // Approve Deduction
   const handleApprove = async (deductionId) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can approve salary deductions");
      return;
    }

    if (!window.confirm("Are you sure you want to approve this salary deduction?")) {
      return;
    }

    try {
      const result = await approveSalaryDeduction(deductionId);
      if (result.success) {
        toast.success("Salary deduction approved successfully");
        fetchSalaryDeductions();
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

  // Get deduction type color class
  const getDeductionTypeColorClass = (deductionTypeId) => {
    const displayName = getDeductionTypeLabel(deductionTypeId);
    
    switch (displayName?.toLowerCase()) {
      case "fine":
        return "bg-red-100 text-red-800";
      case "loan":
        return "bg-yellow-100 text-yellow-800";
      case "advance payment":
        return "bg-blue-100 text-blue-800";
      case "insurance":
        return "bg-green-100 text-green-800";
      case "tax":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return filters.deductionType || filters.month || filters.year;
  };

  // Effects
  useEffect(() => {
    fetchDeductionTypes();
  }, []);

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, deductions, loading]);

  useEffect(() => {
    fetchSalaryDeductions();
  }, [employee, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
              Salary Deductions List
            </h2>
            {!isAdmin && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Viewing in read-only mode - Contact administrator for approvals
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredDeductions.length} of {deductions.length} deductions
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
              Deduction Type
            </label>
            <select
              name="deductionType"
              value={filters.deductionType}
              onChange={handleFilterChange}
              disabled={isLoadingDeductionTypes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingDeductionTypes ? "Loading types..." : "All Types"}
              </option>
              {Object.entries(deductionTypes).map(([id, name]) => (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
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

      {/* Deductions Table */}
      <div className="overflow-x-auto">
        {filteredDeductions.length === 0 ? (
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {deductions.length === 0
                ? "No salary deductions found"
                : hasActiveFilters()
                ? "No deductions match your filter criteria"
                : "No deductions to display"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {deductions.length === 0 
                ? "No salary deductions have been recorded yet."
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
                  Month/Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredDeductions.map((deduction) => (
                <tr key={deduction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDeductionTypeColorClass(
                        deduction.deductionType
                      )}`}
                    >
                      {getDeductionTypeLabel(deduction.deductionType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {deduction.month} {deduction.year}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {deduction.deductionReason || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {deduction.amount ? `PKR ${deduction.amount.toLocaleString()}` : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          deduction?.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {deduction?.isApproved ? "Approved" : "Pending"}
                      </span>
                      {deduction?.isApproved && deduction?.isApprovedBy && (
                        <div className="text-xs text-gray-500">
                          Approved by:{" "}
                          {deduction.isApprovedBy.name ||
                            deduction.isApprovedBy.firstName ||
                            "System"}
                        </div>
                      )}
                      {deduction.approvalDate && (
                        <div className="text-xs text-gray-500">
                          Approved on: {formatDate(deduction.approvalDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {!deduction?.isApproved && (
                        <>
                          {/* Approve Button - Admin Only */}
                          {isAdmin ? (
                            <button
                              onClick={() => handleApprove(deduction._id)}
                              className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                              title="Approve Deduction"
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
                              title="Only administrators can approve deductions"
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
                            onClick={() => onEdit(deduction)}
                            className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            title="Edit Deduction"
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
                              onClick={() => handleDelete(deduction._id)}
                              className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                              title="Delete Deduction"
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
                              title="Only administrators can delete deductions"
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
                      {deduction?.isApproved && (
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

export default SalaryDeductionList;