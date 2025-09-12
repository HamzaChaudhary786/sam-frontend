// Complete LookupPage with multi-select filters and searchable suggestions
import React, { useState, useEffect, useCallback } from "react";
import { useLookups } from "../services/LookUp.js";
import LookupModal from "../components/LookUpForm/LookUpForm.jsx";
import BulkLookupModal from "../components/LookUpForm/BulkLookup.jsx";
import { lookupEnum } from "../constants/Enum.js";
import { SearchableMultiSelect } from "../components/Employee/searchableMultiselect.jsx"; // 🆕 Import multi-select component
import { MultiTextInput } from "../components/Employee/MultiTextInput"; // 🆕 Import multi-text input component
import LookupPagination from "../components/LookUpForm/Pagination.jsx"; // Adjust path as needed

const LookupPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showFilters, setShowFilters] = useState(true); // For mobile responsiveness

  // 🆕 Multi-select filter state
  const [filterForm, setFilterForm] = useState({
    name: [], // Multi-text input with suggestions
    type: [], // Multi-select dropdown
  });

  // 🆕 Suggestions state for name search
  const [suggestions, setSuggestions] = useState({
    name: [],
  });

  const [isSearching, setIsSearching] = useState({
    name: false,
  });

  const {
    lookups,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    typesLoading,
    addLookup,
    modifyLookup,
    removeLookup,
    goToPage,
    searchLookupNames, // 🆕 New method for suggestions
    updateFilters, // 🆕 New method for updating filters
    itemsPerPage, // ADD this line
    changePageSize, // ADD this line
    clearFilters,
    getAllUniqueTypes,
    getPaginationInfo,
    fetchLookups,
    currentFilters,
    hasActiveFilters,
  } = useLookups();

  // 🆕 Convert lookupEnum array to dropdown format for SearchableMultiSelect
  const lookupTypeOptions = lookupEnum.map((type) => ({
    _id: type,
    name:
      type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1"),
  }));

  // 🆕 Search lookup names function for suggestions
  const searchLookupNamesForSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions((prev) => ({ ...prev, name: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, name: true }));

    try {
      // If searchLookupNames doesn't exist in the hook, use direct API call
      if (typeof searchLookupNames === "function") {
        const names = await searchLookupNames(query, { limit: 10 });
        setSuggestions((prev) => ({ ...prev, name: [...new Set(names)] }));
      } else {
        // Fallback: filter from current lookups data
        const filteredNames = lookups
          .filter(
            (lookup) =>
              lookup.name &&
              lookup.name.toLowerCase().includes(query.toLowerCase())
          )
          .map((lookup) => lookup.name)
          .slice(0, 10);
        setSuggestions((prev) => ({
          ...prev,
          name: [...new Set(filteredNames)],
        }));
      }
    } catch (error) {
      console.error("Error searching lookup names:", error);
      // Fallback to filtering current data on error
      const filteredNames = lookups
        .filter(
          (lookup) =>
            lookup.name &&
            lookup.name.toLowerCase().includes(query.toLowerCase())
        )
        .map((lookup) => lookup.name)
        .slice(0, 10);
      setSuggestions((prev) => ({
        ...prev,
        name: [...new Set(filteredNames)],
      }));
    } finally {
      setIsSearching((prev) => ({ ...prev, name: false }));
    }
  };

  // 🆕 Update filterForm when currentFilters change
  useEffect(() => {
    setFilterForm({
      name: Array.isArray(currentFilters.search)
        ? currentFilters.search
        : currentFilters.search
          ? [currentFilters.search]
          : [],
      type: Array.isArray(currentFilters.lookupType)
        ? currentFilters.lookupType
        : currentFilters.lookupType
          ? [currentFilters.lookupType]
          : [],
    });
  }, [currentFilters]);

  const handleAddClick = () => {
    setEditData(null);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleBulkAddClick = () => {
    setIsBulkModalOpen(true);
  };

  const handleEditClick = (lookup) => {
    setEditData(lookup);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await removeLookup(id, name);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };
  const handlePageSizeChange = (newPageSize) => {
    console.log("🔍 Lookup page size change requested:", newPageSize);
    // Use the hook's method instead of local state
    changePageSize(newPageSize);
  };

  const handleModalSuccess = async () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditData(null);
  };

  const handleBulkModalSuccess = async (response) => {
    setIsBulkModalOpen(false);
    fetchLookups();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditData(null);
  };

  const handleBulkModalClose = () => {
    setIsBulkModalOpen(false);
  };

  // 🆕 Handle filter changes with debugging
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter change - ${name}:`, value); // Debug log
    setFilterForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      console.log("Updated filterForm:", updated); // Debug log
      return updated;
    });
  };

  // 🆕 Apply filters with proper state handling
  const handleApplyFilters = async () => {
    const activeFilters = {};

    console.log("Current filterForm before applying:", filterForm); // Debug log

    if (filterForm.name.length > 0) {
      activeFilters.search = filterForm.name;
      console.log("Adding search filter:", filterForm.name);
    }

    if (filterForm.type.length > 0) {
      activeFilters.lookupType = filterForm.type;
      console.log("Adding lookupType filter:", filterForm.type);
    }

    console.log("Final activeFilters being sent:", activeFilters); // Debug log

    // Update filters - this will trigger useEffect in the hook automatically
    updateFilters(activeFilters);

    setShowFilters(false); // Hide on mobile after applying
  };

  // 🆕 Clear all filters with proper state handling
  const clearAllFilters = () => {
    console.log("Clearing all filters from page");
    setFilterForm({
      name: [],
      type: [],
    });

    // Clear filters - this will trigger useEffect in the hook automatically
    clearFilters();
  };

  const uniqueTypes = getAllUniqueTypes();
  const paginationInfo = getPaginationInfo();

  // 🆕 Helper function to get display name for selected filters
  const getDisplayName = (filterType, id) => {
    if (filterType === "type") {
      const typeOption = lookupTypeOptions.find((item) => item._id === id);
      return typeOption ? typeOption.name : id;
    }
    return id;
  };

  // Debug current state
  useEffect(() => {
    console.log("Current filters:", currentFilters);
    console.log("Filter form state:", filterForm);
    console.log("Total items:", totalItems);
  }, [currentFilters, filterForm, totalItems]);

  // Pagination component

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lookup Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system lookup values and configurations
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBulkAddClick}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Bulk Add</span>
            </button>
            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add New Lookup</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchLookups}
                  className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🆕 Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              Filter Lookups
              {hasActiveFilters() && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {filterForm.name.length + filterForm.type.length}
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

        {/* 🆕 Enhanced Filters Section */}
        <div
          className={`bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ${showFilters || window.innerWidth >= 1024
            ? "block"
            : "hidden lg:block"
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Filter Lookups
            </h3>
            {/* Active filter count */}
            {hasActiveFilters() && (
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {filterForm.name.length + filterForm.type.length} active filter
                {filterForm.name.length + filterForm.type.length !== 1
                  ? "s"
                  : ""}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 🆕 Name Filter - MultiTextInput with suggestions */}
            <MultiTextInput
              label="Search Names"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              placeholder="Type lookup name..."
              minLength={2}
              maxLength={50}
              enableSuggestions={true}
              onSearch={searchLookupNamesForSuggestions}
              suggestions={suggestions.name}
              isSearching={isSearching.name}
              searchPlaceholder="Type to search lookup names..."
              emptyMessage="No lookup names found"
              minSearchLength={2}
              onSuggestionSelect={(suggestion) => suggestion}
              debug={true}
            />

            {/* 🆕 Type Filter - SearchableMultiSelect */}
            <SearchableMultiSelect
              label="Filter by Type"
              name="type"
              value={filterForm.type}
              onChange={handleFilterChange}
              options={lookupTypeOptions}
              placeholder="Select types..."
              loading={typesLoading}
              searchPlaceholder="Search types..."
              emptyMessage="No types found"
              allowNA={false}
            />
          </div>

          {/* 🆕 Filter Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>

          {/* 🆕 Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Active filters:
                </span>

                {/* Name filters */}
                {filterForm.name.map((name, index) => (
                  <span
                    key={`name-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    Name: {name}
                    <button
                      onClick={() => {
                        const newNames = filterForm.name.filter(
                          (_, i) => i !== index
                        );
                        setFilterForm((prev) => ({ ...prev, name: newNames }));
                        // Auto-apply filter
                        if (newNames.length === 0) {
                          const newFilters = { ...currentFilters };
                          delete newFilters.search;
                          updateFilters(newFilters);
                        } else {
                          updateFilters({
                            ...currentFilters,
                            search: newNames,
                          });
                        }
                      }}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {/* Type filters */}
                {filterForm.type.map((typeId, index) => (
                  <span
                    key={`type-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    Type: {getDisplayName("type", typeId)}
                    <button
                      onClick={() => {
                        const newTypes = filterForm.type.filter(
                          (_, i) => i !== index
                        );
                        setFilterForm((prev) => ({ ...prev, type: newTypes }));
                        // Auto-apply filter
                        if (newTypes.length === 0) {
                          const newFilters = { ...currentFilters };
                          delete newFilters.lookupType;
                          updateFilters(newFilters);
                        } else {
                          updateFilters({
                            ...currentFilters,
                            lookupType: newTypes,
                          });
                        }
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

        {/* Lookups Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto pb-10">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N0.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>

                    <td colSpan="5" className="text-center py-12">
                      <div className="flex justify-center items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-gray-600">
                          Loading lookups...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : lookups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-lg font-medium">No lookups found</p>
                        <p className="text-sm">
                          {hasActiveFilters() ? (
                            <>
                              No results match your search criteria
                              <br />
                              <button
                                onClick={clearAllFilters}
                                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                              >
                                Clear filters to see all results
                              </button>
                            </>
                          ) : (
                            "Get started by adding your first lookup"
                          )}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lookups.map((item, index) => (
                    <tr
                      key={item._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(currentPage - 1) * itemsPerPage + (index + 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${filterForm.type.includes(item.lookupType)
                            ? "bg-blue-200 text-blue-900 ring-2 ring-blue-300"
                            : "bg-blue-100 text-blue-800"
                            }`}
                        >
                          {item.lookupType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item._id, item.name)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <LookupPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={itemsPerPage} // Use itemsPerPage from hook instead of local pageSize
            onPageChange={goToPage}
            onPageSizeChange={handlePageSizeChange}
            hasActiveFilters={hasActiveFilters()}
            loading={loading}
          />
        </div>

        {/* Modals */}
        <LookupModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          isEdit={isEdit}
          initialData={editData}
        />

        <BulkLookupModal
          isOpen={isBulkModalOpen}
          onClose={handleBulkModalClose}
          onSuccess={handleBulkModalSuccess}
        />
      </div>
    </div>
  );
};

export default LookupPage;
