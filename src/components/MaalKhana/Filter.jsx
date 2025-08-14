import React, { useState, useEffect } from "react";
import { getStationLocationsWithEnum } from "../Station/lookUp.js";
import { getStationStatusWithEnum } from "../Station/stationstatus.js";
import { getStationDistrictWithEnum } from "../Station/District.js";

const StationFilters = ({
  filters,
  updateFilters,
  clearFilters,
  showFilters,
  setShowFilters,
}) => {
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    tehsil: filters.tehsil || "",
    address: filters.address || "",
    status: filters.status || "",
    district: filters.district || "",
  });

  const [stationLocations, setStationLocations] = useState({});
  const [stationStatuses, setStationStatuses] = useState({});
  const [stationDistrict, setStationDistrict] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  // Fetch station locations and statuses on component mount
  useEffect(() => {
    fetchStationLocations();
    fetchStationStatuses();
    fetchStationDistrict();
  }, []);

  // Update form when filters change externally
  useEffect(() => {
    setFilterForm({
      name: filters.name || "",
      tehsil: filters.tehsil || "",
      address: filters.address || "",
      status: filters.status || "",
      district: filters.district || "",
    });
  }, [filters]);

  // Fetch station locations from API
  const fetchStationLocations = async () => {
    setLoadingLocations(true);
    try {
      const result = await getStationLocationsWithEnum();
      if (result.success) {
        setStationLocations(result.data);
      } else {
        console.error("Error fetching station locations:", result.error);
      }
    } catch (error) {
      console.error("Error fetching station locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch station statuses from API
  const fetchStationStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const result = await getStationStatusWithEnum();
      if (result.success) {
        setStationStatuses(result.data);
      } else {
        console.error("Error fetching station statuses:", result.error);
      }
    } catch (error) {
      console.error("Error fetching station statuses:", error);
    } finally {
      setLoadingStatuses(false);
    }
  };
  const fetchStationDistrict = async () => {
    setLoadingStatuses(true);
    try {
      const result = await getStationDistrictWithEnum();
      if (result.success) {
        setStationDistrict(result.data);
      } else {
        console.error("Error fetching station statuses:", result.error);
      }
    } catch (error) {
      console.error("Error fetching station statuses:", error);
    } finally {
      setLoadingStatuses(false);
    }
  };  
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
    if (filterForm.tehsil.trim())
      activeFilters.tehsil = filterForm.tehsil.trim();
    if (filterForm.address.trim())
      activeFilters.address = filterForm.address.trim();
    if (filterForm.status.trim())
      activeFilters.status = filterForm.status.trim();
    if (filterForm.district.trim())
      activeFilters.district = filterForm.district.trim();
    updateFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilterForm({
      name: "",
      tehsil: "",
      address: "",
      status: "",
      district: "",
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
            Filter Maal Khana
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              showFilters ? "rotate-180" : ""
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
        className={`bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ${
          showFilters || window.innerWidth >= 1024 ? "block" : "hidden lg:block"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Maal Khana</h3>
          {/* Active filter count */}
          {Object.keys(filters).length > 0 && (
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {Object.keys(filters).length} active filter
              {Object.keys(filters).length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Station Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maal Khana Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Gulshan"
            />
          </div>

          {/* Tehsil Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tehsil
            </label>
            <select
              name="tehsil"
              value={filterForm.tehsil}
              onChange={handleFilterChange}
              disabled={loadingLocations}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingLocations ? "Loading..." : "All Tehsils"}
              </option>
              {Object.entries(stationLocations).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {loadingLocations && (
              <p className="text-xs text-gray-500 mt-1">
                Loading station locations...
              </p>
            )}
          </div>

          {/* Address Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={filterForm.address}
              onChange={handleFilterChange}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Main Street"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filterForm.status}
              onChange={handleFilterChange}
              disabled={loadingStatuses}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingStatuses ? "Loading..." : "All Statuses"}
              </option>
              {Object.entries(stationStatuses).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {loadingStatuses && (
              <p className="text-xs text-gray-500 mt-1">
                Loading station statuses...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <select
              name="district"
              value={filterForm.district}
              onChange={handleFilterChange}
              disabled={loadingStatuses}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingStatuses ? "Loading..." : "All Districts"}
              </option>
              {Object.entries(stationDistrict).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {loadingStatuses && (
              <p className="text-xs text-gray-500 mt-1">
                Loading station statuses...
              </p>
            )}
          </div>
        </div>

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
              <span className="text-sm text-gray-600 font-medium">
                Active filters:
              </span>
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
              {filters.tehsil && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tehsil: {stationLocations[filters.tehsil] || filters.tehsil}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.tehsil;
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.address && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Address: {filters.address}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.address;
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
                  Status: {stationStatuses[filters.status] || filters.status}
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
              {filters.district && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  District: {filters.district}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.district;
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

export default StationFilters;
