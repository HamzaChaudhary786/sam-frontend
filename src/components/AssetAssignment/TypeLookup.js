// LookupApi.js
import axios from 'axios';
import { BACKEND_URL } from "../../constants/api.js";

const API_URL = BACKEND_URL;

// Get auth token and headers
const getToken = () => localStorage.getItem('authToken');
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic lookup function
const getLookupData = async (lookupType) => {
  try {
    const response = await axios.get(`${API_URL}/lookup?lookupType=${lookupType}`, {
      headers: getAuthHeaders(),
    });

    const lookupList = Array.isArray(response.data.result) ? response.data.result : [];

    const lookupEnum = {};
    lookupList.forEach((item) => {
      lookupEnum[item._id] = item.name;
    });

    console.log(`🎯 Fetched ${lookupType}:`, lookupList);
    console.log(`✅ Formatted ${lookupType} Enum:`, lookupEnum);

    return { success: true, data: lookupEnum };
  } catch (error) {
    console.error(`❌ Error fetching ${lookupType}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || `Failed to fetch ${lookupType}`,
    };
  }
};

// Asset Types lookup
export const getAssetTypesWithEnum = async () => {
  return await getLookupData('assetTypes');
};

// Employee Services Status lookup
export const getStatusWithEnum = async () => {
  return await getLookupData('employeeServicesStatus');
};

// Cast lookup
export const getCastsWithEnum = async () => {
  return await getLookupData('casts');
};

// Designation lookup
export const getDesignationsWithEnum = async () => {
  return await getLookupData('designations');
};

// Grades lookup
export const getGradesWithEnum = async () => {
  return await getLookupData('grades');
};

// Weapons/Assets lookup
export const getWeaponsWithEnum = async () => {
  return await getLookupData('weapons');
};

// Generic function to get any lookup type
export const getLookupByType = async (lookupType) => {
  return await getLookupData(lookupType);
};

// Get raw lookup data (without enum formatting) if needed
export const getRawLookupData = async (lookupType) => {
  try {
    const response = await axios.get(`${API_URL}/lookup?lookupType=${lookupType}`, {
      headers: getAuthHeaders(),
    });

    const lookupList = Array.isArray(response.data.result) ? response.data.result : [];

    console.log(`🎯 Fetched raw ${lookupType}:`, lookupList);

    return { success: true, data: lookupList };
  } catch (error) {
    console.error(`❌ Error fetching raw ${lookupType}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || `Failed to fetch ${lookupType}`,
    };
  }
};