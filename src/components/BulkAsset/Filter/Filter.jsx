import React from "react";
import { 
  useLookupOptions 
} from "../../../services/LookUp.js";
import { EnumSelect } from "../../SearchableDropdown.jsx";

const BulkAssetFilters = ({ filters, onFilterChange, loading }) => {
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");

  // Create asset type enum for dropdown
  const assetTypeEnum = React.useMemo(() => {
    const enumObj = {};
    assetTypeOptions?.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  }, [assetTypeOptions]);

  // Category options based on asset types
  const categoryOptions = [
    { value: "weapons", label: "Weapons" },
    { value: "pistol", label: "Pistol" },
    { value: "vehicle", label: "Vehicle" },
    { value: "weaponRound", label: "Weapon Round" },
    { value: "pistolRound", label: "Pistol Round" },
    { value: "other", label: "Other" },
  ];

  const categoryEnum = React.useMemo(() => {
    const enumObj = {};
    categoryOptions.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const clearFilters = () => {
    onFilterChange('assetType', '');
    onFilterChange('category', '');
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Asset Type Filter */}
        <div>
          <EnumSelect
            label="Filter by Asset Type"
            name="assetType"
            value={filters.assetType || ''}
            onChange={handleFilterChange}
            enumObject={assetTypeEnum}
            required={false}
            disabled={loading}
            placeholder="All Asset Types..."
          />
        </div>

        {/* Category Filter */}
        <div>
          <EnumSelect
            label="Filter by Category"
            name="category"
            value={filters.category || ''}
            onChange={handleFilterChange}
            enumObject={categoryEnum}
            required={false}
            disabled={loading}
            placeholder="All Categories..."
          />
        </div>

        {/* Future filters can be added here */}
        <div className="flex items-end">
          <div className="text-sm text-gray-500">
            Applied filters will affect new rows
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.assetType || filters.category) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.assetType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Type: {assetTypeEnum[filters.assetType]}
              <button
                onClick={() => onFilterChange('assetType', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Category: {categoryEnum[filters.category]}
              <button
                onClick={() => onFilterChange('category', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkAssetFilters;