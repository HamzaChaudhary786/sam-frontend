import React from "react";

const EmployeeGridTable = ({
  employees,
  sortConfig,
  editingCell,
  editingData,
  imageIndexes,
  enums,
  isAdmin,
  onSort,
  onStartEditing,
  onStopEditing,
  onCancelEditing,
  onCellChange,
  onSaveCell,
  onPrevImage,
  onNextImage,
  onImageClick,
  onImageUpload,
  onRemoveImage
}) => {
  // State to track which employees are in edit mode
  const [editableEmployees, setEditableEmployees] = React.useState(new Set());

  const toggleEditMode = (employeeId) => {
    const newEditableEmployees = new Set(editableEmployees);
    if (newEditableEmployees.has(employeeId)) {
      newEditableEmployees.delete(employeeId);
      // If currently editing this employee, stop editing and clear data
      if (editingCell?.rowId === employeeId) {
        onCancelEditing(employeeId);
      }
    } else {
      newEditableEmployees.add(employeeId);
    }
    setEditableEmployees(newEditableEmployees);
  };

  // Handle cancel editing for an employee
  const handleCancelEditing = (employee) => {
    onCancelEditing(employee._id);
  };
  
  // Helper functions
  const getEnumDisplayName = (enumKey, valueId) => {
    if (!valueId) return "N/A";
    if (typeof valueId === "object" && valueId?.name) return valueId.name;
    
    const enumData = enums[enumKey];
    if (Array.isArray(enumData)) {
      const item = enumData.find(item => item._id === valueId);
      return item?.name || valueId || "N/A";
    }
    return valueId || "N/A";
  };

  const getEmployeeImage = (employee, index = 0) => {
    if (Array.isArray(employee.profileUrl)) {
      return employee.profileUrl[index] || employee.profileUrl[0] || "/default-avatar.png";
    }
    return employee.profileUrl || "/default-avatar.png";
  };

  const getImageCount = (employee) => {
    return Array.isArray(employee.profileUrl)
      ? employee.profileUrl.length
      : employee.profileUrl ? 1 : 0;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  // Helper function to get nested value (for address fields)
  const getNestedValue = (employee, fieldPath, editingData) => {
    const employeeEditingData = editingData[employee._id] || {};
    
    // Check if we have editing data for this field
    if (employeeEditingData[fieldPath] !== undefined) {
      return employeeEditingData[fieldPath];
    }
    
    // Get the original value
    const pathParts = fieldPath.split('.');
    let value = employee;
    for (const part of pathParts) {
      value = value?.[part];
    }
    return value || '';
  };

  // Render editable cell
  const renderEditingCell = (employee, fieldKey, fieldType, enumType) => {
    // Get the editing data for this specific employee
    const employeeEditingData = editingData[employee._id] || {};
    
    let value;
    if (fieldKey.includes('.')) {
      // Handle nested fields like address.line1
      value = getNestedValue(employee, fieldKey, editingData);
    } else {
      value = employeeEditingData[fieldKey] !== undefined ? employeeEditingData[fieldKey] : employee[fieldKey];
    }

    switch (fieldType) {
      case 'select':
        const enumData = enums[enumType] || [];
        return (
          <select
            value={value || ''}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs min-w-24"
            autoFocus
          >
            <option value="">Select...</option>
            {enumData.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        );
      
      case 'serviceType':
        return (
          <select
            value={value || 'federal'}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            autoFocus
          >
            <option value="federal">Federal</option>
            <option value="provincial">Provincial</option>
          </select>
        );
      
      case 'date':
        let dateValue = '';
        if (value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              dateValue = date.toISOString().split('T')[0];
            }
          } catch (error) {
            console.error('Date formatting error:', error);
          }
        }
        
        return (
          <input
            type="date"
            value={dateValue}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs min-w-32"
            autoFocus
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs min-w-32 min-h-16 resize-none"
            autoFocus
            rows={2}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs min-w-24"
            autoFocus
          />
        );
    }
  };

  // Render display cell
  const renderDisplayCell = (employee, fieldKey, fieldType, enumType) => {
    // Get the editing data for this specific employee, show edited value if exists
    let value;
    if (fieldKey.includes('.')) {
      // Handle nested fields like address.line1
      value = getNestedValue(employee, fieldKey, editingData);
    } else {
      const employeeEditingData = editingData[employee._id] || {};
      value = employeeEditingData[fieldKey] !== undefined ? employeeEditingData[fieldKey] : employee[fieldKey];
    }

    switch (fieldType) {
      case 'select':
        // Special handling for status to show colored badges
        if (fieldKey === 'status') {
          const displayName = getEnumDisplayName(enumType, value);
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              value === "active" ? "bg-green-100 text-green-800" :
              value === "retired" ? "bg-blue-100 text-blue-800" :
              value === "terminated" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {displayName}
            </span>
          );
        }
        return getEnumDisplayName(enumType, value);
      case 'date':
        return value ? new Date(value).toLocaleDateString() : "N/A";
      default:
        return value || "N/A";
    }
  };

  // Render editable cell wrapper
  const renderCell = (employee, fieldKey, fieldType, enumType = null) => {
    const isEditing = editingCell?.rowId === employee._id && editingCell?.fieldName === fieldKey;
    const isEditable = editableEmployees.has(employee._id);
    
    // For nested fields, get the current value properly
    let currentValue;
    if (fieldKey.includes('.')) {
      currentValue = getNestedValue(employee, fieldKey, editingData);
    } else {
      currentValue = employee[fieldKey];
    }
    
    return (
      <td className="px-3 py-2 text-xs">
        {isEditing ? (
          renderEditingCell(employee, fieldKey, fieldType, enumType)
        ) : (
          <div 
            className={`p-1 rounded min-h-6 flex items-center ${
              isAdmin && isEditable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'
            }`}
            onDoubleClick={() => isAdmin && isEditable && onStartEditing(employee._id, fieldKey, currentValue)}
            title={
              !isAdmin ? "Read-only" : 
              !isEditable ? "Click Edit button to enable editing" : 
              "Double-click to edit"
            }
          >
            <div className="max-w-32 truncate" title={renderDisplayCell(employee, fieldKey, fieldType, enumType)}>
              {renderDisplayCell(employee, fieldKey, fieldType, enumType)}
            </div>
          </div>
        )}
      </td>
    );
  };

  // Render image cell
  const renderImageCell = (employee) => {
    const currentImageIndex = imageIndexes[employee._id] || 0;
    const totalImages = getImageCount(employee);
    const currentImage = getEmployeeImage(employee, currentImageIndex);
    const isEditable = editableEmployees.has(employee._id);

    return (
      <td className="px-3 py-2">
        <div className="relative">
          <img
            className="h-10 w-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            src={currentImage}
            alt={`${employee.firstName} ${employee.lastName}`}
            onClick={() => onImageClick({ image: currentImage, employee })}
          />
          
          {totalImages > 1 && (
            <>
              <button
                onClick={() => onPrevImage(employee._id, totalImages)}
                className="absolute -left-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-0.5 shadow-sm hover:bg-gray-100 transition-colors text-xs"
                title="Previous image"
              >
                ‹
              </button>
              <button
                onClick={() => onNextImage(employee._id, totalImages)}
                className="absolute -right-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-0.5 shadow-sm hover:bg-gray-100 transition-colors text-xs"
                title="Next image"
              >
                ›
              </button>
              <div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 rounded-full"
                style={{ fontSize: "8px" }}
              >
                {currentImageIndex + 1}/{totalImages}
              </div>
            </>
          )}

          {/* Image editing controls when in edit mode */}
          {isAdmin && isEditable && (
            <div className="absolute -bottom-2 -right-2 flex space-x-1">
              {/* Upload new image button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      onImageUpload(employee, file);
                    }
                    e.target.value = ''; // Reset input
                  }}
                  className="hidden"
                />
                <div className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1 shadow-sm transition-colors" title="Upload new image">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </label>

              {/* Remove current image button (only if more than 1 image) */}
              {totalImages > 1 && (
                <button
                  onClick={() => onRemoveImage(employee, currentImageIndex)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-sm transition-colors"
                  title="Remove current image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    );
  };

  // Sortable header component
  const SortableHeader = ({ sortKey, children, className = "" }) => (
    <th 
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {children}
      {getSortIcon(sortKey) && (
        <span className="ml-1">{getSortIcon(sortKey)}</span>
      )}
    </th>
  );

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <SortableHeader sortKey="personalNumber">Personal #</SortableHeader>
              <SortableHeader sortKey="firstName">Name</SortableHeader>
              <SortableHeader sortKey="fatherFirstName">Father's Name</SortableHeader>
              <SortableHeader sortKey="cnic">CNIC</SortableHeader>
              <SortableHeader sortKey="mobileNumber">Mobile</SortableHeader>
              <SortableHeader sortKey="designation">Designation</SortableHeader>
              <SortableHeader sortKey="grade">Grade</SortableHeader>
              <SortableHeader sortKey="rank">Rank</SortableHeader>
              <SortableHeader sortKey="cast">Cast</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <SortableHeader sortKey="serviceType">Service Type</SortableHeader>
              <SortableHeader sortKey="dateOfBirth">Date of Birth</SortableHeader>
              <SortableHeader sortKey="stations">Station</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mohalla
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tehsil
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => {
              const isEditing = editingCell?.rowId === employee._id;
              const isEditable = editableEmployees.has(employee._id);

              return (
                <tr key={employee._id} className="hover:bg-gray-50">
                  {/* Photo */}
                  {renderImageCell(employee)}

                  {/* Editable Fields */}
                  {renderCell(employee, 'personalNumber', 'input')}
                  {renderCell(employee, 'firstName', 'input')}
                  {renderCell(employee, 'fatherFirstName', 'input')}
                  {renderCell(employee, 'cnic', 'input')}
                  {renderCell(employee, 'mobileNumber', 'input')}
                  {renderCell(employee, 'designation', 'select', 'designations')}
                  {renderCell(employee, 'grade', 'select', 'grades')}
                  {renderCell(employee, 'rank', 'select', 'ranks')}
                  {renderCell(employee, 'cast', 'select', 'casts')}
                  {renderCell(employee, 'status', 'select', 'statuses')}
                  {renderCell(employee, 'serviceType', 'serviceType')}
                  {renderCell(employee, 'dateOfBirth', 'date')}
                  {renderCell(employee, 'stations', 'select', 'stations')}

                  {/* Address Fields - Now Editable */}
                  {renderCell(employee, 'address.line1', 'textarea')}
                  {renderCell(employee, 'address.muhala', 'input')}
                  {renderCell(employee, 'address.tehsil', 'select', 'locations')}
                  {renderCell(employee, 'address.line2', 'select', 'districts')}

                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex space-x-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => onSaveCell(employee)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleCancelEditing(employee)}
                            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => toggleEditMode(employee._id)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                  isEditable
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                                title={isEditable ? "Disable editing" : "Enable editing"}
                              >
                                {isEditable ? 'Disable Edit' : 'Edit'}
                              </button>
                              
                              {/* Show Save All button if employee has pending changes */}
                              {isEditable && editingData[employee._id] && Object.keys(editingData[employee._id]).length > 0 && (
                                <button
                                  onClick={() => onSaveCell(employee)}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                  title="Save all changes"
                                >
                                  Save All
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No employees found</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeGridTable;