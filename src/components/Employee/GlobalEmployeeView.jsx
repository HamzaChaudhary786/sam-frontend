import React, { createContext, useContext, useState } from 'react';
import EmployeeViewModal from './ViewEmployee/ViewEmployee.jsx'; // Adjust path to your modal

// Create the context
const GlobalEmployeeViewContext = createContext();

// Hook to use the context
export const useGlobalEmployeeView = () => {
  const context = useContext(GlobalEmployeeViewContext);
  if (!context) {
    throw new Error('useGlobalEmployeeView must be used within a GlobalEmployeeViewProvider');
  }
  return context;
};

// Provider component that should wrap your entire app
export const GlobalEmployeeViewProvider = ({ children }) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const openEmployeeView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const closeEmployeeView = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const value = {
    openEmployeeView,
    closeEmployeeView,
    isViewModalOpen,
    selectedEmployee
  };

  return (
    <GlobalEmployeeViewContext.Provider value={value}>
      {children}
      {/* Global Employee View Modal - will appear over any page */}
      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={closeEmployeeView}
        employee={selectedEmployee}
      />
    </GlobalEmployeeViewContext.Provider>
  );
};