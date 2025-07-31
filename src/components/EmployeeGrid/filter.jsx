import React, { useState } from "react";

const EmployeeFilter = ({ 
  onFilterChange, 
  initialFilters = {},
  totalEmployees = 0,
  filteredCount = 0
}) => {
  // State for filter form
  const [filterForm, setFilterForm] = useState({
    name: initialFilters.name || '',
    city: initialFilters.city || '',
    personalNumber: initialFilters.personalNumber || '',
    cnic: initialFilters.cnic || '',
    ...initialFilters
  });

  // State for showing/hiding filters on mobile
  const [showFilters, setShowFilters] = useState(false);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filterForm,
      [name]: value
    };
    setFilterForm(newFilters);
    
    // Call the parent's filter change handler
    onFilterChange(newFilters);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters = {
      name: '',
      city: '',
      personalNumber: '',
      cnic: ''
    };
    setFilterForm(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Handle apply filters (optional - since filtering happens on change)
  const handleApplyFilters = () => {
    onFilterChange(filterForm);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterForm).some(filter => filter !== '');

  return (
    <div>
      {/* Filter Toggle Button - Show on medium and small screens */}
      <div className="xl:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
            />
          </svg>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filter Section - Responsive */}
      <div
        className={`bg-white shadow-md rounded-lg p-4 mb-6 ${
          showFilters ? "block" : "hidden"
        } xl:block`}
      >
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Filter Employees
        </h3>

        {/* Filter Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., Hamza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={filterForm.city}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., Lahore"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Number
            </label>
            <input
              type="text"
              name="personalNumber"
              value={filterForm.personalNumber}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., Emp-234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNIC
            </label>
            <input
              type="text"
              name="cnic"
              value={filterForm.cnic}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., 1234567891010"
            />
          </div>

          {/* Filter Buttons - Stack vertically on mobile/tablet */}
          <div className="flex flex-col space-y-2 sm:col-span-2 xl:col-span-4">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
                disabled={!hasActiveFilters}
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm transition-colors"
                disabled={!hasActiveFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Show filter results count */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Showing {filteredCount} of {totalEmployees} employees</span>
              </div>
              {filteredCount === 0 && (
                <div className="text-xs text-blue-600">
                  No employees match your filters
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeFilter;