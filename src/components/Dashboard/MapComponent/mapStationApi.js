import axios from "axios";
import { BACKEND_URL } from "../../../constants/api";

export const getFixLocationData = async () => {
    try {
        const token = localStorage.getItem("authToken"); // Get token from localStorage or cookie

        const response = await axios.get(`${BACKEND_URL}/stations/fixLocationData`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            timeout: 10000, // Optional: set timeout for safety
        });

        return response.data;
    } catch (error) {
        console.error("API call error:", error.response?.data || error.message);
        return null;
    }
};
