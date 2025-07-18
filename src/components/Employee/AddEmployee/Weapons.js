import axios from 'axios';
import { BACKEND_URL } from "../../../constants/api.js";

const API_URL = BACKEND_URL;

const getToken = () => localStorage.getItem('authToken');
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getWeaponsWithEnum = async () => {
  try {
    const response = await axios.get(`${API_URL}/assets`, {
      headers: getAuthHeaders()
    });

    const allAssets = response.data;

    const weaponEnum = {};
    allAssets
      .filter(item => item.type === 'weapons' || item.type === 'vehicles') // Fixed: proper OR condition
      .forEach(item => {
        weaponEnum[item._id] = item.name;
      });

    return { success: true, data: weaponEnum };
  } catch (error) {
    console.error("❌ Error fetching weapons:", error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch weapons'
    };
  }
};

// NEW FUNCTION: Get individual asset details by ID
export const getAssetById = async (assetId) => {
  try {
    console.log(`📥 Fetching asset details for ID: ${assetId}`);
    
    const response = await axios.get(`${API_URL}/assets/${assetId}`, {
      headers: getAuthHeaders()
    });

    console.log(`✅ Asset details fetched:`, response.data);

    return { 
      success: true, 
      asset: response.data 
    };
  } catch (error) {
    console.error(`❌ Error fetching asset ${assetId}:`, error);
    
    // Fallback: try to get from the assets list
    try {
      console.log(`🔄 Fallback: Getting asset from list...`);
      const allAssetsResponse = await axios.get(`${API_URL}/assets`, {
        headers: getAuthHeaders()
      });
      
      const asset = allAssetsResponse.data.find(item => item._id === assetId);
      
      if (asset) {
        console.log(`✅ Asset found in list:`, asset);
        return { 
          success: true, 
          asset: asset 
        };
      }
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch asset details'
    };
  }
};