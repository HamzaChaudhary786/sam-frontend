import React, { useState, useEffect } from "react";
import { 
  HISTORY_STATUS_OPTIONS,
  ASSET_ACTION_OPTIONS,
  STATION_ACTION_OPTIONS,
  HISTORY_TYPES
} from "../HistoryConstants.js";
import { BACKEND_URL } from "../../../constants/api.js";

const API_URL = BACKEND_URL;

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Helper function to get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const UnifiedHistoryModal = ({ 
  isOpen, 
  onClose, 
  isEdit = false, 
  editData = null, 
  defaultEmployeeId = null,
  onSuccess = () => {},
  historyType = 'status',
  createHistory,
  modifyHistory,
  currentEmployeeData = null
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  
  // Add states for fetched data
  const [assetsEnum, setAssetsEnum] = useState({});
  const [stationsEnum, setStationsEnum] = useState({});
  const [loadingEnums, setLoadingEnums] = useState(false);
  const [previousHistory, setPreviousHistory] = useState(null);

  // Fetch assets, stations, and previous history from backend
  useEffect(() => {
    const fetchModalData = async () => {
      if (!isOpen) return;
      
      setLoadingEnums(true);
      try {
        // Fetch assets
        if (historyType === HISTORY_TYPES.ASSET || historyType === 'asset') {
          console.log('🔧 Fetching assets from:', `${API_URL}/assets`);
          try {
            const assetsResponse = await fetch(`${API_URL}/assets`, {
              headers: getAuthHeaders()
            });
            
            if (assetsResponse.ok) {
              const assetsData = await assetsResponse.json();
              console.log('✅ Assets fetched successfully:', assetsData);
              
              // Convert array to enum object for dropdown
              const assetsEnumObj = {};
              if (Array.isArray(assetsData)) {
                assetsData.forEach(asset => {
                  assetsEnumObj[asset._id] = asset.name;
                });
              }
              setAssetsEnum(assetsEnumObj);
              console.log('🔧 Assets enum created:', assetsEnumObj);
            } else {
              console.error('❌ Assets API error:', assetsResponse.status, assetsResponse.statusText);
            }
          } catch (assetError) {
            console.error('❌ Error fetching assets:', assetError);
          }
        }

        // Fetch stations for station history
        if (historyType === HISTORY_TYPES.STATION || historyType === 'station') {
          const stationEndpoints = [
            `${API_URL}/station`,
            `${API_URL}/stations`, 
            `${API_URL}/location`,
            `${API_URL}/locations`
          ];

          let stationsData = null;
          let successfulEndpoint = null;

          for (const endpoint of stationEndpoints) {
            try {
              console.log('📍 Trying stations endpoint:', endpoint);
              const stationsResponse = await fetch(endpoint, {
                headers: getAuthHeaders()
              });
              
              if (stationsResponse.ok) {
                stationsData = await stationsResponse.json();
                successfulEndpoint = endpoint;
                console.log('✅ Stations fetched successfully from:', endpoint, stationsData);
                break;
              } else {
                console.log('❌ Failed endpoint:', endpoint, stationsResponse.status);
              }
            } catch (endpointError) {
              console.log('❌ Error with endpoint:', endpoint, endpointError.message);
            }
          }

          if (stationsData && successfulEndpoint) {
            const stationsEnumObj = {};
            
            let stationsArray = null;
            
            if (Array.isArray(stationsData)) {
              stationsArray = stationsData;
            } else if (stationsData.stations && Array.isArray(stationsData.stations)) {
              stationsArray = stationsData.stations;
            } else if (stationsData.data && Array.isArray(stationsData.data)) {
              stationsArray = stationsData.data;
            }
            
            if (stationsArray && stationsArray.length > 0) {
              stationsArray.forEach(station => {
                stationsEnumObj[station._id] = station.name;
              });
              setStationsEnum(stationsEnumObj);
              console.log('📍 Stations enum created:', stationsEnumObj);
              console.log('📍 Total stations loaded:', stationsArray.length);
            } else {
              console.error('❌ No stations found in response structure');
              setError('No stations found in the response');
            }
          } else {
            console.error('❌ No stations data found from any endpoint');
            setError('Could not load stations. Please check API endpoints.');
          }
        }

        // Fetch previous history for context (not in edit mode)
        if (!isEdit && (defaultEmployeeId || formData.employee)) {
          const employeeId = defaultEmployeeId || formData.employee;
          
          if (historyType === HISTORY_TYPES.ASSET || historyType === 'asset') {
            try {
              const prevResponse = await fetch(`${API_URL}/asset-history/employee/${employeeId}/previous`, {
                headers: getAuthHeaders()
              });
              
              if (prevResponse.ok) {
                const prevData = await prevResponse.json();
                setPreviousHistory(prevData);
                console.log('📋 Previous asset history loaded:', prevData);
              }
            } catch (prevError) {
              console.log('ℹ️ No previous asset history found:', prevError.message);
            }
          } else if (historyType === HISTORY_TYPES.STATION || historyType === 'station') {
            try {
              const prevResponse = await fetch(`${API_URL}/station-history/${employeeId}/previous`, {
                headers: getAuthHeaders()
              });
              
              if (prevResponse.ok) {
                const prevData = await prevResponse.json();
                setPreviousHistory(prevData);
                console.log('📋 Previous station history loaded:', prevData);
              }
            } catch (prevError) {
              console.log('ℹ️ No previous station history found:', prevError.message);
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Error fetching modal data:', error);
        setError('Failed to load required data');
      } finally {
        setLoadingEnums(false);
      }
    };

    fetchModalData();
  }, [isOpen, historyType, defaultEmployeeId, isEdit]);

  // Get current employee state for asset/station info
  const getCurrentEmployeeState = () => {
    console.log('🔍 DEBUG - currentEmployeeData:', currentEmployeeData);
    
    if (!currentEmployeeData) return {};
    
    return {
      currentStatus: currentEmployeeData.status || '',
      currentAsset: currentEmployeeData.assets?.[0]?.asset?._id || 
                   currentEmployeeData.assets?.[0]?.asset || 
                   currentEmployeeData.currentAsset?._id || 
                   currentEmployeeData.currentAsset || '',
      currentStation: currentEmployeeData.stations?._id || 
                     currentEmployeeData.stations || 
                     currentEmployeeData.currentStation?._id || 
                     currentEmployeeData.currentStation || ''
    };
  };

  // Get current asset/station name for display
  const getCurrentAssetName = () => {
    const currentState = getCurrentEmployeeState();
    
    // Try multiple ways to get current asset name
    return currentEmployeeData?.assets?.[0]?.asset?.name || 
           currentEmployeeData?.currentAsset?.name ||
           (currentState.currentAsset && assetsEnum[currentState.currentAsset]) || 
           'No Asset Assigned';
  };

  const getCurrentStationName = () => {
    const currentState = getCurrentEmployeeState();
    
    // Try multiple ways to get current station name
    return currentEmployeeData?.stations?.name ||
           currentEmployeeData?.currentStation?.name || 
           (currentState.currentStation && stationsEnum[currentState.currentStation]) || 
           'No Station Assigned';
  };

  // Get form structure based on history type
  const getInitialFormData = () => {
    const base = {
      employee: defaultEmployeeId || "",
      description: "",
      remarks: "",
      from: "",
      to: "",
    };

    const currentState = getCurrentEmployeeState();

    switch (historyType) {
      case HISTORY_TYPES.STATUS:
      case 'status':
        return {
          ...base,
          currentStatus: currentState.currentStatus,
          lastStatus: "",
        };
      case HISTORY_TYPES.ASSET:
      case 'asset':
        return {
          ...base,
          currentAsset: currentState.currentAsset, // This is the ID for API calls
          lastAsset: "",
          action: "",
        };
      case HISTORY_TYPES.STATION:
      case 'station':
        return {
          ...base,
          currentStation: currentState.currentStation, // This is the ID for API calls
          lastStation: "",
          action: "",
        };
      default:
        return base;
    }
  };

  // Initialize form data for editing
  useEffect(() => {
    const currentState = getCurrentEmployeeState();
    console.log('🎯 DEBUG - Extracted current state:', currentState);
    
    if (isEdit && editData) {
      setFormData({
        employee: editData.employee?._id || editData.employee || "",
        description: editData.description || "",
        remarks: editData.remarks || "",
        from: editData.from ? editData.from.split('T')[0] : (editData.date ? editData.date.split('T')[0] : ""),
        to: editData.to ? editData.to.split('T')[0] : "",
        // Type-specific fields
        currentStatus: currentState.currentStatus || editData.currentStatus || "",
        lastStatus: editData.lastStatus || "",
        currentAsset: currentState.currentAsset || editData.currentAsset?._id || editData.currentAsset || "",
        lastAsset: editData.lastAsset?._id || editData.lastAsset || "",
        currentStation: currentState.currentStation || editData.currentStation?._id || editData.currentStation || "",
        lastStation: editData.lastStation?._id || editData.lastStation || "",
        action: editData.action || "",
      });
    } else {
      // Reset form for new history record with current employee state
      const initialData = getInitialFormData();
      setFormData(initialData);
    }
    setError("");
  }, [isEdit, editData, isOpen, defaultEmployeeId, historyType, currentEmployeeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.employee.trim()) {
      setError("Employee ID is required");
      return false;
    }
    
    // Type-specific validation
    switch (historyType) {
      case HISTORY_TYPES.STATUS:
      case 'status':
        if (!formData.lastStatus) {
          setError("Last status must be provided");
          return false;
        }
        if (!formData.description.trim()) {
          setError("Description is required");
          return false;
        }
        break;
        
      case HISTORY_TYPES.ASSET:
      case 'asset':
        if (!formData.action) {
          setError("Action is required");
          return false;
        }
        if (!formData.currentAsset) {
          setError("Current asset must be selected");
          return false;
        }
        if (!formData.remarks.trim()) {
          setError("Remarks are required");
          return false;
        }
        break;
        
      case HISTORY_TYPES.STATION:
      case 'station':
        if (!formData.action) {
          setError("Action is required");
          return false;
        }
        if (!formData.currentStation) {
          setError("Current station must be selected");
          return false;
        }
        if (!formData.remarks.trim()) {
          setError("Remarks are required");
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data based on your API guide
      const submitData = {
        employee: formData.employee.trim(),
      };

      // Add type-specific fields according to API requirements
      switch (historyType) {
        case HISTORY_TYPES.STATUS:
        case 'status':
          if (formData.lastStatus) submitData.lastStatus = formData.lastStatus;
          if (formData.description.trim()) submitData.description = formData.description.trim();
          break;
          
        case HISTORY_TYPES.ASSET:
        case 'asset':
          // Follow API guide: send currentAsset, action, remarks
          // System will auto-link to previous asset as lastAsset
          submitData.currentAsset = formData.currentAsset;
          submitData.action = formData.action;
          submitData.remarks = formData.remarks.trim();
          // DON'T send lastAsset - system handles this automatically
          break;
          
        case HISTORY_TYPES.STATION:
        case 'station':
          // Follow API guide: send currentStation, action, remarks
          // System will auto-link to previous station as lastStation
          submitData.currentStation = formData.currentStation;
          submitData.action = formData.action;
          submitData.remarks = formData.remarks.trim();
          // DON'T send lastStation - system handles this automatically
          break;
      }

      // Add date fields only if they have values
      if (formData.from) submitData.from = formData.from;
      if (formData.to) submitData.to = formData.to;

      console.log('📤 Submitting data according to API guide:', submitData);
      
      let result;
      if (isEdit) {
        result = await modifyHistory(editData._id, submitData);
      } else {
        result = await createHistory(submitData);
      }

      console.log('📨 API Result:', result);

      if (result.success) {
        onClose();
        onSuccess();
        setFormData(getInitialFormData());
      } else {
        setError(result.error || `An error occurred while saving the ${historyType} history record`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  // Get modal title based on type
  const getModalTitle = () => {
    const typeLabel = historyType === 'status' ? 'Status History' : 
                    historyType === 'asset' ? 'Asset History' : 
                    'Station History';
    return isEdit ? `Edit ${typeLabel}` : `Add ${typeLabel}`;
  };

  // Render type-specific fields
  const renderTypeSpecificFields = () => {
    switch (historyType) {
      case HISTORY_TYPES.STATUS:
      case 'status':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status *
                </label>
                <select
                  name="lastStatus"
                  value={formData.lastStatus || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  {HISTORY_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The status this employee is changing from
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe status changed from Active to Retired due to age limit"
              />
            </div>
          </>
        );

      case HISTORY_TYPES.ASSET:
      case 'asset':
        return (
          <>
            {/* Previous History Display */}
            {previousHistory && previousHistory.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Previous Asset History</h4>
                <div className="text-xs text-blue-700">
                  Last {previousHistory.length} record(s) found. System will automatically link to previous asset.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Asset *
                </label>
                <select
                  name="currentAsset"
                  value={formData.currentAsset || ""}
                  onChange={handleChange}
                  required
                  disabled={loadingEnums}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingEnums ? "Loading assets..." : "Select current asset"}
                  </option>
                  {Object.entries(assetsEnum).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The asset being assigned to this employee
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action *
                </label>
                <select
                  name="action"
                  value={formData.action || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  {ASSET_ACTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks || ""}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Laptop assigned for project work"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: System will automatically link to previous asset if any exists
              </p>
            </div>
          </>
        );

      case HISTORY_TYPES.STATION:
      case 'station':
        return (
          <>
            {/* Previous History Display */}
            {previousHistory && previousHistory.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Previous Station History</h4>
                <div className="text-xs text-blue-700">
                  Last {previousHistory.length} record(s) found. System will automatically link to previous station.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Station *
                </label>
                <select
                  name="currentStation"
                  value={formData.currentStation || ""}
                  onChange={handleChange}
                  required
                  disabled={loadingEnums}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingEnums ? "Loading stations..." : "Select current station"}
                  </option>
                  {Object.entries(stationsEnum).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The station being assigned to this employee
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action *
                </label>
                <select
                  name="action"
                  value={formData.action || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  {STATION_ACTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks || ""}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Assigned to new security post"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: System will automatically link to previous station if any exists
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {getModalTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loadingEnums && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">Loading required data...</p>
            </div>
          )}

          {/* Employee Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID *
            </label>
            <input
              type="text"
              name="employee"
              value={formData.employee || ""}
              onChange={handleChange}
              required
              disabled={!!defaultEmployeeId}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                defaultEmployeeId ? 'bg-gray-100' : ''
              }`}
              placeholder="e.g., 507f1f77bcf86cd799439011"
            />
            <p className="text-xs text-gray-500 mt-1">
              {defaultEmployeeId 
                ? "Employee ID is pre-filled and cannot be changed"
                : "Enter the employee's MongoDB ObjectId"
              }
            </p>
          </div>

          {/* Type-specific fields */}
          {renderTypeSpecificFields()}

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="from"
                value={formData.from || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date (Optional)
              </label>
              <input
                type="date"
                name="to"
                value={formData.to || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if assignment is current</p>
            </div>
          </div>

          {/* API Guide Info */}
          {(historyType === 'asset' || historyType === 'station') && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">📋 How This Works</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• System automatically links to previous {historyType} assignments</li>
                <li>• Just select the current {historyType} and action - no need to specify previous {historyType}</li>
                <li>• Historical linkage is handled by the backend API</li>
                {previousHistory && (
                  <li>• Found {previousHistory.length} previous record(s) for auto-linking</li>
                )}
              </ul>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingEnums}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading 
                ? (isEdit ? "Updating..." : "Adding...") 
                : (isEdit ? `Update ${historyType === 'status' ? 'Status' : historyType === 'asset' ? 'Asset' : 'Station'} History` : `Add ${historyType === 'status' ? 'Status' : historyType === 'asset' ? 'Asset' : 'Station'} History`)
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedHistoryModal;