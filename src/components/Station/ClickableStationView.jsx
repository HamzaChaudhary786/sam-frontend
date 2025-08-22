import React, { useState } from 'react';
import { useGlobalStationView } from './GlobalStationView.jsx';
import { getStation } from '../Station/StationApi.js'; // Import your station API

const ClickableStationName = ({ 
  station, 
  stationId, // 🆕 New prop for when you only have the ID
  children, 
  className = "text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors duration-200",
  disabled = false,
  onClick,
  ...props
}) => {
  const { openStationView } = useGlobalStationView();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // If we have a full station object, use it directly
    if (station && station._id && station.name) {
      console.log('Using existing station object:', station);
      if (onClick) {
        onClick(station, e);
      } else {
        openStationView(station);
      }
      return;
    }

    // If we only have an ID (either in station._id or stationId prop), fetch the full station
    const idToFetch = station?._id || stationId;
    
    if (!idToFetch || idToFetch === 'NA') {
      console.log('No valid station ID to fetch');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching station by ID:', idToFetch);
      
      const result = await getStation(idToFetch);
      
      if (result.success && result.data) {
        console.log('Fetched station data:', result.data);
        const fullStation = result.data;
        
        if (onClick) {
          onClick(fullStation, e);
        } else {
          openStationView(fullStation);
        }
      } else {
        console.error('Failed to fetch station:', result.error);
        // You could show a toast error here
      }
    } catch (error) {
      console.error('Error fetching station:', error);
      // You could show a toast error here
    } finally {
      setIsLoading(false);
    }
  };

  // Determine display text
  const getDisplayText = () => {
    if (children) return children;
    if (station?.name) return station.name;
    if (typeof station === 'string') return station; // Handle case where station is just a name string
    return 'Station';
  };

  const displayText = getDisplayText();
  
  // If disabled or no station/stationId, render as plain text
  if (disabled || (!station && !stationId) || (station && !station._id && !stationId)) {
    return (
      <span className="text-gray-900" {...props}>
        {displayText}
      </span>
    );
  }

  // Add loading indicator to className if loading
  const finalClassName = isLoading 
    ? className + " opacity-50 cursor-wait"
    : className;

  return (
    <span 
      onClick={handleClick}
      className={finalClassName}
      title={isLoading ? "Loading station details..." : "Click to view station details"}
      {...props}
    >
      {displayText}
      {/* Optional: Add a small loading spinner */}
      {isLoading && (
        <span className="ml-1 inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      )}
    </span>
  );
};

export default ClickableStationName;