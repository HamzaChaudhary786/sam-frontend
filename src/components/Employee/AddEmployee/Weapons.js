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
      .filter(item => item.type === 'weapons')
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
