import React, { useState } from 'react';
import { useGlobalEmployeeView } from './GlobalEmployeeView.jsx'; // We'll create this
import { getEmployee } from './EmployeeApi.js'; // We'll add this function

const ClickableEmployeeName = ({ 
  employee, 
  employeeId, // 🆕 New prop for when you only have the ID
  children, 
  className = "text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors duration-200",
  disabled = false,
  onClick,
  ...props
}) => {
  const { openEmployeeView } = useGlobalEmployeeView();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // If we have a full employee object, use it directly
    if (employee && employee._id && (employee.firstName || employee.name)) {
      console.log('Using existing employee object:', employee);
      if (onClick) {
        onClick(employee, e);
      } else {
        openEmployeeView(employee);
      }
      return;
    }

    // If we only have an ID (either in employee._id or employeeId prop), fetch the full employee
    const idToFetch = employee?._id || employeeId;
    
    if (!idToFetch || idToFetch === 'NA') {
      console.log('No valid employee ID to fetch');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching employee by ID:', idToFetch);
      
      const result = await getEmployee(idToFetch);
      
      if (result.success && result.data) {
        console.log('Fetched employee data:', result.data);
        const fullEmployee = result.data;
        
        if (onClick) {
          onClick(fullEmployee, e);
        } else {
          openEmployeeView(fullEmployee);
        }
      } else {
        console.error('Failed to fetch employee:', result.error);
        // You could show a toast error here
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      // You could show a toast error here
    } finally {
      setIsLoading(false);
    }
  };

  // Determine display text
  const getDisplayText = () => {
    if (children) return children;
    if (employee?.firstName && employee?.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    }
    if (employee?.firstName) return employee.firstName;
    if (employee?.name) return employee.name;
    if (typeof employee === 'string') return employee; // Handle case where employee is just a name string
    return 'Employee';
  };

  const displayText = getDisplayText();
  
  // If disabled or no employee/employeeId, render as plain text
  if (disabled || (!employee && !employeeId) || (employee && !employee._id && !employeeId)) {
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
      title={isLoading ? "Loading employee details..." : "Click to view employee details"}
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

export default ClickableEmployeeName;