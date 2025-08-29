import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, CheckSquare, Square } from "lucide-react";

const RoleModal = ({ isOpen, onClose, onSave, editingRole, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    accessRequirement: [],
  });

  const resourceOptions = [
    "station",
    "employee",
    "asset",
    "users",
    "roles",
    "lookup",
    "Audit"
  ];

  const permissionFields = [
    { key: "canView", label: "View" },
    { key: "canAdd", label: "Add" },
    { key: "canEdit", label: "Edit" },
    { key: "canDelete", label: "Delete" },
    { key: "canApprove", label: "Approve" },
    { key: "canPrint", label: "Print" },
  ];

  useEffect(() => {
    if (editingRole) {
      setFormData({
        name: editingRole.name || "",
        description: editingRole.description || "",
        accessRequirement: editingRole.accessRequirement || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        accessRequirement: [],
      });
    }
  }, [editingRole, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addPermission = () => {
    const newPermission = {
      resourceName: "",
      canApprove: false,
      canView: true,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canPrint: false,
    };

    setFormData((prev) => ({
      ...prev,
      accessRequirement: [...prev.accessRequirement, newPermission],
    }));
  };

  const updatePermission = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      accessRequirement: prev.accessRequirement.map((perm, i) =>
        i === index ? { ...perm, [field]: value } : perm
      ),
    }));
  };

  const removePermission = (index) => {
    setFormData((prev) => ({
      ...prev,
      accessRequirement: prev.accessRequirement.filter((_, i) => i !== index),
    }));
  };

  const selectAllPermissions = (index) => {
    const updatedPermission = { ...formData.accessRequirement[index] };
    permissionFields.forEach((field) => {
      updatedPermission[field.key] = true;
    });

    setFormData((prev) => ({
      ...prev,
      accessRequirement: prev.accessRequirement.map((perm, i) =>
        i === index ? updatedPermission : perm
      ),
    }));
  };

  const clearAllPermissions = (index) => {
    const updatedPermission = { ...formData.accessRequirement[index] };
    permissionFields.forEach((field) => {
      updatedPermission[field.key] = false;
    });

    setFormData((prev) => ({
      ...prev,
      accessRequirement: prev.accessRequirement.map((perm, i) =>
        i === index ? updatedPermission : perm
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      accessRequirement: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingRole ? "Edit Role" : "Create New Role"}
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
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role description"
                  required
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  Permissions
                </h4>
                <button
                  type="button"
                  onClick={addPermission}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Permission
                </button>
              </div>

              <div className="space-y-4">
                {formData.accessRequirement.map((permission, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <select
                        value={permission.resourceName}
                        onChange={(e) =>
                          updatePermission(
                            index,
                            "resourceName",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Resource</option>
                        {resourceOptions.map((resource) => (
                          <option key={resource} value={resource}>
                            {resource.charAt(0).toUpperCase() +
                              resource.slice(1)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => selectAllPermissions(index)}
                        className="flex items-center text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 text-sm transition-colors"
                      >
                        <CheckSquare className="w-4 h-4 mr-1" />
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => clearAllPermissions(index)}
                        className="flex items-center text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50 text-sm transition-colors"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => removePermission(index)}
                        className="flex items-center text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {permissionFields.map((field) => (
                        <label
                          key={field.key}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={permission[field.key]}
                            onChange={(e) =>
                              updatePermission(
                                index,
                                field.key,
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="text-sm text-gray-700">
                            {field.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {formData.accessRequirement.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No permissions added yet. Click "Add Permission" to start.
                  </div>
                )}
              </div>
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
                onClick={() => onSave(formData)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Saving..."
                  : editingRole
                    ? "Update Role"
                    : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
