import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  userTypes,
  role_data_entery,
  role_admin,
  role_view_only,
  
} from "../../../constants/Enum";
import { EnumSelect } from "../../SearchableDropdown.jsx";

// Searchable Select Component for general use
const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div
          className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center">
            <span
              className={selectedOption ? "text-gray-900" : "text-gray-500"}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "transform rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b">
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${value === option.value
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-900"
                      }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-sm text-gray-500">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserModal = ({
  isOpen,
  onClose,
  onSave,
  editingUser,
  roles,
  groups,
  employees,
  loading,
}) => {
  // Create user type enum object for EnumSelect
  const userTypeEnum = {
    [role_data_entery]: "Data Entry",
    [role_admin]: "Admin",
    [role_view_only]: "View Only",
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profileImage: "",
    employeeId: "",
    roles: [],
    group: [],
    userType: role_data_entery,
    isActive: true,
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        password: "",
        profileImage: editingUser.profileImage || "",
        employeeId: editingUser.employeeId?._id || editingUser.employeeId || "",
        roles: editingUser.roles
          ? editingUser.roles.map((role) => role._id || role)
          : [],
        group: editingUser.group
          ? editingUser.group.map((group) => group._id || group)
          : [],
        userType: editingUser.userType || role_data_entery,
        isActive:
          editingUser.isActive !== undefined ? editingUser.isActive : true,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        profileImage: "",
        employeeId: "",
        roles: [],
        group: [],
        userType: role_data_entery,
        isActive: true,
      });
    }
  }, [editingUser, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleChange = (roleId, checked) => {
    setFormData((prev) => ({
      ...prev,
      roles: checked
        ? [...prev.roles, roleId]
        : prev.roles.filter((id) => id !== roleId),
    }));
  };

  const handleGroupChange = (groupId, checked) => {
    setFormData((prev) => ({
      ...prev,
      group: checked
        ? [...prev.group, groupId]
        : prev.group.filter((id) => id !== groupId),
    }));
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      profileImage: "",
      employeeId: "",
      roles: [],
      group: [],
      userType: role_data_entery,
      isActive: true,
    });
    onClose();
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    if (!editingUser && !formData.password) {
      alert("Password is required for new users");
      return;
    }

    // Remove employeeId if it's empty (optional field)
    if (!formData.employeeId || formData.employeeId === "") {
      delete formData.employeeId;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  // Prepare employee options for SearchableSelect
  const employeeOptions = [
    { value: "", label: "Select Employee" },
    ...employees.map((employee) => ({
      value: employee._id,
      label: `${employee.firstName} ${employee.lastName || ""}`,
      subtitle: employee.personalNumber,
    })),
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingUser ? "Edit User" : "Create New User"}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!editingUser && "*"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Type - Using EnumSelect */}
              <div>
                <EnumSelect
                  label="User Type"
                  name="userType"
                  value={
                    Object.keys(userTypeEnum).find(
                      (key) =>
                        userTypeEnum[key] ===
                        Object.values(userTypeEnum).find((val) =>
                          Object.keys(userTypeEnum).find(
                            (k) =>
                              userTypeEnum[k] === val && k === formData.userType
                          )
                        )
                    ) || formData.userType
                  }
                  onChange={handleChange}
                  enumObject={userTypeEnum}
                  required={true}
                  placeholder="Search and select user type"
                  disabled={loading}
                />
              </div>

              {/* Employee - Using SearchableSelect */}
              <SearchableSelect
                label="Employee (optional)"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                options={employeeOptions}
                placeholder="Search and select employee"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                value={formData.profileImage}
                onChange={(e) =>
                  handleInputChange("profileImage", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Groups and Roles in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Groups Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Groups
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-purple-50">
                  {groups && groups.length > 0 ? (
                    groups.map((group) => (
                      <label
                        key={group._id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.group.includes(group._id)}
                          onChange={(e) =>
                            handleGroupChange(group._id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {group.name}
                          </span>
                          <p className="text-xs text-gray-500">
                            {group.description}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No groups available</p>
                  )}
                </div>
              </div>

              {/* Roles Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Direct Roles
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-blue-50">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <label
                        key={role._id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role._id)}
                          onChange={(e) =>
                            handleRoleChange(role._id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {role.name}
                          </span>
                          <p className="text-xs text-gray-500">
                            {role.description}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No roles available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active User
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Saving..."
                  : editingUser
                    ? "Update User"
                    : "Create User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
