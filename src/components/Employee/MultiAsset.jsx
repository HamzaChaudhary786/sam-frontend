// MultiAssetAssignmentForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createAssetAssignment, getAllAssets } from "../AssetAssignment/AssetApi.js";
import { role_admin } from "../../constants/Enum.js";

const MultiAssetAssignmentForm = ({ 
  selectedEmployees = [], 
  isOpen = false, 
  onSuccess, 
  onCancel 
}) => {
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
  const [processingResults, setProcessingResults] = useState(null);

  // Check user role from localStorage
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const storedUserType = localStorage.getItem("userType");
        const userData = localStorage.getItem("userData");
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const currentUserType = storedUserType || parsedUserData?.userType || "";

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
    setProcessingResults(null);
  };

  // Fetch available assets
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const result = await getAllAssets();
      if (result.success) {
        setAvailableAssets(result.data || []);
        console.log("✅ Assets loaded:", result.data);
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
        [assetId]: value === "" ? "" : Number(value)
      }
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
          ? Object.fromEntries(Object.entries(prevForm.assetRounds).filter(([key]) => key !== assetId))
          : prevForm.assetRounds
      }));

      return newSelection;
    });
  };

  // Get asset details
  const getAssetDetails = (assetId) => {
    return availableAssets.find((a) => a._id === assetId);
  };

  // Check if asset requires rounds
  const assetRequiresRounds = (assetType) => {
    return assetType === "weapons" || assetType === "pistol" || assetType === "round" || assetType === "weaponRound";
  };

  // Check if we have required rounds data for assets that need them
  const hasRequiredRoundsData = () => {
    const assetsNeedingRounds = selectedAssets.filter(assetId => {
      const asset = getAssetDetails(assetId);
      return assetRequiresRounds(asset?.type);
    });
    
    return assetsNeedingRounds.every(assetId => 
      formData.assetRounds[assetId] && formData.assetRounds[assetId] > 0
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProcessingResults(null);

    const results = {
      successful: [],
      failed: [],
      total: selectedEmployees.length,
    };

    try {
      // Process each employee
      for (const employee of selectedEmployees) {
        try {
          const submitData = {
            employee: employee._id,
            asset: selectedAssets,
            assetRounds: formData.assetRounds, // Send individual asset rounds
            // Only include approval fields when user is admin
            ...(isAdmin && {
              isApproved: formData.isApproved,
              approvalComment: formData.approvalComment,
            }),
          };

          const result = await createAssetAssignment(submitData);

          if (result.success) {
            results.successful.push({
              employee: `${employee.firstName} ${employee.lastName}`,
              personalNumber: employee.personalNumber || employee.pnumber,
              id: employee._id,
            });
          } else {
            results.failed.push({
              employee: `${employee.firstName} ${employee.lastName}`,
              personalNumber: employee.personalNumber || employee.pnumber,
              error: result.error || "Unknown error",
              id: employee._id,
            });
          }
        } catch (error) {
          results.failed.push({
            employee: `${employee.firstName} ${employee.lastName}`,
            personalNumber: employee.personalNumber || employee.pnumber,
            error: error.message || "Unknown error",
            id: employee._id,
          });
        }

        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setProcessingResults(results);

      // Show appropriate toast messages
      if (results.successful.length > 0 && results.failed.length === 0) {
        toast.success(`✅ Successfully created asset assignments for all ${results.successful.length} employees`);
      } else if (results.successful.length > 0 && results.failed.length > 0) {
        toast.warning(`⚠️ Created ${results.successful.length} assignments, failed ${results.failed.length}`);
      } else {
        toast.error(`❌ Failed to create asset assignments for all employees`);
      }

    } catch (error) {
      console.error("Multi asset assignment error:", error);
      toast.error("Error processing asset assignments");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle success (close modal and reset)
  const handleSuccess = () => {
    resetForm();
    if (onSuccess) onSuccess();
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

  // Effect to fetch assets when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  // Effect to reset form when modal opens/closes
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
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Multi Asset Assignment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign assets to {selectedEmployees.length} selected employees
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

        <div className="p-6">
          {/* Selected Employees List */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-3">
              Selected Employees ({selectedEmployees.length})
            </h3>
            <div className="max-h-32 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedEmployees.map((employee, index) => (
                  <div key={employee._id || index} className="text-sm text-blue-700">
                    <span className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="text-blue-600 ml-2">
                      ({employee.personalNumber || employee.pnumber})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Processing Results */}
          {processingResults && (
            <div className="mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Processing Results
                </h3>
                
                {processingResults.successful.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      ✅ Successful ({processingResults.successful.length})
                    </h4>
                    <div className="max-h-20 overflow-y-auto">
                      {processingResults.successful.map((item, index) => (
                        <div key={index} className="text-xs text-green-600">
                          {item.employee} ({item.personalNumber})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {processingResults.failed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">
                      ❌ Failed ({processingResults.failed.length})
                    </h4>
                    <div className="max-h-20 overflow-y-auto">
                      {processingResults.failed.map((item, index) => (
                        <div key={index} className="text-xs text-red-600">
                          <div>{item.employee} ({item.personalNumber})</div>
                          <div className="text-red-500 ml-2">Error: {item.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
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
                                    : asset.type === "round" || asset.type === "weaponRound"
                                    ? "bg-orange-100 text-orange-800"
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
                              {asset.type === "weapons" && asset.weaponNumber && (
                                <span>Weapon No: {asset.weaponNumber}</span>
                              )}
                              {asset.type === "pistol" && asset.pistolNumber && (
                                <span>Pistol No: {asset.pistolNumber}</span>
                              )}
                              {(asset.type === "vehicle" || asset.type === "vehicles") && asset.vehicleNumber && (
                                <span>Vehicle No: {asset.vehicleNumber}</span>
                              )}
                              {(asset.type === "round" || asset.type === "weaponRound") && (
                                <>
                                  {asset.weaponName && <span>Weapon: {asset.weaponName} | </span>}
                                  {asset.numberOfRounds && <span>Total Rounds: {asset.numberOfRounds}</span>}
                                </>
                              )}
                              {"availableQuantity" in asset && (
                                <span> | Available: {asset.availableQuantity}</span>
                              )}
                            </div>

                            {/* Rounds Input for selected assets that require rounds */}
                            {assetRequiresRounds(asset.type) && selectedAssets.includes(asset._id) && (
                              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
                                <p className="text-xs font-medium text-orange-800 mb-2">
                                  Assigned Rounds for {asset.name}
                                </p>
                                <input
                                  type="number"
                                  value={formData.assetRounds[asset._id] || ""}
                                  onChange={(e) => handleRoundsChange(asset._id, e.target.value)}
                                  placeholder={`Enter rounds for ${asset.name}`}
                                  min="0"
                                  required
                                  className="w-full px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                                <p className="text-xs text-orange-600 mt-1">
                                  This will be assigned to all selected employees
                                </p>
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
                Selected assets will be assigned to all employees
              </p>
            </div>

            {/* Selected Assets Summary */}
            {selectedAssets.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Selected Assets ({selectedAssets.length})
                </h3>
                <div className="space-y-1">
                  {selectedAssets.map(assetId => {
                    const asset = getAssetDetails(assetId);
                    return (
                      <div key={assetId} className="text-xs text-green-700 flex justify-between">
                        <span>{asset?.name} ({asset?.type})</span>
                        {assetRequiresRounds(asset?.type) && formData.assetRounds[assetId] && (
                          <span className="font-medium">Rounds: {formData.assetRounds[assetId]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Approval Fields */}
            {/* {isAdmin && (
              <>
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
                      Pre-approve All Assignments
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Check this to automatically approve all asset assignments
                  </p>
                </div>

                {formData.isApproved && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Comments *
                    </label>
                    <textarea
                      name="approvalComment"
                      value={formData.approvalComment}
                      onChange={handleChange}
                      placeholder="Enter approval comments..."
                      rows={2}
                      required={formData.isApproved}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                    />
                  </div>
                )}
              </>
            )} */}

            {/* Info Note */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Multi Asset Assignment
                  </h3>
                  <p className="text-sm mt-1 text-blue-700">
                    {isAdmin && formData.isApproved 
                      ? "All asset assignments will be created as approved and will be active immediately."
                      : "All asset assignments will be created as pending approval and will need administrator approval before becoming active."}
                  </p>
                  <p className="text-xs mt-1 text-blue-600">
                    Each selected asset will be assigned to all {selectedEmployees.length} employees.
                  </p>
                </div>
              </div>
            </div> */}

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
              
              {processingResults ? (
                <button
                  type="button"
                  onClick={handleSuccess}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    loadingAssets ||
                    selectedAssets.length === 0 ||
                    !hasRequiredRoundsData() ||
                    (isAdmin && formData.isApproved && !formData.approvalComment)
                  }
                  className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  )}
                  {isSubmitting
                    ? `Processing... (${selectedEmployees.length} employees)`
                    : `Create Asset Assignments (${selectedEmployees.length})`}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MultiAssetAssignmentForm;