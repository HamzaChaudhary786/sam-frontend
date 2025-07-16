import React from "react";
import EmployeeList from "../components/Employee/AddEmployee/AddEmployee";
import { useLocation } from "react-router-dom";

const EmployeePage = () => {
  const location = useLocation();
  // Access passed state
  const isEdit = location.state?.isEdit || false;
  const editData = location.state?.editData || {};

  console.log(isEdit , editData ,"isdit and editData us ");
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmployeeList isEdit={isEdit} editData={editData} />
      </div>
    </div>
  );
};

export default EmployeePage;
