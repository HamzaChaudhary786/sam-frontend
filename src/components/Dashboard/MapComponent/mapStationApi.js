import { BACKEND_URL } from "../../../constants/api";

// stationApi.js

export const getFixLocationData = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/stations/fixLocationData`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call error:', error);
        return null;
    }
};
