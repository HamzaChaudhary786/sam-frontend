// Working useUnifiedHistory hook - replace your existing HistoryHook.js with this

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  // Status History
  getEmployeeStatusHistory,
  addEmployeeStatusHistory,
  updateEmployeeStatusHistory,
  deleteEmployeeStatusHistory,
  // Asset History
  getAssetHistory,
  addAssetHistory,
  updateAssetHistory,
  deleteAssetHistory,
  // Station History
  getStationHistory,
  addStationHistory,
  updateStationHistory,
  deleteStationHistory
} from './HistoryApi.js';

export const useUnifiedHistory = (historyType, initialFilters = {}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [lastHistoryType, setLastHistoryType] = useState(historyType); // Track last history type

  // Get the appropriate API functions based on history type
  const getApiFunctions = () => {
    switch (historyType) {
      case 'status':
        return {
          getHistory: getEmployeeStatusHistory,
          addHistory: addEmployeeStatusHistory,
          updateHistory: updateEmployeeStatusHistory,
          deleteHistory: deleteEmployeeStatusHistory
        };
      case 'asset':
        return {
          getHistory: getAssetHistory,
          addHistory: addAssetHistory,
          updateHistory: updateAssetHistory,
          deleteHistory: deleteAssetHistory
        };
      case 'station':
        return {
          getHistory: getStationHistory,
          addHistory: addStationHistory,
          updateHistory: updateStationHistory,
          deleteHistory: deleteStationHistory
        };
      default:
        toast.error(`Unknown history type: ${historyType}`);
        throw new Error(`Unknown history type: ${historyType}`);
    }
  };

  // Transform filters to match API expectations
  const transformFilters = (rawFilters) => {
    const transformed = { ...rawFilters };
    
    // For asset and station history, map 'remarks' filter to the correct field
    if (historyType === 'asset' || historyType === 'station') {
      // Map description field to remarks for asset/station
      if (transformed.description) {
        transformed.remarks = transformed.description;
        delete transformed.description;
      }
    }
    
    // For status history, ensure we use the right field names
    if (historyType === 'status') {
      // Keep description as is for status history
      if (transformed.remarks) {
        transformed.description = transformed.remarks;
        delete transformed.remarks;
      }
    }
    
    console.log(`🔄 Transformed ${historyType} filters:`, transformed);
    return transformed;
  };

  // Fetch history records with current filters
  const fetchHistory = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    
    try {
      const { getHistory } = getApiFunctions();
      const transformedFilters = transformFilters(currentFilters);
      const result = await getHistory(transformedFilters);
      
      console.log(`${historyType} History API Full Response:`, result);
      
      if (result.success) {
        // Handle different response structures from your API
        let historyData;
        
        if (result.data.history) {
          // Your API returns: { message: "...", history: [...] }
          historyData = result.data.history;
        } else if (result.data.data) {
          // Some APIs return: { success: true, data: { data: [...] } }
          historyData = result.data.data;
        } else if (Array.isArray(result.data)) {
          // Direct array response
          historyData = result.data;
        } else {
          // Fallback
          historyData = result.data;
        }
        
        console.log(`${historyType} History Data Extracted:`, historyData);
        console.log(`${historyType} History Data Type:`, typeof historyData);
        console.log(`${historyType} History Is Array:`, Array.isArray(historyData));
        
        if (Array.isArray(historyData)) {
          // Transform data to match expected format
          const transformedData = historyData.map(item => {
            const transformed = {
              ...item,
              // Map 'date' field to 'from' field for consistency
              from: item.date || item.from,
              // Ensure we have the employee info
              employee: item.employee || item.employeeId
            };
            
            // For asset/station history, ensure we have proper nested objects
            if (historyType === 'asset') {
              // Ensure currentAsset and lastAsset are properly structured
              if (item.currentAsset && typeof item.currentAsset === 'string') {
                transformed.currentAsset = { _id: item.currentAsset, name: 'Unknown Asset' };
              }
              if (item.lastAsset && typeof item.lastAsset === 'string') {
                transformed.lastAsset = { _id: item.lastAsset, name: 'Unknown Asset' };
              }
            }
            
            if (historyType === 'station') {
              // Ensure currentStation and lastStation are properly structured
              if (item.currentStation && typeof item.currentStation === 'string') {
                transformed.currentStation = { _id: item.currentStation, name: 'Unknown Station' };
              }
              if (item.lastStation && typeof item.lastStation === 'string') {
                transformed.lastStation = { _id: item.lastStation, name: 'Unknown Station' };
              }
            }
            
            return transformed;
          });
          
          console.log(`${historyType} History Transformed Data:`, transformedData);
          setHistory(transformedData);
          
        } else {
          console.error('Expected array but got:', typeof historyData, historyData);
          setHistory([]);
          const errorMsg = 'Invalid data format received from server';
          setError(errorMsg);
          toast.error(`Failed to load ${historyType} history: ${errorMsg}`);
        }
      } else {
        const errorMsg = result.error || `Failed to fetch ${historyType} history`;
        setError(errorMsg);
        setHistory([]);
        toast.error(`Failed to fetch ${historyType} history: ${errorMsg}`);
      }
    } catch (err) {
      console.error(`Fetch ${historyType} history error:`, err);
      const errorMsg = err.message || 'An unexpected error occurred';
      setError(errorMsg);
      setHistory([]);
      toast.error(`Error fetching ${historyType} history: ${errorMsg}`);
    }
    
    setLoading(false);
  };

  // Add new history record
  const createHistory = async (historyData) => {
    setError('');
    
    try {
      const { addHistory } = getApiFunctions();
      console.log(`📤 Creating ${historyType} history with data:`, historyData);
      
      const result = await addHistory(historyData);
      
      if (result.success) {
        // Add the new history record to the list
        const newRecord = result.data.data || result.data.history || result.data;
        
        // Transform the new record to match our expected format
        const transformedRecord = {
          ...newRecord,
          from: newRecord.date || newRecord.from,
          employee: newRecord.employee || newRecord.employeeId
        };
        
        setHistory(prev => Array.isArray(prev) ? [transformedRecord, ...prev] : [transformedRecord]);
        
                
        // Refresh the full list to get updated relationships
        setTimeout(() => {
          fetchHistory();
        }, 500);
        
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to create ${historyType} history: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || `Failed to create ${historyType} history`;
      setError(errorMsg);
      toast.error(`Error creating ${historyType} history: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  // Update history record
  const modifyHistory = async (id, historyData) => {
    setError('');
    
    try {
      const { updateHistory } = getApiFunctions();
      console.log(`📝 Updating ${historyType} history ID:`, id, 'with data:', historyData);
      
      const result = await updateHistory(historyData, id);
      
      if (result.success) {
        // Update the history record in the list
        const updatedRecord = result.data.data || result.data.history || result.data;
        
        // Transform the updated record
        const transformedRecord = {
          ...updatedRecord,
          from: updatedRecord.date || updatedRecord.from,
          employee: updatedRecord.employee || updatedRecord.employeeId
        };
        
        setHistory(prev =>
          Array.isArray(prev) ? prev.map(item => item._id === id ? transformedRecord : item) : []
        );
                
        // Refresh the full list to get updated relationships
        setTimeout(() => {
          fetchHistory();
        }, 500);
        
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to update ${historyType} history: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || `Failed to update ${historyType} history`;
      setError(errorMsg);
      toast.error(`Error updating ${historyType} history: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  // Delete history record
  const removeHistory = async (id) => {
    setError('');
    
    try {
      const { deleteHistory } = getApiFunctions();
      console.log(`🗑️ Deleting ${historyType} history ID:`, id);
      
      const result = await deleteHistory(id);
      
      if (result.success) {
        // Remove the history record from the list
        setHistory(prev => Array.isArray(prev) ? prev.filter(item => item._id !== id) : []);
                
        // Refresh the full list to update any affected relationships
        setTimeout(() => {
          fetchHistory();
        }, 500);
        
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to delete ${historyType} history: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || `Failed to delete ${historyType} history`;
      setError(errorMsg);
      toast.error(`Error deleting ${historyType} history: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  // Update filters and refetch
  const updateFilters = (newFilters) => {
    const mergedFilters = { ...filters, ...newFilters };
    setFilters(mergedFilters);
    fetchHistory(mergedFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    fetchHistory({});
  };

  // FIXED: Load history on mount and when history type changes
  useEffect(() => {
    if (historyType) {
      // Check if history type actually changed
      if (historyType !== lastHistoryType) {
        console.log(`🔄 History type changed from ${lastHistoryType} to ${historyType}`);
        
        // Clear existing history immediately when type changes
        setHistory([]);
        setError('');
        
        // Reset filters to employee-only when changing type
        const employeeFilter = filters.employee ? { employee: filters.employee } : {};
        setFilters(employeeFilter);
        
        // Update last history type tracker
        setLastHistoryType(historyType);
              
        // Fetch new data for the new type
        fetchHistory(employeeFilter);
      } else {
        // Same type, just refresh with current filters
        console.log(`🚀 Loading ${historyType} history with filters:`, filters);
        fetchHistory();
      }
    }
  }, [historyType]); // Only depend on historyType change

  // Separate effect for initial load
  useEffect(() => {
    if (historyType && !lastHistoryType) {
      console.log(`🎯 Initial load for ${historyType} history`);
      setLastHistoryType(historyType);
      fetchHistory();
    }
  }, []); // Run only on mount

  return {
    history,
    loading,
    error,
    filters,
    fetchHistory,
    createHistory,
    modifyHistory,
    removeHistory,
    updateFilters,
    clearFilters
  };
};