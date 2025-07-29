// hooks/useAdminData.js
import { useState, useEffect, useCallback } from 'react';
import { roleApi } from './RoleApi';
import { userApi } from './UserApi';
import { employeeApi } from './EmployeeApi';
import { toast } from 'react-toastify';

export const useAdminData = () => {
  // State
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await roleApi.getAll();
      if (result.success) {
        setRoles(result.data || []);
      } else {
        toast.error('Failed to fetch roles: ' + result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch roles');
      console.error('Fetch roles error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users with pagination
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { page = 1, limit = 10, userType } = params;
      const result = await userApi.getAll({ page, limit, userType });
      
      if (result.success) {
        setUsers(result.data || []);
        if (result.pagination) {
          setUserPagination(result.pagination);
        }
      } else {
        toast.error('Failed to fetch users: ' + result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const result = await employeeApi.getAll();
      if (result.success) {
        setEmployees(result.data || []);
      } else {
        toast.error('Failed to fetch employees: ' + result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Fetch employees error:', error);
    }
  }, []);

  // Role CRUD operations
  const createRole = useCallback(async (roleData) => {
    setLoading(true);
    try {
      const result = await roleApi.create(roleData);
      if (result.success) {
        toast.success('Role created successfully');
        await fetchRoles();
        return { success: true };
      } else {
        toast.error('Failed to create role: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to create role');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (id, roleData) => {
    setLoading(true);
    try {
      const result = await roleApi.update(id, roleData);
      if (result.success) {
        toast.success('Role updated successfully');
        await fetchRoles();
        return { success: true };
      } else {
        toast.error('Failed to update role: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to update role');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return { success: false, cancelled: true };
    }

    setLoading(true);
    try {
      const result = await roleApi.delete(id);
      if (result.success) {
        toast.success('Role deleted successfully');
        await fetchRoles();
        return { success: true };
      } else {
        toast.error('Failed to delete role: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to delete role');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  // User CRUD operations
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const result = await userApi.create(userData);
      if (result.success) {
        toast.success('User created successfully');
        await fetchUsers({ page: userPagination.page, limit: userPagination.limit });
        return { success: true };
      } else {
        toast.error('Failed to create user: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to create user');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, userPagination]);

  const updateUser = useCallback(async (id, userData) => {
    setLoading(true);
    try {
      const result = await userApi.update(id, userData);
      if (result.success) {
        toast.success('User updated successfully');
        await fetchUsers({ page: userPagination.page, limit: userPagination.limit });
        return { success: true };
      } else {
        toast.error('Failed to update user: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to update user');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, userPagination]);

  const deleteUser = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return { success: false, cancelled: true };
    }

    setLoading(true);
    try {
      const result = await userApi.delete(id);
      if (result.success) {
        toast.success('User deleted successfully');
        await fetchUsers({ page: userPagination.page, limit: userPagination.limit });
        return { success: true };
      } else {
        toast.error('Failed to delete user: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to delete user');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, userPagination]);

  // User pagination
  const goToPage = useCallback((page) => {
    fetchUsers({ page, limit: userPagination.limit });
  }, [fetchUsers, userPagination.limit]);

  const changePageSize = useCallback((limit) => {
    fetchUsers({ page: 1, limit });
  }, [fetchUsers]);

  // Initialize data
  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchEmployees();
  }, [fetchRoles, fetchUsers, fetchEmployees]);

  return {
    // Data
    roles,
    users,
    employees,
    loading,
    userPagination,

    // Role operations
    createRole,
    updateRole,
    deleteRole,
    fetchRoles,

    // User operations
    createUser,
    updateUser,
    deleteUser,
    fetchUsers,

    // Employee operations
    fetchEmployees,

    // Pagination
    goToPage,
    changePageSize,
  };
};