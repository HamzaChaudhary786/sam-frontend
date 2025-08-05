import { useState, useEffect } from 'react';
import { getAssets, addAsset, updateAsset, deleteAsset } from './AssetApi.js';
import { toast } from 'react-toastify';

export const useAssets = (initialFilters = {}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAssets: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch all assets with current filters
  const fetchAssets = async (customFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const result = await getAssets(customFilters);

      if (result.success) {
        const assetsData = result.data.assets || [];
        const safeAssets = Array.isArray(assetsData) ? assetsData : [];

        setAssets(safeAssets);
        setPagination(result.data.pagination || {}); // <- backend pagination
      } else {
        setError(result.error);
        setAssets([]);
        toast.error(`Failed to fetch assets: ${result.error}`);
      }
    } catch (error) {
      const errorMessage =
        error.message || 'Unknown error occurred while fetching assets';
      setError(errorMessage);
      setAssets([]);
      toast.error(`Error fetching assets: ${errorMessage}`);
    }

    setLoading(false);
  };

  // Add new asset
  const createAsset = async (assetData) => {
    setError('');
    try {
      const result = await addAsset(assetData);
      if (result.success) {
        await fetchAssets();
        toast.success(`Asset "${assetData.name || 'New Asset'}" created successfully!`);
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to create asset: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while creating asset';
      setError(errorMessage);
      toast.error(`Error creating asset: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Update asset
  const modifyAsset = async (id, assetData) => {
    setError('');
    try {
      const result = await updateAsset(assetData, id);
      if (result.success) {
        await fetchAssets();
        toast.success(`Asset "${assetData.name || 'Asset'}" updated successfully!`);
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to update asset: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while updating asset';
      setError(errorMessage);
      toast.error(`Error updating asset: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Delete asset
  const removeAsset = async (id) => {
    setError('');
    try {
      const result = await deleteAsset(id);
      if (result.success) {
        toast.success("Asset deleted successfully");
        await fetchAssets();
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to delete asset: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while deleting asset';
      setError(errorMessage);
      toast.error(`Error deleting asset: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Update filters and reset page to 1
  const updateFilters = (newFilters) => {
    const combinedFilters = { ...newFilters, page: 1 };
    setFilters(combinedFilters);
    fetchAssets(combinedFilters);
  };

  // Set page for pagination
  const setPage = (pageNumber) => {
    fetchAssets({ ...filters, page: pageNumber });
  };

  const clearFilters = () => {
    setFilters({});
    fetchAssets({ page: 1 });
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    loading,
    error,
    filters,
    fetchAssets,
    createAsset,
    modifyAsset,
    removeAsset,
    updateFilters,
    clearFilters,
    pagination,
    setPage,
  };
};
