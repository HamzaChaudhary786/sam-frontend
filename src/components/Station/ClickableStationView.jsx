import React from 'react';
import { useGlobalStationView } from './GlobalStationView';

const ClickableStationName = ({ 
  station, 
  children, 
  className = "text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors duration-200",
  disabled = false,
  onClick,
  ...props
}) => {
  const { openStationView } = useGlobalStationView();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && station) {
      if (onClick) {
        onClick(station, e);
      } else {
        openStationView(station);
      }
    }
  };

  const displayText = children || station?.name || 'Unknown Station';
  
  if (disabled || !station) {
    return (
      <span className="text-gray-900" {...props}>
        {displayText}
      </span>
    );
  }

  return (
    <span 
      onClick={handleClick}
      className={className}
      title="Click to view station details"
      {...props}
    >
      {displayText}
    </span>
  );
};

export default ClickableStationName;