import React, { useState } from "react";
import { deleteEmployee } from "../../Employee/EmployeeApi";
import { AlertTriangle, X } from "lucide-react";

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

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // State to track which employees are in edit mode
  const [editableEmployees, setEditableEmployees] = React.useState(new Set());
  const [confirmPopup, setConfirmPopup] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
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
            placeholder={fieldKey}
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
            placeholder={fieldKey}
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
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${value === "active" ? "bg-green-100 text-green-800" :
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
        return value ? new Date(value).toLocaleDateString() : `${fieldKey} N/A`;
      default:
        return value || `${fieldKey} N/A`;
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
      <>
        {isEditing ? (
          renderEditingCell(employee, fieldKey, fieldType, enumType)
        ) : (
          <div
            className={`p-1 rounded min-h-6 flex items-center ${isAdmin && isEditable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'
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
      </>
    );
  };

  // Render image cell
  const renderImageCell = (employee) => {
    const currentImageIndex = imageIndexes[employee._id] || 0;
    const totalImages = getImageCount(employee);
    const currentImage = getEmployeeImage(employee, currentImageIndex);
    const isEditable = editableEmployees.has(employee._id);

    return (
      <>
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
      </>
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


  // const handleDelete = async (id) => {

  //   await deleteEmployee(id)

  // }


  const handleDelete = (id) => {

    setDeleteId(id)
    setConfirmPopup(true)

  }

  const handleYes = async () => {
    // Add your delete logic here
    console.log("Deleting all employee data...");
    await deleteEmployee(deleteId)
    window.location.reload();
    setConfirmPopup(false);
  };

  const handleNo = () => {
    setConfirmPopup(false);
  };

  
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.trim()) activeFilters.name = filterForm.name.trim();
    if (filterForm.city.trim()) activeFilters.city = filterForm.city.trim();
    if (filterForm.status) activeFilters.status = filterForm.status;
    if (filterForm.designation)
      activeFilters.designation = filterForm.designation;
    if (filterForm.grade) activeFilters.grade = filterForm.grade;
    if (filterForm.personalNumber.trim())
      activeFilters.personalNumber = filterForm.personalNumber.trim();
    if (filterForm.cnic.trim()) activeFilters.cnic = filterForm.cnic.trim();
    updateFilters(activeFilters);
    setShowFilters(false); // Close filters on mobile after applying
  };

  const handleClearFilters = () => {
    setFilterForm({
      name: "",
      city: "",
      status: "",
      designation: "",
      grade: "",
      personalNumber: "",
      cnic: "",
    });
    clearFilters();
  };


  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden ">

      <div className="grid grid-cols-9 grid-rows-2 gap-1 bg-black/95 text-white text-lg font-bold text-left text-xs font-medium  uppercase tracking-wider">
        <div >Photo</div>
        <div >Personal #</div>
        <div >Name</div>
        <div >Father's Name</div>
        <div >CNIC</div>
        <div >Mobile</div>
        <div >Designation</div>
        <div >Service Type</div>
        <div >Date of Birth</div>
        <div className="padding-5" >Status</div>
        <div >Grade</div>
        <div >Rank</div>
        <div >Cast</div>
        <div >Station</div>
        <div >Address</div>
        <div >Mohalla</div>
        <div >Tehsil</div>
        <div >District</div>

      </div>

      {employees?.map((employee) => {
        const isEditing = editingCell?.rowId === employee._id;
        const isEditable = editableEmployees.has(employee._id);

        return (
          <>

            <div key={employee._id} className="grid grid-cols-9 grid-rows-3 gap-1 overflow-x-auto text-left text-xs font-medium  uppercase tracking-wider ">
              <div className="row-span-2">
                {/* Photo */}
                {renderImageCell(employee)}
              </div>
              <div >{renderCell(employee, 'personalNumber', 'input')}</div>
              <div > {renderCell(employee, 'firstName', 'input')}</div>
              <div > {renderCell(employee, 'fatherFirstName', 'input')}</div>
              <div > {renderCell(employee, 'cnic', 'input')}</div>
              <div > {renderCell(employee, 'mobileNumber', 'input')}</div>
              <div > {renderCell(employee, 'designation', 'select', 'designations')}</div>
              <div >{renderCell(employee, 'serviceType', 'serviceType')}</div>
              <div > {renderCell(employee, 'dateOfBirth', 'date')}</div>

              <div className="col-start-1 row-start-3   border-b border-indigo-600 "> {renderCell(employee, 'status', 'select', 'statuses')}</div>

              <div className="col-start-2"> {renderCell(employee, 'grade', 'select', 'grades')}</div>
              <div className="col-start-3">{renderCell(employee, 'rank', 'select', 'ranks')}</div>
              <div className="col-start-4">{renderCell(employee, 'cast', 'select', 'casts')}</div>
              <div className="col-start-5">{renderCell(employee, 'stations', 'select', 'stations')}</div>
              <div className="col-start-6">{renderCell(employee, 'address.line1', 'textarea')}</div>
              <div className="col-start-7">{renderCell(employee, 'address.muhala', 'input')}</div>
              <div className="col-start-8">{renderCell(employee, 'address.tehsil', 'select', 'locations')}</div>
              <div className="col-start-9"> {renderCell(employee, 'address.line2', 'select', 'districts')}</div>

              <div className="col-start-2 row-start-3 col-span-8  border-b border-indigo-600 ">
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
                            className={`px-2 py-1 text-xs rounded transition-colors ${isEditable
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            title={isEditable ? "Disable editing" : "Enable editing"}
                          >
                            {isEditable ? 'Disable Edit' : 'Edit'}
                          </button>

                          <button
                            onClick={() => { handleDelete(employee?._id) }}
                            className="bg-red-500 py-1 px-2 text-xs text-white rounded"
                          >
                            Delete
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

                  <button
                    onClick={() => handleView(employee)}
                    className="px-3 py-2 text-xs rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition margin-right-15"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleAssets(employee)}
                    className="px-3 py-2 text-xs rounded-md bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition"
                  >
                    Assets
                  </button>
                  <button
                    onClick={() => handlePosting(employee)}
                    className="px-3 py-2 text-xs rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                  >
                    Posting
                  </button>
                  <button
                    onClick={() => handleStatus(employee)}
                    className="px-3 py-2 text-xs rounded-md bg-teal-100 text-teal-700 hover:bg-teal-200 transition"
                  >
                    History
                  </button>
                  <button
                    onClick={() => handleAchievements(employee)}
                    className="px-3 py-2 text-xs rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                  >
                    Achievements
                  </button>
                  <button
                    onClick={() => handleDeductions(employee)}
                    className="px-3 py-2 text-xs rounded-md bg-pink-100 text-pink-700 hover:bg-pink-200 transition"
                  >
                    Deduction
                  </button>
                </div>
              </div>
            </div>

          </>
        );
      })}

      <div>
        {confirmPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
                </div>
                <button
                  onClick={handleNo}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Are you sure you want to delete employee ?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 bg-gray-50 justify-end">
                <button
                  onClick={handleNo}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleYes}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {
        employees.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No employees found</p>
          </div>
        )
      }
    </div >

    
  );
  
};

export default EmployeeGridTable;