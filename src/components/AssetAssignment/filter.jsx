// AssetFilters.jsx
import React, { useState, useEffect } from "react";
import { getAssetTypesWithEnum } from "./TypeLookup.js";
import { toast } from "react-toastify";

const AssetFilters = ({ onFiltersChange, selectedCount, onBulkApprove, onBulkDelete, isAdmin }) => {
  const [filters, setFilters] = useState({
    assetType: "",
    approvalStatus: "",
  });
  const [assetTypes, setAssetTypes] = useState({});
  const [loadingAssetTypes, setLoadingAssetTypes] = useState(false);

  // Approval status options
  const approvalStatusOptions = [
    { value: "pending", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
  ];

  // Fetch asset types from lookup
  const fetchAssetTypes = async () => {
    setLoadingAssetTypes(true);
    try {
      const result = await getAssetTypesWithEnum();
      if (result.success) {
        setAssetTypes(result.data);
        console.log("🔧 Asset types loaded:", result.data);
      } else {
        console.error("❌ Failed to fetch asset types:", result.error);
        toast.error("Failed to load asset types: " + result.error);
        setAssetTypes({});
      }
    } catch (error) {
      console.error("💥 Error fetching asset types:", error);
      toast.error("Error loading asset types");
      setAssetTypes({});
    } finally {
      setLoadingAssetTypes(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      assetType: "",
      approvalStatus: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return filters.assetType || filters.approvalStatus;
  };

  useEffect(() => {
    fetchAssetTypes();
  }, []);

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-end mr-10">
            <span className="text-sm text-blue-800 mr-10">
              {selectedCount} item(s) selected
            </span>
            {isAdmin ? (
              <>
                <button
                  onClick={onBulkApprove}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 mr-10"
                >
                  Approve Selected
                </button>
                <button
                  onClick={onBulkDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </>
            ) : (
              <>
                <button
                  disabled
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-500 rounded-md cursor-not-allowed mr-10"
                  title="Only administrators can approve assignments"
                >
                  Approve Selected
                </button>
                <button
                  disabled
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                  title="Only administrators can delete assignments"
                >
                  Delete Selected
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              name="assetType"
              value={filters.assetType}
              onChange={handleFilterChange}
              disabled={loadingAssetTypes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
            >
              <option value="">
                {loadingAssetTypes ? "Loading asset types..." : "All Types"}
              </option>
              {Object.entries(assetTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              name="approvalStatus"
              value={filters.approvalStatus}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Status</option>
              {approvalStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {hasActiveFilters() && (
          <div className="ml-4">
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetFilters;