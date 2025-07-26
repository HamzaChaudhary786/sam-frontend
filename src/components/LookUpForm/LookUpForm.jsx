// src/components/LookUpForm/LookUpForm.jsx
import React, { useState, useEffect } from "react";
import {
  createLookup,
  updateLookup,
  getUniqueLookupTypes,
} from "./LookUpApi.js";
import { lookupEnum } from "../../constants/Enum.js";
import { EnumSelect } from "../SearchableDropdown.jsx";

const LookupModal = ({
  isOpen,
  onClose,
  onSuccess,
  isEdit = false,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    lookupType: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get enum value from key/index (same as BulkLookupModal)
  const getEnumValue = (keyOrValue) => {
    // If it's already a valid enum value, return it
    if (Object.values(lookupEnum).includes(keyOrValue)) {
      return keyOrValue;
    }
    
    // If it's a key, get the corresponding value
    if (lookupEnum[keyOrValue]) {
      return lookupEnum[keyOrValue];
    }
    
    // If it's an index (number), get the value at that index
    if (typeof keyOrValue === 'number' || !isNaN(keyOrValue)) {
      const enumValues = Object.values(lookupEnum);
      const index = parseInt(keyOrValue);
      if (index >= 0 && index < enumValues.length) {
        return enumValues[index];
      }
    }
    
    // Return as-is if we can't determine the correct value
    return keyOrValue;
  };

  // Helper function to get enum key from value (for displaying in EnumSelect)
  const getEnumKeyFromValue = (enumValue) => {
    // Find the key that corresponds to this value
    const enumKey = Object.keys(lookupEnum).find(key => lookupEnum[key] === enumValue);
    return enumKey || enumValue;
  };

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // When editing, convert the enum value back to the key/format that EnumSelect expects
        const displayLookupType = getEnumKeyFromValue(initialData.lookupType);
        
        setFormData({
          name: initialData.name || "",
          lookupType: displayLookupType || initialData.lookupType || "",
          isActive: initialData.isActive !== false,
        });
        
        console.log("Edit mode - initialData.lookupType:", initialData.lookupType);
        console.log("Edit mode - displayLookupType for EnumSelect:", displayLookupType);
      } else {
        setFormData({
          name: "",
          lookupType: "",
          isActive: true,
        });
      }
      setError("");
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.lookupType) {
      setError("Lookup type is required");
      return;
    }

    // Convert lookupType to proper enum value
    const properEnumValue = getEnumValue(formData.lookupType);
    
    // Validate that we have a proper enum value
    if (!Object.values(lookupEnum).includes(properEnumValue)) {
      setError("Invalid lookup type selected. Please select a valid option.");
      return;
    }

    console.log("Form lookupType:", formData.lookupType);
    console.log("Converted enum value:", properEnumValue);
    console.log("Valid enum values:", Object.values(lookupEnum));

    setLoading(true);
    setError("");

    try {
      let response;

      // Prepare data with converted enum value
      const submitData = {
        ...formData,
        lookupType: properEnumValue // Use the converted enum value
      };

      console.log("Submitting data:", submitData);

      if (isEdit && initialData?._id) {
        response = await updateLookup(initialData._id, submitData);
      } else {
        response = await createLookup(submitData);
      }

      if (response && response.success) {
        // Reset form
        setFormData({ name: "", lookupType: "", isActive: true });

        // Close modal and notify parent
        onClose();
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Enhanced error handling
      let errorMessage = `Failed to ${isEdit ? "update" : "create"} lookup`;
      
      if (error.message.includes("validation failed")) {
        errorMessage = "Validation error: Please check that all values are correct and the lookup type is valid.";
      } else if (error.message.includes("enum value")) {
        errorMessage = "Invalid lookup type. Please select a different lookup type and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", lookupType: "", isActive: true });
      setError("");
      onClose();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Lookup" : "Add New Lookup"}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold disabled:opacity-50"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Lookup Type Field */}
            <div>
              <EnumSelect
                label="Lookup Type"
                name="lookupType"
                value={formData.lookupType}
                onChange={handleChange}
                enumObject={lookupEnum}
                required={true}
                placeholder="Search and select lookup type"
                disabled={loading}
              />
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                required
                disabled={loading}
                placeholder="Enter lookup name"
                maxLength={100}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Active Status
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim() || !formData.lookupType}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEdit ? "Updating..." : "Creating..."}
              </span>
            ) : isEdit ? (
              "Update Lookup"
            ) : (
              "Create Lookup"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LookupModal;