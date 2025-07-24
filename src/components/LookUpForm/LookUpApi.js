// src/components/LookUpForm/LookUpApi.js - FIXED VERSION
import axios from 'axios';
import { lookupEnum } from '../../constants/Enum';
import { BACKEND_URL } from '../../constants/api';

const BASE_URL = `${BACKEND_URL}/lookup`;

// Create new lookup
export const createLookup = async (data) => {
  try {
    const response = await axios.post(BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating lookup:', error.response?.data || error.message);
    throw error;
  }
};

// FIXED: Get all lookups with pagination and filtering support
export const getAllLookups = async (queryString = '') => {
  try {
    console.log('API call URL:', `${BASE_URL}${queryString}`);
    const response = await axios.get(`${BASE_URL}${queryString}`);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching lookups:', error.response?.data || error.message);
    throw error;
  }
};

// FIXED: Get lookups with filters and pagination - This is the main function used by your hook
export const getLookupsWithFilters = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (filters.page) queryParams.set('page', filters.page);
    if (filters.limit) queryParams.set('limit', filters.limit);
    
    // CRITICAL FIX: Add search parameter correctly
    if (filters.search && filters.search.trim() !== '') {
      queryParams.set('search', filters.search.trim());
      console.log('🔍 Adding search parameter:', filters.search.trim());
    }
    
    // Add filter parameters
    if (filters.lookupType && filters.lookupType.trim() !== '') {
      queryParams.set('lookupType', filters.lookupType);
    }
    if (filters.isActive !== undefined) {
      queryParams.set('isActive', filters.isActive);
    }
    
    // Add sorting parameters
    if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const fullUrl = `${BASE_URL}${queryString}`;
    
    console.log('🌐 Final API URL:', fullUrl);
    console.log('📊 Query parameters:', Object.fromEntries(queryParams));
    
    const response = await axios.get(fullUrl);
    
    console.log('✅ API Response Status:', response.status);
    console.log('📦 API Response Data:', response.data);
    console.log('📈 Results Count:', response.data.result?.length || 0);
    console.log('🎯 Total Items:', response.data.totalItems);
    
    // Validate response structure
    if (!response.data || !response.data.success) {
      throw new Error('Invalid API response structure');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching lookups with filters:', error.response?.data || error.message);
    console.error('🔗 Failed URL:', error.config?.url);
    throw error;
  }
};

// FIXED: Search lookups with pagination
export const searchLookups = async (searchTerm, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Only add search if it's not empty
    if (searchTerm && searchTerm.trim() !== '') {
      queryParams.set('search', searchTerm.trim());
    }
    
    const url = `${BASE_URL}?${queryParams.toString()}`;
    console.log('Direct search URL:', url);
    
    const response = await axios.get(url);
    console.log('Direct search response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error searching lookups:', error.response?.data || error.message);
    throw error;
  }
};

// Test function to verify API is working correctly
export const testSearchApi = async (searchTerm) => {
  try {
    console.log('\n=== TESTING SEARCH API ===');
    console.log('Testing search term:', searchTerm);
    
    // Test 1: Direct axios call
    const testUrl = `${BASE_URL}?search=${encodeURIComponent(searchTerm)}&page=1&limit=10`;
    console.log('Test URL:', testUrl);
    
    const response = await axios.get(testUrl);
    console.log('Test Response:', response.data);
    console.log('Results returned:', response.data.result?.length || 0);
    console.log('=== END TESTING ===\n');
    
    return response.data;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
};

// FIXED: Get all lookup types from ALL pages
export const getLookupTypes = async () => {
  try {
    // First, get the first page to know total pages
    const firstPageResponse = await axios.get(`${BASE_URL}?page=1&limit=100`);
    
    if (!firstPageResponse.data.success) {
      throw new Error('Failed to fetch lookup types');
    }

    let allLookups = firstPageResponse.data.result || [];
    const totalPages = firstPageResponse.data.totalPages || 1;

    // If there are more pages, fetch them all
    if (totalPages > 1) {
      const pagePromises = [];
      
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          axios.get(`${BASE_URL}?page=${page}&limit=100`)
            .then(response => response.data.success ? response.data.result : [])
            .catch(error => {
              console.error(`Error fetching page ${page}:`, error);
              return [];
            })
        );
      }

      const additionalPages = await Promise.all(pagePromises);
      additionalPages.forEach(pageResults => {
        allLookups.push(...pageResults);
      });
    }

    // Extract unique lookup types
    const uniqueTypes = [...new Set(allLookups.map(item => item.lookupType))].filter(Boolean);
    
    return {
      success: true,
      result: allLookups,
      types: uniqueTypes
    };
  } catch (error) {
    console.error('Error fetching lookup types:', error.response?.data || error.message);
    throw error;
  }
};

// NEW: Get only unique types (optimized)
export const getUniqueLookupTypes = async () => {
  try {
    const response = await getLookupTypes();
    return {
      success: true,
      types: response.types
    };
  } catch (error) {
    console.error('Error fetching unique lookup types:', error);
    // Fallback to hardcoded types
    return {
      success: false,
      types: lookupEnum
    };
  }
};

// Get lookups by type with pagination support
export const getLookupsByType = async (lookupType, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}?lookupType=${lookupType}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lookups by type:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a lookup
export const deleteLookup = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting lookup:', error.response?.data || error.message);
    throw error;
  }
};

// Update a lookup
export const updateLookup = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating lookup:', error.response?.data || error.message);
    throw error;
  }
};

// Get lookup by ID
export const getLookupById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lookup by ID:', error.response?.data || error.message);
    throw error;
  }
};

// Bulk operations
export const bulkDeleteLookups = async (ids) => {
  try {
    const response = await axios.delete(`${BASE_URL}/bulk`, { data: { ids } });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting lookups:', error.response?.data || error.message);
    throw error;
  }
};

export const bulkUpdateLookups = async (updates) => {
  try {
    const response = await axios.put(`${BASE_URL}/bulk`, { updates });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating lookups:', error.response?.data || error.message);
    throw error;
  }
};