// src/components/LookUpForm/BulkLookupModal.jsx
import React, { useState, useEffect } from "react";
import { lookupEnum } from "../../constants/Enum.js";
import { BACKEND_URL } from "../../constants/api.js";
import { EnumSelect } from "../SearchableDropdown.jsx";

const BulkLookupModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    lookupType: "",
    values: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewLookups, setPreviewLookups] = useState([]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        lookupType: "",
        values: "",
      });
      setError("");
      setPreviewLookups([]);
    }
  }, [isOpen]);

  // Helper function to get enum value from key/index
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

  // Helper function to get enum display name for preview
  const getEnumDisplayName = (keyOrValue) => {
    const enumValue = getEnumValue(keyOrValue);
    
    // Find the key that corresponds to this value for display
    const enumKey = Object.keys(lookupEnum).find(key => lookupEnum[key] === enumValue);
    
    // Return a formatted display name (replace underscores with spaces, capitalize)
    if (enumKey) {
      return enumKey.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return enumValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) setError("");

    // Generate preview when values change
    if (name === "values" && value.trim() && formData.lookupType) {
      generatePreview(value, formData.lookupType);
    } else if (name === "lookupType" && formData.values.trim() && value) {
      generatePreview(formData.values, value);
    } else {
      setPreviewLookups([]);
    }
  };

  const generatePreview = (valuesText, type) => {
    const lines = valuesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const preview = lines.map((name, index) => ({
      id: `preview-${index}`,
      name,
      lookupType: type,
      lookupTypeDisplay: getEnumDisplayName(type),
      isActive: true,
    }));

    setPreviewLookups(preview);
  };

  const bulkCreateLookup = async (lookups) => {
    try {
      // Debug logging
      console.log("Sending bulk lookup request with data:", lookups);
      
      const response = await fetch(`${BACKEND_URL}/lookup/bulk-lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lookups }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", data);
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating bulk lookups:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.lookupType) {
      setError("Lookup type is required");
      return;
    }

    if (!formData.values.trim()) {
      setError("At least one lookup value is required");
      return;
    }

    const lines = formData.values
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setError("Please enter at least one valid lookup name");
      return;
    }

    // Check for duplicates
    const uniqueLines = [...new Set(lines)];
    if (uniqueLines.length !== lines.length) {
      setError("Duplicate values found. Please remove duplicates.");
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
      const lookups = uniqueLines.map((name) => ({
        name,
        lookupType: properEnumValue, // Use the converted enum value
        isActive: true,
      }));

      console.log("Prepared lookups for API:", lookups);

      const response = await bulkCreateLookup(lookups);

      if (response && response.success) {
        // Reset form
        setFormData({ lookupType: "", values: "" });
        setPreviewLookups([]);

        // Close modal and notify parent
        onClose();
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response?.message || "Failed to create bulk lookups");
      }
    } catch (error) {
      console.error("Error submitting bulk form:", error);
      
      // Enhanced error handling
      let errorMessage = "Failed to create bulk lookups";
      
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
      setFormData({ lookupType: "", values: "" });
      setPreviewLookups([]);
      setError("");
      onClose();
    }
  };

  const handleClearValues = () => {
    setFormData((prev) => ({ ...prev, values: "" }));
    setPreviewLookups([]);
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Add Lookups
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add multiple lookup values at once by entering them line by line
            </p>
          </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div>
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
                    placeholder="Search and select lookups"
                  />
                </div>

                {/* Values Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter values line by line{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {formData.values && (
                      <button
                        type="button"
                        onClick={handleClearValues}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <textarea
                    name="values"
                    value={formData.values}
                    onChange={handleChange}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 font-mono text-sm"
                    required
                    disabled={loading}
                    placeholder={`Alpha cast
Beta cast
Gamma cast
Delta cast
...up to n`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter each lookup name on a separate line.
                    {formData.values && (
                      <span className="ml-1 text-blue-600">
                        (
                        {
                          formData.values
                            .split("\n")
                            .filter((line) => line.trim()).length
                        }{" "}
                        entries)
                      </span>
                    )}
                  </p>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div>
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Preview ({previewLookups.length} items)
                </h3>

                {previewLookups.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {previewLookups.map((lookup, index) => (
                      <div
                        key={lookup.id}
                        className="bg-white p-2 rounded border border-gray-200 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {lookup.name}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {lookup.lookupTypeDisplay || lookup.lookupType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <p className="text-sm">Preview will appear here</p>
                    <p className="text-xs text-gray-400">
                      Select a type and enter values
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="text-sm text-gray-600">
            {previewLookups.length > 0 && (
              <span>
                Ready to create {previewLookups.length} lookup
                {previewLookups.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
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
              disabled={
                loading ||
                !formData.lookupType ||
                !formData.values.trim() ||
                previewLookups.length === 0
              }
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
                  Creating {previewLookups.length} lookups...
                </span>
              ) : (
                `Save ${previewLookups.length} Lookup${
                  previewLookups.length !== 1 ? "s" : ""
                }`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkLookupModal;