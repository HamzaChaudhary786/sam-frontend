import axios from 'axios';
import { BACKEND_URL } from "../../constants/api.js";

const API_URL = BACKEND_URL;

const getToken = () => localStorage.getItem('authToken');

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getStationDistrictWithEnum = async () => {
  try {
    const response = await axios.get(`${API_URL}/lookup?lookupType=stationDistrict`, {
      headers: getAuthHeaders(),
    });

    const stationLocationList = Array.isArray(response.data.result) ? response.data.result : [];

    const stationLocationEnum = {};
    stationLocationList.forEach((location) => {
      stationLocationEnum[location._id] = location.name;
    });

    console.log("🎯 Fetched Station Locations:", stationLocationList);
    console.log("✅ Formatted Station Location Enum:", stationLocationEnum);

    return { success: true, data: stationLocationEnum };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch station locations",
    };
  }
};