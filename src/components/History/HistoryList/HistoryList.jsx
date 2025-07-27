import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUnifiedHistory } from "../HistoryHook.js";
import UnifiedHistoryModal from "../AddHistory/AddHistory.jsx";
import {
  HISTORY_STATUS_DISPLAY,
  HISTORY_STATUS_OPTIONS,
  ASSET_ACTION_DISPLAY,
  ASSET_ACTION_OPTIONS,
  STATION_ACTION_DISPLAY,
  STATION_ACTION_OPTIONS,
  HISTORY_TYPES,
  HISTORY_TYPE_OPTIONS,
} from "../HistoryConstants.js";
import { toast } from "react-toastify";

const UnifiedHistoryList = () => {
  const location = useLocation();
  const employeeId = location.state?.id;

  // Current history type state
  const [currentHistoryType, setCurrentHistoryType] = useState(
    HISTORY_TYPES.STATUS
  );

  // Store employee data for consistent name display
  const [employeeData, setEmployeeData] = useState(
    location.state?.currentEmployeeData || null
  );

  // Initialize filters with employee ID if provided
  const initialFilters = employeeId ? { employee: employeeId } : {};
  const {
    history,
    loading,
    error,
    removeHistory,
    updateFilters,
    clearFilters,
    filters,
    fetchHistory,
    createHistory,
    modifyHistory,
  } = useUnifiedHistory(currentHistoryType, initialFilters);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // Filter state
  const [filterForm, setFilterForm] = useState({
    status: "",
    action: "",
    employee: employeeId || "",
    description: "",
    remarks: "",
  });

  // Enhanced header with sync functionality - COMMENTED SYNC BUTTON
  const renderHeaderWithSync = () => (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Employee History Management
        </h1>
      </div>
      <div className="flex space-x-3">
        {/* Buttons commented out as per your requirements */}
      </div>
    </div>
  );

  // Current state display component
  const renderCurrentEmployeeStateCard = () => {
    const currentEmployeeData =
      location.state?.currentEmployeeData || employeeData;

    if (!currentEmployeeData) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        {/* Content commented out as per your requirements */}
      </div>
    );
  };

  // FIXED: History type change handler - SINGLE VERSION ONLY
  const handleHistoryTypeChange = (newType) => {
    console.log(`🔄 Switching history type from ${currentHistoryType} to ${newType}`);

    // Close any open modals immediately
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditData(null);

    // Update the history type - the hook will handle the rest
    setCurrentHistoryType(newType);

    // Reset filter form to clean state
    const clearedForm = {
      status: "",
      action: "",
      employee: employeeId || "",
      description: "",
      remarks: "",
    };
    setFilterForm(clearedForm);

    // Success notification
    toast.success(`Switched to ${newType} history view`);
  };

  // FIXED: Single useEffect for history type changes
  useEffect(() => {
    console.log(`🎯 History type effect triggered for: ${currentHistoryType}`);

    // Close modal if open
    if (isModalOpen) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditData(null);
    }

    // Reset the filter form when history type changes
    const newFilterForm = {
      status: "",
      action: "",
      employee: employeeId || "",
      description: "",
      remarks: "",
    };
    
    setFilterForm(newFilterForm);
    
    console.log(`✅ Filter form reset for ${currentHistoryType}`);
  }, [currentHistoryType, employeeId]);

  // Edit Function
  const handleEdit = (historyItem) => {
    console.log(
      `✏️ Editing ${currentHistoryType} history record:`,
      historyItem
    );

    if (historyItem) {
      setIsEditMode(true);
      setEditData(historyItem);
      setIsModalOpen(true);
    } else {
      console.error("❌ No history item provided for editing");
      toast.error("Unable to edit: No history item selected");
    }
  };

  const handleCloseModal = () => {
    console.log(`🚪 Closing modal for ${currentHistoryType} history`);

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditData(null);

    setTimeout(() => {
      fetchHistory();
    }, 100);
  };

  const handleDelete = async (id) => {
    try {
      const result = await removeHistory(id);
      if (result && result.success) {
        toast.success(
          `${currentHistoryType} history record deleted successfully`
        );
      } else {
        toast.error(`Failed to delete ${currentHistoryType} history record`);
      }
    } catch (error) {
      console.error("Error deleting history record:", error);
      toast.error(`Error deleting history record: ${error.message}`);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};

    // Always preserve employee ID if it exists
    if (employeeId) {
      activeFilters.employee = employeeId;
    } else if (filterForm.employee.trim()) {
      activeFilters.employee = filterForm.employee.trim();
    }

    switch (currentHistoryType) {
      case HISTORY_TYPES.STATUS:
        if (filterForm.status) activeFilters.status = filterForm.status;
        if (filterForm.description.trim())
          activeFilters.description = filterForm.description.trim();
        break;

      case HISTORY_TYPES.ASSET:
        if (filterForm.action) activeFilters.action = filterForm.action;
        if (filterForm.remarks.trim())
          activeFilters.remarks = filterForm.remarks.trim();
        break;

      case HISTORY_TYPES.STATION:
        if (filterForm.action) activeFilters.action = filterForm.action;
        if (filterForm.remarks.trim())
          activeFilters.remarks = filterForm.remarks.trim();
        break;
    }

    console.log(`🔍 Applying ${currentHistoryType} filters:`, activeFilters);
    updateFilters(activeFilters);

    // Toast notification for applied filters
    const filterCount = Object.keys(activeFilters).length;
    if (filterCount > 0) {
      toast.info(
        `Applied ${filterCount} filter(s) to ${currentHistoryType} history`
      );
    } else {
      toast.info("No filters applied - showing all records");
    }
  };

  // FIXED: Clear filters function
  const handleClearFilters = () => {
    console.log(`🧹 Clearing all filters for ${currentHistoryType} history`);
    
    // Reset the form state
    const clearedForm = {
      status: "",
      action: "",
      employee: employeeId || "", // Preserve employee ID if it exists
      description: "",
      remarks: "",
    };
    
    setFilterForm(clearedForm);

    // Clear the filters in the hook - this will trigger a refetch
    if (employeeId) {
      // If we have an employee ID, keep only that filter
      updateFilters({ employee: employeeId });
    } else {
      // Otherwise, clear all filters completely
      clearFilters();
    }

    // Toast notification for cleared filters
    toast.info(`All filters cleared for ${currentHistoryType} history`);
  };

  const getTypeSpecificConfig = () => {
    switch (currentHistoryType) {
      case HISTORY_TYPES.STATUS:
        return {
          options: HISTORY_STATUS_OPTIONS,
          display: HISTORY_STATUS_DISPLAY,
          filterField: "status",
          contentField: "description",
        };
      case HISTORY_TYPES.ASSET:
        return {
          options: ASSET_ACTION_OPTIONS,
          display: ASSET_ACTION_DISPLAY,
          filterField: "action",
          contentField: "remarks",
        };
      case HISTORY_TYPES.STATION:
        return {
          options: STATION_ACTION_OPTIONS,
          display: STATION_ACTION_DISPLAY,
          filterField: "action",
          contentField: "remarks",
        };
      default:
        return {
          options: [],
          display: {},
          filterField: "status",
          contentField: "description",
        };
    }
  };

  const getEmployeeName = (historyItem) => {
    if (historyItem.employee?.firstName && historyItem.employee?.lastName) {
      return `${historyItem.employee.firstName} ${historyItem.employee.lastName}`;
    }

    if (employeeData?.firstName && employeeData?.lastName) {
      return `${employeeData.firstName} ${employeeData.lastName}`;
    }

    return "Unknown Employee";
  };

  const getEmployeeDetails = (historyItem) => {
    const employeeId = historyItem.employee?._id || historyItem.employee;

    if (historyItem.employee?.pnumber) {
      return {
        id: employeeId,
        pnumber: historyItem.employee.pnumber,
        srnumber: historyItem.employee.srnumber,
      };
    }

    if (employeeData?.pnumber) {
      return {
        id: employeeId,
        pnumber: employeeData.pnumber,
        srnumber: employeeData.srnumber,
      };
    }

    return { id: employeeId };
  };

  const renderFilterSection = () => {
    const typeConfig = getTypeSpecificConfig();

    return (
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Filter{" "}
          {currentHistoryType === "status"
            ? "Status"
            : currentHistoryType === "asset"
            ? "Asset"
            : "Station"}{" "}
          Records
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentHistoryType === HISTORY_TYPES.STATUS
                ? "Status"
                : "Action"}
            </label>
            <select
              name={
                currentHistoryType === HISTORY_TYPES.STATUS
                  ? "status"
                  : "action"
              }
              value={
                currentHistoryType === HISTORY_TYPES.STATUS
                  ? filterForm.status
                  : filterForm.action
              }
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                All{" "}
                {currentHistoryType === HISTORY_TYPES.STATUS
                  ? "Statuses"
                  : "Actions"}
              </option>
              {typeConfig.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              name="employee"
              value={filterForm.employee}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Employee ID"
              disabled={!!employeeId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentHistoryType === HISTORY_TYPES.STATUS
                ? "Description"
                : "Remarks"}
            </label>
            <input
              type="text"
              name={
                currentHistoryType === HISTORY_TYPES.STATUS
                  ? "description"
                  : "remarks"
              }
              value={
                currentHistoryType === HISTORY_TYPES.STATUS
                  ? filterForm.description
                  : filterForm.remarks
              }
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Search ${
                currentHistoryType === HISTORY_TYPES.STATUS
                  ? "description"
                  : "remarks"
              }`}
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  };

  const typeConfig = getTypeSpecificConfig();
  const safeHistory = Array.isArray(history) ? history : [];

  // FIXED: Complete renderChangeColumn function
  const renderChangeColumn = (historyItem) => {
    switch (currentHistoryType) {
      case HISTORY_TYPES.STATUS:
        return (
          <div className="text-sm text-gray-900">
            {/* Show current status change with better formatting */}
            <div className="flex items-center space-x-2 mb-2">
              {historyItem.currentStatus && (
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    historyItem.currentStatus === "active"
                      ? "bg-green-100 text-green-800"
                      : historyItem.currentStatus === "retired"
                      ? "bg-blue-100 text-blue-800"
                      : historyItem.currentStatus === "terminated"
                      ? "bg-red-100 text-red-800"
                      : historyItem.currentStatus === "suspended"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {HISTORY_STATUS_DISPLAY[historyItem.currentStatus] ||
                    historyItem.currentStatus}
                </span>
              )}
            </div>

            {/* Show status transition details */}
            {historyItem.lastStatus ? (
              // Status change - show from old to new
              <div className="text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">
                    Changed from:
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      historyItem.lastStatus === "active"
                        ? "bg-green-100 text-green-800"
                        : historyItem.lastStatus === "retired"
                        ? "bg-blue-100 text-blue-800"
                        : historyItem.lastStatus === "terminated"
                        ? "bg-red-100 text-red-800"
                        : historyItem.lastStatus === "suspended"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {HISTORY_STATUS_DISPLAY[historyItem.lastStatus] ||
                      historyItem.lastStatus}
                  </span>
                </div>

                {historyItem.currentStatus && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-medium text-gray-600">
                      Changed to:
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        historyItem.currentStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : historyItem.currentStatus === "retired"
                          ? "bg-blue-100 text-blue-800"
                          : historyItem.currentStatus === "terminated"
                          ? "bg-red-100 text-red-800"
                          : historyItem.currentStatus === "suspended"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {HISTORY_STATUS_DISPLAY[historyItem.currentStatus] ||
                        historyItem.currentStatus}
                    </span>
                  </div>
                )}

                {/* Show transition arrow summary */}
                <div className="text-xs text-gray-500 mt-2 flex items-center">
                  <span>
                    {HISTORY_STATUS_DISPLAY[historyItem.lastStatus] ||
                      historyItem.lastStatus}
                  </span>
                  <svg
                    className="h-3 w-3 mx-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span>
                    {HISTORY_STATUS_DISPLAY[historyItem.currentStatus] ||
                      historyItem.currentStatus}
                  </span>
                </div>
              </div>
            ) : historyItem.currentStatus ? (
              // Initial status assignment - no previous status
              <div className="text-xs text-gray-600">
                <div className="font-medium text-green-600">
                  Initial status set to:{" "}
                  {HISTORY_STATUS_DISPLAY[historyItem.currentStatus] ||
                    historyItem.currentStatus}
                </div>
              </div>
            ) : (
              // Fallback
              <div className="text-xs text-gray-500">
                Status information not available
              </div>
            )}
          </div>
        );

      case HISTORY_TYPES.ASSET:
        return (
          <div className="text-sm text-gray-900">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  historyItem.action === "allocated"
                    ? "bg-green-100 text-green-800"
                    : historyItem.action === "deallocated"
                    ? "bg-red-100 text-red-800"
                    : historyItem.action === "transferred"
                    ? "bg-blue-100 text-blue-800"
                    : historyItem.action === "returned"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {ASSET_ACTION_DISPLAY[historyItem.action] || historyItem.action}
              </span>
            </div>

            {/* Show asset details based on action type */}
            {historyItem.action === "deallocated" && historyItem.lastAsset ? (
              // For deallocation, show the asset that was removed (lastAsset)
              <div className="text-xs text-gray-600">
                <div className="font-medium text-red-600">
                  Deallocated:{" "}
                  {historyItem.lastAsset.name || historyItem.lastAsset}
                </div>
                {historyItem.lastAsset.type && (
                  <div className="text-gray-500">
                    {historyItem.lastAsset.type}
                    {historyItem.lastAsset.additionalInfo &&
                      ` - ${historyItem.lastAsset.additionalInfo}`}
                  </div>
                )}
                {historyItem.lastAsset.weaponNumber && (
                  <div className="text-gray-500">
                    Weapon #: {historyItem.lastAsset.weaponNumber}
                  </div>
                )}
                {historyItem.lastAsset.pistolNumber && (
                  <div className="text-gray-500">
                    Pistol #: {historyItem.lastAsset.pistolNumber}
                  </div>
                )}
              </div>
            ) : historyItem.action === "allocated" &&
              historyItem.currentAsset ? (
              // For allocation, show the new asset (currentAsset)
              <div className="text-xs text-gray-600">
                <div className="font-medium text-green-600">
                  Allocated:{" "}
                  {historyItem.currentAsset.name || historyItem.currentAsset}
                </div>
                {historyItem.currentAsset.type && (
                  <div className="text-gray-500">
                    {historyItem.currentAsset.type}
                    {historyItem.currentAsset.additionalInfo &&
                      ` - ${historyItem.currentAsset.additionalInfo}`}
                  </div>
                )}
                {historyItem.currentAsset.weaponNumber && (
                  <div className="text-gray-500">
                    Weapon #: {historyItem.currentAsset.weaponNumber}
                  </div>
                )}
                {historyItem.currentAsset.pistolNumber && (
                  <div className="text-gray-500">
                    Pistol #: {historyItem.currentAsset.pistolNumber}
                  </div>
                )}
              </div>
            ) : historyItem.action === "transferred" &&
              (historyItem.lastAsset || historyItem.currentAsset) ? (
              // For transfer, show both assets if available
              <div className="text-xs text-gray-600">
                {historyItem.lastAsset && (
                  <div className="mb-1">
                    <span className="font-medium text-red-600">From: </span>
                    {historyItem.lastAsset.name || historyItem.lastAsset}
                  </div>
                )}
                {historyItem.currentAsset && (
                  <div>
                    <span className="font-medium text-green-600">To: </span>
                    {historyItem.currentAsset.name || historyItem.currentAsset}
                  </div>
                )}
              </div>
            ) : (
              // Fallback for other cases
              <div className="text-xs text-gray-600">
                {(historyItem.currentAsset || historyItem.lastAsset) && (
                  <div className="font-medium">
                    {historyItem.currentAsset?.name ||
                      historyItem.currentAsset ||
                      historyItem.lastAsset?.name ||
                      historyItem.lastAsset}
                  </div>
                )}
              </div>
            )}

            {/* Show transition arrow and summary for transfers */}
            {historyItem.action === "transferred" &&
              historyItem.lastAsset &&
              historyItem.currentAsset && (
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span>
                    {historyItem.lastAsset?.name || historyItem.lastAsset}
                  </span>
                  <svg
                    className="h-3 w-3 mx-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span>
                    {historyItem.currentAsset?.name || historyItem.currentAsset}
                  </span>
                </div>
              )}
          </div>
        );

      case HISTORY_TYPES.STATION:
        return (
          <div className="text-sm text-gray-900">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  historyItem.action === "assigned"
                    ? "bg-green-100 text-green-800"
                    : historyItem.action === "unassigned"
                    ? "bg-red-100 text-red-800"
                    : historyItem.action === "transferred"
                    ? "bg-blue-100 text-blue-800"
                    : historyItem.action === "relieved"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {STATION_ACTION_DISPLAY[historyItem.action] ||
                  historyItem.action}
              </span>
            </div>
            
            {/* Show station details based on action type */}
            {(historyItem.action === "unassigned" || historyItem.action === "relieved") && historyItem.lastStation ? (
              // For unassignment/relief, show the station that was removed (lastStation)
              <div className="text-xs text-gray-600">
                <div className="font-medium text-red-600">
                  {historyItem.action === "unassigned" ? "Unassigned from: " : "Relieved from: "}
                  {historyItem.lastStation.name || historyItem.lastStation}
                </div>
                {historyItem.lastStation.tehsil && (
                  <div className="text-gray-500">
                    Tehsil: {historyItem.lastStation.tehsil}
                  </div>
                )}
                {historyItem.lastStation.address?.city && (
                  <div className="text-gray-500">
                    City: {historyItem.lastStation.address.city}
                  </div>
                )}
                {historyItem.lastStation.address?.line1 && (
                  <div className="text-gray-500">
                    Address: {historyItem.lastStation.address.line1}
                    {historyItem.lastStation.address?.line2 && 
                      `, ${historyItem.lastStation.address.line2}`
                    }
                  </div>
                )}
              </div>
            ) : historyItem.action === "assigned" && historyItem.currentStation ? (
              // For assignment, show the new station (currentStation)
              <div className="text-xs text-gray-600">
                <div className="font-medium text-green-600">
                  Assigned to: {historyItem.currentStation.name || historyItem.currentStation}
                </div>
                {historyItem.currentStation.tehsil && (
                  <div className="text-gray-500">
                    Tehsil: {historyItem.currentStation.tehsil}
                  </div>
                )}
                {historyItem.currentStation.address?.city && (
                  <div className="text-gray-500">
                    City: {historyItem.currentStation.address.city}
                  </div>
                )}
                {historyItem.currentStation.address?.line1 && (
                  <div className="text-gray-500">
                    Address: {historyItem.currentStation.address.line1}
                    {historyItem.currentStation.address?.line2 && 
                      `, ${historyItem.currentStation.address.line2}`
                    }
                  </div>
                )}
              </div>
            ) : historyItem.action === "transferred" && (historyItem.lastStation || historyItem.currentStation) ? (
              // For transfer, show both stations if available
              <div className="text-xs text-gray-600">
                {historyItem.lastStation && (
                  <div className="mb-2">
                    <span className="font-medium text-red-600">From: </span>
                    {historyItem.lastStation.name || historyItem.lastStation}
                    {historyItem.lastStation.tehsil && (
                      <div className="text-gray-500 ml-2">
                        Tehsil: {historyItem.lastStation.tehsil}
                      </div>
                    )}
                    {historyItem.lastStation.address?.city && (
                      <div className="text-gray-500 ml-2">
                        City: {historyItem.lastStation.address.city}
                      </div>
                    )}
                  </div>
                )}
                {historyItem.currentStation && (
                  <div>
                    <span className="font-medium text-green-600">To: </span>
                    {historyItem.currentStation.name || historyItem.currentStation}
                    {historyItem.currentStation.tehsil && (
                      <div className="text-gray-500 ml-2">
                        Tehsil: {historyItem.currentStation.tehsil}
                      </div>
                    )}
                    {historyItem.currentStation.address?.city && (
                      <div className="text-gray-500 ml-2">
                        City: {historyItem.currentStation.address.city}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Fallback for other cases
              <div className="text-xs text-gray-600">
                {(historyItem.currentStation || historyItem.lastStation) && (
                  <div className="font-medium">
                    {historyItem.currentStation?.name ||
                      historyItem.currentStation ||
                      historyItem.lastStation?.name ||
                      historyItem.lastStation}
                  </div>
                )}
              </div>
            )}
            
            {/* Show transition arrow and summary for transfers */}
            {historyItem.action === "transferred" && historyItem.lastStation && historyItem.currentStation && (
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <span>{historyItem.lastStation?.name || historyItem.lastStation}</span>
                <svg className="h-3 w-3 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span>{historyItem.currentStation?.name || historyItem.currentStation}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Enhanced Header with sync */}
      {renderHeaderWithSync()}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => {
              window.location.reload();
              toast.info("Page reloaded");
            }}
            className="text-red-600 underline text-sm mt-2"
          >
            Reload Page
          </button>
        </div>
      )}

      {/* Current Employee State Card */}
      {renderCurrentEmployeeStateCard()}

      {/* History Type Tabs */}
      <div className="bg-white shadow-md rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {HISTORY_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleHistoryTypeChange(option.value)}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  currentHistoryType === option.value
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            {
              HISTORY_TYPE_OPTIONS.find(
                (opt) => opt.value === currentHistoryType
              )?.description
            }
          </p>
        </div>
      </div>

      {/* Filter Section */}
      {renderFilterSection()}

      {/* History Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {currentHistoryType === HISTORY_TYPES.STATUS
                  ? "Status Change"
                  : currentHistoryType === HISTORY_TYPES.ASSET
                  ? "Asset Action"
                  : "Station Action"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {currentHistoryType === HISTORY_TYPES.STATUS
                  ? "Description"
                  : "Remarks"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeHistory.map((historyItem) => (
              <tr key={historyItem._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        src={
                          historyItem?.employee?.profileUrl ||
                          "/default-avatar.png"
                        }
                        alt={`${
                          historyItem?.employee?.firstName || "Unknown"
                        } ${historyItem?.employee?.lastName || ""}`}
                        className="h-10 w-10 rounded-full object-contain shadow-sm"
                      />
                    </div>

                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getEmployeeName(historyItem)}
                      </div>
                      {getEmployeeDetails(historyItem).pnumber && (
                        <div className="text-sm text-gray-500">
                          PN: {getEmployeeDetails(historyItem).pnumber} | SR:{" "}
                          {getEmployeeDetails(historyItem).srnumber}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderChangeColumn(historyItem)}
                  {historyItem.from && historyItem.to && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(historyItem.from).toLocaleDateString()} →{" "}
                      {new Date(historyItem.to).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {historyItem[typeConfig.contentField]}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {historyItem.date
                      ? new Date(historyItem.date).toLocaleDateString()
                      : historyItem.from
                      ? new Date(historyItem.from).toLocaleDateString()
                      : historyItem.createdAt
                      ? new Date(historyItem.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {historyItem.date
                      ? new Date(historyItem.date).toLocaleTimeString()
                      : historyItem.from
                      ? new Date(historyItem.from).toLocaleTimeString()
                      : historyItem.createdAt
                      ? new Date(historyItem.createdAt).toLocaleTimeString()
                      : ""}
                  </div>
                  {historyItem.to && (
                    <div className="text-xs text-red-500 mt-1">
                      Ended: {new Date(historyItem.to).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(historyItem)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(historyItem._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {safeHistory.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {employeeId
                ? `No ${currentHistoryType} history records found for this employee`
                : `No ${currentHistoryType} history records found`}
            </p>
          </div>
        )}
      </div>

      {/* Unified History Modal - UNCOMMENTED FOR EDIT FUNCTIONALITY */}
      <UnifiedHistoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEdit={isEditMode}
        editData={editData}
        defaultEmployeeId={employeeId}
        historyType={currentHistoryType}
        createHistory={createHistory}
        modifyHistory={modifyHistory}
        currentEmployeeData={location.state?.currentEmployeeData}
        onSuccess={() => {
          fetchHistory();
          toast.success(
            `History record ${isEditMode ? "updated" : "created"} successfully!`
          );
        }}
      />
    </div>
  );
};

export default UnifiedHistoryList;