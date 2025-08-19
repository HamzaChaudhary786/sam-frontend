// MultiTextInput.jsx - Add these props and functionality

import React, { useState, useRef, useEffect } from 'react';

export const MultiTextInput = ({
  label,
  name,
  value = [],
  onChange,
  placeholder,
  minLength = 1,
  maxLength = 100,
  pattern,
  patternMessage,
  disabled = false,
  // 🆕 New props for suggestions
  onSearch,
  suggestions = [],
  isSearching = false,
  onSuggestionSelect,
  enableSuggestions = false,
  searchPlaceholder,
  emptyMessage = "No suggestions found",
  minSearchLength = 2
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate input
  const validateInput = (input) => {
    const newErrors = [];
    
    if (input.length < minLength) {
      newErrors.push(`Minimum ${minLength} characters required`);
    }
    
    if (input.length > maxLength) {
      newErrors.push(`Maximum ${maxLength} characters allowed`);
    }
    
    if (pattern && !pattern.test(input)) {
      newErrors.push(patternMessage || 'Invalid format');
    }
    
    return newErrors;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (errors.length > 0) {
      setErrors([]);
    }

    // Trigger search for suggestions if enabled
    if (enableSuggestions && onSearch && newValue.length >= minSearchLength) {
      setShowSuggestions(true);
      onSearch(newValue);
    } else if (newValue.length < minSearchLength) {
      setShowSuggestions(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addValue(inputValue.trim());
    }
  };

  // Add value to array
  const addValue = (valueToAdd) => {
    const trimmedValue = valueToAdd.trim();
    
    if (!trimmedValue) return;
    
    const validationErrors = validateInput(trimmedValue);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (value.includes(trimmedValue)) {
      setErrors(['This value already exists']);
      return;
    }
    
    const newValue = [...value, trimmedValue];
    onChange({ target: { name, value: newValue } });
    
    setInputValue('');
    setShowSuggestions(false);
    setErrors([]);
  };

  // Remove value
  const removeValue = (indexToRemove) => {
    const newValue = value.filter((_, index) => index !== indexToRemove);
    onChange({ target: { name, value: newValue } });
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const valueToAdd = onSuggestionSelect ? onSuggestionSelect(suggestion) : suggestion;
    if (valueToAdd) {
      addValue(valueToAdd);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Selected Values */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 rounded-md border border-gray-200">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              {item}
              <button
                type="button"
                onClick={() => removeValue(index)}
                disabled={disabled}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 disabled:opacity-50"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (enableSuggestions && suggestions.length > 0 && inputValue.length >= minSearchLength) {
              setShowSuggestions(true);
            }
          }}
          placeholder={enableSuggestions ? (searchPlaceholder || placeholder) : placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
            errors.length > 0 ? 'border-red-300' : 'border-gray-300'
          }`}
        />

        {/* Loading Spinner */}
        {enableSuggestions && isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {enableSuggestions && showSuggestions && inputValue.length >= minSearchLength && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto"
          >
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  disabled={disabled}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50 border-b border-gray-100 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))
            ) : (
              !isSearching && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {emptyMessage}
                </div>
              )
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {enableSuggestions 
          ? `Type ${minSearchLength}+ characters to search, or press Enter to add`
          : `Type ${minLength}+ characters and press Enter to add`
        }
      </p>

      {errors.length > 0 && (
        <div className="mt-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};