// StatusAssignmentForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createStatusAssignment, updateStatusAssignment } from "../StatusAssignmentApi.js";
import { getStatusWithEnum } from "../../Employee/AddEmployee/Status.js";

const StatusAssignmentForm = ({ employee, editingStatus, isOpen, onSuccess, onCancel }) => {
  // State for dynamic status options
  const [statusOptions, setStatusOptions] = useState({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  const [formData, setFormData] = useState({
    currentStatus: "",
    lastStatus: "",
    from: "",
    to: "",
    description: "",
    isApproved: false,
    approvalComment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      const submitData = {
        employee: employee._id,
        currentStatus: formData.currentStatus,
        lastStatus: employee.status || formData.lastStatus,
        from: formData.from ? new Date(formData.from).toISOString() : new Date().toISOString(),
        to: formData.to ? new Date(formData.to).toISOString() : null,
        description: formData.description,
        // Only include approval fields when editing
        ...(editingStatus && {
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
          `Status assignment ${editingStatus ? "updated" : "created"} successfully`
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

  // Effect to populate form when editing
  useEffect(() => {
    if (editingStatus) {
      setFormData({
        currentStatus: editingStatus.currentStatus || "",
        lastStatus: editingStatus.lastStatus || "",
        from: editingStatus.from 
          ? new Date(editingStatus.from).toISOString().split('T')[0] 
          : "",
        to: editingStatus.to 
          ? new Date(editingStatus.to).toISOString().split('T')[0] 
          : "",
        description: editingStatus.description || "",
        isApproved: editingStatus.isApproved || false,
        approvalComment: editingStatus.approvalComment || "",
      });
    } else {
      resetForm();
      // Set employee's current status as last status for new assignments
      if (employee?.status) {
        setFormData(prev => ({
          ...prev,
          lastStatus: employee.status
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
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingStatus ? "Edit Status Assignment" : "New Status Assignment"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingStatus ? "Update" : "Create"} status assignment for{" "}
              <span className="font-medium">
                {employee.firstName} {employee.lastName}
              </span>{" "}
              ({employee.personalNumber || employee.pnumber})
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

        {/* Employee Current Status Info */}
        {employee?.status && !editingStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Current Employee Status
            </h3>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Status:</span> {statusOptions[employee.status] || employee.status}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This will be automatically set as the "Last Status" for the new assignment.
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
                : "Automatically filled from employee's current status"
              }
            </p>
          </div>

          {/* Current Status (New Status) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status *
            </label>
            <select
              name="currentStatus"
              value={formData.currentStatus}
              onChange={handleChange}
              required
              disabled={isLoadingStatuses}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingStatuses ? "Loading statuses..." : "Select new status"}
              </option>
              {Object.entries(statusOptions).map(([id, name]) => (
                <option key={id} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              The status the employee will be assigned
            </p>
            {isLoadingStatuses && (
              <p className="text-xs text-blue-500 mt-1">
                Loading available statuses...
              </p>
            )}
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
              Leave empty for permanent status change, or set end date for temporary status
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
              Provide reason for status change, disciplinary action, promotion, etc.
            </p>
          </div>

          {/* Approval Fields - Only show when editing */}
          {editingStatus && (
            <>
              {/* Approval Checkbox */}
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

          {/* Info Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Status Assignment Process
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {editingStatus 
                    ? (formData.isApproved 
                        ? "This status assignment will be updated as approved and will be active immediately."
                        : "This status assignment will be updated as pending approval and will need to be approved before becoming active.")
                    : "This status assignment will be created as pending approval and will need to be approved before becoming active."
                  }
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
                !formData.currentStatus || 
                !formData.from || 
                !formData.description ||
                (editingStatus && !formData.approvalComment) // Only require approval comment when editing
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