import axios from 'axios';
import { BACKEND_URL } from "../../../constants/api.js";

const API_URL = BACKEND_URL;

const getToken = () => localStorage.getItem('authToken');

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTrainingsWithEnum = async () => {
  try {
    const response = await axios.get(`${API_URL}/lookup?lookupType=training`, {
      headers: getAuthHeaders(),
    });

    const trainingList = Array.isArray(response.data.result) ? response.data.result : [];

    const trainingEnum = {};
    trainingList.forEach((training) => {
      trainingEnum[training._id] = training.name;
    });

    console.log("🎯 Fetched Trainings:", trainingList);
    console.log("✅ Formatted Training Enum:", trainingEnum);

    return { success: true, data: trainingEnum };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch trainings",
    };
  }
};