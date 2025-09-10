// EmployeeMultiSelect.jsx - With Multi-Asset Assignment Feature
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EmployeeMultiSelect = ({ 
  employees = [], 
  isAdmin = false, 
  removeEmployee, 
  loading = false,
  onMultiPosting, // Callback for multi-posting
  onMultiDeduction, // Callback for multi-deduction
  onMultiAchievement, // Callback for multi-achievement
  onMultiStatus, // Callback for multi-status assignment
  onMultiAsset // ✅ New: Callback for multi-asset assignment
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setSelectedEmployees(new Set());
    setSelectAll(false);
  }, [employees]);

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      newSet.has(employeeId) ? newSet.delete(employeeId) : newSet.add(employeeId);
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
        let successCount = 0, errorCount = 0, errors = [];

        for (const employeeId of selectedEmployees) {
          try {
            if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
              throw new Error("Invalid employee ID format");
            }
            const result = await removeEmployee(employeeId.trim());
            result?.success ? successCount++ : (errorCount++, errors.push(`${employeeId}: ${result?.error || 'Unknown error'}`));
          } catch (error) {
            errorCount++;
            errors.push(`${employeeId}: ${error.message || 'Unknown error'}`);
          }
        }

        setSelectedEmployees(new Set());
        setSelectAll(false);

        if (successCount && !errorCount) toast.success(`Deleted ${successCount} employee(s)`);
        else if (successCount && errorCount) toast.warning(`Deleted ${successCount}, failed ${errorCount}`);
        else toast.error("Failed to delete selected employees");
        if (errors.length) console.log("Errors:", errors);
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Error deleting employees");
      }
    }
  };

  const handleMultiPosting = () => {
    if (selectedEmployees.size === 0) {
      toast.error("Please select employees for station assignment");
      return;
    }
    const selectedEmployeeObjects = employees.filter(emp => selectedEmployees.has(emp._id));
    onMultiPosting?.(selectedEmployeeObjects);
  };

  const handleMultiDeduction = () => {
    if (selectedEmployees.size === 0) {
      toast.error("Please select employees for salary deduction");
      return;
    }
    const selectedEmployeeObjects = employees.filter(emp => selectedEmployees.has(emp._id));
    onMultiDeduction?.(selectedEmployeeObjects);
  };

  const handleMultiAchievement = () => {
    if (selectedEmployees.size === 0) {
      toast.error("Please select employees for achievement assignment");
      return;
    }
    const selectedEmployeeObjects = employees.filter(emp => selectedEmployees.has(emp._id));
    onMultiAchievement?.(selectedEmployeeObjects);
  };

  const handleMultiStatus = () => {
    if (selectedEmployees.size === 0) {
      toast.error("Please select employees for status assignment");
      return;
    }
    const selectedEmployeeObjects = employees.filter(emp => selectedEmployees.has(emp._id));
    onMultiStatus?.(selectedEmployeeObjects);
  };

  // ✅ Multi-Asset Assignment handler
  const handleMultiAsset = () => {
    if (selectedEmployees.size === 0) {
      toast.error("Please select employees for asset assignment");
      return;
    }
    const selectedEmployeeObjects = employees.filter(emp => selectedEmployees.has(emp._id));
    onMultiAsset?.(selectedEmployeeObjects);
  };

  const handleClearSelection = () => {
    setSelectedEmployees(new Set());
    setSelectAll(false);
  };

  const renderSelectAllCheckbox = () => (
    <input
      type="checkbox"
      checked={selectAll}
      onChange={handleSelectAll}
      className="rounded border-gray-300 w-4 h-4  text-blue-600 focus:ring-blue-500"
      disabled={loading || employees.length === 0}
    />
    
  );

  const renderEmployeeCheckbox = (employee) => (
    <input
      type="checkbox"
      checked={selectedEmployees.has(employee._id)}
      onChange={() => handleSelectEmployee(employee._id)}
      className="rounded border-gray-300 mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
      disabled={loading}
    />
  );

  const renderBulkActionsBar = () => {
    if (selectedEmployees.size === 0) return null;

    return (
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md mb-4 ` }>
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
            onClick={handleMultiPosting}
            disabled={loading}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Multi Posting
          </button>

          {/* Multi-Deduction Button */}
          <button
            onClick={handleMultiDeduction}
            disabled={loading}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-md text-sm flex items-center gap-1"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Multi Deduction
          </button>

          {/* Multi-Achievement Button */}
          <button
            onClick={handleMultiAchievement}
            disabled={loading}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Multi Achievement
          </button>

          {/* Multi-Status Assignment Button */}
          <button
            onClick={handleMultiStatus}
            disabled={loading}
            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-md text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Multi Status
          </button>

          {/* ✅ Multi-Asset Assignment Button */}
          <button
            onClick={handleMultiAsset}
            disabled={loading}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white rounded-md text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            Multi Asset
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

  return {
    selectedEmployees,
    selectAll,
    selectedCount: selectedEmployees.size,
    hasSelection: selectedEmployees.size > 0,

    handleSelectEmployee,
    handleSelectAll,
    handleBulkDelete,
    handleMultiPosting,
    handleMultiDeduction,
    handleMultiAchievement,
    handleMultiStatus,
    handleMultiAsset, // ✅ expose handler

    handleClearSelection,

    renderSelectAllCheckbox,
    renderEmployeeCheckbox,
    renderBulkActionsBar,

    isSelected: (employeeId) => selectedEmployees.has(employeeId),
    getSelectedIds: () => Array.from(selectedEmployees),
    getSelectedEmployees: () => employees.filter(emp => selectedEmployees.has(emp._id)),
    clearSelection: handleClearSelection,
  };
};

export default EmployeeMultiSelect;