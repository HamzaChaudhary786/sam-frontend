import React, { useState, useEffect } from "react";
import { getStationLocationsWithEnum } from "./lookUp.js";
import { getStationStatusWithEnum } from "./stationstatus.js";
import { getStationDistrictWithEnum } from "./District.js";
import { SearchableMultiSelect } from "../Employee/searchableMultiselect.jsx"; // 🆕 Import the SearchableMultiSelect component
import { MultiTextInput } from "../Employee/MultiTextInput.jsx"; // 🆕 Import the MultiTextInput component
import { getAllStationsWithoutPage} from "./StationApi.js"; // 🆕 Import for station name suggestions

const StationFilters = ({
  filters,
  updateFilters,
  clearFilters,
  showFilters,
  setShowFilters,
}) => {
  // 🆕 Updated filter state to handle arrays for multi-select inputs
  const [filterForm, setFilterForm] = useState({
    name: Array.isArray(filters.name)
      ? filters.name
      : filters.name
      ? [filters.name]
      : [],
    tehsil: Array.isArray(filters.tehsil)
      ? filters.tehsil
      : filters.tehsil
      ? [filters.tehsil]
      : [],
    address: Array.isArray(filters.address)
      ? filters.address
      : filters.address
      ? [filters.address]
      : [],
    status: Array.isArray(filters.status)
      ? filters.status
      : filters.status
      ? [filters.status]
      : [],
    district: Array.isArray(filters.district)
      ? filters.district
      : filters.district
      ? [filters.district]
      : [],
  });

  // 🆕 Convert enum objects to arrays for SearchableMultiSelect
  const [stationLocations, setStationLocations] = useState([]);
  const [stationStatuses, setStationStatuses] = useState([]);
  const [stationDistrict, setStationDistrict] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // 🆕 Suggestions for name input only (address kept simple)
  const [suggestions, setSuggestions] = useState({
    name: [],
  });

  const [isSearching, setIsSearching] = useState({
    name: false,
  });

  // 🆕 Search station names function
  const searchStationNames = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions((prev) => ({ ...prev, name: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, name: true }));

    try {
      
      const result = await  getAllStationsWithoutPage({
        name: query,
        limit: 10,
      });      

      if (result.success) {
        const stations = result?.data?.result || result.data || [];
        const names = stations
          .map((station) => station.name)
          .filter(Boolean);
        setSuggestions((prev) => ({ ...prev, name: [...new Set(names)] }));
      }
    } catch (error) {
      console.error("Error searching station names:", error);
    } finally {
      setIsSearching((prev) => ({ ...prev, name: false }));
    }
  };

  // Fetch station locations and statuses on component mount
  useEffect(() => {
    fetchStationLocations();
    fetchStationStatuses();
    fetchStationDistrict();
  }, []);

  // Update form when filters change externally
  useEffect(() => {
    setFilterForm({
      name: Array.isArray(filters.name)
        ? filters.name
        : filters.name
        ? [filters.name]
        : [],
      tehsil: Array.isArray(filters.tehsil)
        ? filters.tehsil
        : filters.tehsil
        ? [filters.tehsil]
        : [],
      address: Array.isArray(filters.address)
        ? filters.address
        : filters.address
        ? [filters.address]
        : [],
      status: Array.isArray(filters.status)
        ? filters.status
        : filters.status
        ? [filters.status]
        : [],
      district: Array.isArray(filters.district)
        ? filters.district
        : filters.district
        ? [filters.district]
        : [],
    });
  }, [filters]);

  // 🆕 Fetch station locations from API and convert to array format
  const fetchStationLocations = async () => {
    setLoadingLocations(true);
    try {
      const result = await getStationLocationsWithEnum();
      if (result.success) {
        // Convert object to array format for SearchableMultiSelect
        const locationsArray = Object.entries(result.data).map(([id, name]) => ({
          _id: id,
          name: name,
        }));
        setStationLocations(locationsArray);
      } else {
        console.error("Error fetching station locations:", result.error);
        setStationLocations([]);
      }
    } catch (error) {
      console.error("Error fetching station locations:", error);
      setStationLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // 🆕 Fetch station statuses from API and convert to array format
  const fetchStationStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const result = await getStationStatusWithEnum();
      if (result.success) {
        // Convert object to array format for SearchableMultiSelect
        const statusesArray = Object.entries(result.data).map(([id, name]) => ({
          _id: id,
          name: name,
        }));
        setStationStatuses(statusesArray);
      } else {
        console.error("Error fetching station statuses:", result.error);
        setStationStatuses([]);
      }
    } catch (error) {
      console.error("Error fetching station statuses:", error);
      setStationStatuses([]);
    } finally {
      setLoadingStatuses(false);
    }
  };

  // 🆕 Fetch station districts from API and convert to array format
  const fetchStationDistrict = async () => {
    setLoadingDistricts(true);
    try {
      const result = await getStationDistrictWithEnum();
      if (result.success) {
        // Convert object to array format for SearchableMultiSelect
        const districtsArray = Object.entries(result.data).map(([id, name]) => ({
          _id: id,
          name: name,
        }));
        setStationDistrict(districtsArray);
      } else {
        console.error("Error fetching station districts:", result.error);
        setStationDistrict([]);
      }
    } catch (error) {
      console.error("Error fetching station districts:", error);
      setStationDistrict([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Updated handleApplyFilters to handle arrays
  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.length > 0) activeFilters.name = filterForm.name;
    if (filterForm.tehsil.length > 0) activeFilters.tehsil = filterForm.tehsil;
    if (filterForm.address.length > 0) activeFilters.address = filterForm.address;
    if (filterForm.status.length > 0) activeFilters.status = filterForm.status;
    if (filterForm.district.length > 0) activeFilters.district = filterForm.district;

    updateFilters(activeFilters);
    setShowFilters(false);
  };

  // Updated handleClearFilters to reset arrays
  const handleClearFilters = () => {
    setFilterForm({
      name: [],
      tehsil: [],
      address: [],
      status: [],
      district: [],
    });
    clearFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  // 🆕 Helper function to get display name for selected filters
  const getDisplayName = (filterType, id) => {
    switch (filterType) {
      case 'tehsil':
        const tehsil = stationLocations.find(item => item._id === id);
        return tehsil ? tehsil.name : id;
      case 'status':
        const status = stationStatuses.find(item => item._id === id);
        return status ? status.name : id;
      case 'district':
        const district = stationDistrict.find(item => item._id === id);
        return district ? district.name : id;
      default:
        return id;
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
            Filter Stations
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
          <h3 className="text-lg font-medium text-gray-900">Filter Stations</h3>
          {/* Active filter count */}
          {Object.keys(filters).length > 0 && (
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {Object.keys(filters).length} active filter
              {Object.keys(filters).length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 🆕 Station Name Filter - Now MultiTextInput with suggestions */}
          <MultiTextInput
            label="Station Name"
            name="name"
            value={filterForm.name}
            onChange={handleFilterChange}
            placeholder="Type station name..."
            minLength={2}
            maxLength={50}
            enableSuggestions={true}
            onSearch={searchStationNames}
            suggestions={suggestions.name}
            isSearching={isSearching.name}
            searchPlaceholder="Type to search station names..."
            emptyMessage="No station names found"
            minSearchLength={2}
            onSuggestionSelect={(suggestion) => suggestion}
          />

          {/* 🆕 Tehsil Filter - Now SearchableMultiSelect */}
          <SearchableMultiSelect
            label="Tehsil"
            name="tehsil"
            value={filterForm.tehsil}
            onChange={handleFilterChange}
            options={stationLocations}
            placeholder="Select tehsils..."
            loading={loadingLocations}
            searchPlaceholder="Search tehsils..."
            emptyMessage="No tehsils found"
            allowNA={true}
          />

          {/* Address Filter - MultiTextInput without suggestions */}
          <MultiTextInput
            label="Address"
            name="address"
            value={filterForm.address}
            onChange={handleFilterChange}
            placeholder="Type address and press Enter..."
            minLength={3}
            maxLength={100}
            enableSuggestions={false}
          />

          {/* 🆕 Status Filter - Now SearchableMultiSelect */}
          <SearchableMultiSelect
            label="Status"
            name="status"
            value={filterForm.status}
            onChange={handleFilterChange}
            options={stationStatuses}
            placeholder="Select status..."
            loading={loadingStatuses}
            searchPlaceholder="Search status..."
            emptyMessage="No status found"
            allowNA={true}
          />

          {/* 🆕 District Filter - Now SearchableMultiSelect */}
          <SearchableMultiSelect
            label="District"
            name="district"
            value={filterForm.district}
            onChange={handleFilterChange}
            options={stationDistrict}
            placeholder="Select districts..."
            loading={loadingDistricts}
            searchPlaceholder="Search districts..."
            emptyMessage="No districts found"
            allowNA={true}
          />
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

        {/* 🆕 Updated Active Filters Display to handle arrays */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                Active filters:
              </span>
              
              {/* Name filters */}
              {filters.name && Array.isArray(filters.name) && filters.name.map((name, index) => (
                <span key={`name-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Name: {name}
                  <button
                    onClick={() => {
                      const newNames = filters.name.filter((_, i) => i !== index);
                      const newFilters = { ...filters };
                      if (newNames.length === 0) {
                        delete newFilters.name;
                      } else {
                        newFilters.name = newNames;
                      }
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Tehsil filters */}
              {filters.tehsil && Array.isArray(filters.tehsil) && filters.tehsil.map((tehsilId, index) => (
                <span key={`tehsil-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tehsil: {getDisplayName('tehsil', tehsilId)}
                  <button
                    onClick={() => {
                      const newTehsils = filters.tehsil.filter((_, i) => i !== index);
                      const newFilters = { ...filters };
                      if (newTehsils.length === 0) {
                        delete newFilters.tehsil;
                      } else {
                        newFilters.tehsil = newTehsils;
                      }
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Address filters */}
              {filters.address && Array.isArray(filters.address) && filters.address.map((address, index) => (
                <span key={`address-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Address: {address}
                  <button
                    onClick={() => {
                      const newAddresses = filters.address.filter((_, i) => i !== index);
                      const newFilters = { ...filters };
                      if (newAddresses.length === 0) {
                        delete newFilters.address;
                      } else {
                        newFilters.address = newAddresses;
                      }
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Status filters */}
              {filters.status && Array.isArray(filters.status) && filters.status.map((statusId, index) => (
                <span key={`status-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {getDisplayName('status', statusId)}
                  <button
                    onClick={() => {
                      const newStatuses = filters.status.filter((_, i) => i !== index);
                      const newFilters = { ...filters };
                      if (newStatuses.length === 0) {
                        delete newFilters.status;
                      } else {
                        newFilters.status = newStatuses;
                      }
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* District filters */}
              {filters.district && Array.isArray(filters.district) && filters.district.map((districtId, index) => (
                <span key={`district-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  District: {getDisplayName('district', districtId)}
                  <button
                    onClick={() => {
                      const newDistricts = filters.district.filter((_, i) => i !== index);
                      const newFilters = { ...filters };
                      if (newDistricts.length === 0) {
                        delete newFilters.district;
                      } else {
                        newFilters.district = newDistricts;
                      }
                      updateFilters(newFilters);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StationFilters;