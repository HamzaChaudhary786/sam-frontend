// MultiEnumSelect.jsx - A searchable multi-select component for enum data
import React, { useState, useRef, useEffect } from 'react';

export const MultiEnumSelect = ({
  label,
  name,
  value = [], // Array of selected values
  onChange,
  enumObject = {},
  required = false,
  placeholder = "Select items...",
  readOnly = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Convert enumObject to array of options for easier filtering
  const options = Object.entries(enumObject).map(([key, label]) => ({
    value: key,
    label: label
  }));

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
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
    const option = options.find(opt => opt.value === val);
    return option ? option.label : val;
  });

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
          }`}
          onClick={() => !readOnly && setIsOpen(!isOpen)}
        >
          {/* Selected items display */}
          <div className="flex flex-wrap gap-1 mb-1">
            {value.length > 0 ? (
              selectedLabels.map((label, index) => (
                <span
                  key={value[index]}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {label}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleOption(value[index]);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">{placeholder}</span>
            )}
          </div>
          
          {/* Dropdown arrow */}
          {!readOnly && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className={`w-4 h-4 text-gray-400 transform transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>

        {/* Dropdown menu */}
        {isOpen && !readOnly && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 ${
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
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No facilities found
                </div>
              )}
            </div>

            {/* Selected count */}
            {value.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-600">
                  {value.length} facilit{value.length !== 1 ? 'ies' : 'y'} selected
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        Select multiple facilities. Click to expand and search.
      </p>
    </div>
  );
};