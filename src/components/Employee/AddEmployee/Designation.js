import axios from "axios";
import { BACKEND_URL } from "../../../constants/api.js";
const API_URL = BACKEND_URL;

const getToken = () => localStorage.getItem("authToken");
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDesignationsWithEnum = async () => {
  try {
    const response = await axios.get(`${API_URL}/designation`, {
      headers: getAuthHeaders(),
    });

    const designationList = Array.isArray(response.data) ? response.data : [];

    const designationEnum = {};
    designationList.forEach((item) => {
      designationEnum[item._id] = item.name;
    });

    console.log("✅ designationRes.data:", designationEnum);
    return { success: true, data: designationEnum };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch designations",
    };
  }
};
