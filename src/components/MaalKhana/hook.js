import { useState, useEffect } from 'react';
import { getStations, addStation, updateStation, deleteStation } from './Api.js';
import { toast } from 'react-toastify';

export const useStations = (initialFilters = {}) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStations, setTotalStations] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Fetch all stations with current filters and pagination
  const fetchStations = async (currentFilters = filters, page = currentPage, limit = itemsPerPage) => {
    setLoading(true);
    setError('');
    
    try {
      // Add pagination parameters to filters
      const paginationFilters = {
        ...currentFilters,
        page,
        limit
      };
      
      const result = await getStations(paginationFilters);
      
      if (result.success) {
        // Handle the case where data has a 'stations' property
        const responseData = result.data;
        const stationsData = responseData.stations || responseData;
        
        setStations(Array.isArray(stationsData) ? stationsData : []);
        
        // Set pagination data from response
        setCurrentPage(responseData.currentPage || page);
        setTotalPages(responseData.totalPages || 1);
        setTotalStations(responseData.totalStations || stationsData.length);
      } else {
        setError(result.error);
        setStations([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalStations(0);
        toast.error(`Failed to fetch mallkhana: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while fetching mallkhana';
      setError(errorMessage);
      setStations([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalStations(0);
      toast.error(`Error fetching mallkhana: ${errorMessage}`);
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
        toast.success(`Mall Khana "${stationData.name || 'Mall Khana'}" created successfully!`);
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to create mall khana: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while creating mall khana';
      setError(errorMessage);
      toast.error(`Error creating mallkhana: ${errorMessage}`);
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
        toast.success(`Mall Khana"${stationData.name || 'Mall Khana'}" updated successfully!`);
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to update Mallkhana: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while updating MallKhana';
      setError(errorMessage);
      toast.error(`Error updating mallkhana: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Delete station
  const removeStation = async (id) => {
    setError('');
    
    try {
      const result = await deleteStation(id);
      
      if (result.success) {
        // If we're on the last page and it becomes empty, go to previous page
        const currentStationsCount = stations.length;
        const shouldGoToPrevPage = currentPage > 1 && currentStationsCount === 1;
        
        if (shouldGoToPrevPage) {
          setCurrentPage(prev => prev - 1);
          await fetchStations(filters, currentPage - 1, itemsPerPage);
        } else {
          await fetchStations();
        }
        
        toast.success("Mall Khana deleted successfully!");
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to delete Mall Khana: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while deleting Mall Khana';
      setError(errorMessage);
      toast.error(`Error deleting Mall Khana: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Update filters and refetch
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchStations(newFilters, 1, itemsPerPage);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    fetchStations({}, 1, itemsPerPage);
  };

  // Handle page change
  const setPage = (page) => {
    setCurrentPage(page);
    fetchStations(filters, page, itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    fetchStations(filters, 1, newItemsPerPage);
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
    currentPage,
    totalPages,
    totalStations,
    itemsPerPage,
    fetchStations,
    createStation,
    modifyStation,
    removeStation,
    updateFilters,
    clearFilters,
    setPage,
    setItemsPerPage: handleItemsPerPageChange
  };
};