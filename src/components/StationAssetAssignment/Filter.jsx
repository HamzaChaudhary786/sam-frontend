// StationAssetFilters.jsx
import React, { useState, useEffect } from "react";
import { getAssetTypesWithEnum } from "../AssetAssignment/TypeLookup.js";

const StationAssetFilters = ({
  onFiltersChange,
  selectedCount,
  onBulkApprove,
  onBulkDelete,
  isAdmin,
}) => {
  const [filters, setFilters] = useState({
    assetType: "",
    approvalStatus: "",
    fromDate: "",
    toDate: "",
  });

  const [assetTypes, setAssetTypes] = useState({});
  const [loadingAssetTypes, setLoadingAssetTypes] = useState(false);

  // Fetch asset types for filtering
  useEffect(() => {
    const fetchAssetTypes = async () => {
      setLoadingAssetTypes(true);
      try {
        const result = await getAssetTypesWithEnum();
        if (result.success) {
          setAssetTypes(result.data);
        } else {
          console.error("Error fetching asset types:", result.error);
          setAssetTypes({});
        }
      } catch (error) {
        console.error("Error fetching asset types:", error);
        setAssetTypes({});
      } finally {
        setLoadingAssetTypes(false);
      }
    };

    fetchAssetTypes();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      assetType: "",
      approvalStatus: "",
      fromDate: "",
      toDate: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <span className="text-sm text-blue-800 font-medium">
            {selectedCount} assignment(s) selected
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={onBulkApprove}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                >
                  Approve Selected
                </button>
                <button
                  onClick={onBulkDelete}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  Delete Selected
                </button>
              </>
            )}
            <button
              onClick={() => onFiltersChange({ clearSelection: true })}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Asset Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Type
          </label>
          <select
            value={filters.assetType}
            onChange={(e) => handleFilterChange("assetType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loadingAssetTypes}
          >
            <option value="">All Types</option>
            {loadingAssetTypes ? (
              <option value="">Loading types...</option>
            ) : (
              Object.entries(assetTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Approval Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approval Status
          </label>
          <select
            value={filters.approvalStatus}
            onChange={(e) => handleFilterChange("approvalStatus", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* From Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange("fromDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* To Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => handleFilterChange("toDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {filters.assetType && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Type: {assetTypes[filters.assetType] || filters.assetType}
              <button
                onClick={() => handleFilterChange("assetType", "")}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.approvalStatus && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Status: {filters.approvalStatus === "pending" ? "Pending" : "Approved"}
              <button
                onClick={() => handleFilterChange("approvalStatus", "")}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.fromDate && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              From: {filters.fromDate}
              <button
                onClick={() => handleFilterChange("fromDate", "")}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.toDate && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              To: {filters.toDate}
              <button
                onClick={() => handleFilterChange("toDate", "")}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationAssetFilters;