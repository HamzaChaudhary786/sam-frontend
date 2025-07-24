import React, { useState, useEffect } from "react";
import { useEmployeeStatusHistory } from "../HistoryHook.js";
import { getCurrentEmployeeStatus } from "../HistoryApi.js";
import { HISTORY_STATUS_OPTIONS } from "../HistoryConstants.js";

const HistoryModal = ({ isOpen, onClose, isEdit = false, editData = null, defaultEmployeeId = null, currentEmployeeData = null }) => {
  const { createHistory, modifyHistory } = useEmployeeStatusHistory();
  
  const [loading, setLoading] = useState(false);
  const [fetchingCurrentStatus, setFetchingCurrentStatus] = useState(false);
  const [error, setError] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [formData, setFormData] = useState({
    employee: "",
    currentStatus: "",
    lastStatus: "",
    description: "",
    from: "",
    to: "",
  });

  // Fetch current employee status when modal opens with employee ID
  useEffect(() => {
    const fetchCurrentEmployeeStatus = async () => {
      console.log('Modal opened with:', { 
        defaultEmployeeId, 
        currentEmployeeData: currentEmployeeData ? 'Available' : 'Not available',
        currentEmployeeDataStatus: currentEmployeeData?.status,
        isEdit, 
        isOpen 
      }); // Debug log
      
      if (defaultEmployeeId && !isEdit && isOpen) {
        setFetchingCurrentStatus(true);
        let status = null;
        
        // First, try to use the employee data that was passed directly
        if (currentEmployeeData?.status) {
          status = currentEmployeeData.status;
          console.log('Using status from passed employee data:', status); // Debug log
        }
        
        // If no status from passed data, try the API
        if (!status) {
          try {
            const result = await getCurrentEmployeeStatus(defaultEmployeeId);
            console.log('API result for current status:', result); // Debug log
            console.log('API result data structure:', result.data); // Debug log
            
            if (result.success && result.data) {
              // The current employee status is in lastStatus field (represents their current state)
              status = result.data.lastStatus || result.data.currentStatus;
              console.log('Extracted status from API:', status); // Debug log
              console.log('Available fields in result.data:', Object.keys(result.data)); // Debug log
              
              if (!status) {
                console.log('Debugging - result.data.lastStatus:', result.data.lastStatus);
                console.log('Debugging - result.data.currentStatus:', result.data.currentStatus);
                console.log('Full result.data object:', JSON.stringify(result.data, null, 2));
              }
            }
          } catch (error) {
            console.log('Could not fetch current status from API:', error);
          }
        }
        
        if (status) {
          console.log('Final status being set:', status); // Debug log
          setCurrentStatus(status);
        } else {
          console.log('No status found from any source'); // Debug log
        }
        
        setFetchingCurrentStatus(false);
      }
    };

    fetchCurrentEmployeeStatus();
  }, [defaultEmployeeId, isEdit, isOpen, currentEmployeeData]);

  // Initialize form data for editing
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        employee: editData.employee?._id || editData.employee || "",
        currentStatus: editData.currentStatus || "",
        lastStatus: editData.lastStatus || "",
        description: editData.description || "",
        from: editData.from ? editData.from.split('T')[0] : "",
        to: editData.to ? editData.to.split('T')[0] : "",
      });
    } else if (isOpen && !isEdit) {
      // Reset form for new history record and set lastStatus when currentStatus is available
      console.log('Setting form with currentStatus:', currentStatus); // Debug log
      setFormData({
        employee: defaultEmployeeId || "",
        currentStatus: "",
        lastStatus: currentStatus || "", // Pre-fill with current status
        description: "",
        from: "",
        to: "",
      });
    }
    setError("");
  }, [isEdit, editData, isOpen, defaultEmployeeId, currentStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.employee.trim()) {
      setError("Employee ID is required");
      return false;
    }
    
    if (!formData.currentStatus && !formData.lastStatus) {
      setError("Either current status or last status must be provided");
      return false;
    }
    
    if (formData.currentStatus && formData.lastStatus) {
      setError("Cannot have both current status and last status");
      return false;
    }
    
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;
      
      // Prepare data - remove empty fields
      const submitData = {
        employee: formData.employee.trim(),
        description: formData.description.trim(),
      };

      // Add status fields only if they have values
      if (formData.currentStatus) {
        submitData.currentStatus = formData.currentStatus;
      }
      if (formData.lastStatus || currentStatus) {
        // Use formData.lastStatus if available, otherwise use currentStatus for pre-filled cases
        submitData.lastStatus = formData.lastStatus || currentStatus;
      }

      // Add date fields only if they have values
      if (formData.from) {
        submitData.from = formData.from;
      }
      if (formData.to) {
        submitData.to = formData.to;
      }

      console.log('Submitting data:', submitData); // Debug log
      
      if (isEdit) {
        result = await modifyHistory(editData._id, submitData);
      } else {
        result = await createHistory(submitData);
      }

      console.log('API Result:', result); // Debug log

      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          employee: defaultEmployeeId || "",
          currentStatus: "",
          lastStatus: "",
          description: "",
          from: "",
          to: "",
        });
        setCurrentStatus("");
      } else {
        setError(result.error || "An error occurred while saving the history record");
      }
    } catch (error) {
      console.error('Submit error:', error); // Debug log
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setCurrentStatus("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Status History" : "Add Status History"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Current Status Info Display */}
          {defaultEmployeeId && currentStatus && !isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                <strong>Current Employee Status:</strong> 
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  currentStatus === "active"
                    ? "bg-green-100 text-green-800"
                    : currentStatus === "retired"
                    ? "bg-blue-100 text-blue-800"
                    : currentStatus === "terminated"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                </span>
              </p>
              <p className="text-blue-600 text-xs mt-1">
                This will be automatically set as the "Previous Status" for the new record.
              </p>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && defaultEmployeeId && !isEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-yellow-800 text-xs">
                <strong>Debug:</strong> Employee ID: {defaultEmployeeId}, 
                Current Status: {currentStatus || 'Not loaded'}, 
                Employee Data Status: {currentEmployeeData?.status || 'Not available'},
                Form Last Status: {formData.lastStatus || 'Empty'}
              </p>
            </div>
          )}

          {/* Employee and Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                required
                disabled={!!defaultEmployeeId} // Disable if employee ID is passed
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  defaultEmployeeId ? 'bg-gray-100' : ''
                }`}
                placeholder="e.g., 507f1f77bcf86cd799439011"
              />
              <p className="text-xs text-gray-500 mt-1">
                {defaultEmployeeId 
                  ? "Employee ID is pre-filled and cannot be changed"
                  : "Enter the employee's MongoDB ObjectId"
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status *
              </label>
              <select
                name="currentStatus"
                value={formData.currentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!formData.lastStatus} // Required if lastStatus is not set
              >
                <option value="">Select new status</option>
                {HISTORY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the new status the employee is transitioning to
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Status
              </label>
              {defaultEmployeeId && currentStatus && !isEdit ? (
                // Show as read-only display when employee ID is provided
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    currentStatus === "active"
                      ? "bg-green-100 text-green-800"
                      : currentStatus === "retired"
                      ? "bg-blue-100 text-blue-800"
                      : currentStatus === "terminated"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                  </span>
                  {/* Hidden input to maintain form data */}
                  <input type="hidden" name="lastStatus" value={currentStatus} />
                </div>
              ) : (
                // Show as editable select when no employee ID or editing
                <select
                  name="lastStatus"
                  value={formData.lastStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select previous status</option>
                  {HISTORY_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {defaultEmployeeId && currentStatus && !isEdit
                  ? "Auto-filled with employee's current status (read-only)"
                  : "Choose the status the employee is transitioning from"
                }
              </p>
            </div>

            {fetchingCurrentStatus && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading current status...</span>
              </div>
            )}
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                When this status change became effective
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date (Optional)
              </label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if status is current</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Doe promoted to Senior Software Engineer or Mike Johnson terminated due to performance issues"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingCurrentStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading 
                ? (isEdit ? "Updating..." : "Adding...") 
                : (isEdit ? "Update History" : "Add History")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HistoryModal;