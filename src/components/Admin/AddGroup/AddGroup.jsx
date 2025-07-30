import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const GroupModal = ({ isOpen, onClose, onSave, editingGroup, roles, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roles: [],
    isActive: true
  });

  useEffect(() => {
    if (editingGroup) {
      // Extract role IDs from role objects if they exist
      const roleIds = editingGroup.roles ? 
        editingGroup.roles.map(role => 
          typeof role === 'object' ? role._id : role
        ) : [];
      
      setFormData({
        name: editingGroup.name || '',
        description: editingGroup.description || '',
        roles: roleIds, // Store only role IDs
        isActive: editingGroup.isActive !== undefined ? editingGroup.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        roles: [],
        isActive: true
      });
    }
  }, [editingGroup, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (roleId, checked) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(id => id !== roleId)
    }));
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      roles: [],
      isActive: true
    });
    onClose();
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name) {
      alert('Please enter a group name');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingGroup ? 'Edit Group' : 'Create New Group'}
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
                  Group Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter group description"
                />
              </div>
            </div>

            {/* Roles Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Roles to Group
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                {roles.length > 0 ? (
                  roles.map(role => (
                    <label key={role._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role._id)}
                        onChange={(e) => handleRoleChange(role._id, e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{role.name}</span>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No roles available</p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">Active Group</span>
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
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : (editingGroup ? 'Update Group' : 'Create Group')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;