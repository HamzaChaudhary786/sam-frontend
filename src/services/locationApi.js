// Update your locationApi.js file with this fixed version

import axios from 'axios';
import { BACKEND_URL } from '../constants/api';

const API_BASE_URL = BACKEND_URL || 'http://localhost:5000/api';

// Main API instance for your backend
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Separate axios instance for external APIs (without credentials)
const externalApi = axios.create({
    timeout: 15000,
    withCredentials: false, // This is key - no credentials for external APIs
});

// Request interceptor for main API
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for main API
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
    }
);

// Location API methods (for your backend)
export const locationAPI = {
    // Get all locations
    getAll: () => api.get('/locations'),

    // Get single location
    getById: (id) => api.get(`/locations/${id}`),

    // Create new location
    create: (locationData) => api.post('/locations', locationData),

    // Update location
    update: (id, locationData) => api.put(`/locations/${id}`, locationData),

    // Delete location
    delete: (id) => api.delete(`/locations/${id}`),

    // Get nearby locations
    getNearby: (lat, lng, radius = 10) =>
        api.get(`/locations/nearby/${lat}/${lng}/${radius}`)
};

// External APIs (using separate axios instance without credentials)
export const externalAPI = {
    // Search locations using Nominatim
    searchLocation: async (query) => {
        try {
            // Use the external axios instance instead of the main one
            const response = await externalApi.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'YourMapApp/1.0' // Nominatim requires a User-Agent
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Location search error:', error);
            throw new Error('Failed to search location. Please try again.');
        }
    },

    // Reverse geocoding (get address from coordinates)
    reverseGeocode: async (lat, lng) => {
        try {
            const response = await externalApi.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'YourMapApp/1.0'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Return a fallback object instead of throwing
            return { display_name: 'Unknown Location' };
        }
    }
};

export default api;