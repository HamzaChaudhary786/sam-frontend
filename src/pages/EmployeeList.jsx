import React from 'react';
import EmployeeList from '../components/Employee/EmployeeList/EmployeeList';

const EmployeePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your police force employees, add new officers, and track their information.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmployeeList />
      </div>
    </div>
  );
};

export default EmployeePage;