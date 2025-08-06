import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Enhanced hook for multi-select functionality with bulk actions UI
const useGridMultiSelect = ({ 
  employees = [], 
  isAdmin = false, 
  removeEmployee, 
  loading = false,
  onMultiPosting // New prop for multi-posting callback
}) => {
  // Multiple selection state - exactly like EmployeeList
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Reset selection when employees change - exactly like EmployeeList
  useEffect(() => {
    setSelectedEmployees(new Set());
    setSelectAll(false);
  }, [employees]);

  // Multiple selection handlers - exactly like EmployeeList
  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(emp => emp._id)));
    }
    setSelectAll(!selectAll);
  };

  // Bulk delete handler - exactly like EmployeeList
  const handleBulkDelete = async () => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can delete employees");
      return;
    }
    
    if (selectedEmployees.size === 0) {
      toast.error("Please select employees to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEmployees.size} employee(s)?`)) {
      try {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (const employeeId of selectedEmployees) {
          try {
            // Validate ID format
            if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
              throw new Error("Invalid employee ID format");
            }
            
            console.log("Attempting to delete employee with ID:", employeeId);
            
            // The hook function expects just the string ID
            const result = await removeEmployee(employeeId.trim());
            
            if (result && result.success) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`${employeeId}: ${result?.error || 'Unknown error'}`);
            }
          } catch (error) {
            console.error(`Failed to delete employee ${employeeId}:`, error);
            errorCount++;
            errors.push(`${employeeId}: ${error?.message || 'Unknown error'}`);
          }
        }
        
        setSelectedEmployees(new Set());
        setSelectAll(false);
        
        if (successCount > 0 && errorCount === 0) {
          toast.success(`Successfully deleted ${successCount} employee(s)`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.warning(`Deleted ${successCount} employee(s), failed to delete ${errorCount}`);
          console.log("Errors:", errors);
        } else {
          toast.error("Failed to delete selected employees");
          console.log("All errors:", errors);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Error deleting employees");
      }
    }
  };

  // New: Handle multi-posting
  const handleMultiPosting = () => {
    console.log("Multi-posting button clicked!"); // Debug log
    console.log("Selected employees count:", selectedEmployees.size); // Debug log
    console.log("onMultiPosting function:", onMultiPosting); // Debug log
    
    if (selectedEmployees.size === 0) {
      toast.error("Please select employees for station assignment");
      return;
    }

    // Get selected employee objects
    const selectedEmployeeObjects = employees.filter(emp => 
      selectedEmployees.has(emp._id)
    );

    console.log("Selected employee objects:", selectedEmployeeObjects); // Debug log

    // Call the parent component's multi-posting handler
    if (onMultiPosting) {
      console.log("Calling onMultiPosting with employees:", selectedEmployeeObjects);
      onMultiPosting(selectedEmployeeObjects);
    } else {
      console.error("onMultiPosting callback not provided!");
      toast.error("Multi-posting functionality not properly configured");
    }
  };

  const handleClearSelection = () => {
    setSelectedEmployees(new Set());
    setSelectAll(false);
  };

  // Render functions for UI components
  const renderSelectAllCheckbox = () => (
    <input
      type="checkbox"
      checked={selectAll}
      onChange={handleSelectAll}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      disabled={loading || employees.length === 0}
    />
  );

  const renderEmployeeCheckbox = (employee) => (
    <input
      type="checkbox"
      checked={selectedEmployees.has(employee._id)}
      onChange={() => handleSelectEmployee(employee._id)}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      disabled={loading}
    />
  );

  const renderBulkActionsBar = () => {
    if (selectedEmployees.size === 0) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
        <span className="text-sm text-blue-800 font-medium">
          {selectedEmployees.size} employee(s) selected
        </span>
        <div className="flex flex-col sm:flex-row gap-2">
          {isAdmin && (
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md text-sm"
            >
              {loading ? "Deleting..." : "Delete Selected"}
            </button>
          )}
          
          {/* Multi-Posting Button */}
          <button
            onClick={(e) => {
              console.log("Multi-posting button clicked - event:", e);
              e.preventDefault();
              e.stopPropagation();
              handleMultiPosting();
            }}
            disabled={loading}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Multi Posting
          </button>
          
          <button
            onClick={handleClearSelection}
            disabled={loading}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-md text-sm"
          >
            Clear Selection
          </button>
        </div>
      </div>
    );
  };

  // Return the hook interface with render functions
  return {
    // State
    selectedEmployees,
    selectAll,
    selectedCount: selectedEmployees.size,
    hasSelection: selectedEmployees.size > 0,
    
    // Functions
    handleSelectEmployee,
    handleSelectAll,
    handleBulkDelete,
    handleMultiPosting, // New function
    handleClearSelection,
    
    // Render functions
    renderSelectAllCheckbox,
    renderEmployeeCheckbox,
    renderBulkActionsBar,
    
    // Utility functions
    isSelected: (employeeId) => selectedEmployees.has(employeeId),
    getSelectedIds: () => Array.from(selectedEmployees),
    getSelectedEmployees: () => employees.filter(emp => selectedEmployees.has(emp._id)), // New utility
    clearSelection: handleClearSelection,
  };
};

export default useGridMultiSelect;