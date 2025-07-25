import { useState, useEffect } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from './EmployeeApi.js';
import { toast } from 'react-toastify';

export const useEmployees = (initialFilters = {}) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10, // Default items per page
  });

  // Fetch all employees with current filters and pagination
  const fetchEmployees = async (currentFilters = filters, page = 1, limit = pagination.limit) => {
    setLoading(true);
    setError('');
    
    try {
      // Include pagination parameters in the API call
      const queryParams = {
        ...currentFilters,
        page,
        limit
      };
      
      const result = await getEmployees(queryParams);
      
      if (result.success) {
        // Handle the case where data has an 'employees' property or is directly an array
        const employeesData = result.data.employees || result.data;
        const paginationData = result.data.pagination || {};
        
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        
        // Update pagination state
        setPagination({
          currentPage: paginationData.currentPage || page,
          totalPages: paginationData.totalPages || 1,
          totalEmployees: paginationData.totalEmployees || 0,
          hasNext: paginationData.hasNext || false,
          hasPrev: paginationData.hasPrev || false,
          limit: limit
        });
      } else {
        setError(result.error);
        setEmployees([]);
        toast.error(`Failed to fetch employees: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while fetching employees';
      setError(errorMessage);
      setEmployees([]);
      // toast.error(`Error fetching employees: ${errorMessage}`);
    }
    
    setLoading(false);
  };

  // Navigate to specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchEmployees(filters, page, pagination.limit);
    }
  };

  // Go to next page
  const nextPage = () => {
    if (pagination.hasNext) {
      goToPage(pagination.currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (pagination.hasPrev) {
      goToPage(pagination.currentPage - 1);
    }
  };

  // Change items per page
  const changePageSize = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchEmployees(filters, 1, newLimit); // Reset to first page when changing page size
  };

  // Add new employee
  const createEmployee = async (employeeData) => {
    setError('');
    
    try {
      const result = await addEmployee(employeeData);
      
      if (result.success) {
        // Refresh the current page to show updated data
        await fetchEmployees(filters, pagination.currentPage, pagination.limit);
        toast.success(`Employee "${employeeData.firstName || 'New Employee'} ${employeeData.lastName || ''}" created successfully!`.trim());
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to create employee: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while creating employee';
      setError(errorMessage);
      toast.error(`Error creating employee: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Update employee
  const modifyEmployee = async (id, employeeData) => {
    setError('');
    
    try {
      const result = await updateEmployee(employeeData, id);
      
      if (result.success) {
        // Update the employee in the current list
        setEmployees(prev =>
          Array.isArray(prev) ? prev.map(emp => emp._id === id ? result.data : emp) : []
        );
        toast.success(`Employee "${employeeData.firstName || 'Employee'} ${employeeData.lastName || ''}" updated successfully!`.trim());
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to update employee: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while updating employee';
      setError(errorMessage);
      toast.error(`Error updating employee: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Delete employee
  const removeEmployee = async (id) => {
    setError('');
    
    try {
      const result = await deleteEmployee(id);
      
      if (result.success) {
        // Refresh the current page to show updated data
        await fetchEmployees(filters, pagination.currentPage, pagination.limit);
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Failed to delete employee: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred while deleting employee';
      setError(errorMessage);
      toast.error(`Error deleting employee: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Update filters and refetch from first page
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    fetchEmployees(newFilters, 1, pagination.limit); // Reset to first page when filtering
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    fetchEmployees({}, 1, pagination.limit);
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
    pagination,
    fetchEmployees,
    createEmployee,
    modifyEmployee,
    removeEmployee,
    updateFilters,
    clearFilters,
    // Pagination methods
    goToPage,
    nextPage,
    prevPage,
    changePageSize
  };
};