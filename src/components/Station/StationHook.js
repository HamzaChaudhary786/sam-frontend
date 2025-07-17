import { useState, useEffect } from 'react';
import { getStations, addStation, updateStation, deleteStation } from './StationApi.js';

export const useStations = (initialFilters = {}) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  // Fetch all stations with current filters
  const fetchStations = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    
    const result = await getStations(currentFilters);
    
    if (result.success) {
      // Handle the case where data has a 'stations' property
      const stationsData = result.data.stations || result.data;
      setStations(Array.isArray(stationsData) ? stationsData : []);
    } else {
      setError(result.error);
      setStations([]);
    }
    
    setLoading(false);
  };

  // Add new station
  const createStation = async (stationData) => {
    setError('');
    
    const result = await addStation(stationData);
    
    if (result.success) {
      // Add the new station to the list
      setStations(prev => Array.isArray(prev) ? [...prev, result.data] : [result.data]);
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Update station
  const modifyStation = async (id, stationData) => {
    setError('');
    
    const result = await updateStation(stationData, id);
    
    if (result.success) {
      // Update the station in the list
      setStations(prev =>
        Array.isArray(prev) ? prev.map(station => station._id === id ? result.data : station) : []
      );
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Delete station
  const removeStation = async (id) => {
    setError('');
    
    const result = await deleteStation(id);
    
    if (result.success) {
      // Remove the station from the list
      setStations(prev => Array.isArray(prev) ? prev.filter(station => station._id !== id) : []);
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Update filters and refetch
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    fetchStations(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    fetchStations({});
  };

  // Load stations on mount
  useEffect(() => {
    fetchStations();
  }, []);

  return {
    stations,
    loading,
    error,
    filters,
    fetchStations,
    createStation,
    modifyStation,
    removeStation,
    updateFilters,
    clearFilters
  };
};