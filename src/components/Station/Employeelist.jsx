import React from "react";
import EmployeeList from "../Employee/EmployeeList/EmployeeList.jsx";

const StationEmployeeWrapper = ({ 
  stationId, 
  stationName, 
  showAll = false, 
  onToggleView 
}) => {
  // Create filters for this specific station
  const employeeFilters = {
    station: stationId,
    limit: showAll ? 500 : 5, // Show 5 employees when collapsed, 100 when expanded
  };

  // If not showing, return the toggle row
  if (!showAll) {
    return (
      <tr className="bg-blue-50 border-t-2 border-blue-200">
        <td className="px-6 py-3">
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <span className="mr-2">👥 Employees</span>
                        <span className="mr-2"> 10 </span>

          </div>
          
        </td>
        <td className="px-6 py-3" colSpan="4">
          <div className="text-sm text-gray-600">
            Click "Show Employees" to view staff at {stationName}
          </div>
        </td>
        <td className="px-6 py-3">
          <button
            onClick={() => onToggleView(true)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition"
          >
            Show Employees
          </button>
        </td>
      </tr>
    );
  }

  // When expanded, show the full EmployeeList component
  return (
    <tr className="bg-blue-50">
      <td colSpan="6" className="px-0 py-0">
        <div className="border-l-4 border-blue-400 bg-blue-50">
          {/* Header for the employee section */}
          <div className="px-6 py-3 bg-blue-100 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-900">
                👥 Employees at {stationName}
              </h4>
              <button
                onClick={() => onToggleView(false)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition"
              >
                Hide Employees
              </button>
            </div>
          </div>
          
          {/* Your existing EmployeeList component with pre-applied filters */}
          <div className="px-4 py-4">
            <EmployeeList 
              initialFilters={employeeFilters}
              hideHeader={true}
              compactView={true}
              stationContext={{
                stationId,
                stationName,
                isEmbedded: true
              }}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default StationEmployeeWrapper;