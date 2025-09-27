import React, { useState, useEffect } from "react";
import { useLookupOptions } from "../../services/LookUp.js";
import { MultiTextInput } from "../Employee/MultiTextInput.jsx";

const AssetFilters = ({
  filters,
  updateFilters,
  clearFilters,
  showFilters,
  setShowFilters,
}) => {
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    type: filters.type || "",
    status: filters.status || "",
    purchaseDate: filters.purchaseDate || "",
    serialNumber: filters.serialNumber || [],
  });

  // Get lookup options for dropdowns
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");
  const { options: assetStatusOptions } = useLookupOptions("assetStatus");

  // Update form when filters change externally
  useEffect(() => {
    setFilterForm({
      name: filters.name || "",
      type: filters.type || "",
      status: filters.status || "",
      purchaseDate: filters.purchaseDate || "",
      serialNumber: filters.serialNumber || [],
    });
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.trim()) activeFilters.name = filterForm.name.trim();
    if (filterForm.type.trim()) activeFilters.type = filterForm.type.trim();
    if (filterForm.status.trim()) activeFilters.status = filterForm.status.trim();
    if (filterForm.purchaseDate.trim()) activeFilters.purchaseDate = filterForm.purchaseDate.trim();
    if (Array.isArray(filterForm.serialNumber) && filterForm.serialNumber.length > 0) {
      activeFilters.serialNumber = filterForm.serialNumber;
    }
    updateFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilterForm({
      name: "",
      type: "",
      status: "",
      purchaseDate: "",
      serialNumber: [],
    });
    clearFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">
            Filter Assets
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${showFilters ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Filter Section */}
      <div
        className={`bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ${showFilters || window.innerWidth >= 1024 ? "block" : "hidden lg:block"
          }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Assets</h3>
          {/* Active filter count */}
          {/* {Object.keys(filters).length > 0 && (
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {Object.keys(filters).length} active filter
              {Object.keys(filters).length !== 1 ? "s" : ""}
            </span>
          )} */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Asset Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., AK27"
            />
          </div>

          {/* Asset Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              name="type"
              value={filterForm.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filterForm.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {assetStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={filterForm.purchaseDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <MultiTextInput
          label="Serial Number"
          name="serialNumber"
          value={filterForm.serialNumber}
          onChange={handleFilterChange}
          placeholder="Weapon/Registration Number"
          minLength={3}
          maxLength={20}
          enableSuggestions={false}
        />

        {/* Filter Action Buttons - Moved below the grid */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {filters.name && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Name: {filters.name}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.name;
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Type: {assetTypeOptions.find(opt => opt.value === filters.type)?.label || filters.type}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.type;
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {assetStatusOptions.find(opt => opt.value === filters.status)?.label || filters.status}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.status;
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.purchaseDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Purchase Date: {filters.purchaseDate}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.purchaseDate;
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssetFilters;