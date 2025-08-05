import React, { useState } from "react";
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  UsersIcon,
} from "lucide-react";
import { useAdminData } from "../components/Admin/hook.js";
import RoleModal from "../components/Admin/AddRole/AddRole.jsx";
import UserModal from "../components/Admin/AddUser/AddUser.jsx";
import GroupModal from "../components/Admin/AddGroup/AddGroup.jsx";

const AdminManagementPage = () => {
  const {
    roles,
    users,
    employees,
    groups,
    loading,
    userPagination,
    createRole,
    updateRole,
    deleteRole,
    createGroup,
    updateGroup,
    deleteGroup,
    createUser,
    updateUser,
    deleteUser,
    goToPage,
    changePageSize,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("roles");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  // Role handlers
  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleSaveRole = async (roleData) => {
    let result;
    if (editingRole) {
      result = await updateRole(editingRole._id, roleData);
    } else {
      result = await createRole(roleData);
    }

    if (result.success) {
      setShowRoleModal(false);
      setEditingRole(null);
    }
  };

  const handleDeleteRole = async (roleId) => {
    await deleteRole(roleId);
  };

  // Group handlers
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowGroupModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowGroupModal(true);
  };

  const handleSaveGroup = async (groupData) => {
    let result;
    if (editingGroup) {
      result = await updateGroup(editingGroup._id, groupData);
    } else {
      result = await createGroup(groupData);
    }

    if (result.success) {
      setShowGroupModal(false);
      setEditingGroup(null);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    await deleteGroup(groupId);
  };

  // User handlers
  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async (userData) => {
    let result;
    if (editingUser) {
      result = await updateUser(editingUser._id, userData);
    } else {
      result = await createUser(userData);
    }

    if (result.success) {
      setShowUserModal(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    await deleteUser(userId);
  };

  // Helper functions
  const PermissionIcon = ({ granted }) =>
    granted ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    );

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee
      ? `${employee.firstName} ${employee.lastName || ""}`
      : "N/A";
  };

  const getUserRoles = (userRoles) => {
    return roles.filter((role) => userRoles?.includes(role._id));
  };

  const getUserGroups = (userGroups) => {
    return groups.filter((group) => userGroups?.includes(group._id));
  };

  const getGroupRoles = (groupRoles) => {
    return roles.filter((role) => groupRoles?.includes(role._id));
  };

  const StatusBadge = ({ isActive }) => (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  const UserTypeBadge = ({ userType }) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      data_entry: "bg-blue-100 text-blue-800",
      incharge: "bg-orange-100 text-orange-800",
      view_only: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          colors[userType] || colors.data_entry
        }`}
      >
        {userType?.replace("_", " ").toUpperCase() || "DATA ENTRY"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Management Panel
          </h1>
          <p className="text-gray-600">
            Manage roles, groups, users, and permissions for your system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center px-6 py-3 font-medium transition-colors ${
              activeTab === "roles"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="w-5 h-5 mr-2" />
            Roles Management 
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex items-center px-6 py-3 font-medium transition-colors ${
              activeTab === "groups"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UsersIcon className="w-5 h-5 mr-2" />
            Groups Management 
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center px-6 py-3 font-medium transition-colors ${
              activeTab === "users"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Users Management
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && !loading && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Roles & Permissions
              </h2>
              <button
                onClick={handleCreateRole}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Role
              </button>
            </div>

            {roles.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No roles created yet</p>
                <button
                  onClick={handleCreateRole}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Create Your First Role
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {roles.map((role) => (
                  <div
                    key={role._id}
                    className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {role.name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {role.description}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role._id)}
                            className="flex items-center text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      {role.accessRequirement &&
                        role.accessRequirement.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resource
                                  </th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    View
                                  </th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    Add
                                  </th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    Edit
                                  </th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    Delete
                                  </th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    Approve
                                  </th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                    Print
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {role.accessRequirement.map((perm, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 font-medium text-gray-900">
                                      {perm.resourceName}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex justify-center">
                                        <PermissionIcon
                                          granted={perm.canView}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex justify-center">
                                        <PermissionIcon granted={perm.canAdd} />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex justify-center">
                                        <PermissionIcon
                                          granted={perm.canEdit}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex justify-center">
                                        <PermissionIcon
                                          granted={perm.canDelete}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex justify-center">
                                        <PermissionIcon
                                          granted={perm.canApprove}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex justify-center">
                                        <PermissionIcon
                                          granted={perm.canPrint}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && !loading && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Groups Management
              </h2>
              <button
                onClick={handleCreateGroup}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Group
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No groups created yet</p>
                <button
                  onClick={handleCreateGroup}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Create Your First Group
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {groups.map((group) => {
                  const groupRoles = getGroupRoles(group.roles);
                  return (
                    <div
                      key={group._id}
                      className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {group.name}
                              </h3>
                              <StatusBadge isActive={group.isActive} />
                            </div>
                            <p className="text-gray-600 mt-1">
                              {group.description}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="flex items-center text-purple-600 hover:text-purple-800 px-3 py-1 rounded border border-purple-600 hover:bg-purple-50 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group._id)}
                              className="flex items-center text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>

                        {groupRoles.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Assigned Roles:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {groupRoles.map((role) => (
                                <span
                                  key={role._id}
                                  className="inline-flex px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
                                >
                                  {role.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && !loading && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Users Management
              </h2>
              <button
                onClick={handleCreateUser}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New User
              </button>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No users found</p>
                <button
                  onClick={handleCreateUser}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Create Your First User
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Groups
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Direct Roles
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users?.data?.map((user) => {
                          const userRoles = getUserRoles(user.roles);
                          const userGroups = getUserGroups(user.group);
                          return (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={
                                        user.profileImage ||
                                        `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=ffffff`
                                      }
                                      alt=""
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.firstName} {user.lastName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <UserTypeBadge userType={user.userType} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getEmployeeName(user.employeeId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {userGroups.length > 0 ? (
                                    userGroups.map((group) => (
                                      <span
                                        key={group._id}
                                        className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                                      >
                                        {group.name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-sm">
                                      No groups
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {userRoles.length > 0 ? (
                                    userRoles.map((role) => (
                                      <span
                                        key={role._id}
                                        className="inline-flex px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                                      >
                                        {role.name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-sm">
                                      No direct roles
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge isActive={user.isActive} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => goToPage(userPagination.page - 1)}
                      disabled={userPagination.page <= 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => goToPage(userPagination.page + 1)}
                      disabled={
                        userPagination.page >= userPagination.totalPages
                      }
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(userPagination.page - 1) * userPagination.limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            userPagination.page * userPagination.limit,
                            userPagination.total
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {userPagination.total}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={userPagination.limit}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                      >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                      </select>

                      <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => goToPage(userPagination.page - 1)}
                          disabled={userPagination.page <= 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          { length: Math.min(userPagination.totalPages, 5) },
                          (_, i) => {
                            const pageNum =
                              userPagination.page <= 3
                                ? i + 1
                                : userPagination.page + i - 2;

                            if (pageNum > userPagination.totalPages)
                              return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  pageNum === userPagination.page
                                    ? "z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() => goToPage(userPagination.page + 1)}
                          disabled={
                            userPagination.page >= userPagination.totalPages
                          }
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <ChevronRight
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Role Modal */}
        <RoleModal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setEditingRole(null);
          }}
          onSave={handleSaveRole}
          editingRole={editingRole}
          loading={loading}
        />

        {/* Group Modal */}
        <GroupModal
          isOpen={showGroupModal}
          onClose={() => {
            setShowGroupModal(false);
            setEditingGroup(null);
          }}
          onSave={handleSaveGroup}
          editingGroup={editingGroup}
          roles={roles}
          loading={loading}
        />

        {/* User Modal */}
        <UserModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          editingUser={editingUser}
          roles={roles}
          groups={groups}
          employees={employees}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminManagementPage;
