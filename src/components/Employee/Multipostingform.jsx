// MultiStationAssignmentForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createStationAssignment } from "../StationAssignment/StationAssignmentApi.js";
import { useLocationEnum } from "./AddEmployee/LocationHook.js";

const MultiStationAssignmentForm = ({ 
  selectedEmployees = [], 
  isOpen, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    currentStation: "",
    fromDate: "",
    remarks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    current: 0,
    total: 0,
    currentEmployeeName: ""
  });

  // Get location/station data
  const { locationEnum, loading: locationLoading } = useLocationEnum();

  // Reset form
  const resetForm = () => {
    setFormData({
      currentStation: "",
      fromDate: "",
      remarks: "",
    });
    setProcessingProgress({
      current: 0,
      total: 0,
      currentEmployeeName: ""
    });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for multiple employees
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      setProcessingProgress({
        current: 0,
        total: selectedEmployees.length,
        currentEmployeeName: ""
      });

      for (let i = 0; i < selectedEmployees.length; i++) {
        const employee = selectedEmployees[i];
        
        setProcessingProgress(prev => ({
          ...prev,
          current: i + 1,
          currentEmployeeName: `${employee.firstName} ${employee.lastName}`
        }));

        try {
          const submitData = {
            employee: employee._id,
            currentStation: formData.currentStation,
            lastStation: employee?.stations?._id || employee?.station, // Handle both possible station field names
            fromDate: formData.fromDate ? new Date(formData.fromDate).toISOString() : new Date().toISOString(),
            remarks: formData.remarks,
          };

          const result = await createStationAssignment(submitData);

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`${employee.firstName} ${employee.lastName}: ${result.error}`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`${employee.firstName} ${employee.lastName}: ${error.message}`);
        }

        // Small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Show results
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully created station assignments for ${successCount} employee(s)`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Created assignments for ${successCount} employee(s), failed for ${errorCount}`);
        console.log("Errors:", errors);
      } else {
        toast.error("Failed to create station assignments for all selected employees");
        console.log("All errors:", errors);
      }

      resetForm();
      onSuccess();

    } catch (error) {
      toast.error("Error creating station assignments");
      console.error("Multi station assignment error:", error);
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

  // Effect to reset form when modal opens
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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Multi Station Assignment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create station assignments for {selectedEmployees.length} selected employee(s)
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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

        {/* Selected Employees List */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 max-h-40 overflow-y-auto">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Selected Employees ({selectedEmployees.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedEmployees.map((employee, index) => (
              <div key={employee._id} className="text-sm text-blue-700">
                {index + 1}. {employee.firstName} {employee.lastName} 
                <span className="text-blue-600 ml-1">
                  ({employee.personalNumber || employee.pnumber})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        {isSubmitting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-800">
                Processing Assignments...
              </span>
              <span className="text-sm text-yellow-700">
                {processingProgress.current} / {processingProgress.total}
              </span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(processingProgress.current / processingProgress.total) * 100}%` 
                }}
              ></div>
            </div>
            {processingProgress.currentEmployeeName && (
              <p className="text-xs text-yellow-700">
                Currently processing: {processingProgress.currentEmployeeName}
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Station */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Station *
            </label>
            <select
              name="currentStation"
              value={formData.currentStation}
              onChange={handleChange}
              required
              disabled={locationLoading || isSubmitting}
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
              All selected employees will be assigned to this station
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
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              The date when these assignments become effective
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
              placeholder="Enter reason for station transfer/assignment for all selected employees..."
              rows={4}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will apply to all selected employees' station assignments
            </p>
          </div>

          {/* Info Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Multi Assignment Process
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  All station assignments will be created as pending approval and will need to be approved before becoming active. Each employee's current station will be automatically set as their "Last Station".
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
                !formData.remarks
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting
                ? "Creating Assignments..."
                : `Create ${selectedEmployees.length} Assignment${selectedEmployees.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiStationAssignmentForm;