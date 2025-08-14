// Complete LookupPage with bulk add functionality and searchable filter
import React, { useState, useEffect, useCallback } from "react";
import { useLookups } from "../services/LookUp.js";
import LookupModal from "../components/LookUpForm/LookUpForm.jsx";
import BulkLookupModal from "../components/LookUpForm/BulkLookup.jsx";
import { lookupEnum } from "../constants/Enum.js";
import { EnumSelect } from "../components/SearchableDropdown.jsx";

const LookupPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

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
    searchLookups,
    filterByType,
    clearFilters,
    getAllUniqueTypes,
    getPaginationInfo,
    fetchLookups,
    currentFilters,
    hasActiveFilters
  } = useLookups();

  // Debounced search to avoid too many API calls
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);

  // Helper function to get enum value from key/index (same as modals)
  const getEnumValue = (keyOrValue) => {
    // If it's already a valid enum value, return it
    if (Object.values(lookupEnum).includes(keyOrValue)) {
      return keyOrValue;
    }
    
    // If it's a key, get the corresponding value
    if (lookupEnum[keyOrValue]) {
      return lookupEnum[keyOrValue];
    }
    
    // If it's an index (number), get the value at that index
    if (typeof keyOrValue === 'number' || !isNaN(keyOrValue)) {
      const enumValues = Object.values(lookupEnum);
      const index = parseInt(keyOrValue);
      if (index >= 0 && index < enumValues.length) {
        return enumValues[index];
      }
    }
    
    // Return as-is if we can't determine the correct value
    return keyOrValue;
  };

  const debouncedSearch = useCallback((value) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      console.log('Executing debounced search:', value);
      searchLookups(value);
    }, 300); // Wait 300ms after user stops typing
    
    setSearchDebounceTimer(timer);
  }, [searchLookups, searchDebounceTimer]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

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
        console.error('Delete failed:', error);
      }
    }
  };

  const handleModalSuccess = async () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditData(null);
  };

  const handleBulkModalSuccess = async (response) => {
    setIsBulkModalOpen(false);
    // Refresh the lookups list after bulk creation
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

  const handleSearch = (value) => {
    console.log('Search input changed:', value);
    setSearchTerm(value);
    
    // Use debounced search for better performance
    if (value.trim() === '') {
      // If empty, search immediately
      searchLookups('');
    } else {
      // Otherwise, debounce
      debouncedSearch(value);
    }
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    console.log('Filter type changed (raw value):', value);
    
    // Convert enum key/index to proper enum value
    const enumValue = getEnumValue(value);
    console.log('Filter type converted to enum value:', enumValue);
    
    setFilterType(value); // Store the display value for UI
    filterByType(enumValue); // Use the enum value for filtering
  };

  const clearAllFilters = () => {
    console.log('Clearing all filters from page');
    setSearchTerm("");
    setFilterType("");
    clearFilters();
  };

  const uniqueTypes = getAllUniqueTypes();
  const paginationInfo = getPaginationInfo();

  // Debug current state
  useEffect(() => {
    console.log('Current filters:', currentFilters);
    console.log('Search term state:', searchTerm);
    console.log('Filter type state:', filterType);
    console.log('Total items:', totalItems);
  }, [currentFilters, searchTerm, filterType, totalItems]);

  // Pagination component
  const   Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={!paginationInfo.hasPreviousPage}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={!paginationInfo.hasNextPage}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{paginationInfo.startItem}</span>{' '}
              to{' '}
              <span className="font-medium">{paginationInfo.endItem}</span>{' '}
              of{' '}
              <span className="font-medium">{totalItems}</span> results
              {hasActiveFilters() && (
                <span className="ml-2 text-blue-600">(filtered)</span>
              )}
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={!paginationInfo.hasPreviousPage}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!paginationInfo.hasNextPage}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lookup Management</h1>
            <p className="text-gray-600 mt-1">Manage system lookup values and configurations</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBulkAddClick}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Bulk Add</span>
            </button>
            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
                {searchTerm && <span className="text-xs text-blue-600 ml-2">({searchTerm.length} chars)</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or type..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1">
              <EnumSelect
                label="Filter by Type"
                name="filterType"
                value={filterType}
                onChange={handleFilterChange}
                enumObject={lookupEnum}
                required={false}
                placeholder="Search and select type to filter"
                disabled={typesLoading}
                allowClear={true}
              />
              {typesLoading && (
                <p className="mt-1 text-xs text-gray-500">
                  Loading types from all pages...
                </p>
              )}
            </div>
          </div>
          
          {/* Active filters indicator */}
          {hasActiveFilters() && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-blue-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  <span>Filters active - Showing {totalItems} matching result{totalItems !== 1 ? 's' : ''}</span>
                </div>
                <button 
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Lookups Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-600">Loading lookups...</span>
                      </div>
                    </td>
                  </tr>
                ) : lookups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-lg font-medium">No lookups found</p>
                        <p className="text-sm">
                          {searchTerm || filterType ? (
                            <>
                              No results match your search criteria
                              {searchTerm && (
                                <><br />Search term: "<span className="font-medium text-blue-600">{searchTerm}</span>"</>
                              )}
                              {filterType && (
                                <><br />Filter type: "<span className="font-medium text-blue-600">{filterType}</span>"</>
                              )}
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
                    <tr key={item._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          getEnumValue(filterType) === item.lookupType 
                            ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-300' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.lookupType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
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
          <Pagination />
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