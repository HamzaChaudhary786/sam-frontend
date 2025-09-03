// AssetForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createAssetAssignment,
  updateAssetAssignment,
  getAllAssets,
} from "../AssetApi.js";
import { role_admin } from "../../../constants/Enum.js";
import ClickableEmployeeName from "../../Employee/ClickableName.jsx"; // Adjust path as needed
import { usePermissions } from "../../../hook/usePermission.js";

const AssetForm = ({ employee, editingAsset, isOpen, onSuccess, onCancel }) => {
  const permissions = usePermissions();
  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    asset: [],
    assetRounds: {}, // Store rounds for each asset individually
    isApproved: false,
    approvalComment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);

  console.log(employee, "all employee data are here");

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
      assetRounds: {},
      isApproved: false,
      approvalComment: "",
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle rounds change for specific assets
  const handleRoundsChange = (assetId, value) => {
    setFormData((prev) => ({
      ...prev,
      assetRounds: {
        ...prev.assetRounds,
        [assetId]: value === "" ? "" : Number(value),
      },
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
        // Remove rounds data if asset is deselected
        assetRounds: isSelected
          ? Object.fromEntries(
              Object.entries(prevForm.assetRounds).filter(
                ([key]) => key !== assetId
              )
            )
          : prevForm.assetRounds,
      }));

      return newSelection;
    });
  };

  // Get asset details
  const getAssetDetails = (assetId) => {
    const asset = availableAssets.find((a) => a._id === assetId);
    return asset;
  };

  // Check if asset requires rounds
  const assetRequiresRounds = (assetType) => {
    return (
      assetType === "weapons" ||
      assetType === "pistol" ||
      assetType === "round" ||
      assetType === "weaponRound"
    );
  };

  // Check if we have required rounds data for assets that need them
  const hasRequiredRoundsData = () => {
    const assetsNeedingRounds = selectedAssets.filter((assetId) => {
      const asset = getAssetDetails(assetId);
      return assetRequiresRounds(asset?.type);
    });

    return assetsNeedingRounds.every(
      (assetId) =>
        formData.assetRounds[assetId] && formData.assetRounds[assetId] > 0
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        employee: employee._id,
        asset: selectedAssets,
        assetRounds: formData.assetRounds, // Send individual asset rounds
        // Only include approval fields when editing and user is admin
        ...(editingAsset &&
          isAdmin && {
            isApproved: formData.isApproved,
            approvalComment: formData.approvalComment,
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
          `Asset assignment ${
            editingAsset ? "updated" : "created"
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

      // Build assetRounds object from existing data
      const assetRounds = {};
      if (editingAsset.assetRounds) {
        Object.assign(assetRounds, editingAsset.assetRounds);
      } else if (editingAsset.assignedRounds) {
        // Fallback for old data structure - assign same rounds to all assets
        assetIds.forEach((id) => {
          assetRounds[id] = editingAsset.assignedRounds;
        });
      }

      setFormData({
        asset: assetIds,
        assetRounds: assetRounds,
        isApproved: editingAsset.isApproved || false,
        approvalComment: editingAsset.approvalComment || "",
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
            {/* <p className="text-sm text-gray-600 mt-1">
              {editingAsset ? "Update" : "Create"} asset assignment for{" "}
              <ClickableEmployeeName
                employee={employee}
                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
              >
                {employee.firstName} {employee.lastName}
              </ClickableEmployeeName>{" "}
              ({employee.personalNumber || employee.pnumber})
            </p> */}
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
                                  : asset.type === "round" ||
                                    asset.type === "weaponRound"
                                  ? "bg-orange-100 text-orange-800"
                                  : asset.type === "vehicle" ||
                                    asset.type === "vehicles"
                                  ? "bg-green-100 text-green-800"
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

                          {/* Available Quantity */}
                          {"availableQuantity" in asset && (
                            <p className="text-xs text-gray-500">
                              Available Qty: {asset.availableQuantity}
                            </p>
                          )}

                          {/* Assigned Rounds - Show inline for weapons, pistols, and rounds when selected */}
                          {assetRequiresRounds(asset.type) &&
                            selectedAssets.includes(asset._id) && (
                              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
                                <p className="text-xs font-medium text-orange-800 mb-2">
                                  Assigned Rounds for {asset.name}
                                </p>
                                <div>
                                  <input
                                    type="number"
                                    value={
                                      formData.assetRounds[asset._id] || ""
                                    }
                                    onChange={(e) =>
                                      handleRoundsChange(
                                        asset._id,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Enter rounds for ${asset.name}`}
                                    min="0"
                                    required
                                    className="w-full px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  />
                                  <p className="text-xs text-orange-600 mt-1">
                                    Specify rounds for this {asset.type}
                                  </p>
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

          {/* Approval Fields - Only show when editing and user is admin */}
          {editingAsset &&
            permissions?.userData?.roles?.some((role) =>
              role.accessRequirement?.some(
                (access) =>
                  access.resourceName.toLowerCase() === "employee" &&
                  access.canApprove === true
              )
            ) && (
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
                !hasRequiredRoundsData() || // Check individual asset rounds
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

export default AssetForm;
