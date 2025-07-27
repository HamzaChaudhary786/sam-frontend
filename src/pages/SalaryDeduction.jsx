// SalaryDeductionPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SalaryDeductionForm from "../components/SalaryDeduction/AddDeduction/AddDeduction.jsx";
import SalaryDeductionList from "../components/SalaryDeduction/DeductionList/DeductionList.jsx";

const SalaryDeductionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employee } = location.state || {};

  const [editingDeduction, setEditingDeduction] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Handle form success
  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingDeduction(null);
    setShowModal(false);
  };

  // Handle edit
  const handleEdit = (deduction) => {
    setEditingDeduction(deduction);
    setShowModal(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingDeduction(null);
    setShowModal(true);
  };

  // Handle cancel/close modal
  const handleCloseModal = () => {
    setEditingDeduction(null);
    setShowModal(false);
  };

  // Early return if no employee
  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                No Employee Data Found
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please go back and select an employee.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate("/employees")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Employees
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Salary Deduction Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Managing salary deductions for{" "}
            <span className="font-medium">
              {employee.firstName} {employee.lastName}
            </span>{" "}
            ({employee.personalNumber || employee.pnumber})
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Deduction
          </button>
          <button
            onClick={() => navigate("/employees")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Back to Employees
          </button>
        </div>
      </div>

      {/* Salary Deductions List - Always visible */}
      <SalaryDeductionList
        employee={employee}
        onEdit={handleEdit}
        refreshTrigger={refreshTrigger}
      />

      {/* Modal Form - Only shows when modal is open */}
      <SalaryDeductionForm
        employee={employee}
        editingDeduction={editingDeduction}
        isOpen={showModal}
        onSuccess={handleFormSuccess}
        onCancel={handleCloseModal}
      />
    </div>
  );
};

export default SalaryDeductionPage;