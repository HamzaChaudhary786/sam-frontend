import { useState, useEffect } from 'react';
import { getAssets, addAsset, updateAsset, deleteAsset } from './AssetApi.js';

export const useAssets = (initialFilters = {}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  // Fetch all assets with current filters
  const fetchAssets = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    
    const result = await getAssets(currentFilters);
    
    if (result.success) {
      const assetsData = result.data.assets || result.data;
      setAssets(Array.isArray(assetsData) ? assetsData : []);
    } else {
      setError(result.error);
      setAssets([]);
    }

    setLoading(false);
  };

  // Add new asset
  const createAsset = async (assetData) => {
    setError('');
    const result = await addAsset(assetData);
    
    if (result.success) {
      await fetchAssets(); // only if success
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Update asset
  const modifyAsset = async (id, assetData) => {
    setError('');
    const result = await updateAsset(assetData, id);

    if (result.success) {
      await fetchAssets(); // only if success
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Delete asset
  const removeAsset = async (id) => {
    setError('');
    const result = await deleteAsset(id);

    if (result.success) {
      await fetchAssets(); // only if success
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Update filters and refetch
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    fetchAssets(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    fetchAssets({});
  };

  useEffect(() => {
    fetchAssets();
  }, []); // or [filters] if you want reactive filtering

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
    clearFilters
  };
};
