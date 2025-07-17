import axios from 'axios';
import { BACKEND_URL } from "../../../constants/api.js";
const API_URL = BACKEND_URL;

const getToken = () => localStorage.getItem('authToken');
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCastsWithEnum = async () => {
  try {
    const response = await axios.get(`${API_URL}/cast`, {
      headers: getAuthHeaders(),
    });

    const castList = Array.isArray(response.data) ? response.data : [];

    const castEnum = {};
    castList.forEach((cast) => {
      castEnum[cast._id] = cast.name;
    });

    console.log("🎯 Fetched Casts:", castList);
    console.log("✅ Formatted Cast Enum:", castEnum);

    return { success: true, data: castEnum };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch casts",
    };
  }
};

