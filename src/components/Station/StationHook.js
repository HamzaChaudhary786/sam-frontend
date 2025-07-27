import { useState, useEffect } from 'react';
import { getStations, addStation, updateStation, deleteStation } from './StationApi.js';
import { toast } from 'react-toastify';

export const useStations = (initialFilters = {}) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  // Fetch all stations with current filters
  const fetchStations = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await getStations(currentFilters);
      
      if (result.success) {
        // Handle the case where data has a 'stations' property
        const stationsData = result.data.stations || result.data;
        setStations(Array.isArray(stationsData) ? stationsData : []);
      } else {
        setError(result.error);
        setStations([]);
        toast.error(`Failed to fetch stations: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while fetching stations';
      setError(errorMessage);
      setStations([]);
      toast.error(`Error fetching stations: ${errorMessage}`);
    }
    
    setLoading(false);
  };

  // Add new station
  const createStation = async (stationData) => {
    setError('');
    
    try {
      const result = await addStation(stationData);
      
      if (result.success) {
        await fetchStations();
        toast.success(`Station "${stationData.name || 'New Station'}" created successfully!`);
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to create station: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while creating station';
      setError(errorMessage);
      toast.error(`Error creating station: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Update station
  const modifyStation = async (id, stationData) => {
    setError('');
    
    try {
      const result = await updateStation(stationData, id);
      
      if (result.success) {
        await fetchStations();
        toast.success(`Station "${stationData.name || 'Station'}" updated successfully!`);
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to update station: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while updating station';
      setError(errorMessage);
      toast.error(`Error updating station: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Delete station
  const removeStation = async (id) => {
    setError('');
    
    try {
      const result = await deleteStation(id);
      
      if (result.success) {
        await fetchStations();
        toast.success("Station deleted successfully!");
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to delete station: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while deleting station';
      setError(errorMessage);
      toast.error(`Error deleting station: ${errorMessage}`);
      return { success: false, error: errorMessage };
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