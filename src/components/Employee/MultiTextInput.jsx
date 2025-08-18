// MultiTextInput.jsx - A component for entering multiple text values
import React, { useState, useRef, useEffect } from 'react';

export const MultiTextInput = ({
  label,
  name,
  value = [], // Array of text values
  onChange,
  placeholder = "Type and press Enter to add...",
  required = false,
  className = "",
  maxDisplayItems = 3,
  allowDuplicates = false,
  trimValues = true,
  minLength = 1,
  maxLength = 100,
  pattern = null, // Regex pattern for validation
  patternMessage = "Invalid format"
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Validate input value
  const validateInput = (val) => {
    if (!val || val.length < minLength) {
      return `Minimum ${minLength} character${minLength !== 1 ? 's' : ''} required`;
    }
    if (val.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`;
    }
    if (pattern && !pattern.test(val)) {
      return patternMessage;
    }
    if (!allowDuplicates && value.includes(val)) {
      return 'This value already exists';
    }
    return '';
  };

  // Add new value
  const addValue = () => {
    let newValue = trimValues ? inputValue.trim() : inputValue;
    
    if (!newValue) return;

    const validationError = validateInput(newValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    const updatedValues = [...value, newValue];
    
    // Create synthetic event object
    const syntheticEvent = {
      target: { name, value: updatedValues }
    };
    onChange(syntheticEvent);
    
    setInputValue('');
    setError('');
  };

  // Remove value
  const removeValue = (indexToRemove) => {
    const updatedValues = value.filter((_, index) => index !== indexToRemove);
    
    const syntheticEvent = {
      target: { name, value: updatedValues }
    };
    onChange(syntheticEvent);
  };

  // Clear all values
  const clearAll = () => {
    const syntheticEvent = {
      target: { name, value: [] }
    };
    onChange(syntheticEvent);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setError('');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  // Handle paste - support pasting multiple values separated by commas/newlines
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Split by common separators and clean up
    const pastedValues = pastedText
      .split(/[,\n\r\t]+/)
      .map(val => trimValues ? val.trim() : val)
      .filter(val => val.length >= minLength);

    if (pastedValues.length === 0) return;

    let validValues = [];
    let hasErrors = false;

    pastedValues.forEach(val => {
      const validationError = validateInput(val);
      if (!validationError) {
        validValues.push(val);
      } else {
        hasErrors = true;
      }
    });

    if (validValues.length > 0) {
      const updatedValues = [...value, ...validValues];
      const syntheticEvent = {
        target: { name, value: updatedValues }
      };
      onChange(syntheticEvent);
    }

    if (hasErrors) {
      setError('Some values were skipped due to validation errors');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Display logic for values
  const getDisplayValues = () => {
    if (value.length === 0) return null;

    if (value.length <= maxDisplayItems) {
      return value.map((val, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
        >
          {val}
          <button
            type="button"
            onClick={() => removeValue(index)}
            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            title="Remove"
          >
            ×
          </button>
        </span>
      ));
    } else {
      return (
        <div className="flex items-center flex-wrap">
          {value.slice(0, maxDisplayItems).map((val, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
            >
              {val}
              <button
                type="button"
                onClick={() => removeValue(index)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                title="Remove"
              >
                ×
              </button>
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
      
      <div className="relative">
        {/* Values display area */}
        {value.length > 0 && (
          <div className="w-full min-h-[38px] px-3 py-2 border border-gray-300 rounded-t-md bg-gray-50 border-b-0">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex flex-wrap items-center flex-1">
                {getDisplayValues()}
              </div>
              
              {/* Clear all button */}
              <button
                type="button"
                onClick={clearAll}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0"
                title="Clear all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Input field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            className={`w-full px-3 py-2 border border-gray-300 ${
              value.length > 0 ? 'rounded-b-md rounded-t-none' : 'rounded-md'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              error ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder={placeholder}
          />
          
          {/* Add button */}
          {inputValue.trim() && (
            <button
              type="button"
              onClick={addValue}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              title="Add value"
            >
              <svg className="w-4 h-4 text-green-600 hover:text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}

      {/* Helper text */}
      <div className="text-xs text-gray-500 mt-1 space-y-1">
        <p>Press Enter to add • Paste multiple values separated by commas</p>
        {value.length > 0 && (
          <p className="font-medium text-blue-600">
            {value.length} value{value.length !== 1 ? 's' : ''} added
          </p>
        )}
      </div>
    </div>
  );
};