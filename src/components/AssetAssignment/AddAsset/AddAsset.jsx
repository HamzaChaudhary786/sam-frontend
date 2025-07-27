// AssetForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createAssetAssignment,
  updateAssetAssignment,
  getAllAssets,
} from "../AssetApi.js";

const AssetForm = ({ employee, editingAsset, isOpen, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    asset: [],
    assignedRounds: "",
    consumedRounds: "0",
    consumedDate: "",
    consumedReason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);


  console.log(employee, "all employee data are here");

  // Reset form
  const resetForm = () => {
    setFormData({
      asset: [],
      assignedRounds: "",
      consumedRounds: "0",
      consumedDate: "",
      consumedReason: "",
    });
    setSelectedAssets([]);
  };

  // Fetch available assets
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const result = await getAllAssets();
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
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
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

  // Auto-populate rounds for weapons
  const getAssetDetails = (assetId) => {
    const asset = availableAssets.find((a) => a._id === assetId);
    return asset;
  };

  // Check if selected assets include rounds
  const hasRounds = selectedAssets.some((assetId) => {
    const asset = getAssetDetails(assetId);
    return asset?.type === "round" || asset?.type === "weaponRound";
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        employee: employee._id,
        asset: selectedAssets,
        assignedRounds: formData.assignedRounds || "0",
        consumedRounds: formData.consumedRounds || "0",
        ...(formData.consumedDate && { consumedDate: formData.consumedDate }),
        ...(formData.consumedReason && {
          consumedReason: formData.consumedReason,
        }),
      };

      let result;
      if (editingAsset) {
        result = await updateAssetAssignment(editingAsset._id, submitData);
      } else {
        result = await createAssetAssignment(submitData);
      }

      if (result.success) {
        toast.success(
          `Asset assignment ${editingAsset ? "updated" : "created"
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

  // Effect to populate form when editing
  useEffect(() => {
    if (editingAsset) {
      // Extract asset IDs from the editing asset
      const assetIds = editingAsset.asset?.map((a) => a._id || a) || [];

      setFormData({
        asset: assetIds,
        assignedRounds: editingAsset.assignedRounds || "",
        consumedRounds: editingAsset.consumedRounds || "0",
        consumedDate: editingAsset.consumedDate
          ? new Date(editingAsset.consumedDate).toISOString().split("T")[0]
          : "",
        consumedReason: editingAsset.consumedReason || "",
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
              {editingAsset ? "Edit Asset Assignment" : "Assign Assets"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingAsset ? "Update" : "Create"} asset assignment for{" "}
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
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${asset.type === "weapons"
                                  ? "bg-red-100 text-red-800"
                                  : asset.type === "round" || asset.type === "weaponRound"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {asset.type}
                            </span>
                          </div>
                          {/* Weapon Number */}
                          {asset.type === "weapons" && asset.weaponNumber && (
                            <p className="text-xs text-gray-500">
                              Weapon No: {asset.weaponNumber}
                            </p>
                          )}

                          {/* Pistol Number */}
                          {asset.type === "pistol" && asset.pistolNumber && (
                            <p className="text-xs text-gray-500">
                              Pistol No: {asset.pistolNumber}
                            </p>
                          )}

                          {/* Vehicle Number */}
                          {(asset.type === "vehicle" ||
                            asset.type === "vehicles") &&
                            asset.vehicleNumber && (
                              <p className="text-xs text-gray-500">
                                Vehicle No: {asset.vehicleNumber}
                              </p>
                            )}

                          {/* Round Details */}
                          {(asset.type === "round" || asset.type === "weaponRound") && (
                            <>
                              {asset.weaponName && (
                                <p className="text-xs text-gray-500">
                                  Weapon: {asset.weaponName}
                                </p>
                              )}
                              {asset.numberOfRounds && (
                                <p className="text-xs text-gray-500">
                                  Total Rounds: {asset.numberOfRounds}
                                </p>
                              )}
                            </>
                          )}

                          {/* Available Quantity */}
                          {"availableQuantity" in asset && (
                            <p className="text-xs text-gray-500">
                              Available Qty: {asset.availableQuantity}
                            </p>
                          )}

                          {/* Consumption Details for Rounds - Show inline when selected */}
                          {(asset.type === "round" || asset.type === "weaponRound") && selectedAssets.includes(asset._id) && (
                            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
                              <p className="text-xs font-medium text-orange-800 mb-3">Rounds & Consumption Details</p>
                              <div className="space-y-3">
                                {/* Rounds Information */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-orange-700 mb-1">
                                      Assigned Rounds
                                    </label>
                                    <input
                                      type="number"
                                      name="assignedRounds"
                                      value={formData.assignedRounds}
                                      onChange={handleChange}
                                      placeholder="0"
                                      min="0"
                                      className="w-full px-2 py-1 text-xs border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-orange-700 mb-1">
                                      Consumed Rounds
                                    </label>
                                    <input
                                      type="number"
                                      name="consumedRounds"
                                      value={formData.consumedRounds}
                                      onChange={handleChange}
                                      placeholder="0"
                                      min="0"
                                      className="w-full px-2 py-1 text-xs border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                  </div>
                                </div>
                                {/* Consumption Details */}
                                <div>
                                  <label className="block text-xs font-medium text-orange-700 mb-1">
                                    Consumed Date
                                  </label>
                                  <input
                                    type="date"
                                    name="consumedDate"
                                    value={formData.consumedDate}
                                    onChange={handleChange}
                                    className="w-full px-2 py-1 text-xs border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-orange-700 mb-1">
                                    Consumption Reason
                                  </label>
                                  <textarea
                                    name="consumedReason"
                                    value={formData.consumedReason}
                                    onChange={handleChange}
                                    placeholder="Enter consumption reason..."
                                    rows={2}
                                    className="w-full px-2 py-1 text-xs border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                                  />

                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Select one or more assets to assign to this employee
            </p>
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
              disabled={isSubmitting || selectedAssets.length === 0}
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

export default AssetForm;