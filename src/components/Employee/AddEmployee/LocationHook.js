import { useState, useEffect } from 'react';
import { getStationsWithDetails } from './LocationService';
import { LOCATION_ENUM } from './EmployeeConstants';

export const useLocationEnum = () => {
  // Initialize with fallback enum to prevent null/undefined errors
  const [locationEnum, setLocationEnum] = useState(LOCATION_ENUM);
  const [stationDetails, setStationDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch stations with full details from backend
  const fetchStationsData = async () => {
    setLoading(true);
    setError('');
    
    const result = await getStationsWithDetails();
    
    if (result.success) {
      // Check if we got stations from backend
      if (Object.keys(result.data.enum).length > 0) {
        setLocationEnum(result.data.enum);
        setStationDetails(result.data.details);
      } else {
        // No stations found, use fallback
        setLocationEnum(LOCATION_ENUM);
        setStationDetails({});
      }
    } else {
      setError(result.error);
      // Use hardcoded LOCATION_ENUM if backend fails
      setLocationEnum(LOCATION_ENUM);
      setStationDetails({});
    }
    
    setLoading(false);
  };

  // Load stations data on mount
  useEffect(() => {
    fetchStationsData();
  }, []);

  // Function to get station address by ID
  const getStationAddress = (stationId) => {
    return stationDetails[stationId]?.address || null;
  };

  return {
    locationEnum,
    stationDetails,
    loading,
    error,
    getStationAddress,
    refetchStationsData: fetchStationsData
  };
};