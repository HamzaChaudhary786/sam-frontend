// StatusAssignmentForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createStatusAssignment,
  updateStatusAssignment,
} from "../StatusAssignmentApi.js";
import { getStatusWithEnum } from "../../Employee/AddEmployee/Status.js";
import { role_admin } from "../../../constants/Enum.js";

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

const StatusAssignmentForm = ({
  employee,
  editingStatus,
  isOpen,
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
    lastStatus: "",
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

  // Function to build changedFields array
  // Function to build changedFields array - FIXED VERSION
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
      console.log("DOB Comparison:", {
        formDataDOB: formData.dateOfBirth,
        employeeDOB: employeeDOB,
        originalEmployeeDOB: employee.dateOfBirth,
      });

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

    console.log("Built changedFields:", changedFields);
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
      lastStatus: "",
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

    // For editing mode, we allow submission even without changes to personal info
    // For new status assignments, check if any fields are being updated
    if (!editingStatus) {
      const employeeDOB = employee.dateOfBirth
        ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
        : null;
      const hasChanges =
        (formData.currentStatus &&
          formData.currentStatus !== employee.status) ||
        (formData.dateOfBirth && formData.dateOfBirth !== employeeDOB) ||
        (formData.cnic && formData.cnic !== employee.cnic) ||
        (formData.personalNumber &&
          formData.personalNumber !==
            (employee.personalNumber || employee.pnumber));

      if (!hasChanges) {
        toast.error(
          "Please make at least one change to create a status assignment"
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const changedFields = buildChangedFields(employee, formData);

      const submitData = {
        employee: employee._id,
        editBy: currentUser._id,
        currentStatus: formData.currentStatus || employee.status,
        lastStatus: employee.status || formData.lastStatus,
        changedFields: changedFields, // Add changed fields array
        from: formData.from
          ? new Date(formData.from).toISOString()
          : new Date().toISOString(),
        to: formData.to ? new Date(formData.to).toISOString() : null,
        description: formData.description,
        disciplinaryAction: formData.disciplinaryAction,
        // Only include approval fields when editing and user is admin
        ...(editingStatus &&
          isAdmin && {
            isApproved: formData.isApproved,
            approvalComment: formData.approvalComment,
          }),
      };

      let result;
      if (editingStatus) {
        result = await updateStatusAssignment(editingStatus._id, submitData);
      } else {
        result = await createStatusAssignment(submitData);
      }

      if (result.success) {
        toast.success(
          `Status assignment ${
            editingStatus ? "updated" : "created"
          } successfully`
        );
        resetForm();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
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

  // Helper function to extract field values from changedFields
  // Updated helper functions to work with the corrected schema structure

  // Helper function to extract field values from changedFields - UPDATED
  const getChangedFieldValue = (changedFields, fieldName) => {
    if (!changedFields || !Array.isArray(changedFields)) return "";

    const field = changedFields.find(
      (field) => field.currentStatus?.toFieldName === fieldName
    );

    return field?.currentStatus?.toFieldValue || "";
  };

  // Additional helper to get the old/previous value
  const getOldFieldValue = (changedFields, fieldName) => {
    if (!changedFields || !Array.isArray(changedFields)) return "";

    const field = changedFields.find(
      (field) => field.oldStatus?.fromFieldName === fieldName
    );

    return field?.oldStatus?.fromFieldValue || "";
  };

  // Helper to check if a field was changed
  const wasFieldChanged = (changedFields, fieldName) => {
    if (!changedFields || !Array.isArray(changedFields)) return false;

    return changedFields.some(
      (field) =>
        field.currentStatus?.toFieldName === fieldName ||
        field.oldStatus?.fromFieldName === fieldName
    );
  };

  // Effect to populate form when editing
  useEffect(() => {
    if (editingStatus) {
      // Extract values from changedFields for edit mode
      const extractedDateOfBirth = getChangedFieldValue(
        editingStatus.changedFields,
        "dateOfBirth"
      );
      const extractedCnic = getChangedFieldValue(
        editingStatus.changedFields,
        "cnic"
      );
      const extractedPersonalNumber = getChangedFieldValue(
        editingStatus.changedFields,
        "personalNumber"
      );

      setFormData({
        currentStatus: editingStatus.currentStatus || "",
        lastStatus: editingStatus.lastStatus || "",
        from: editingStatus.from
          ? new Date(editingStatus.from).toISOString().split("T")[0]
          : "",
        to: editingStatus.to
          ? new Date(editingStatus.to).toISOString().split("T")[0]
          : "",
        description: editingStatus.description || "",
        isApproved: editingStatus.isApproved || false,
        approvalComment: editingStatus.approvalComment || "",
        disciplinaryAction: editingStatus.disciplinaryAction || false,
        dateOfBirth: extractedDateOfBirth,
        cnic: extractedCnic,
        personalNumber: extractedPersonalNumber,
      });
    } else {
      resetForm();
      // Set employee's current status as last status for new assignments
      if (employee?.status) {
        setFormData((prev) => ({
          ...prev,
          lastStatus: employee.status,
        }));
      }
    }
  }, [editingStatus, isOpen, employee]);

  // Effect to fetch status options when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(statusOptions).length === 0) {
      fetchStatusOptions();
    }
  }, [isOpen]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingStatus
                ? "Edit Status Assignment"
                : "New Status Assignment"}
            </h2>
            {/* <p className="text-sm text-gray-600 mt-1">
              {editingStatus ? "Update" : "Create"} status assignment for{" "}
              <span className="font-medium">
                {employee.firstName} {employee.lastName}
              </span>{" "}
              ({employee.personalNumber || employee.pnumber})
            </p> */}
            {editingStatus && !isAdmin && (
              <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">
                Note: Only administrators can modify approval settings
              </p>
            )}
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

        {/* Employee Current Information */}
        {employee && !editingStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Current Employee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Status:</span>{" "}
                  {statusOptions[employee.status] || employee.status || "N/A"}
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">DOB:</span>{" "}
                  {formatDate(employee.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">CNIC:</span>{" "}
                  {employee.cnic || "N/A"}
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Personal Number:</span>{" "}
                  {employee.personalNumber || employee.pnumber || "N/A"}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Current status will be automatically set as "Last Status". You can
              optionally update other information.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Last Status (Read Only - Employee's Current Status) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Status (Employee's Current Status) *
            </label>
            <div className="border border-gray-300 p-2 w-full rounded-lg bg-gray-50">
              <h1>
                {statusOptions[employee?.status] ||
                  statusOptions[formData.lastStatus] ||
                  employee?.status ||
                  formData.lastStatus ||
                  "N/A"}
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {editingStatus
                ? "The status the employee had previously"
                : "Automatically filled from employee's current status"}
            </p>
          </div>

          {/* Current Status (New Status) */}
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
            {isLoadingStatuses && (
              <p className="text-xs text-blue-500 mt-1">
                Loading available statuses...
              </p>
            )}
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
                <p className="text-xs text-gray-500 mt-1">
                  {editingStatus
                    ? `Original change: ${
                        getChangedFieldValue(
                          editingStatus.changedFields,
                          "dateOfBirth"
                        ) || "No change"
                      }`
                    : `Current: ${formatDate(employee?.dateOfBirth)}`}
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  {editingStatus
                    ? `Original change: ${
                        getChangedFieldValue(
                          editingStatus.changedFields,
                          "personalNumber"
                        ) || "No change"
                      }`
                    : `Current: ${
                        employee?.personalNumber || employee?.pnumber || "N/A"
                      }`}
                </p>
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
              <p className="text-xs text-gray-500 mt-1">
                {editingStatus
                  ? `Original change: ${
                      getChangedFieldValue(
                        editingStatus.changedFields,
                        "cnic"
                      ) || "No change"
                    }`
                  : `Current: ${employee?.cnic || "N/A"}`}
              </p>
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
            <p className="text-xs text-gray-500 mt-1">
              The date when this status assignment becomes effective
            </p>
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
              Leave empty for permanent status change, or set end date for
              temporary status
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
            <p className="text-xs text-gray-500 mt-1">
              Provide reason for status change, disciplinary action, promotion,
              etc.
            </p>
          </div>

          {/* Approval Fields - Only show when editing and user is admin */}
          {editingStatus && isAdmin && (
            <>
              {/* Approval Checkbox */}
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
                    Approved
                  </label>
                </div>
              </div>

              {/* Approval Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Comments *
                </label>
                <textarea
                  name="approvalComment"
                  value={formData.approvalComment}
                  onChange={handleChange}
                  placeholder="Enter detailed reason for this approval/comments..."
                  rows={2}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide approval comments or additional notes
                </p>
              </div>
            </>
          )}

          {/* Non-Admin Approval Info - Show when editing but user is not admin */}
          {editingStatus && !isAdmin && (
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Current Approval Status
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          editingStatus.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {editingStatus.isApproved
                          ? "Approved"
                          : "Pending Approval"}
                      </span>
                    </p>
                    {editingStatus.approvalComment && (
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Admin Comment:</span>{" "}
                        {editingStatus.approvalComment}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Contact an administrator to modify approval settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div
            className={`border rounded-md p-3 ${
              formData.disciplinaryAction
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex">
              <svg
                className={`w-5 h-5 mr-2 flex-shrink-0 ${
                  formData.disciplinaryAction
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3
                  className={`text-sm font-medium ${
                    formData.disciplinaryAction
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {formData.disciplinaryAction
                    ? "Disciplinary Action Notice"
                    : "Status Assignment Process"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    formData.disciplinaryAction
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}
                >
                  {formData.disciplinaryAction
                    ? "This status assignment is marked as a disciplinary action and will require special approval procedures."
                    : editingStatus
                    ? isAdmin && formData.isApproved
                      ? "This status assignment will be updated as approved and will be active immediately."
                      : "This status assignment will be updated and may require administrator approval before becoming active."
                    : "This status assignment will be created as pending approval and will need to be approved before becoming active."}
                </p>
              </div>
            </div>
          </div>

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
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingStatuses ||
                !formData.from ||
                !formData.description ||
                (editingStatus && isAdmin && !formData.approvalComment) // Only require approval comment when editing as admin
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? editingStatus
                  ? "Updating..."
                  : "Creating..."
                : editingStatus
                ? "Update Status"
                : "Create Status Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusAssignmentForm;
