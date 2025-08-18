// SearchableMultiSelect.jsx - A generic searchable multi-select component
import React, { useState, useRef, useEffect } from 'react';

export const SearchableMultiSelect = ({
  label,
  name,
  value = [], // Array of selected values
  onChange,
  options = [], // Array of {_id, name} or {value, label} objects
  required = false,
  placeholder = "Select items...",
  readOnly = false,
  className = "",
  loading = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  allowNA = true, // Whether to show N/A option
  valueKey = '_id', // Key to use for value (supports both _id and value)
  labelKey = 'name', // Key to use for label (supports both name and label)
  maxDisplayItems = 3 // Maximum items to show before "X more"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to have consistent structure
  const normalizedOptions = options.map(option => ({
    value: option[valueKey] || option.value,
    label: option[labelKey] || option.label || option.name
  }));

  // Add N/A option if enabled
  const allOptions = allowNA 
    ? [{ value: 'NA', label: 'N/A' }, ...normalizedOptions]
    : normalizedOptions;

  // Filter options based on search term
  const filteredOptions = allOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selection/deselection
  const handleToggleOption = (optionValue) => {
    const isSelected = value.includes(optionValue);
    let newValue;
    
    if (isSelected) {
      newValue = value.filter(v => v !== optionValue);
    } else {
      newValue = [...value, optionValue];
    }

    // Create synthetic event object to match your existing onChange handler
    const syntheticEvent = {
      target: { name, value: newValue }
    };
    onChange(syntheticEvent);
  };

  // Clear all selections
  const handleClearAll = (e) => {
    e.stopPropagation();
    const syntheticEvent = {
      target: { name, value: [] }
    };
    onChange(syntheticEvent);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Get selected labels for display
  const selectedLabels = value.map(val => {
    const option = allOptions.find(opt => opt.value === val);
    return option ? option.label : val;
  });

  // Display logic for selected items
  const getDisplayText = () => {
    if (value.length === 0) {
      return <span className="text-gray-500 text-sm">{placeholder}</span>;
    }

    if (value.length <= maxDisplayItems) {
      return selectedLabels.map((label, index) => (
        <span
          key={value[index]}
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
        >
          {label}
          {!readOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleOption(value[index]);
              }}
              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              ×
            </button>
          )}
        </span>
      ));
    } else {
      return (
        <div className="flex items-center flex-wrap">
          {selectedLabels.slice(0, maxDisplayItems).map((label, index) => (
            <span
              key={value[index]}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
            >
              {label}
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOption(value[index]);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 mr-1 mb-1">
            +{value.length - maxDisplayItems} more
          </span>
        </div>
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Main input display */}
        <div
          className={`w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 ${
            readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${loading ? 'bg-gray-50' : ''}`}
          onClick={() => !readOnly && !loading && setIsOpen(!isOpen)}
        >
          {/* Selected items display */}
          <div className="flex flex-wrap items-center min-h-[26px]">
            {loading ? (
              <span className="text-gray-500 text-sm">Loading...</span>
            ) : (
              getDisplayText()
            )}
          </div>
          
          {/* Action buttons and dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {/* Clear all button */}
            {!readOnly && !loading && value.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="mr-1 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                title="Clear all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {/* Dropdown arrow */}
            {!readOnly && !loading && (
              <svg
                className={`w-4 h-4 text-gray-400 transform transition-transform pointer-events-none ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        {/* Dropdown menu */}
        {isOpen && !readOnly && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Select all / Clear all buttons */}
            {filteredOptions.length > 0 && (
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const allValues = filteredOptions.map(opt => opt.value);
                    const syntheticEvent = {
                      target: { name, value: allValues }
                    };
                    onChange(syntheticEvent);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-800' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleOption(option.value);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Controlled by parent
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm flex-1">{option.label}</span>
                    </label>
                  );
                })
              ) : (
                <div className="px-3 py-8 text-center">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V7a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h8.306z" />
                  </svg>
                  <p className="text-sm text-gray-500">{emptyMessage}</p>
                </div>
              )}
            </div>

            {/* Footer with selection count */}
            {value.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-600">
                  {value.length} item{value.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};