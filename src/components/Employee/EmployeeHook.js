import { useState, useEffect } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from './EmployeeApi.js';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    
    const result = await getEmployees();
    
    if (result.success) {
      setEmployees(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Add new employee
  const createEmployee = async (employeeData) => {
    setError('');
    
    const result = await addEmployee(employeeData);
    
    if (result.success) {
      // Add the new employee to the list
      setEmployees(prev => [...prev, result.data]);
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Update employee
  const modifyEmployee = async (id, employeeData) => {
    setError('');
    
    const result = await updateEmployee(id, employeeData);
    
    if (result.success) {
      // Update the employee in the list
      setEmployees(prev => 
        prev.map(emp => emp._id === id ? result.data : emp)
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
      setEmployees(prev => prev.filter(emp => emp._id !== id));
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Load employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    modifyEmployee,
    removeEmployee
  };
};