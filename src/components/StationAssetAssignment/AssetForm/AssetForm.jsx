// StationAssetForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createStationAssetAssignment,
  updateStationAssetAssignment,
  getAllAvailableAssets,
} from "../StationAssetApi.js";
import { role_admin } from "../../../constants/Enum.js";

const StationAssetForm = ({ station, editingAsset, isOpen, onSuccess, onCancel }) => {
  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    asset: [],
    employee: "",
    mallKhana: "",
    fromDate: "",
    toDate: "",
    description: "",
    isApproved: false,
    approvalComment: "",
    changedFields: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);

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

  // Reset form
  const resetForm = () => {
    setFormData({
      asset: [],
      employee: "",
      mallKhana: "",
      fromDate: "",
      toDate: "",
      description: "",
      isApproved: false,
      approvalComment: "",
      changedFields: [],
    });
    setSelectedAssets([]);
  };

  // Fetch available assets
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const result = await getAllAvailableAssets();
      if (result.success) {
        setAvailableAssets(result.data || []);
      } else {
        toast.error("Failed to fetch assets: " + result.error);
      }
    } catch (error) {
      toast.error("Error fetching assets: " + error.message);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle asset selection
  const handleAssetSelection = (assetId) => {
    setSelectedAssets((prev) => {
      const isSelected = prev.includes(assetId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId];

      // Update form data
      setFormData((prevForm) => ({
        ...prevForm,
        asset: newSelection,
      }));

      return newSelection;
    });
  };

  // Get asset details
  const getAssetDetails = (assetId) => {
    const asset = availableAssets.find((a) => a._id === assetId);
    return asset;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create changed fields tracking
      const changedFields = [];
      
      if (selectedAssets.length > 0) {
        selectedAssets.forEach(assetId => {
          const asset = getAssetDetails(assetId);
          if (asset) {
            changedFields.push({
              oldStatus: {
                fromType: "unassigned",
                fromFieldName: "status",
                fromFieldValue: "Available"
              },
              currentStatus: {
                toType: "station",
                toFieldName: "assignedTo",
                toFieldValue: station.name
              }
            });
          }
        });
      }

      const submitData = {
        station: station._id,
        asset: selectedAssets,
        employee: formData.employee || null,
        mallKhana: formData.mallKhana || null,
        fromDate: formData.fromDate || new Date().toISOString(),
        toDate: formData.toDate || null,
        description: formData.description || `Assets assigned to ${station.name}`,
        changedFields: changedFields,
        // Only include approval fields when editing and user is admin
        ...(editingAsset && isAdmin && {
          isApproved: formData.isApproved,
          approvalComment: formData.approvalComment,
        }),
      };

      let result;
      if (editingAsset) {
        result = await updateStationAssetAssignment(editingAsset._id, submitData);
      } else {
        result = await createStationAssetAssignment(submitData);
      }

      if (result.success) {
        toast.success(
          `Station asset assignment ${editingAsset ? "updated" : "created"} successfully`
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
    if (editingAsset) {
      // Extract asset IDs from the editing asset
      const assetIds = editingAsset.asset?.map((a) => a._id || a) || [];
      
      setFormData({
        asset: assetIds,
        employee: editingAsset.employee?._id || "",
        mallKhana: editingAsset.mallKhana?._id || "",
        fromDate: editingAsset.fromDate ? editingAsset.fromDate.split('T')[0] : "",
        toDate: editingAsset.toDate ? editingAsset.toDate.split('T')[0] : "",
        description: editingAsset.description || "",
        isApproved: editingAsset.isApproved || false,
        approvalComment: editingAsset.approvalComment || "",
        changedFields: editingAsset.changedFields || [],
      });
      setSelectedAssets(assetIds);
    } else {
      resetForm();
    }
  }, [editingAsset, isOpen]);

  // Fetch assets when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAssets();
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
              {editingAsset ? "Edit Station Asset Assignment" : "Assign Assets to Station"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingAsset ? "Update" : "Create"} asset assignment for{" "}
              <span className="font-medium">
                {station.name}
              </span>
            </p>
            {editingAsset && !isAdmin && (
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Assets *
            </label>
            {loadingAssets ? (
              <div className="border border-gray-300 rounded-md p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading assets...</p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                {availableAssets.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No assets available
                  </div>
                ) : (
                  <div className="p-2">
                    {availableAssets?.map((asset) => (
                      <label
                        key={asset._id}
                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset._id)}
                          onChange={() => handleAssetSelection(asset._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {asset.name}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                asset.type === "weapons"
                                  ? "bg-red-100 text-red-800"
                                  : asset.type === "pistol"
                                  ? "bg-purple-100 text-purple-800"
                                  : asset.type === "vehicle" || asset.type === "vehicles"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {asset.type}
                            </span>
                          </div>

                          {/* Asset Details */}
                          <div className="text-xs text-gray-500 mt-1">
                            {asset.assetId && (
                              <p>Asset ID: {asset.assetId}</p>
                            )}
                            {asset.serialNumber && (
                              <p>Serial: {asset.serialNumber}</p>
                            )}
                            {asset.model && (
                              <p>Model: {asset.model}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Select one or more assets to assign to this station
            </p>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date (Optional)
            </label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter assignment description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
            />
          </div>

          {/* Approval Fields - Only show when editing and user is admin */}
          {editingAsset && isAdmin && (
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
                selectedAssets.length === 0 ||
                (editingAsset && isAdmin && !formData.approvalComment) // Only require approval comment when editing as admin
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? editingAsset
                  ? "Updating..."
                  : "Assigning..."
                : editingAsset
                  ? "Update Assignment"
                  : "Assign Assets"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationAssetForm;