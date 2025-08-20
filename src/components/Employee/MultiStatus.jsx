// MultiStatusAssignmentForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createStatusAssignment } from "../StatusAssignment/StatusAssignmentApi.js";
import { getStatusWithEnum } from "./AddEmployee/Status.js";
import { role_admin } from "../../constants/Enum.js";

// Add this function after your imports and before the component
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Returns format: DD/MM/YYYY
  } catch (error) {
    return "Invalid Date";
  }
};

const MultiStatusAssignmentForm = ({
  selectedEmployees = [],
  isOpen = false,
  onSuccess,
  onCancel,
}) => {
  // State for dynamic status options
  const [statusOptions, setStatusOptions] = useState({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    currentStatus: "",
    from: "",
    to: "",
    description: "",
    isApproved: false,
    approvalComment: "",
    disciplinaryAction: false,
    dateOfBirth: "",
    cnic: "",
    personalNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);

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

  // Function to get current user data from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  };

  const buildChangedFields = (employee, formData) => {
    const changedFields = [];

    // Status change
    if (formData.currentStatus && formData.currentStatus !== employee.status) {
      changedFields.push({
        oldStatus: {
          fromType: "employee",
          fromFieldName: "status",
          fromFieldValue: employee.status || null,
        },
        currentStatus: {
          toType: "employee",
          toFieldName: "status",
          toFieldValue: formData.currentStatus,
        },
      });
    }

    // Date of Birth change
    if (formData.dateOfBirth) {
      const employeeDOB = employee.dateOfBirth
        ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
        : null;
      if (formData.dateOfBirth !== employeeDOB) {
        changedFields.push({
          oldStatus: {
            fromType: "employee",
            fromFieldName: "dateOfBirth",
            fromFieldValue: employee.dateOfBirth || null,
          },
          currentStatus: {
            toType: "employee",
            toFieldName: "dateOfBirth",
            toFieldValue: formData.dateOfBirth,
          },
        });
      }
    }

    // CNIC change
    if (formData.cnic && formData.cnic !== employee.cnic) {
      changedFields.push({
        oldStatus: {
          fromType: "employee",
          fromFieldName: "cnic",
          fromFieldValue: employee.cnic || null,
        },
        currentStatus: {
          toType: "employee",
          toFieldName: "cnic",
          toFieldValue: formData.cnic,
        },
      });
    }

    // Personal Number change
    if (
      formData.personalNumber &&
      formData.personalNumber !== (employee.personalNumber || employee.pnumber)
    ) {
      changedFields.push({
        oldStatus: {
          fromType: "employee",
          fromFieldName: "personalNumber",
          fromFieldValue: employee.personalNumber || employee.pnumber || null,
        },
        currentStatus: {
          toType: "employee",
          toFieldName: "personalNumber",
          toFieldValue: formData.personalNumber,
        },
      });
    }

    return changedFields;
  };
  // Fetch status options from API
  const fetchStatusOptions = async () => {
    setIsLoadingStatuses(true);
    try {
      const result = await getStatusWithEnum();
      if (result.success) {
        setStatusOptions(result.data);
        console.log("✅ Status options loaded:", result.data);
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

  // Reset form
  const resetForm = () => {
    setFormData({
      currentStatus: "",
      from: "",
      to: "",
      description: "",
      isApproved: false,
      approvalComment: "",
      disciplinaryAction: false,
      dateOfBirth: "",
      cnic: "",
      personalNumber: "",
    });
    setProcessingResults(null);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser._id) {
      toast.error("User information not found. Please login again.");
      return;
    }

    // Check if any fields are being updated
    const hasChanges = selectedEmployees.some((employee) => {
      const employeeDOB = employee.dateOfBirth
        ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
        : null;
      return (
        (formData.currentStatus &&
          formData.currentStatus !== employee.status) ||
        (formData.dateOfBirth && formData.dateOfBirth !== employeeDOB) ||
        (formData.cnic && formData.cnic !== employee.cnic) ||
        (formData.personalNumber &&
          formData.personalNumber !==
            (employee.personalNumber || employee.pnumber))
      );
    });

    if (!hasChanges) {
      toast.error("Please make at least one change to the selected employees");
      return;
    }

    setIsSubmitting(true);
    setProcessingResults(null);

    const results = {
      successful: [],
      failed: [],
      total: selectedEmployees.length,
    };

    try {
      // Process each employee
      for (const employee of selectedEmployees) {
        try {
          const changedFields = buildChangedFields(employee, formData);

          const submitData = {
            employee: employee._id,
            editBy: currentUser._id,
            currentStatus: formData.currentStatus || employee.status, // Always include current status
            lastStatus: employee.status || null, // Current employee status becomes last status
            changedFields: changedFields, // Add changed fields array
            from: formData.from
              ? new Date(formData.from).toISOString()
              : new Date().toISOString(),
            to: formData.to ? new Date(formData.to).toISOString() : null,
            description: formData.description,
            disciplinaryAction: formData.disciplinaryAction,

            // Only include approval fields when user is admin
            ...(isAdmin && {
              isApproved: formData.isApproved,
              approvalComment: formData.approvalComment,
            }),
          };

          console.log(
            "Submitting data for employee:",
            employee.firstName,
            employee.lastName
          );
          console.log("Submit data:", submitData);

          const result = await createStatusAssignment(submitData);

          if (result.success) {
            results.successful.push({
              employee: `${employee.firstName} ${employee.lastName}`,
              personalNumber: employee.personalNumber || employee.pnumber,
              id: employee._id,
            });
          } else {
            results.failed.push({
              employee: `${employee.firstName} ${employee.lastName}`,
              personalNumber: employee.personalNumber || employee.pnumber,
              error: result.error || "Unknown error",
              id: employee._id,
            });
          }
        } catch (error) {
          results.failed.push({
            employee: `${employee.firstName} ${employee.lastName}`,
            personalNumber: employee.personalNumber || employee.pnumber,
            error: error.message || "Unknown error",
            id: employee._id,
          });
        }

        // Small delay to prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setProcessingResults(results);

      // Show appropriate toast messages
      if (results.successful.length > 0 && results.failed.length === 0) {
        toast.success(
          `✅ Successfully created status assignments for all ${results.successful.length} employees`
        );
      } else if (results.successful.length > 0 && results.failed.length > 0) {
        toast.warning(
          `⚠️ Created ${results.successful.length} assignments, failed ${results.failed.length}`
        );
      } else {
        toast.error(`❌ Failed to create status assignments for all employees`);
      }
    } catch (error) {
      console.error("Multi status assignment error:", error);
      toast.error("Error processing status assignments");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle success (close modal and reset)
  const handleSuccess = () => {
    resetForm();
    if (onSuccess) onSuccess();
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Effect to fetch status options when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(statusOptions).length === 0) {
      fetchStatusOptions();
    }
  }, [isOpen]);

  // Effect to reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Multi Status Assignment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign status to {selectedEmployees.length} selected employees
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Selected Employees List */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-3">
              Selected Employees ({selectedEmployees.length})
            </h3>
            <div className="max-h-32 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedEmployees.map((employee, index) => (
                  <div
                    key={employee._id || index}
                    className="text-sm text-blue-700"
                  >
                    <span className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="text-blue-600 ml-2">
                      ({employee.personalNumber || employee.pnumber})
                    </span>
                    <div className="text-xs text-blue-600">
                      Current Status:{" "}
                      {statusOptions[employee.status] ||
                        employee.status ||
                        "N/A"}
                    </div>
                    <div className="text-xs text-blue-600">
                      Current DOB: {formatDate(employee.dateOfBirth) || "N/A"}
                    </div>
                    <div className="text-xs text-blue-600">
                      Current CNIC: {employee.cnic || "N/A"}
                    </div>
                    <div className="text-xs text-blue-600">
                      Current Personal Number:{" "}
                      {employee.personalNumber || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Processing Results */}
          {processingResults && (
            <div className="mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Processing Results
                </h3>

                {processingResults.successful.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      ✅ Successful ({processingResults.successful.length})
                    </h4>
                    <div className="max-h-20 overflow-y-auto">
                      {processingResults.successful.map((item, index) => (
                        <div key={index} className="text-xs text-green-600">
                          {item.employee} ({item.personalNumber})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {processingResults.failed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">
                      ❌ Failed ({processingResults.failed.length})
                    </h4>
                    <div className="max-h-20 overflow-y-auto">
                      {processingResults.failed.map((item, index) => (
                        <div key={index} className="text-xs text-red-600">
                          <div>
                            {item.employee} ({item.personalNumber})
                          </div>
                          <div className="text-red-500 ml-2">
                            Error: {item.error}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Status */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status (Optional)
              </label>
              <select
                name="currentStatus"
                value={formData.currentStatus}
                onChange={handleChange}
                disabled={isLoadingStatuses}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingStatuses
                    ? "Loading statuses..."
                    : "Select new status (optional)"}
                </option>
                {Object.entries(statusOptions).map(([id, name]) => (
                  <option key={id} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if you don't want to change the status
              </p>
            </div>

            {/* Personal Information Section */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information Updates (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Personal Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="personalNumber"
                    value={formData.personalNumber}
                    onChange={handleChange}
                    placeholder="Enter personal number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* CNIC - Full Width */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNIC (Optional)
                </label>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  placeholder="Enter CNIC number (e.g., 1234512345671)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Disciplinary Action Checkbox */}
            <div className="flex flex-row gap-2 items-start">
              <input
                type="checkbox"
                name="disciplinaryAction"
                checked={formData.disciplinaryAction}
                onChange={handleChange}
                className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors mt-0.5"
              />
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700">
                  Disciplinary Action
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Check this if the status change is due to disciplinary action
                </p>
              </div>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective From Date *
              </label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective To Date (Optional)
              </label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for permanent status change
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter reason for status change..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
              />
            </div>

            {/* Admin Approval Fields */}
            {/* {isAdmin && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-row gap-2 items-center">
                    <input
                      type="checkbox"
                      name="isApproved"
                      checked={formData.isApproved}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                    />
                    <label className="block text-sm font-medium text-gray-700">
                      Pre-approve All Assignments
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Check this to automatically approve all status assignments
                  </p>
                </div>

                {formData.isApproved && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Comments *
                    </label>
                    <textarea
                      name="approvalComment"
                      value={formData.approvalComment}
                      onChange={handleChange}
                      placeholder="Enter approval comments..."
                      rows={2}
                      required={formData.isApproved}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                    />
                  </div>
                )}
              </>
            )} */}

            {/* Info Note */}
            {/* <div className={`border rounded-md p-3 ${
              formData.disciplinaryAction 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex">
                <svg 
                  className={`w-5 h-5 mr-2 flex-shrink-0 ${
                    formData.disciplinaryAction ? 'text-red-400' : 'text-yellow-400'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 className={`text-sm font-medium ${
                    formData.disciplinaryAction ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {formData.disciplinaryAction ? 'Disciplinary Action Notice' : 'Multi Status Assignment'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    formData.disciplinaryAction ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {formData.disciplinaryAction ? (
                      "All status assignments will be marked as disciplinary actions and will require special approval procedures."
                    ) : (
                      isAdmin && formData.isApproved 
                        ? "All status assignments will be created as approved and will be active immediately."
                        : "All status assignments will be created as pending approval and will need administrator approval before becoming active."
                    )}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {processingResults ? (
                <button
                  type="button"
                  onClick={handleSuccess}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isLoadingStatuses ||
                    !formData.from ||
                    !formData.description ||
                    (isAdmin &&
                      formData.isApproved &&
                      !formData.approvalComment)
                  }
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {isSubmitting
                    ? `Processing... (${selectedEmployees.length} employees)`
                    : `Create Status Assignments (${selectedEmployees.length})`}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MultiStatusAssignmentForm;
