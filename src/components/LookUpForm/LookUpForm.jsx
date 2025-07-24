// src/components/LookUpForm/LookUpForm.jsx
import React, { useState, useEffect } from 'react';
import { createLookup, updateLookup, getUniqueLookupTypes } from './LookUpApi.js';

const LookupModal = ({
  isOpen,
  onClose,
  onSuccess,
  isEdit = false,
  initialData = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    lookupType: '',
    isActive: true,
  });
  const [lookupTypes, setLookupTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [error, setError] = useState('');

  // FIXED: Fetch ALL lookup types from all pages
  const fetchLookupTypes = async () => {
    setTypesLoading(true);
    try {
      const response = await getUniqueLookupTypes();
      if (response.success && Array.isArray(response.types)) {
        setLookupTypes(response.types);
      } else {
        // Fallback to hardcoded types if API fails
        setLookupTypes([
          "cast", "employeeServicesStatus", "deductionType", "appreciationType", "grades", "stationLocation", "assetTypes", "designation", "payscale", "vehicle", "achievementType", "assetStatus"
        ]);
      }
    } catch (error) {
      console.error('Error fetching lookup types:', error);
      // Fallback to hardcoded types
      setLookupTypes([
        "cast", "employeeServicesStatus", "deductionType", "appreciationType", "grades", "stationLocation", "assetTypes", "designation", "payscale", "vehicle", "achievementType", "assetStatus"
      ]);
    } finally {
      setTypesLoading(false);
    }
  };

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      fetchLookupTypes();

      if (isEdit && initialData) {
        setFormData({
          name: initialData.name || '',
          lookupType: initialData.lookupType || '',
          isActive: initialData.isActive !== false,
        });
      } else {
        setFormData({
          name: '',
          lookupType: '',
          isActive: true,
        });
      }
      setError('');
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.lookupType) {
      setError('Lookup type is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;

      if (isEdit && initialData?._id) {
        response = await updateLookup(initialData._id, formData);
      } else {
        response = await createLookup(formData);
      }

      if (response && response.success) {
        // Reset form
        setFormData({ name: '', lookupType: '', isActive: true });

        // Close modal and notify parent
        onClose();
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(
        error.response?.data?.message ||
        error.message ||
        `Failed to ${isEdit ? 'update' : 'create'} lookup`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', lookupType: '', isActive: true });
      setError('');
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
            {isEdit ? 'Edit Lookup' : 'Add New Lookup'}
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
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lookup Type <span className="text-red-500">*</span>
              </label>
              <select
                name="lookupType"
                value={formData.lookupType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                required
                disabled={loading || typesLoading}
              >
                <option value="">
                  {typesLoading ? 'Loading all types...' : 'Select lookup type'}
                </option>
                {lookupTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {typesLoading && (
                <p className="mt-1 text-xs text-gray-500">Loading lookup types from all pages...</p>
              )}
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEdit ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              isEdit ? 'Update Lookup' : 'Create Lookup'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LookupModal;