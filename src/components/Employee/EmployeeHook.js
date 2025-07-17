import { useState, useEffect } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from './EmployeeApi.js';

export const useEmployees = (initialFilters = {}) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  // Fetch all employees with current filters
  const fetchEmployees = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    
    const result = await getEmployees(currentFilters);
    
    if (result.success) {
      // Handle the case where data has an 'employees' property or is directly an array
      const employeesData = result.data.employees || result.data;
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } else {
      setError(result.error);
      setEmployees([]);
    }
    
    setLoading(false);
  };

  // Add new employee
  const createEmployee = async (employeeData) => {
    setError('');
    
    const result = await addEmployee(employeeData);
    
    if (result.success) {
      // Add the new employee to the list
      setEmployees(prev => Array.isArray(prev) ? [...prev, result.data] : [result.data]);
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Update employee
  const modifyEmployee = async (id, employeeData) => {
    setError('');
    
    const result = await updateEmployee(employeeData, id);
    
    if (result.success) {
      // Update the employee in the list
      setEmployees(prev =>
        Array.isArray(prev) ? prev.map(emp => emp._id === id ? result.data : emp) : []
      );
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Delete employee
  const removeEmployee = async (id) => {
    setError('');
    
    const result = await deleteEmployee(id);
    
    if (result.success) {
      // Remove the employee from the list
      setEmployees(prev => Array.isArray(prev) ? prev.filter(emp => emp._id !== id) : []);
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Update filters and refetch
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    fetchEmployees(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    fetchEmployees({});
  };

  // Load employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    filters,
    fetchEmployees,
    createEmployee,
    modifyEmployee,
    removeEmployee,
    updateFilters,
    clearFilters
  };
};