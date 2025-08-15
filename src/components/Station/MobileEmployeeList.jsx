import React from "react";
import { useNavigate } from "react-router-dom";

const MobileStationEmployeeSimple = ({ stationId, stationName, isExpanded }) => {
  const navigate = useNavigate();

  if (!isExpanded) return null;

  const handleViewAllEmployees = () => {
    // Navigate to the main employee list with station filter pre-applied
    navigate('/employees', { 
      state: { 
        initialFilters: { station: stationId },
        stationContext: { stationId, stationName }
      } 
    });
  };

  return (
    <div className="mt-4 border-t pt-3">
      <div className="bg-blue-50 rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-blue-900">
            👥 Station Employees
          </h4>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">
          View all employees posted at {stationName}
        </p>
        
        <button
          onClick={handleViewAllEmployees}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          View All Employees at This Station
        </button>
      </div>
    </div>
  );
};

export default MobileStationEmployeeSimple;