// AuditTrailPage.jsx - Main Audit Trail Dashboard
import React, { useState } from "react";
import RecentActivityComponent from "../components/Audit/RecentActivity/RecentActivity.jsx";
import AuditHistoryComponent from "../components/Audit/AuditHistory/AuditHistory.jsx";

const AuditTrailPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeView, setActiveView] = useState("recent"); // "recent" or "history"

  // Handle employee selection from recent activity
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setActiveView("history");
  };

  // Handle back to recent activity
  const handleBackToRecent = () => {
    setSelectedEmployee(null);
    setActiveView("recent");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Audit Trail</h1>
              <p className="text-gray-600 mt-2">
                Track and monitor all employee record changes and activities
              </p>
            </div>
            
            {/* Navigation Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={handleBackToRecent}
                className={`hover:text-blue-600 transition-colors ${
                  activeView === "recent" ? "text-blue-600 font-medium" : ""
                }`}
              >
                Recent Activity
              </button>
              {selectedEmployee && (
                <>
                  <span>→</span>
                  <span className="text-gray-700 font-medium">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={handleBackToRecent}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeView === "recent"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Recent Activity</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveView("history")}
              disabled={!selectedEmployee}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeView === "history" && selectedEmployee
                  ? "bg-blue-600 text-white shadow-md"
                  : selectedEmployee
                  ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Detailed History</span>
                {selectedEmployee && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {selectedEmployee.personalNumber}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {activeView === "recent" && (
            <RecentActivityComponent onEmployeeSelect={handleEmployeeSelect} />
          )}

          {activeView === "history" && selectedEmployee && (
            <AuditHistoryComponent
              employee={selectedEmployee}
              onClose={handleBackToRecent}
            />
          )}

          {activeView === "history" && !selectedEmployee && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select an Employee
              </h3>
              <p className="text-gray-500 mb-4">
                Choose an employee from the recent activity list to view their detailed audit history.
              </p>
              <button
                onClick={handleBackToRecent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Recent Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;