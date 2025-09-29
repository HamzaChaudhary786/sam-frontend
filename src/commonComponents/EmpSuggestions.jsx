import React from "react";

const EmpSuggestions = ({ emp }) => {
  return (
    <div className="flex items-center">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          <span className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline">
            {emp.firstName} {emp.lastName}
          </span>
          {emp.fatherFirstName && (
            <span className="ml-1 text-gray-600 text-sm">
              (Father: {emp.fatherFirstName})
            </span>
          )}
        </div>

        {(emp.personalNumber || emp.pnumber) && (
          <div className="text-xs text-gray-500 truncate">
            Personal No: {emp.personalNumber || emp.pnumber}
          </div>
        )}
        {emp.cnic && (
          <div className="text-xs text-gray-500 truncate">CNIC: {emp.cnic}</div>
        )}
        {emp.grade && (
          <div className="text-xs text-gray-500 truncate">
            Grade: {emp.grade}
          </div>
        )}
        {emp.rank && (
          <div className="text-xs text-gray-500 truncate">Rank: {emp.rank}</div>
        )}
      </div>
    </div>
  );
};

export default EmpSuggestions;
