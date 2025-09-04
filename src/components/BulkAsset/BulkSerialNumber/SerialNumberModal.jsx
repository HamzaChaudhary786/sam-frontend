// src/components/LookUpForm/BulkLookupModal.jsx
import React, { useState, useEffect } from "react";
const SerialNumberModal = ({ isOpen, onClose, onSuccess, serialNumbers }) => {
  const [formData, setFormData] = useState({
    values: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewLookups, setPreviewLookups] = useState([]);
  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ values: serialNumbers?.join("\n") || "" });
      setError("");
      const preview = serialNumbers?.map((name, index) => ({
        id: `preview-${index}`,
        name,
        isActive: true,
      }));
      setPreviewLookups(preview || []);
    }
  }, [isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) setError("");

    // Generate preview when values change
    if (name === "values" && value.trim()) {
      generatePreview(value);
    } else {
      setPreviewLookups([]);
    }
  };

  const generatePreview = (valuesText) => {
    const lines = valuesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const preview = lines.map((name, index) => ({
      id: `preview-${index}`,
      name,
      isActive: true,
    }));

    setPreviewLookups(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.values.trim()) {
      setError("At least one serial number is required");
      return;
    }

    const lines = formData.values
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setError("Please enter at least one valid serial number");
      return;
    }

    // Check for duplicates
    const uniqueLines = [...new Set(lines)];
    if (uniqueLines.length !== lines.length) {
      setError("Duplicate values found. Please remove duplicates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // instead of API call, just return the values
      if (onSuccess) {
        onSuccess({ data: uniqueLines.map((name) => ({ name })) });
      }

      // reset and close
      setFormData({ values: "" });
      setPreviewLookups([]);
      onClose();
    } catch (error) {
      console.error("Error submitting bulk form:", error);
      setError("Failed to create bulk serails Number");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ values: "" });
      setPreviewLookups([]);
      setError("");
      onClose();
    }
  };

  const handleClearValues = () => {
    setFormData({ values: "" });
    setPreviewLookups([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Bulk Serail Number
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add multiple Serial Number values at once by entering them line by
              line
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
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Preview ({previewLookups.length} items)
                </h3>
                {previewLookups.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {previewLookups.map((lookup) => (
                      <div
                        key={lookup.id}
                        className="bg-white p-2 rounded border border-gray-200 text-sm"
                      >
                        <span className="font-medium text-gray-900">
                          {lookup.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">Preview will appear here</p>
                    <p className="text-xs text-gray-400">
                      Enter values to see preview
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
                Ready to create {previewLookups.length} Serial Number
                {previewLookups.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !formData.values.trim() ||
                previewLookups.length === 0
              }
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? `Creating ${previewLookups.length} Serial Number...`
                : `Save ${previewLookups.length} Serial Number${
                    previewLookups.length !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerialNumberModal;
