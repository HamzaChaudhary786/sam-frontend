// Searchable enum select component
import React, { useEffect, useState } from "react";


export const EnumSelect = ({
  label,
  name,
  value,
  onChange,
  enumObject,
  required = false,
  placeholder = "Search and select...",
  readOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  
  const safeEnumObject = enumObject || {};
  
  // Get selected option label
  useEffect(() => {
    if (value && safeEnumObject[value]) {
      setSelectedLabel(safeEnumObject[value]);
    } else {
      setSelectedLabel('');
    }
  }, [value, safeEnumObject]);
  
  // Filter options based on search term
  const filteredOptions = Object.entries(safeEnumObject).filter(([id, name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleInputClick = () => {
    if (!readOnly) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };
  
  const handleOptionSelect = (optionId, optionName) => {
    const fakeEvent = {
      target: {
        name: name,
        value: optionId
      }
    };
    onChange(fakeEvent);
    setSelectedLabel(optionName);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClear = () => {
    const fakeEvent = {
      target: {
        name: name,
        value: ''
      }
    };
    onChange(fakeEvent);
    setSelectedLabel('');
    setSearchTerm('');
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.searchable-dropdown')) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="searchable-dropdown relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : selectedLabel}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          placeholder={selectedLabel || placeholder}
          readOnly={readOnly}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
            readOnly ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""
          }`}
        />
        
        {/* Clear button */}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
        
        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Dropdown menu */}
        {isOpen && !readOnly && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(([id, name]) => (
                <div
                  key={id}
                  onClick={() => handleOptionSelect(id, name)}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                    value === id ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">
                No options found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};