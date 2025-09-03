// StationAssignmentForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createStationAssignment,
  updateStationAssignment,
} from "../StationAssignmentApi.js";
import { useLocationEnum } from "../../../components/Employee/AddEmployee/LocationHook.js";
import { usePermissions } from "../../../hook/usePermission.js";

const StationAssignmentForm = ({
  employee,
  editingAssignment,
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    currentStation: "",
    lastStation: "",
    fromDate: "",
    remarks: "",
    isApproved: false,
    approvalComment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const permissions = usePermissions();

  // Get location/station data
  const { locationEnum, loading: locationLoading } = useLocationEnum();

  // Reset form
  const resetForm = () => {
    setFormData({
      currentStation: "",
      lastStation: "",
      fromDate: "",
      remarks: "",
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
        currentStation: formData.currentStation,
        lastStation: employee?.stations?._id,
        fromDate: formData.fromDate
          ? new Date(formData.fromDate).toISOString()
          : new Date().toISOString(),
        remarks: formData.remarks,
        // Only include approval fields when editing
        ...(editingAssignment && {
          isApproved: formData.isApproved,
          approvalComment: formData.approvalComment,
        }),
      };

      let result;
      if (editingAssignment) {
        result = await updateStationAssignment(
          editingAssignment._id,
          submitData
        );
      } else {
        result = await createStationAssignment(submitData);
      }

      if (result.success) {
        toast.success(
          `Station assignment ${
            editingAssignment ? "updated" : "created"
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

  // Effect to populate form when editing or set employee's current station as last station
  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        currentStation: editingAssignment.currentStation?._id || "",
        lastStation: editingAssignment.lastStation?._id || "",
        fromDate: editingAssignment.fromDate
          ? new Date(editingAssignment.fromDate).toISOString().split("T")[0]
          : "",
        remarks: editingAssignment.remarks || "",
        isApproved: editingAssignment.isApproved || false,
        approvalComment: editingAssignment.approvalComment || "",
      });
    } else {
      resetForm();
      // Set employee's current station as last station for new assignments
      if (employee?.station) {
        setFormData((prev) => ({
          ...prev,
          lastStation: employee.station,
        }));
      }
    }
  }, [editingAssignment, isOpen, employee]);

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
              {editingAssignment
                ? "Edit Station Assignment"
                : "New Station Assignment"}
            </h2>
            {/* <p className="text-sm text-gray-600 mt-1">
              {editingAssignment ? "Update" : "Create"} station assignment for{" "}
              <span className="font-medium">
                {employee.firstName} {employee.lastName}
              </span>{" "}
              ({employee.personalNumber || employee.pnumber})
            </p> */}
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

        {/* Employee Current Station Info */}
        {employee?.station && !editingAssignment && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Current Employee Station
            </h3>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Station:</span>{" "}
              {locationEnum[employee.station] || "Unknown Station"}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This will be automatically set as the "Last Station" for the new
              assignment.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Last Station (Read Only - Employee's Current Station) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Station (Employee's Current Station) *
            </label>
            <div className="border border-gray-300 p-2 w-full rounded-lg">
              <h1> {employee?.stations?.name} </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {editingAssignment
                ? "The station where the employee was previously assigned"
                : "Automatically filled from employee's current station"}
            </p>
          </div>

          {/* Current Station (New Station) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Station *
            </label>
            <select
              name="currentStation"
              value={formData.currentStation}
              onChange={handleChange}
              required
              disabled={locationLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              <option value="">
                {locationLoading ? "Loading stations..." : "Select new station"}
              </option>
              {Object.entries(locationEnum).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              The station where the employee will be assigned
            </p>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective From Date *
            </label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              The date when this assignment becomes effective
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks *
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter reason for station transfer/assignment..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide reason for transfer, project requirements, etc.
            </p>
          </div>

          {/* Approval Fields - Only show when editing */}
          {editingAssignment &&
            permissions?.userData?.roles?.some((role) =>
              role.accessRequirement?.some(
                (access) =>
                  access.resourceName.toLowerCase() === "employee" &&
                  access.canApprove === true
              )
            ) && (
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
              <svg
                className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0"
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
                <h3 className="text-sm font-medium text-yellow-800">
                  Assignment Process
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {editingAssignment
                    ? formData.isApproved
                      ? "This assignment will be updated as approved and will be active immediately."
                      : "This assignment will be updated as pending approval and will need to be approved before becoming active."
                    : "This assignment will be created as pending approval and will need to be approved before becoming active."}
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
                !formData.currentStation ||
                !formData.fromDate ||
                !formData.remarks ||
                (editingAssignment && !formData.approvalComment) // Only require approval comment when editing
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? editingAssignment
                  ? "Updating..."
                  : "Creating..."
                : editingAssignment
                ? "Update Assignment"
                : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationAssignmentForm;
