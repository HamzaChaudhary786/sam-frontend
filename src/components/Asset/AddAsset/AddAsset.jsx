import React, { useState, useEffect } from "react";
import { useAssets } from "../AssetHook.js";
import { ASSET_TYPE_OPTIONS } from "../AssetConstants.js";

const AssetModal = ({ isOpen, onClose, isEdit = false, editData = null }) => {
  const { createAsset, modifyAsset } = useAssets();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    weaponNumber: "",
    pistolNumber: "",
    additionalInfo: "",
  });

  // Initialize form data for editing
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        type: editData.type || "",
        weaponNumber: editData.weaponNumber || "",
        pistolNumber: editData.pistolNumber || "",
        additionalInfo: editData.additionalInfo || "",
      });
    } else {
      // Reset form for new asset
      setFormData({
        name: "",
        type: "",
        additionalInfo: "",
      });
    }
    setError("");
  }, [isEdit, editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      
      if (isEdit) {
        result = await modifyAsset(editData._id, formData);
      } else {
        result = await createAsset(formData);
      }

      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          name: "",
          type: "",
          weaponNumber: "",
          pistolNumber: "",
          additionalInfo: "",
        });
      } else {
        setError(result.error || "An error occurred while saving the asset");
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Asset" : "Add New Asset"}
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

          {/* Asset Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Black Hawk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select asset type</option>
                {ASSET_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weapon/Equipment Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weapon Number
              </label>
              <input
                type="text"
                name="weaponNumber"
                value={formData.weaponNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., dk-1223"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pistol Number
              </label>
              <input
                type="text"
                name="pistolNumber"
                value={formData.pistolNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., fk-1237"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Multi-role military helicopter used for troop transport"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading 
                ? (isEdit ? "Updating..." : "Adding...") 
                : (isEdit ? "Update Asset" : "Add Asset")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;