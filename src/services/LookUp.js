// src/services/LookUp.js
import { useEffect, useState, useCallback } from "react";

// Import API functions - update the path as needed
import { 
  getLookupsWithFilters,
  createLookup,
  updateLookup,
  deleteLookup,
  getUniqueLookupTypes
} from '../components/LookUpForm/LookUpApi.js';
import { BACKEND_URL } from "../constants/api.js";

// Main hook for lookup management (for the main lookup page)
export const useLookups = () => {
  // Main state
  const [lookups, setLookups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // 🆕 Updated filter state to support arrays
  const [filters, setFilters] = useState({
    search: [], // Changed to array for multi-text input
    lookupType: [], // Changed to array for multi-select
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // All unique types from all pages
  const [allUniqueTypes, setAllUniqueTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);

  // Fetch all unique types from all pages
  const fetchAllUniqueTypes = async () => {
    setTypesLoading(true);
    try {
      const response = await getUniqueLookupTypes();
      if (response.success && Array.isArray(response.types)) {
        setAllUniqueTypes(response.types);
      }
    } catch (error) {
      console.error('Error fetching all unique types:', error);
      setAllUniqueTypes([]);
    } finally {
      setTypesLoading(false);
    }
  };

  // 🆕 Updated fetch function to handle array filters properly (improved array handling)
  const fetchLookups = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Clean up filters - handle arrays properly and convert to API format
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (key === 'search' || key === 'lookupType') {
          // Handle array fields - convert to comma-separated string for API
          if (Array.isArray(value) && value.length > 0) {
            // Filter out empty strings and join with comma
            const filteredValues = value.filter(v => v && v.toString().trim());
            if (filteredValues.length > 0) {
              acc[key] = filteredValues.join(','); // Send as comma-separated string
              console.log(`Converting ${key} array to string:`, filteredValues, '->', acc[key]);
            }
          }
        } else if (value !== '' && value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const queryFilters = {
        page: currentPage,
        limit: itemsPerPage,
        ...cleanFilters
      };

      console.log('Final queryFilters being sent to API:', queryFilters); // Debug log

      const response = await getLookupsWithFilters(queryFilters);
      
      if (response && response.success) {
        setLookups(response.result || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || 0);
      } else {
        throw new Error(response?.message || 'Failed to fetch lookups');
      }
    } catch (err) {
      console.error('Error fetching lookups:', err);
      setError(err.message || 'Failed to load lookups');
      setLookups([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // Initialize data and watch for filter changes
  useEffect(() => {
    console.log('useEffect triggered - filters changed:', filters); // Debug log
    fetchLookups();
  }, [fetchLookups]);

  // 🆕 Additional useEffect to ensure filters trigger fetch (backup)
  useEffect(() => {
    console.log('Filters state changed, triggering fetch:', filters);
    // Add small delay to ensure state has settled
    const timer = setTimeout(() => {
      if (currentPage === 1) { // Only fetch if we're on page 1, otherwise let the main useEffect handle it
        fetchLookups();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [filters.search, filters.lookupType, filters.isActive]); // Watch specific filter properties

  // Initialize types only once
  useEffect(() => {
    fetchAllUniqueTypes();
  }, []);

  // CRUD operations
  const addLookup = async (lookupData) => {
    try {
      const response = await createLookup(lookupData);
      if (response && response.success) {
        await fetchLookups();
        await fetchAllUniqueTypes();
        return { success: true, message: 'Lookup created successfully' };
      } else {
        throw new Error(response?.message || 'Failed to create lookup');
      }
    } catch (error) {
      console.error('Error adding lookup:', error);
      setError(error.message || 'Failed to create lookup');
      throw error;
    }
  };

  const modifyLookup = async (id, lookupData) => {
    try {
      const response = await updateLookup(id, lookupData);
      if (response && response.success) {
        await fetchLookups();
        await fetchAllUniqueTypes();
        return { success: true, message: 'Lookup updated successfully' };
      } else {
        throw new Error(response?.message || 'Failed to update lookup');
      }
    } catch (error) {
      console.error('Error updating lookup:', error);
      setError(error.message || 'Failed to update lookup');
      throw error;
    }
  };

  const removeLookup = async (id, name = '') => {
    try {
      const response = await deleteLookup(id);
      if (response && response.success) {
        // If this was the last item on the current page and not page 1, go back a page
        if (lookups.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          await fetchLookups();
        }
        return { success: true, message: `Lookup "${name}" deleted successfully` };
      } else {
        throw new Error(response?.message || 'Failed to delete lookup');
      }
    } catch (error) {
      console.error('Error deleting lookup:', error);
      setError(error.message || 'Failed to delete lookup');
      throw error;
    }
  };

  // Pagination methods
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // 🆕 Updated search and filter methods to handle arrays
  const searchLookups = (searchTerms) => {
    console.log('Searching for:', searchTerms);
    const searchArray = Array.isArray(searchTerms) ? searchTerms : [searchTerms].filter(Boolean);
    setFilters(prev => ({ ...prev, search: searchArray }));
    setCurrentPage(1);
  };

  const filterByType = (lookupTypes) => {
    console.log('Filtering by types:', lookupTypes);
    const typeArray = Array.isArray(lookupTypes) ? lookupTypes : [lookupTypes].filter(Boolean);
    setFilters(prev => ({ ...prev, lookupType: typeArray }));
    setCurrentPage(1);
  };

  // 🆕 New method to update filters directly (for form components)
  const updateFilters = (newFilters) => {
    console.log('Updating filters:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // 🆕 Add search suggestions method (fetch from all pages)
  const searchLookupNames = async (query, options = {}) => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      const queryFilters = {
        search: query, // Use single string for search suggestions
        limit: 100, // Get more results to search through
        page: 1,
        sortBy: 'name',
        sortOrder: 'asc'
      };

      console.log('Searching for suggestions:', queryFilters);

      const response = await getLookupsWithFilters(queryFilters);
      
      if (response && response.success) {
        let allLookups = response.result || [];
        
        // If there are multiple pages, fetch all pages for better suggestions
        if (response.totalPages > 1) {
          const additionalPromises = [];
          for (let page = 2; page <= Math.min(response.totalPages, 5); page++) { // Limit to first 5 pages for performance
            const pageFilters = {
              ...queryFilters,
              page: page
            };
            additionalPromises.push(
              getLookupsWithFilters(pageFilters)
                .then(pageResponse => pageResponse.success ? pageResponse.result : [])
                .catch(err => {
                  console.error(`Error fetching suggestions page ${page}:`, err);
                  return [];
                })
            );
          }
          
          const additionalResults = await Promise.all(additionalPromises);
          additionalResults.forEach(pageResults => {
            allLookups = allLookups.concat(pageResults);
          });
        }
        
        // Filter and return unique names
        const names = allLookups
          .map(lookup => lookup.name)
          .filter(Boolean)
          .filter(name => name.toLowerCase().includes(query.toLowerCase()));
        
        return [...new Set(names)].slice(0, options.limit || 10); // Remove duplicates and limit results
      }
      return [];
    } catch (error) {
      console.error('Error searching lookup names:', error);
      return [];
    }
  };

  const filterByStatus = (isActive) => {
    setFilters(prev => ({ ...prev, isActive }));
    setCurrentPage(1);
  };

  const sortLookups = (sortBy, sortOrder = 'asc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  // 🆕 Updated clearFilters to reset arrays
  const clearFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      search: [],
      lookupType: [],
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  // Utility methods
  const getUniqueTypes = () => {
    return [...new Set(lookups.map(lookup => lookup.lookupType))].filter(Boolean);
  };

  const getAllUniqueTypes = () => {
    return allUniqueTypes;
  };

  const getPaginationInfo = () => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return {
      startItem,
      endItem,
      totalItems,
      currentPage,
      totalPages,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  };

  const refreshData = async () => {
    await fetchLookups();
    await fetchAllUniqueTypes();
  };

  // 🆕 Updated hasActiveFilters to check arrays
  const hasActiveFilters = () => {
    return (Array.isArray(filters.search) && filters.search.length > 0) || 
           (Array.isArray(filters.lookupType) && filters.lookupType.length > 0) || 
           filters.isActive !== undefined;
  };

  return {
    // Data
    lookups,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    
    // Types
    allUniqueTypes,
    typesLoading,
    
    // CRUD operations
    addLookup,
    modifyLookup,
    removeLookup,
    
    // Pagination methods
    goToPage,
    goToFirstPage: () => goToPage(1),
    goToLastPage: () => goToPage(totalPages),
    goToNextPage: () => goToPage(currentPage + 1),
    goToPreviousPage: () => goToPage(currentPage - 1),
    
    // Search and filter methods
    searchLookups,
    searchLookupNames, // 🆕 New method for suggestions
    filterByType,
    filterByStatus,
    updateFilters, // 🆕 New method for direct filter updates
    sortLookups,
    clearFilters,
    
    // Utility methods
    getUniqueTypes,
    getAllUniqueTypes,
    getPaginationInfo,
    refreshData,
    fetchLookups,
    refreshAllTypes: fetchAllUniqueTypes,
    
    // Current filters (for debugging and form controls)
    currentFilters: filters,
    
    // Helper to check if any filters are active
    hasActiveFilters
  };
};

// Hook for dropdown/select components (like in AddAsset.jsx)
export const useLookupOptions = (lookupType, options = {}) => {
  const [lookupOptions, setLookupOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Configuration options
  const {
    valueField = 'name', // 'name' or '_id' or any other field
    labelField = 'name',
    includeInactive = false,
    limit = 100, // Get more items for dropdowns
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;

  useEffect(() => {
    const fetchOptions = async () => {
      if (!lookupType) {
        setLookupOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      
      try {
        // Build query parameters for paginated API
        const queryParams = new URLSearchParams({
          lookupType,
          limit: limit.toString(),
          page: '1', // We'll fetch all pages if needed
          sortBy,
          sortOrder
        });

        // Only filter by active status if includeInactive is false
        if (!includeInactive) {
          queryParams.set('isActive', 'true');
        }

        const response = await fetch(
          `${BACKEND_URL}/lookup?${queryParams}`
        );
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();

        if (!data?.success) {
          throw new Error(data?.message || "Failed to fetch lookup options");
        }

        let allResults = data.result || [];

        // If there are multiple pages and we want all options for a dropdown
        if (data.totalPages > 1 && limit >= data.totalItems) {
          allResults = await fetchAllPages(lookupType, data.totalPages, {
            includeInactive,
            sortBy,
            sortOrder
          });
        }

        // Filter and format the options
        const filteredData = allResults.filter(item => {
          const typeMatches = item.lookupType === lookupType;
          const statusMatches = includeInactive || item.isActive;
          return typeMatches && statusMatches;
        });

        const formatted = filteredData.map((item) => ({
          label: item[labelField] || item.name,
          value: item[valueField] || item.name,
          ...item // Include original item data for advanced use cases
        }));

        setLookupOptions(formatted);
      } catch (err) {
        console.error('Lookup fetch error:', err);
        setError(err.message || "Failed to load lookup options");
        setLookupOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [lookupType, valueField, labelField, includeInactive, limit, sortBy, sortOrder]);

  // Helper function to fetch all pages if needed
  const fetchAllPages = async (type, totalPages, config) => {
    const allResults = [];
    const fetchPromises = [];

    for (let page = 1; page <= totalPages; page++) {
      const queryParams = new URLSearchParams({
        lookupType: type,
        limit: '100',
        page: page.toString(),
        sortBy: config.sortBy,
        sortOrder: config.sortOrder
      });

      if (!config.includeInactive) {
        queryParams.set('isActive', 'true');
      }

      const promise = fetch(`${BACKEND_URL}/lookup?${queryParams}`)
        .then(res => res.json())
        .then(data => data.success ? data.result : [])
        .catch(err => {
          console.error(`Error fetching page ${page}:`, err);
          return [];
        });

      fetchPromises.push(promise);
    }

    const results = await Promise.all(fetchPromises);
    results.forEach(pageResults => allResults.push(...pageResults));
    
    return allResults;
  };

  return { 
    options: lookupOptions, 
    loading, 
    error,
    refresh: () => {
      setError("");
      // Trigger useEffect by updating a dependency
    }
  };
};

export const useLookupAssetStatusOption = (lookupType, options = {}) => {
  const [lookupStatusOptions, setLookupStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Configuration options
  const {
    valueField = 'name', // 'name' or '_id' or any other field
    labelField = 'name',
    includeInactive = false,
    limit = 100, // Get more items for dropdowns
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;

  useEffect(() => {
    const fetchOptions = async () => {
      if (!lookupType) {
        setLookupStatusOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      
      try {
        // Build query parameters for paginated API
        const queryParams = new URLSearchParams({
          lookupType,
          limit: limit.toString(),
          page: '1', // We'll fetch all pages if needed
          sortBy,
          sortOrder
        });

        // Only filter by active status if includeInactive is false
        if (!includeInactive) {
          queryParams.set('isActive', 'true');
        }

        const response = await fetch(
          `${BACKEND_URL}/lookup?${queryParams}`
        );
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();

        if (!data?.success) {
          throw new Error(data?.message || "Failed to fetch lookup options");
        }

        let allResults = data.result || [];

        // If there are multiple pages and we want all options for a dropdown
        if (data.totalPages > 1 && limit >= data.totalItems) {
          allResults = await fetchAllPages(lookupType, data.totalPages, {
            includeInactive,
            sortBy,
            sortOrder
          });
        }

        // Filter and format the options
        const filteredData = allResults.filter(item => {
          const typeMatches = item.lookupType === lookupType;
          const statusMatches = includeInactive || item.isActive;
          return typeMatches && statusMatches;
        });

        const formatted = filteredData.map((item) => ({
          label: item[labelField] || item.name,
          value: item[valueField] || item.name,
          ...item // Include original item data for advanced use cases
        }));

        setLookupStatusOptions(formatted);
      } catch (err) {
        console.error('Lookup fetch error:', err);
        setError(err.message || "Failed to load lookup options");
        setLookupStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [lookupType, valueField, labelField, includeInactive, limit, sortBy, sortOrder]);

  // Helper function to fetch all pages if needed
  const fetchAllPages = async (type, totalPages, config) => {
    const allResults = [];
    const fetchPromises = [];

    for (let page = 1; page <= totalPages; page++) {
      const queryParams = new URLSearchParams({
        lookupType: type,
        limit: '100',
        page: page.toString(),
        sortBy: config.sortBy,
        sortOrder: config.sortOrder
      });

      if (!config.includeInactive) {
        queryParams.set('isActive', 'true');
      }

      const promise = fetch(`${BACKEND_URL}/lookup?${queryParams}`)
        .then(res => res.json())
        .then(data => data.success ? data.result : [])
        .catch(err => {
          console.error(`Error fetching page ${page}:`, err);
          return [];
        });

      fetchPromises.push(promise);
    }

    const results = await Promise.all(fetchPromises);
    results.forEach(pageResults => allResults.push(...pageResults));
    
    return allResults;
  };

  return { 
    options: lookupStatusOptions, 
    loading, 
    error,
    refresh: () => {
      setError("");
      // Trigger useEffect by updating a dependency
    }
  };
};

// Enhanced hook with caching for better performance
export const useLookupOptionsWithCache = (lookupType, options = {}) => {
  const [cache, setCache] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const cacheKey = `${lookupType}-${JSON.stringify(options)}`;
  
  useEffect(() => {
    if (cache.has(cacheKey)) {
      setLoading(false);
      return;
    }

    const fetchAndCache = async () => {
      setLoading(true);
      setError("");
      
      try {
        const result = await fetchLookupOptions(lookupType, options);
        setCache(prev => new Map(prev).set(cacheKey, result));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lookupType) {
      fetchAndCache();
    }
  }, [cacheKey, lookupType]);

  return {
    options: cache.get(cacheKey) || [],
    loading,
    error,
    clearCache: () => setCache(new Map()),
    refresh: () => {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        return newCache;
      });
    }
  };
};

// Utility function for direct API calls (can be used outside of React components)
export const fetchLookupOptions = async (lookupType, options = {}) => {
  const {
    valueField = 'name',
    labelField = 'name',
    includeInactive = false,
    limit = 100,
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;

  const queryParams = new URLSearchParams({
    lookupType,
    limit: limit.toString(),
    page: '1',
    sortBy,
    sortOrder
  });

  if (!includeInactive) {
    queryParams.set('isActive', 'true');
  }

  const response = await fetch(`${BACKEND_URL}/lookup?${queryParams}`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data?.success) {
    throw new Error(data?.message || "Failed to fetch lookup options");
  }

  let allResults = data.result || [];

  // Fetch all pages if needed
  if (data.totalPages > 1) {
    const promises = [];
    for (let page = 2; page <= data.totalPages; page++) {
      queryParams.set('page', page.toString());
      const promise = fetch(`${BACKEND_URL}/lookup?${queryParams}`)
        .then(res => res.json())
        .then(pageData => pageData.success ? pageData.result : []);
      promises.push(promise);
    }
    const additionalPages = await Promise.all(promises);
    additionalPages.forEach(pageResults => allResults.push(...pageResults));
  }

  // Filter and format
  const filtered = allResults.filter(item => {
    const typeMatches = item.lookupType === lookupType;
    const statusMatches = includeInactive || item.isActive;
    return typeMatches && statusMatches;
  });

  return filtered.map(item => ({
    label: item[labelField] || item.name,
    value: item[valueField] || item.name,
    ...item
  }));
};

// Hook for multiple lookup types at once
export const useMultipleLookupOptions = (lookupTypes = []) => {
  const [lookupData, setLookupData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMultipleLookups = async () => {
      if (lookupTypes.length === 0) {
        setLookupData({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const promises = lookupTypes.map(type => 
          fetchLookupOptions(type).catch(err => {
            console.error(`Error fetching ${type}:`, err);
            return [];
          })
        );

        const results = await Promise.all(promises);
        
        const data = {};
        lookupTypes.forEach((type, index) => {
          data[type] = results[index];
        });

        setLookupData(data);
      } catch (err) {
        setError(err.message || "Failed to load lookup options");
      } finally {
        setLoading(false);
      }
    };

    fetchMultipleLookups();
  }, [JSON.stringify(lookupTypes)]);

  return { lookupData, loading, error };
};

// Default export for convenience
export default {
  useLookups,
  useLookupOptions,
  useLookupOptionsWithCache,
  fetchLookupOptions,
  useMultipleLookupOptions
};