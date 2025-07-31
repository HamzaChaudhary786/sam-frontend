import React, { useState } from "react";
import { deleteEmployee } from "../../Employee/EmployeeApi";
import { AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";


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
  // State management
  const [editableEmployees, setEditableEmployees] = useState(new Set());
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();
    

  // Helper functions
  const getEnumDisplayName = (enumKey, valueId) => {
    if (!valueId) return `${enumKey} N/A`;
    if (typeof valueId === "object" && valueId?.name) return valueId.name;

    const enumData = enums[enumKey];
    if (Array.isArray(enumData)) {
      const item = enumData.find(item => item._id === valueId);
      return item?.name || valueId || `${enumKey} N/A`;
    }
    return valueId || `${enumKey} N/A`;
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

  const getNestedValue = (employee, fieldPath, editingData) => {
    const employeeEditingData = editingData[employee._id] || {};

    if (employeeEditingData[fieldPath] !== undefined) {
      return employeeEditingData[fieldPath];
    }

    const pathParts = fieldPath.split('.');
    let value = employee;
    for (const part of pathParts) {
      value = value?.[part];
    }
    return value || '';
  };

  // Event handlers
  const toggleEditMode = (employeeId) => {
    const newEditableEmployees = new Set(editableEmployees);
    if (newEditableEmployees.has(employeeId)) {
      newEditableEmployees.delete(employeeId);
      if (editingCell?.rowId === employeeId) {
        onCancelEditing(employeeId);
      }
    } else {
      newEditableEmployees.add(employeeId);
    }
    setEditableEmployees(newEditableEmployees);
  };

  const handleCancelEditing = (employee) => {
    onCancelEditing(employee._id);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setConfirmPopup(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmPopup(false);
    setDeleteId(null);
  };

  // Navigation handlers (these would need to be passed as props or use router)
  const handleAchievements = (employee) => {
    navigate("/achievements", { state: { employee } });
    
  };

  const handleDeductions = (employee) => {
    navigate("/deductions", { state: { employee } });
  };

  const handleAssets = (employee) => {
    navigate("/assetassignment", { state: { employee } });
  };

  const handlePosting = (employee) => {
    navigate("/stationassignment", { state: { employee } });
  };

  const handleStatus = (employee) => {
    navigate("/statusassignment", { state: { employee } });
  };

  // Render functions
  const renderEditingCell = (employee, fieldKey, fieldType, enumType) => {
    const employeeEditingData = editingData[employee._id] || {};
    let value;

    if (fieldKey.includes('.')) {
      value = getNestedValue(employee, fieldKey, editingData);
    } else {
      value = employeeEditingData[fieldKey] !== undefined 
        ? employeeEditingData[fieldKey] 
        : employee[fieldKey];
    }

    const baseInputClasses = "w-full px-2 py-1 border border-gray-300 rounded text-xs";

    switch (fieldType) {
      case 'select':
        const enumData = enums[enumType] || [];
        return (
          <select
            value={value || ''}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={`${baseInputClasses} min-w-24`}
            placeholder={fieldKey}
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
            value={value || 'provincial'}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={baseInputClasses}
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
            className={`${baseInputClasses} min-w-32`}
            autoFocus
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={`${baseInputClasses} min-w-32 min-h-16 resize-none`}
            autoFocus
            rows={2}
            placeholder={fieldKey}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={`${baseInputClasses} min-w-24`}
            autoFocus
            placeholder={fieldKey}
          />
        );
    }
  };

  const renderDisplayCell = (employee, fieldKey, fieldType, enumType) => {
    let value;
    if (fieldKey.includes('.')) {
      value = getNestedValue(employee, fieldKey, editingData);
    } else {
      const employeeEditingData = editingData[employee._id] || {};
      value = employeeEditingData[fieldKey] !== undefined 
        ? employeeEditingData[fieldKey] 
        : employee[fieldKey];
    }

    switch (fieldType) {
      case 'select':
        if (fieldKey === 'status') {
          const displayName = getEnumDisplayName(enumType, value);
          const statusClasses = {
            active: "bg-green-100 text-green-800",
            retired: "bg-blue-100 text-blue-800",
            terminated: "bg-red-100 text-red-800",
            default: "bg-gray-100 text-gray-800"
          };
          
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              statusClasses[value] || statusClasses.default
            }`}>
              {displayName}
            </span>
          );
        }
        return getEnumDisplayName(enumType, value);
        
      case 'date':
        return value ? new Date(value).toLocaleDateString() : `${fieldKey} N/A`;
        
      default:
        return value || `${fieldKey} N/A`;
    }
  };

  const renderCell = (employee, fieldKey, fieldType, enumType = null) => {
    const isEditing = editingCell?.rowId === employee._id && editingCell?.fieldName === fieldKey;
    const isEditable = editableEmployees.has(employee._id);

    let currentValue;
    if (fieldKey.includes('.')) {
      currentValue = getNestedValue(employee, fieldKey, editingData);
    } else {
      currentValue = employee[fieldKey];
    }

    const cellClasses = `p-1 rounded min-h-6 flex items-center ${
      isAdmin && isEditable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'
    }`;

    const titleText = !isAdmin 
      ? "Read-only" 
      : !isEditable 
        ? "Click Edit button to enable editing" 
        : "Double-click to edit";

    return (
      <>
        {isEditing ? (
          renderEditingCell(employee, fieldKey, fieldType, enumType)
        ) : (
          <div
            className={cellClasses}
            onDoubleClick={() => isAdmin && isEditable && onStartEditing(employee._id, fieldKey, currentValue)}
            title={titleText}
          >
            <div 
              className="max-w-32 truncate" 
              title={renderDisplayCell(employee, fieldKey, fieldType, enumType)}
            >
              {renderDisplayCell(employee, fieldKey, fieldType, enumType)}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderImageCell = (employee) => {
    const currentImageIndex = imageIndexes[employee._id] || 0;
    const totalImages = getImageCount(employee);
    const currentImage = getEmployeeImage(employee, currentImageIndex);
    const isEditable = editableEmployees.has(employee._id);

    return (
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

        {isAdmin && isEditable && (
          <div className="absolute -bottom-2 -right-2 flex space-x-1">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    onImageUpload(employee, file);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />
              <div 
                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1 shadow-sm transition-colors" 
                title="Upload new image"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </label>

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
    );
  };

  const renderActionButtons = (employee, isEditing, isEditable) => {
    const buttonBaseClasses = "px-2 py-1 text-xs rounded transition-colors";
    const actionButtonClasses = "px-3 py-2 text-xs rounded-md transition";

    return (
      <div className="flex space-x-1">
        {isEditing ? (
          <>
            <button
              onClick={() => onSaveCell(employee)}
              className={`${buttonBaseClasses} bg-green-600 text-white hover:bg-green-700`}
            >
              Save
            </button>
            <button
              onClick={() => handleCancelEditing(employee)}
              className={`${buttonBaseClasses} bg-gray-600 text-white hover:bg-gray-700`}
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
                  className={`${buttonBaseClasses} ${
                    isEditable
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title={isEditable ? "Disable editing" : "Enable editing"}
                >
                  {isEditable ? 'Disable Edit' : 'Edit'}
                </button>

                <button
                  onClick={() => handleDelete(employee?._id)}
                  className={`${buttonBaseClasses} bg-red-500 text-white hover:bg-red-600`}
                >
                  Delete
                </button>

                {isEditable && editingData[employee._id] && Object.keys(editingData[employee._id]).length > 0 && (
                  <button
                    onClick={() => onSaveCell(employee)}
                    className={`${buttonBaseClasses} bg-green-600 text-white hover:bg-green-700`}
                    title="Save all changes"
                  >
                    Save All
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => handleAssets(employee)}
              className={`${actionButtonClasses} bg-cyan-100 text-cyan-700 hover:bg-cyan-200`}
            >
              Employee Assets
            </button>
            <button
              onClick={() => handlePosting(employee)}
              className={`${actionButtonClasses} bg-indigo-100 text-indigo-700 hover:bg-indigo-200`}
            >
              Posting
            </button>
            <button
              onClick={() => handleStatus(employee)}
              className={`${actionButtonClasses} bg-teal-100 text-teal-700 hover:bg-teal-200`}
            >
              History
            </button>
            <button
              onClick={() => handleAchievements(employee)}
              className={`${actionButtonClasses} bg-purple-100 text-purple-700 hover:bg-purple-200`}
            >
              Employee Achievements
            </button>
            <button
              onClick={() => handleDeductions(employee)}
              className={`${actionButtonClasses} bg-pink-100 text-pink-700 hover:bg-pink-200`}
            >
              Deduction
            </button>
          </>
        )}
      </div>
    );
  };

  const renderConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
          </div>
          <button
            onClick={handleCancelDelete}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed mb-2">
            Are you sure you want to delete this employee?
          </p>
          <p className="text-sm text-red-600 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 p-6 bg-gray-50 justify-end">
          <button
            onClick={handleCancelDelete}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Delete Employee
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Header Grid */}
      <div className="grid grid-cols-9 grid-rows-2 gap-3 bg-black/95 text-white text-sm text-left font-bold uppercase tracking-wider p-3">
        <div>Photo</div>
        <div>Personal #</div>
        <div>Name</div>
        <div>Father's Name</div>
        <div>CNIC</div>
        <div>Mobile</div>
        <div>Designation</div>
        <div>Service Type</div>
        <div>Date of Birth</div>
        <div>Status</div>
        <div>Grade</div>
        <div>Rank</div>
        <div>Cast</div>
        <div>Station</div>
        <div>Address</div>
        <div>Mohalla</div>
        <div>Tehsil</div>
        <div>District</div>
      </div>

      {/* Employee Rows */}
      {employees?.map((employee) => {
        const isEditing = editingCell?.rowId === employee._id;
        const isEditable = editableEmployees.has(employee._id);

        return (
          <div 
            key={employee._id} 
            className="grid grid-cols-9 grid-rows-3 gap-1 overflow-x-auto text-left text-xs font-medium uppercase tracking-wider p-2 border-b border-gray-200"
          >
            {/* Photo - spans 2 rows */}
            <div className="row-span-2">
              {renderImageCell(employee)}
            </div>

            {/* First row of data */}
            <div>{renderCell(employee, 'personalNumber', 'input')}</div>
            <div>{renderCell(employee, 'firstName', 'input')}</div>
            <div>{renderCell(employee, 'fatherFirstName', 'input')}</div>
            <div>{renderCell(employee, 'cnic', 'input')}</div>
            <div>{renderCell(employee, 'mobileNumber', 'input')}</div>
            <div>{renderCell(employee, 'designation', 'select', 'designations')}</div>
            <div>{renderCell(employee, 'serviceType', 'serviceType')}</div>
            <div>{renderCell(employee, 'dateOfBirth', 'date')}</div>

            {/* Second row of data */}
            <div className="col-start-1 row-start-3 border-b border-indigo-600">
              {renderCell(employee, 'status', 'select', 'statuses')}
            </div>
            <div className="col-start-2">{renderCell(employee, 'grade', 'select', 'grades')}</div>
            <div className="col-start-3">{renderCell(employee, 'rank', 'select', 'ranks')}</div>
            <div className="col-start-4">{renderCell(employee, 'cast', 'select', 'casts')}</div>
            <div className="col-start-5">{renderCell(employee, 'stations', 'select', 'stations')}</div>
            <div className="col-start-6">{renderCell(employee, 'address.line1', 'textarea')}</div>
            <div className="col-start-7">{renderCell(employee, 'address.muhala', 'input')}</div>
            <div className="col-start-8">{renderCell(employee, 'address.tehsil', 'select', 'locations')}</div>
            <div className="col-start-9">{renderCell(employee, 'address.line2', 'select', 'districts')}</div>

            {/* Action buttons row */}
            <div className="col-start-2 row-start-3 col-span-8 border-b border-indigo-600">
              {renderActionButtons(employee, isEditing, isEditable)}
            </div>
          </div>
        );
      })}

      {/* Confirmation Modal */}
      {confirmPopup && renderConfirmationModal()}

      {/* Empty State */}
      {employees.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No employees found</p>
        </div>
      )}
      
    </div>
    
  );
};

export default EmployeeGridTable;