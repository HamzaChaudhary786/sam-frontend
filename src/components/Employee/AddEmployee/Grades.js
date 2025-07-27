import axios from "axios";
import { BACKEND_URL } from "../../../constants/api.js";
const API_URL = BACKEND_URL;

const getToken = () => localStorage.getItem("authToken");
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getGradesWithEnum = async () => {
  try {
    const response = await axios.get(`${API_URL}/lookup?lookupType=grades`, {
      // headers: getAuthHeaders(),
    });

    const gradeList = Array.isArray(response.data.result) ? response.data.result : [];
      console.log(response,"my response hahahahahahahahaahahhaahhaah")
      console.log(gradeList,"my list hahahahahahahahhaahhahahahhaahhaahhaha")
    const gradeEnum = {};
    gradeList.forEach((item) => {
      gradeEnum[item._id] = item.name;
    });

    console.log("✅ gradeRes.data:", gradeEnum);
    return { success: true, data: gradeEnum };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch grades",
    };
  }
};
