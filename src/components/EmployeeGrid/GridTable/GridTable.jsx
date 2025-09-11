import React, { useState, useEffect } from "react";
import { deleteEmployee } from "../../Employee/EmployeeApi";
import { AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployeeFilters from "../../Employee/Filters.jsx";
import EmployeeViewModal from "../../Employee/ViewEmployee/ViewEmployee.jsx";
import Pagination from "../Pagination/Pagination.jsx";
import useGridMultiSelect from "../../Employee/MultiSelectGrid.jsx";
import MultiStationAssignmentForm from "../../Employee/Multipostingform.jsx";
import MultiSalaryDeductionForm from "../../Employee/Multisalarydeductin.jsx";
import MultiAchievementForm from "../../Employee/MultiAchievement.jsx";
import MultiStatusAssignmentForm from "../../Employee/MultiStatus.jsx";
import MultiAssetAssignmentForm from "../../Employee/MultiAsset.jsx";

import { toast } from "react-toastify";
import { usePermissions } from "../../../hook/usePermission.js";
import { MultiEnumSelect } from "../../Multiselect.jsx";
import { getTrainingsWithEnum } from "../../Employee/AddEmployee/Training.js";

const EmployeeGridTable = ({
  // parent-managed state and methods (single source of truth)
  employees,
  loading,
  error,
  filters,
  pagination,
  goToPage,
  nextPage,
  prevPage,
  changePageSize,
  updateFilters,
  clearFilters,
  removeEmployee,

  // editing and UI props
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
  onSaveAll,
  onPrevImage,
  onNextImage,
  onImageClick,
  onImageUpload,
  onRemoveImage,
  onDataRefresh,
}) => {
  const [isMultiStationModalOpen, setIsMultiStationModalOpen] = useState(false);
  const [selectedEmployeesForPosting, setSelectedEmployeesForPosting] =
    useState([]);
  const [isMultiDeductionModalOpen, setIsMultiDeductionModalOpen] =
    useState(false);
  const [selectedEmployeesForDeduction, setSelectedEmployeesForDeduction] =
    useState([]);

  const [isMultiAchievementModalOpen, setIsMultiAchievementModalOpen] =
    useState(false);
  const [selectedEmployeesForAchievement, setSelectedEmployeesForAchievement] =
    useState([]);
  const [isMultiStatusModalOpen, setIsMultiStatusModalOpen] = useState(false);
  const [selectedEmployeesForStatus, setSelectedEmployeesForStatus] = useState(
    []
  );
  const [isMultiAssetModalOpen, setIsMultiAssetModalOpen] = useState(false);
  const [selectedEmployeesForAsset, setSelectedEmployeesForAsset] = useState(
    []
  );
  // State management for grid
  const [editableEmployees, setEditableEmployees] = useState(new Set());
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const permissions = usePermissions();
  const [trainingEnum, setTrainingEnum] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await getTrainingsWithEnum();
        if (res?.success) {
          setTrainingEnum(res.data || {});
        }
      } catch (_) { }
    })();
  }, []);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const navigate = useNavigate();

  // Safety check for employees
  const safeEmployees = Array.isArray(employees) ? employees : [];

  

  function handleMultiPosting(selectedEmployeeObjects) {
    alert(`Multi-posting for ${selectedEmployeeObjects.length} employees!`); // Temporary for testing
    setSelectedEmployeesForPosting(selectedEmployeeObjects);
    setIsMultiStationModalOpen(true);
  }

  // Handle multi station assignment success
  const handleMultiStationSuccess = () => {
    setIsMultiStationModalOpen(false);
    setSelectedEmployeesForPosting([]);
    multiSelect.clearSelection(); // Use the function from the hook
    toast.success("Multi station assignments completed!");
  };

  // Handle multi station assignment cancel
  const handleMultiStationCancel = () => {
    setIsMultiStationModalOpen(false);
    setSelectedEmployeesForPosting([]);
  };
  function handleMultiDeduction(selectedEmployeeObjects) {
    setSelectedEmployeesForDeduction(selectedEmployeeObjects);
    setIsMultiDeductionModalOpen(true);
  }

  // Add these handler functions:
  const handleMultiDeductionSuccess = () => {
    setIsMultiDeductionModalOpen(false);
    setSelectedEmployeesForDeduction([]);
    multiSelect.clearSelection();
    toast.success("Multi salary deductions completed!");
  };

  const handleMultiDeductionCancel = () => {
    setIsMultiDeductionModalOpen(false);
    setSelectedEmployeesForDeduction([]);
  };
  function handleMultiAchievement(selectedEmployeeObjects) {
    setSelectedEmployeesForAchievement(selectedEmployeeObjects);
    setIsMultiAchievementModalOpen(true);
  }

  const handleMultiAchievementSuccess = () => {
    setIsMultiAchievementModalOpen(false);
    setSelectedEmployeesForAchievement([]);
    multiSelect.clearSelection();
    toast.success("Multi achievements completed!");
  };

  const handleMultiAchievementCancel = () => {
    setIsMultiAchievementModalOpen(false);
    setSelectedEmployeesForAchievement([]);
  };
  function handleMultiStatus(selectedEmployeeObjects) {
    setSelectedEmployeesForStatus(selectedEmployeeObjects);
    setIsMultiStatusModalOpen(true);
  }

  const handleMultiStatusSuccess = () => {
    setIsMultiStatusModalOpen(false);
    setSelectedEmployeesForStatus([]);
    multiSelect.clearSelection();
    toast.success("Multi status assignments completed!");
  };

  const handleMultiStatusCancel = () => {
    setIsMultiStatusModalOpen(false);
    setSelectedEmployeesForStatus([]);
  };
  function handleMultiAsset(selectedEmployeeObjects) {
    setSelectedEmployeesForAsset(selectedEmployeeObjects);
    setIsMultiAssetModalOpen(true);
  }

  // 4. Add success and cancel handlers:
  const handleMultiAssetSuccess = () => {
    setIsMultiAssetModalOpen(false);
    setSelectedEmployeesForAsset([]);
    multiSelect.clearSelection();
    toast.success("Multi asset assignments completed!");
  };

  const handleMultiAssetCancel = () => {
    setIsMultiAssetModalOpen(false);
    setSelectedEmployeesForAsset([]);
  };

  // Multi-select functionality - Add this exactly like EmployeeList
  const multiSelect = useGridMultiSelect({
    employees: safeEmployees,
    isAdmin,
    removeEmployee,
    loading,
    onMultiPosting: handleMultiPosting,
    onMultiDeduction: handleMultiDeduction, // Add this line!
    onMultiAchievement: handleMultiAchievement, // ✅ Add this line!
    onMultiStatus: handleMultiStatus, // Add this line
    onMultiAsset: handleMultiAsset, // ✅ Add this line!
  });
  const {
    selectedEmployees,
    selectAll,
    handleSelectEmployee,
    handleSelectAll,
    handleBulkDelete,
    handleClearSelection,
    selectedCount,
    hasSelection,
    isSelected,
    renderSelectAllCheckbox,
    renderEmployeeCheckbox,
    renderBulkActionsBar,
  } = multiSelect;

  // All your existing helper functions remain the same
  const getEnumDisplayName = (enumKey, valueId) => {
    if (!valueId) return `${enumKey} N/A`;
    if (typeof valueId === "object" && valueId?.name) return valueId.name;

    const enumData = enums[enumKey];
    if (Array.isArray(enumData)) {
      const item = enumData.find((item) => item._id === valueId);
      return item?.name || valueId || `${enumKey} N/A`;
    }
    return valueId || `${enumKey} N/A`;
  };

  const getEmployeeImage = (employee, index = 0) => {
    if (Array.isArray(employee.profileUrl)) {
      return (
        employee.profileUrl[index] ||
        employee.profileUrl[0] ||
        "/default-avatar.png"
      );
    }
    return employee.profileUrl || "/default-avatar.png";
  };

  const getImageCount = (employee) => {
    return Array.isArray(employee.profileUrl)
      ? employee.profileUrl.length
      : employee.profileUrl
        ? 1
        : 0;
  };

  const getNestedValue = (employee, fieldPath, editingData) => {
    const employeeEditingData = editingData[employee._id] || {};

    if (employeeEditingData[fieldPath] !== undefined) {
      return employeeEditingData[fieldPath];
    }

    const pathParts = fieldPath.split(".");
    let value = employee;
    for (const part of pathParts) {
      value = value?.[part];
    }
    return value || "";
  };

  // All your existing event handlers remain the same
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
      // Use the removeEmployee function from the hook which handles data refresh properly
      if (onDataRefresh) {
        await onDataRefresh(deleteId);
      } else {
        await deleteEmployee(deleteId);
      }
      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    } finally {
      setConfirmPopup(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmPopup(false);
    setDeleteId(null);
  };

  const handleApplyFilters = (filters) => {
    const backendFilters = {};

    // Handle array filters (multi-select and multi-text inputs)
    if (filters.name && filters.name.length > 0)
      backendFilters.name = filters.name;
    if (filters.address && filters.address.length > 0)
      backendFilters.address = filters.address;
    if (filters.personalNumber && filters.personalNumber.length > 0)
      backendFilters.personalNumber = filters.personalNumber;
    if (filters.cnic && filters.cnic.length > 0)
      backendFilters.cnic = filters.cnic;
    if (filters.cast && filters.cast.length > 0)
      backendFilters.cast = filters.cast;
    if (filters.rank && filters.rank.length > 0)
      backendFilters.rank = filters.rank;
    if (filters.status && filters.status.length > 0)
      backendFilters.status = filters.status;
    if (filters.designation && filters.designation.length > 0)
      backendFilters.designation = filters.designation;
    if (filters.grade && filters.grade.length > 0)
      backendFilters.grade = filters.grade;
    if (filters.station && filters.station.length > 0)
      backendFilters.station = filters.station;
    if (filters.district && filters.district.length > 0)
      backendFilters.district = filters.district;
    if (filters.tehsil && filters.tehsil.length > 0)
      backendFilters.tehsil = filters.tehsil;
    if (filters.assetType && filters.assetType.length > 0)
      backendFilters.assetType = filters.assetType;
    if (filters.serviceType && filters.serviceType.length > 0)
      backendFilters.serviceType = filters.serviceType;
    if (filters.serialNumber && filters.serialNumber.length > 0)
      backendFilters.serialNumber = filters.serialNumber;

    if (filters.fromDOB && filters.fromDOB.trim() !== '')
      backendFilters.fromDOB = filters.fromDOB;
    if (filters.toDOB && filters.toDOB.trim() !== '')
      backendFilters.toDOB = filters.toDOB;

    updateFilters(backendFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  // Navigation handlers remain the same
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

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  {
    /* Employee View Modal */
  }
  <EmployeeViewModal
    isOpen={isViewModalOpen}
    onClose={handleCloseViewModal}
    employee={selectedEmployee}
  />;

  // Pagination handlers remain the same
  const handlePageChange = (page) => {
    goToPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    changePageSize(pageSize);
  };

  // All your render functions remain the same...
  const renderEditingCell = (employee, fieldKey, fieldType, enumType) => {
    const employeeEditingData = editingData[employee._id] || {};
    let value;

    if (fieldKey.includes(".")) {
      value = getNestedValue(employee, fieldKey, editingData);
    } else {
      value =
        employeeEditingData[fieldKey] !== undefined
          ? employeeEditingData[fieldKey]
          : employee[fieldKey];
    }

    const baseInputClasses =
      "w-full px-2 py-1 border border-gray-300 rounded text-xs";

    let placeHolder = fieldKey;
    switch (fieldKey) {
      case "address.line1":
        placeHolder = "Address";
        break;
      case "address.line2":
        placeHolder = "District";
        break;
      case "address.muhala":
        placeHolder = "Mohalla";
        break;
      case "address.tehsil":
        placeHolder = "Tehsil";
        break;
    }

    switch (fieldType) {
      case "select":
        const enumData = enums[enumType] || [];
        return (
          <select
            value={value || ""}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={`${baseInputClasses} min-w-24`}
            placeholder={placeHolder}
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

      case "serviceType":
        return (
          <select
            value={value || "provincial"}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={baseInputClasses}
            autoFocus
          >
            <option value="federal">Federal</option>
            <option value="provincial">Provincial</option>
          </select>
        );

      case "date":
        let dateValue = "";
        if (value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              dateValue = date.toISOString().split("T")[0];
            }
          } catch (error) {
            console.error("Date formatting error:", error);
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

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={`${baseInputClasses} min-w-32 min-h-16 resize-none`}
            autoFocus
            rows={2}
            placeholder={placeHolder}
          />
        );

      case "training": {
        const currentArray = Array.isArray(value) ? value : [];
        return (
          <MultiEnumSelect
            label=""
            name={fieldKey}
            value={currentArray}
            onChange={(e) => {
              const next = Array.isArray(e?.target?.value) ? e.target.value : [];
              onCellChange(fieldKey, next);
            }}
            enumObject={trainingEnum}
            placeholder="Search and select trainings..."
            readOnly={false}
            className="w-full"
          />
        );
      }

      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onCellChange(fieldKey, e.target.value)}
            className={`${baseInputClasses} min-w-24`}
            autoFocus
            placeholder={placeHolder}
          />
        );
    }
  };

  const renderDisplayCell = (employee, fieldKey, fieldType, enumType) => {
    let value;
    if (fieldKey.includes(".")) {
      value = getNestedValue(employee, fieldKey, editingData);
    } else {
      const employeeEditingData = editingData[employee._id] || {};
      value =
        employeeEditingData[fieldKey] !== undefined
          ? employeeEditingData[fieldKey]
          : employee[fieldKey];
    }

    switch (fieldType) {
      case "select":
        if (fieldKey === "status") {
          const displayName = getEnumDisplayName(enumType, value);
          const statusClasses = {
            active: "bg-green-100 text-green-800",
            retired: "bg-blue-100 text-blue-800",
            terminated: "bg-red-100 text-red-800",
            default: "bg-gray-100 text-gray-800",
          };

          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[value] || statusClasses.default
                }`}
            >
              {displayName}
            </span>
          );
        }
        return getEnumDisplayName(enumType, value);

      case "date":
        return value ? new Date(value).toLocaleDateString() : `${fieldKey} N/A`;

      default: {
        switch (fieldKey) {
          case "address.line1":
            return value || `Address N/A`;
          case "address.line2":
            return value || `District N/A`;
          case "address.muhala":
            return value || `Mohalla N/A`;
          case "address.tehsil":
            return value || `Tehsil N/A`;
          case "training": {
            const arr = Array.isArray(value) ? value : [];
            if (!arr.length) return "Trainings N/A";
            const labels = arr.map((id) => trainingEnum?.[id] || id);
            return labels.join(", ");
          }

          default:
            return value || `${fieldKey} N/A`;
        }
      }
    }
  };

  const renderCell = (employee, fieldKey, fieldType, enumType = null) => {
    const isEditing =
      editingCell?.rowId === employee._id &&
      editingCell?.fieldName === fieldKey;
    const isEditable = editableEmployees.has(employee._id);

    let currentValue;
    if (fieldKey.includes(".")) {
      currentValue = getNestedValue(employee, fieldKey, editingData);
    } else {
      currentValue = employee[fieldKey];
    }

    const cellClasses = `p-1 rounded min-h-6 flex items-center ${isAdmin && isEditable
      ? "cursor-pointer hover:bg-gray-100"
      : "cursor-default"
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
            onDoubleClick={() =>
              isAdmin &&
              isEditable &&
              onStartEditing(employee._id, fieldKey, currentValue)
            }
            title={titleText}
          >
            <div
              className="max-w-64 truncate"
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
          className="h-8 w-8 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
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
                  e.target.value = "";
                }}
                className="hidden"
              />
              <div
                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1 shadow-sm transition-colors"
                title="Upload new image"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </label>

            {totalImages > 1 && (
              <button
                onClick={() => onRemoveImage(employee, currentImageIndex)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-sm transition-colors"
                title="Remove current image"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Removed old horizontal action buttons; actions will be rendered vertically next to the checkbox

  const renderConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Confirm Deletion
            </h2>
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  const handleSaveAll = () => {
    onSaveAll();
    toast.success("All changes saved!");
  };

  const handleCancelAll = () => {
    Object.keys(editingData).forEach((employeeId) => {
      const employee = safeEmployees.find((emp) => emp._id === employeeId);
      if (employee) {
        onCancelEditing(employee._id);
      }
    });
    toast.info("All changes cancelled.");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Main render with multi-select functionality
  return (
    <div>
      <EmployeeFilters
        filters={filters}
        updateFilters={handleApplyFilters}
        clearFilters={handleClearFilters}
        showFilters={true}
      />

      {/* Bulk Actions Bar - exactly like EmployeeList */}
      {renderBulkActionsBar()}

      {/* Save All Button for multiple edits */}
      {Object.keys(editingData).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md p-4 flex gap-3 justify-end z-50">
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 font-semibold"
          >
            Save All Changes
          </button>
          <button
            onClick={handleCancelAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold"
          >
            Cancel All Changes
          </button>
        </div>
      )}

      <div class="overflow-x-auto rounded-t-xl">
        <table class="min-w-full text-left text-sm text-gray-500 border border-gray-200">
          <thead class="bg-[#ede8e8] text-[#000] h-12">
            <tr class="text-left text-xs font-medium uppercase tracking-wider">
              {/* <th class="px-4 py-2 border border-gray-200 ">Photo</th> */}
              <th class="px-4 py-2 border border-gray-200">
                <div className="flex flex-col items-center gap-1 mt-5">
                  <span className="text-xs">Photo</span>
                  {renderSelectAllCheckbox()}
                </div>
              </th>
              <th class="px-4 py-2 border border-gray-200">Actions</th>
              <th class="px-4 py-2 border border-gray-200">Name</th>

              <th class="px-4 py-2 border border-gray-200">Status</th>

              <th class="px-4 py-2 border border-gray-200 row-span-2">
                Personal #
              </th>

              <th class="px-4 py-2 border border-gray-200">Station</th>

              <th class="px-4 py-2 border border-gray-200">Rank</th>

              <th class="px-4 py-2 border border-gray-200">Cast</th>

              <th class="px-4 py-2 border border-gray-200 row-span-2">
                Address
              </th>

              <th class="px-4 py-2 border border-gray-200">Tehsil</th>

              <th class="px-4 py-2 border border-gray-200"></th>

              <th colSpan={7} class="px-4 py-2 border border-gray-200">
                Employee's
              </th>
            </tr>
            <tr class="text-left text-xs font-medium uppercase tracking-wider">
              <th class="px-4 py-2 border border-gray-200"></th>
              <th class="px-4 py-2 border border-gray-200"></th>
              <th class="px-4 py-2 border border-gray-200">Father's Name</th>
              <th class="px-4 py-2 border border-gray-200">Grade</th>
              <th class="px-4 py-2 border border-gray-200">CNIC</th>
              <th class="px-4 py-2 border border-gray-200">Mobile</th>

              <th class="px-4 py-2 border border-gray-200">Date of Birth</th>

              <th class="px-4 py-2 border border-gray-200">Designation</th>
              <th class="px-4 py-2 border border-gray-200">Mohalla</th>

              <th class="px-4 py-2 border border-gray-200">District</th>

              <th class="px-4 py-2 border border-gray-200">Service Type</th>

              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                Trainings
              </th>
              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                Assets
              </th>
              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                Awards
              </th>
              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                Deductions
              </th>
              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                Posting
              </th>
              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                Disciplinary
              </th>
              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                History
              </th>
              <th class="px-4 py-2 border border-gray-200 text-center">
                {" "}
                Functions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Employee Rows - Updated with checkboxes */}
            {safeEmployees?.map((employee) => {
              const isEditing = editingCell?.rowId === employee._id;
              const isEditable = editableEmployees.has(employee._id);
              const isStationIncharge =
                employee.stations?.stationIncharge?.some(
                  (incharge) => incharge.employee === employee._id
                );
              const isMallkhanaIncharge = employee.assignedAssets?.some(
                (asset) => asset.asset[0]?.mallkhana !== null
              );
              const hasAward = employee.assignedAwards?.some(
                (award) => award.isMonitor === true
              );
              const disciplinaryObjects =
                employee?.disciplinaryActions?.filter(
                  (dis) => dis.isDisciplinaryAction === true
                ) || [];


              return (
                <>
                  {/* {renderCell(employee, "address.line1", "textarea")}
                  {renderCell(employee, "address.muhala", "input")} */}

                  <tr
                    key={employee._id}
                    className={`text-left text-xs font-medium uppercase tracking-wider ${isSelected(employee._id)
                      ? "bg-blue-50 ring-1 ring-blue-300"
                      : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    <td rowSpan={2} className="border border-gray-200 mx-2">

                      <div className="border border-gray-200 items-center justify-center p-1">
                        {renderEmployeeCheckbox(employee)}
                        {renderImageCell(employee)}
                      </div>
                    </td>

                    <td rowSpan={2} className="border border-gray-200">
                      {/* Vertical action buttons - spans 2 rows */}
                      <div className=" flex flex-col items-stretch gap-1 py-1">
                        {(isAdmin ||
                          permissions?.userData?.roles?.some((role) =>
                            role.accessRequirement?.some(
                              (access) =>
                                access.resourceName.toLowerCase() ===
                                "employee" && access.canEdit === true
                            )
                          )) && (
                            <button
                              onClick={() => toggleEditMode(employee._id)}
                              className={`px-1.5 py-0.5 text-[12px] rounded transform origin-left scale-x-[0.7] ${editableEmployees.has(employee._id)
                                ? "bg-orange-600 text-white hover:bg-orange-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              title={
                                editableEmployees.has(employee._id)
                                  ? "Disable editing"
                                  : "Enable editing"
                              }
                            >
                              {editableEmployees.has(employee._id)
                                ? "Disable Edit"
                                : "Edit"}
                            </button>
                          )}
                        {/* <button
                  onClick={() => handleDelete(employee?._id)}
                  className="px-1.5 py-0.5 text-[12px] rounded bg-red-600 text-white hover:bg-red-700 transform origin-left scale-x-[0.7]"
                >
                  Delete
                </button> */}
                        {!isEditing && (
                          <button
                            onClick={() => handleView(employee)}
                            className="px-1.5 py-0.5 text-[12px] rounded bg-gray-700 text-white hover:bg-gray-800 transform origin-left scale-x-[0.7]"
                          >
                            View
                          </button>
                        )}
                        {/* Removed horizontal action row; actions shown vertically next to checkbox */}
                        {isEditing && (
                          <>
                            <button
                              onClick={() => onSaveCell(employee)}
                              className="px-1.5 py-0.5 text-[12px] rounded bg-green-700 text-white hover:bg-green-800 transform origin-left scale-x-[0.7]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleCancelEditing(employee)}
                              className="px-1.5 py-0.5 text-[12px] rounded bg-purple-700 text-white hover:bg-purple-800 transform origin-left scale-x-[0.7]"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "firstName", "input")}
                      <div className="flex flex-wrap gap-1">
                        {isStationIncharge && (
                          <div
                            className="bg-blue-100 text-blue-800 w-fit text-[8px]  px-2 py-1 rounded"

                          >
                            <p>
                              S.Incharge
                            </p>
                          </div>
                        )}
                        {isMallkhanaIncharge && (
                          <div
                            className="bg-blue-100 text-blue-800 w-fit text-[8px]  px-2 py-1 rounded"

                          >
                            <p>
                              M.Incharge
                            </p>
                          </div>
                        )}
                        {hasAward && (
                          <span className="bg-yellow-100 text-yellow-800 w-fit text-[8px] px-2 py-1 rounded">
                            Award
                          </span>
                        )}

                        {disciplinaryObjects.length > 0 && disciplinaryObjects[0]?.description && (
                          <span className="bg-yellow-100 text-yellow-800 w-fit text-[8px] px-2 py-1 rounded">
                            {disciplinaryObjects[0].description}
                          </span>
                        )}

                      </div>
                    </td>

                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "status", "select", "statuses")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "personalNumber", "input")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "stations", "select", "stations")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "rank", "select", "ranks")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "cast", "select", "casts")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "address.line1", "textarea")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(
                        employee,
                        "address.tehsil",
                        "select",
                        "tehsil"
                      )}
                    </td>
                    <td rowSpan={2} className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "serviceType", "serviceType")}
                    </td>

                    <td rowSpan={2} className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "training", "training")}
                    </td>
                    <td rowSpan={2} className="x-4 py-2 border border-gray-200">
                      <div>
                        {employee?.assignedAssets?.map((item) => (
                          <div key={item._id} className="flex flex-row">
                            {item.asset?.map((itm) => (
                              <div key={itm._id} className="text-xs text-gray-500 truncate">
                                {itm.weaponNumber ||
                                  itm.registerNumber}

                                <span className="text-xs mt-0.5">
                                  {itm.name} {itm.category}
                                </span>
                              </div>

                            ))}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td rowSpan={2} className="x-4 py-2 border border-gray-200">
                      <div className="flex flex-row">
                        {employee?.assignedAwards?.map((itm) => (
                          <span key={itm._id} className="text-xs mt-0.5">
                            {itm.achievementType} {itm.amount} {formatDate(itm.date)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td rowSpan={2} className="x-4 py-2 border border-gray-200">
                      <div className="flex flex-row">
                        {employee?.assignedDeduction?.map((itm) => (
                          <span key={itm._id} className="text-xs mt-0.5">
                            {itm.deductionType} {itm.amount} {formatDate(itm.date)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td rowSpan={2} className="px-2 py-1 border border-gray-200 w-full">
                      <div className="flex flex-col w-full">
                        {employee?.postings?.map((itm) => (
                          <>

                            <div
                              key={itm._id}
                              className="text-[10px] text-gray-700 bg-gray-50 w-48 rounded px-1"
                            >

                              {itm.currentStation?.name || 'N/A'} {" from "}
                              {itm.fromDate ? new Date(itm.fromDate).toLocaleDateString() : 'N/A'}


                            </div>


                          </>
                        ))}
                      </div>
                    </td>

                  </tr>

                  <tr
                    className={`text-left text-xs font-medium uppercase tracking-wider border-b-2 border-black pb-2 pt-2 ${isSelected(employee._id)
                      ? "bg-blue-50 ring-1 ring-blue-300"
                      : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "fatherFirstName", "input")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "grade", "select", "grades")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "cnic", "input")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "mobileNumber", "input")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(employee, "dateOfBirth", "date")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(
                        employee,
                        "designation",
                        "select",
                        "designations"
                      )}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {" "}
                      {renderCell(employee, "address.muhala", "input")}
                    </td>
                    <td className="x-4 py-2 border border-gray-200">
                      {renderCell(
                        employee,
                        "address.line2",
                        "select",
                        "district"
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grid Section - Updated with checkboxes */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Confirmation Modal */}
        {confirmPopup && renderConfirmationModal()}

        {/* Empty State */}
        {safeEmployees.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {Object.values(filters).some((filter) => filter !== "")
                ? "No employees match your filters"
                : "No employees found"}
            </p>
          </div>
        )}
      </div>



      <MultiStationAssignmentForm
        selectedEmployees={selectedEmployeesForPosting}
        isOpen={isMultiStationModalOpen}
        onSuccess={handleMultiStationSuccess}
        onCancel={handleMultiStationCancel}
      />

      <MultiSalaryDeductionForm
        selectedEmployees={selectedEmployeesForDeduction}
        isOpen={isMultiDeductionModalOpen}
        onSuccess={handleMultiDeductionSuccess}
        onCancel={handleMultiDeductionCancel}
      />

      <MultiAchievementForm
        selectedEmployees={selectedEmployeesForAchievement}
        isOpen={isMultiAchievementModalOpen}
        onSuccess={handleMultiAchievementSuccess}
        onCancel={handleMultiAchievementCancel}
      />
      <MultiStatusAssignmentForm
        selectedEmployees={selectedEmployeesForStatus}
        isOpen={isMultiStatusModalOpen}
        onSuccess={handleMultiStatusSuccess}
        onCancel={handleMultiStatusCancel}
      />
      <MultiAssetAssignmentForm
        selectedEmployees={selectedEmployeesForAsset}
        isOpen={isMultiAssetModalOpen}
        onSuccess={handleMultiAssetSuccess}
        onCancel={handleMultiAssetCancel}
      />
      {/* Pagination Component */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        showPageSizeOptions={true}
        pageSizeOptions={[5, 10, 15, 20, 50, 200, 500]}
      />
    </div>
  );
};

export default EmployeeGridTable;

// import React, { useState, useEffect } from "react";
// import { deleteEmployee } from "../../Employee/EmployeeApi";
// import { AlertTriangle, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import EmployeeFilter from "../filter.jsx";
// import EmployeeViewModal from "../../Employee/ViewEmployee/ViewEmployee.jsx";
// import { useEmployees } from "../../Employee/EmployeeHook.js";
// import Pagination from "../Pagination/Pagination.jsx";

// const EmployeeGridTable = ({
//   sortConfig,
//   editingCell,
//   editingData,
//   imageIndexes,
//   enums,
//   isAdmin,
//   onSort,
//   onStartEditing,
//   onStopEditing,
//   onCancelEditing,
//   onCellChange,
//   onSaveCell,
//   onPrevImage,
//   onNextImage,
//   onImageClick,
//   onImageUpload,
//   onRemoveImage,
// }) => {
//   // Use the employees hook for backend filtering and pagination
//   const {
//     employees,
//     loading,
//     error,
//     updateFilters,
//     clearFilters,
//     filters,
//     pagination,
//     goToPage,
//     nextPage,
//     prevPage,
//     changePageSize,
//   } = useEmployees();

//   // State management for grid
//   const [editableEmployees, setEditableEmployees] = useState(new Set());
//   const [confirmPopup, setConfirmPopup] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   // View Modal state
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   const navigate = useNavigate();

//   // Helper functions
//   const getEnumDisplayName = (enumKey, valueId) => {
//     if (!valueId) return `${enumKey} N/A`;
//     if (typeof valueId === "object" && valueId?.name) return valueId.name;

//     const enumData = enums[enumKey];
//     if (Array.isArray(enumData)) {
//       const item = enumData.find((item) => item._id === valueId);
//       return item?.name || valueId || `${enumKey} N/A`;
//     }
//     return valueId || `${enumKey} N/A`;
//   };

//   const getEmployeeImage = (employee, index = 0) => {
//     if (Array.isArray(employee.profileUrl)) {
//       return (
//         employee.profileUrl[index] ||
//         employee.profileUrl[0] ||
//         "/default-avatar.png"
//       );
//     }
//     return employee.profileUrl || "/default-avatar.png";
//   };

//   const getImageCount = (employee) => {
//     return Array.isArray(employee.profileUrl)
//       ? employee.profileUrl.length
//       : employee.profileUrl
//         ? 1
//         : 0;
//   };

//   const getSortIcon = (key) => {
//     if (sortConfig.key === key) {
//       return sortConfig.direction === "asc" ? "↑" : "↓";
//     }
//     return "";
//   };

//   const getNestedValue = (employee, fieldPath, editingData) => {
//     const employeeEditingData = editingData[employee._id] || {};

//     if (employeeEditingData[fieldPath] !== undefined) {
//       return employeeEditingData[fieldPath];
//     }

//     const pathParts = fieldPath.split(".");
//     let value = employee;
//     for (const part of pathParts) {
//       value = value?.[part];
//     }
//     return value || "";
//   };

//   // Event handlers
//   const toggleEditMode = (employeeId) => {
//     const newEditableEmployees = new Set(editableEmployees);
//     if (newEditableEmployees.has(employeeId)) {
//       newEditableEmployees.delete(employeeId);
//       if (editingCell?.rowId === employeeId) {
//         onCancelEditing(employeeId);
//       }
//     } else {
//       newEditableEmployees.add(employeeId);
//     }
//     setEditableEmployees(newEditableEmployees);
//   };

//   const handleCancelEditing = (employee) => {
//     onCancelEditing(employee._id);
//   };

//   const handleDelete = (id) => {
//     setDeleteId(id);
//     setConfirmPopup(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       await deleteEmployee(deleteId);
//       window.location.reload();
//     } catch (error) {
//       console.error("Error deleting employee:", error);
//     } finally {
//       setConfirmPopup(false);
//       setDeleteId(null);
//     }
//   };

//   const handleCancelDelete = () => {
//     setConfirmPopup(false);
//     setDeleteId(null);
//   };

//   // Filter handlers
//   const handleFilterChange = (filters) => {
//     // Local filter state management
//   };

//   const handleApplyFilters = (filters) => {
//     const backendFilters = {};

//     if (filters.name) {
//       backendFilters.name = filters.name;
//     }

//     if (filters.city) {
//       backendFilters.address = filters.city;
//     }

//     if (filters.personalNumber) {
//       backendFilters.personalNumber = filters.personalNumber;
//     }

//     if (filters.cnic) {
//       backendFilters.cnic = filters.cnic;
//     }

//     updateFilters(backendFilters);
//   };

//   const handleClearFilters = () => {
//     clearFilters();
//   };

//   // Navigation handlers
//   const handleAchievements = (employee) => {
//     navigate("/achievements", { state: { employee } });
//   };

//   const handleDeductions = (employee) => {
//     navigate("/deductions", { state: { employee } });
//   };

//   const handleAssets = (employee) => {
//     navigate("/assetassignment", { state: { employee } });
//   };

//   const handlePosting = (employee) => {
//     navigate("/stationassignment", { state: { employee } });
//   };

//   const handleStatus = (employee) => {
//     navigate("/statusassignment", { state: { employee } });
//   };

//   const handleView = (employee) => {
//     setSelectedEmployee(employee);
//     setIsViewModalOpen(true);
//   };

//   const handleCloseViewModal = () => {
//     setIsViewModalOpen(false);
//     setSelectedEmployee(null);
//   };

//   // Pagination handlers
//   const handlePageChange = (page) => {
//     goToPage(page);
//   };

//   const handlePageSizeChange = (pageSize) => {
//     changePageSize(pageSize);
//   };

//   // Render functions
//   const renderEditingCell = (employee, fieldKey, fieldType, enumType) => {
//     const employeeEditingData = editingData[employee._id] || {};
//     let value;

//     if (fieldKey.includes(".")) {
//       value = getNestedValue(employee, fieldKey, editingData);
//     } else {
//       value =
//         employeeEditingData[fieldKey] !== undefined
//           ? employeeEditingData[fieldKey]
//           : employee[fieldKey];
//     }

//     const baseInputClasses =
//       "w-full px-2 py-1 border border-gray-300 rounded text-xs";

//     let placeHolder = fieldKey;
//     switch (fieldKey) {
//       case "address.line1":
//         placeHolder = "Address";
//         break;
//       case "address.line2":
//         placeHolder = "District";
//         break;
//       case "address.muhala":
//         placeHolder = "Mohalla";
//         break;
//       case "address.tehsil":
//         placeHolder = "Tehsil";
//         break;
//     }

//     switch (fieldType) {
//       case "select":
//         const enumData = enums[enumType] || [];
//         return (
//           <select
//             value={value || ""}
//             onChange={(e) => onCellChange(fieldKey, e.target.value)}
//             className={`${baseInputClasses} min-w-20 text-xs`}
//             placeholder={placeHolder}
//             autoFocus
//           >
//             <option value="">Select...</option>
//             {enumData.map((item) => (
//               <option key={item._id} value={item._id}>
//                 {item.name}
//               </option>
//             ))}
//           </select>
//         );

//       case "serviceType":
//         return (
//           <select
//             value={value || "provincial"}
//             onChange={(e) => onCellChange(fieldKey, e.target.value)}
//             className={`${baseInputClasses} text-xs`}
//             autoFocus
//           >
//             <option value="federal">Federal</option>
//             <option value="provincial">Provincial</option>
//           </select>
//         );

//       case "date":
//         let dateValue = "";
//         if (value) {
//           try {
//             const date = new Date(value);
//             if (!isNaN(date.getTime())) {
//               dateValue = date.toISOString().split("T")[0];
//             }
//           } catch (error) {
//             console.error("Date formatting error:", error);
//           }
//         }

//         return (
//           <input
//             type="date"
//             value={dateValue}
//             onChange={(e) => onCellChange(fieldKey, e.target.value)}
//             className={`${baseInputClasses} min-w-24 text-xs`}
//             autoFocus
//           />
//         );

//       case "textarea":
//         return (
//           <textarea
//             value={value || ""}
//             onChange={(e) => onCellChange(fieldKey, e.target.value)}
//             className={`${baseInputClasses} min-w-24 min-h-12 resize-none text-xs`}
//             autoFocus
//             rows={2}
//             placeholder={placeHolder}
//           />
//         );

//       default:
//         return (
//           <input
//             type="text"
//             value={value || ""}
//             onChange={(e) => onCellChange(fieldKey, e.target.value)}
//             className={`${baseInputClasses} min-w-20 text-xs`}
//             autoFocus
//             placeholder={placeHolder}
//           />
//         );
//     }
//   };

//   const renderDisplayCell = (employee, fieldKey, fieldType, enumType) => {
//     let value;
//     if (fieldKey.includes(".")) {
//       value = getNestedValue(employee, fieldKey, editingData);
//     } else {
//       const employeeEditingData = editingData[employee._id] || {};
//       value =
//         employeeEditingData[fieldKey] !== undefined
//           ? employeeEditingData[fieldKey]
//           : employee[fieldKey];
//     }

//     switch (fieldType) {
//       case "select":
//         if (fieldKey === "status") {
//           const displayName = getEnumDisplayName(enumType, value);
//           const statusClasses = {
//             active: "bg-green-100 text-green-800",
//             retired: "bg-blue-100 text-blue-800",
//             terminated: "bg-red-100 text-red-800",
//             default: "bg-gray-100 text-gray-800",
//           };

//           return (
//             <span
//               className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[value] || statusClasses.default
//                 }`}
//             >
//               {displayName}
//             </span>
//           );
//         }
//         return getEnumDisplayName(enumType, value);

//       case "date":
//         return value ? new Date(value).toLocaleDateString() : `${fieldKey} N/A`;

//       default:
//         switch (fieldKey) {
//           case "address.line1":
//             return value || `Address N/A`;
//           case "address.line2":
//             return value || `District N/A`;
//           case "address.muhala":
//             return value || `Mohalla N/A`;
//           case "address.tehsil":
//             return value || `Tehsil N/A`;
//           default:
//             return value || `${fieldKey} N/A`;
//         }
//     }
//   };

//   const renderCell = (employee, fieldKey, fieldType, enumType = null) => {
//     const isEditing =
//       editingCell?.rowId === employee._id &&
//       editingCell?.fieldName === fieldKey;
//     const isEditable = editableEmployees.has(employee._id);

//     let currentValue;
//     if (fieldKey.includes(".")) {
//       currentValue = getNestedValue(employee, fieldKey, editingData);
//     } else {
//       currentValue = employee[fieldKey];
//     }

//     const cellClasses = `p-1 rounded min-h-6 flex items-center text-xs w-full ${isAdmin && isEditable
//       ? "cursor-pointer hover:bg-gray-100"
//       : "cursor-default"
//       }`;

//     const titleText = !isAdmin
//       ? "Read-only"
//       : !isEditable
//         ? "Click Edit button to enable editing"
//         : "Double-click to edit";

//     return (
//       <>
//         {isEditing ? (
//           <div className="w-full">
//             {renderEditingCell(employee, fieldKey, fieldType, enumType)}
//           </div>
//         ) : (
//           <div
//             className={cellClasses}
//             onDoubleClick={() =>
//               isAdmin &&
//               isEditable &&
//               onStartEditing(employee._id, fieldKey, currentValue)
//             }
//             title={titleText}
//           >
//             <div
//               className="w-full truncate text-xs"
//               title={renderDisplayCell(employee, fieldKey, fieldType, enumType)}
//             >
//               {renderDisplayCell(employee, fieldKey, fieldType, enumType)}
//             </div>
//           </div>
//         )}
//       </>
//     );
//   };

//   const renderImageCell = (employee) => {
//     const currentImageIndex = imageIndexes[employee._id] || 0;
//     const totalImages = getImageCount(employee);
//     const currentImage = getEmployeeImage(employee, currentImageIndex);
//     const isEditable = editableEmployees.has(employee._id);

//     return (
//       <div className="relative flex justify-center">
//         <img
//           className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
//           src={currentImage}
//           alt={`${employee.firstName} ${employee.lastName}`}
//           onClick={() => onImageClick({ image: currentImage, employee })}
//         />
//         {totalImages > 1 && (
//           <>
//             <button
//               onClick={() => onPrevImage(employee._id, totalImages)}
//               className="absolute -left-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-0.5 shadow-sm hover:bg-gray-100 transition-colors text-xs"
//               title="Previous image"
//             >
//               ‹
//             </button>
//             <button
//               onClick={() => onNextImage(employee._id, totalImages)}
//               className="absolute -right-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-0.5 shadow-sm hover:bg-gray-100 transition-colors text-xs"
//               title="Next image"
//             >
//               ›
//             </button>
//             <div
//               className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 rounded-full"
//               style={{ fontSize: "8px" }}
//             >
//               {currentImageIndex + 1}/{totalImages}
//             </div>
//           </>
//         )}

//         {isAdmin && isEditable && (
//           <div className="absolute -bottom-2 -right-2 flex space-x-1">
//             <label className="cursor-pointer">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) {
//                     onImageUpload(employee, file);
//                   }
//                   e.target.value = "";
//                 }}
//                 className="hidden"
//               />
//               <div
//                 className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1 shadow-sm transition-colors"
//                 title="Upload new image"
//               >
//                 <svg
//                   className="w-2 h-2 sm:w-3 sm:h-3"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                   />
//                 </svg>
//               </div>
//             </label>

//             {totalImages > 1 && (
//               <button
//                 onClick={() => onRemoveImage(employee, currentImageIndex)}
//                 className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-sm transition-colors"
//                 title="Remove current image"
//               >
//                 <svg
//                   className="w-2 h-2 sm:w-3 sm:h-3"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderActionButtons = (employee, isEditing, isEditable) => {
//     const buttonBaseClasses = "px-1.5 py-1 text-xs rounded transition-colors whitespace-nowrap";
//     const actionButtonClasses = "px-2 py-1 text-xs rounded-md transition whitespace-nowrap";

//     return (
//       <div className="flex flex-wrap gap-1 text-xs">
//         {isEditing ? (
//           <>
//             <button
//               onClick={() => onSaveCell(employee)}
//               className={`${buttonBaseClasses} bg-green-600 text-white hover:bg-green-700`}
//             >
//               Save
//             </button>
//             <button
//               onClick={() => handleCancelEditing(employee)}
//               className={`${buttonBaseClasses} bg-gray-600 text-white hover:bg-gray-700`}
//             >
//               Cancel
//             </button>
//           </>
//         ) : (
//           <>
//             {isAdmin && (
//               <>
//                 <button
//                   onClick={() => toggleEditMode(employee._id)}
//                   className={`${buttonBaseClasses} ${isEditable
//                     ? "bg-orange-600 text-white hover:bg-orange-700"
//                     : "bg-blue-600 text-white hover:bg-blue-700"
//                     }`}
//                   title={isEditable ? "Disable editing" : "Enable editing"}
//                 >
//                   {isEditable ? "Disable" : "Edit"}
//                 </button>

//                 <button
//                   onClick={() => handleDelete(employee?._id)}
//                   className={`${buttonBaseClasses} bg-red-500 text-white hover:bg-red-600`}
//                 >
//                   Delete
//                 </button>

//                 {isEditable &&
//                   editingData[employee._id] &&
//                   Object.keys(editingData[employee._id]).length > 0 && (
//                     <button
//                       onClick={() => onSaveCell(employee)}
//                       className={`${buttonBaseClasses} bg-green-600 text-white hover:bg-green-700`}
//                       title="Save all changes"
//                     >
//                       Save All
//                     </button>
//                   )}
//               </>
//             )}

//             <button
//               onClick={() => handleView(employee)}
//               className={`${actionButtonClasses} bg-green-700 text-white hover:bg-green-800`}
//             >
//               View
//             </button>

//             <button
//               onClick={() => handleAssets(employee)}
//               className={`${actionButtonClasses} bg-cyan-700 text-white hover:bg-cyan-800`}
//             >
//               Assets
//             </button>
//             <button
//               onClick={() => handlePosting(employee)}
//               className={`${actionButtonClasses} bg-indigo-700 text-white hover:bg-indigo-800`}
//             >
//               Posting
//             </button>
//             <button
//               onClick={() => handleStatus(employee)}
//               className={`${actionButtonClasses} bg-teal-700 text-white hover:bg-teal-800`}
//             >
//               History
//             </button>
//             <button
//               onClick={() => handleAchievements(employee)}
//               className={`${actionButtonClasses} bg-purple-700 text-white hover:bg-purple-800`}
//             >
//               Awards
//             </button>
//             <button
//               onClick={() => handleDeductions(employee)}
//               className={`${actionButtonClasses} bg-pink-700 text-white hover:bg-pink-800`}
//             >
//               Deductions
//             </button>
//           </>
//         )}
//       </div>
//     );
//   };

//   const renderConfirmationModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-red-100 rounded-full">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900">
//               Confirm Deletion
//             </h2>
//           </div>
//           <button
//             onClick={handleCancelDelete}
//             className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>

//         <div className="p-6">
//           <p className="text-gray-700 text-base leading-relaxed mb-2">
//             Are you sure you want to delete this employee?
//           </p>
//           <p className="text-sm text-red-600 font-medium">
//             This action cannot be undone.
//           </p>
//         </div>

//         <div className="flex gap-3 p-6 bg-gray-50 justify-end">
//           <button
//             onClick={handleCancelDelete}
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleConfirmDelete}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
//           >
//             Delete Employee
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // Mobile Card Component
//   const renderMobileCard = (employee) => {
//     const isEditing = editingCell?.rowId === employee._id;
//     const isEditable = editableEmployees.has(employee._id);

//     // Helper function to render mobile field with proper editing support
//     const renderMobileField = (fieldKey, fieldType, enumType, label) => {
//       const isFieldEditing = editingCell?.rowId === employee._id && editingCell?.fieldName === fieldKey;

//       return (
//         <div>
//           <span className="text-gray-500 block mb-1">{label}:</span>
//           <div className="font-medium">
//             {isFieldEditing ? (
//               <div className="w-full">
//                 {renderEditingCell(employee, fieldKey, fieldType, enumType)}
//               </div>
//             ) : (
//               <div
//                 className={`p-2 rounded border min-h-8 flex items-center text-xs w-full ${
//                   isAdmin && isEditable
//                     ? "cursor-pointer hover:bg-gray-100 border-gray-300"
//                     : "cursor-default border-transparent"
//                 }`}
//                 onDoubleClick={() => {
//                   if (isAdmin && isEditable) {
//                     const currentValue = fieldKey.includes(".")
//                       ? getNestedValue(employee, fieldKey, editingData)
//                       : employee[fieldKey];
//                     onStartEditing(employee._id, fieldKey, currentValue);
//                   }
//                 }}
//                 title={
//                   !isAdmin
//                     ? "Read-only"
//                     : !isEditable
//                     ? "Click Edit button to enable editing"
//                     : "Double-click to edit"
//                 }
//               >
//                 <div className="w-full truncate">
//                   {renderDisplayCell(employee, fieldKey, fieldType, enumType)}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       );
//     };

//     return (
//       <div key={employee._id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
//         {/* Header with Photo and Basic Name Info Only */}
//         <div className="flex items-start space-x-3 mb-4">
//           <div className="flex-shrink-0">
//             {renderImageCell(employee)}
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-sm font-semibold text-gray-900 truncate">
//                 {employee.firstName} {employee.lastName}
//               </h3>
//             </div>
//           </div>
//         </div>

//         {/* Details Grid - Now includes all fields uniformly */}
//         <div className="grid grid-cols-2 gap-3 text-xs mb-4">
//           {renderMobileField("personalNumber", "input", null, "Personal #")}
//           {renderMobileField("firstName", "input", null, "First Name")}
//           {renderMobileField("fatherFirstName", "input", null, "Father's Name")}
//           {renderMobileField("cnic", "input", null, "CNIC")}
//           {renderMobileField("mobileNumber", "input", null, "Mobile")}
//           {renderMobileField("dateOfBirth", "date", null, "DOB")}
//           {renderMobileField("designation", "select", "designations", "Designation")}
//           {renderMobileField("status", "select", "statuses", "Status")}
//           {renderMobileField("grade", "select", "grades", "Grade")}
//           {renderMobileField("rank", "select", "ranks", "Rank")}
//           {renderMobileField("cast", "select", "casts", "Cast")}
//           {renderMobileField("stations", "select", "stations", "Station")}
//         </div>

//         {/* Address Section */}
//         <div className="mb-4">
//           <div className="text-xs space-y-2">
//             <div>
//               <span className="text-gray-500 block mb-1">Street Address:</span>
//               <div className="font-medium">
//                 {(() => {
//                   const isFieldEditing = editingCell?.rowId === employee._id && editingCell?.fieldName === "address.line1";

//                   if (isFieldEditing) {
//                     return (
//                       <div className="w-full">
//                         {renderEditingCell(employee, "address.line1", "textarea")}
//                       </div>
//                     );
//                   }

//                   return (
//                     <div
//                       className={`p-2 rounded border min-h-12 flex items-start text-xs w-full ${
//                         isAdmin && isEditable
//                           ? "cursor-pointer hover:bg-gray-100 border-gray-300"
//                           : "cursor-default border-transparent"
//                       }`}
//                       onDoubleClick={() => {
//                         if (isAdmin && isEditable) {
//                           const currentValue = getNestedValue(employee, "address.line1", editingData);
//                           onStartEditing(employee._id, "address.line1", currentValue);
//                         }
//                       }}
//                       title={
//                         !isAdmin
//                           ? "Read-only"
//                           : !isEditable
//                           ? "Click Edit button to enable editing"
//                           : "Double-click to edit"
//                       }
//                     >
//                       <div className="w-full">
//                         {renderDisplayCell(employee, "address.line1", "textarea")}
//                       </div>
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               {renderMobileField("address.muhala", "input", null, "Mohalla")}
//               {renderMobileField("address.tehsil", "select", "tehsil", "Tehsil")}
//             </div>
//             <div>
//               {renderMobileField("address.line2", "select", "district", "District")}
//             </div>
//           </div>
//         </div>

//         {/* Service Info */}
//         <div className="grid grid-cols-1 gap-2 text-xs mb-4">
//           {renderMobileField("serviceType", "serviceType", null, "Service Type")}
//         </div>

//         {/* Actions */}
//         <div className="pt-3 border-t border-gray-100">
//           {renderActionButtons(employee, isEditing, isEditable)}
//         </div>
//       </div>
//     );
//   };

//   // Convert backend filters to frontend filter format
//   const convertFiltersForComponent = (backendFilters) => {
//     return {
//       name: backendFilters.name || '',
//       city: backendFilters.address || '',
//       personalNumber: backendFilters.personalNumber || '',
//       cnic: backendFilters.cnic || ''
//     };
//   };

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
//         <p className="text-red-800 text-sm">{error}</p>
//       </div>
//     );
//   }

//   // Main render
//   return (
//     <div className="w-full">
//       {/* Filter Component */}
//       <EmployeeFilter
//         onFilterChange={handleFilterChange}
//         onApplyFilters={handleApplyFilters}
//         onClearFilters={handleClearFilters}
//         initialFilters={convertFiltersForComponent(filters)}
//         totalEmployees={pagination.totalEmployees}
//         filteredCount={employees?.length || 0}
//       />

//       {/* Mobile View (below md) */}
//       <div className="md:hidden">
//         {employees?.length > 0 ? (
//           employees.map((employee) => renderMobileCard(employee))
//         ) : (
//           <div className="text-center py-8">
//             <p className="text-gray-500 text-sm">
//               {Object.values(filters).some((filter) => filter !== "")
//                 ? "No employees match your filters"
//                 : "No employees found"}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Desktop/Tablet Grid View (md and above) */}
//       <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
//         {/* Header Grid - Responsive */}
//         <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-1 lg:gap-2 xl:gap-3 bg-black/75 text-white text-xs lg:text-sm text-left font-bold uppercase tracking-wider p-2 lg:p-3 overflow-x-auto">
//           <div className="col-span-1">Photo</div>
//           <div className="col-span-1">Personal #</div>
//           <div className="col-span-1">Name</div>
//           <div className="col-span-1 hidden lg:block">Father's Name</div>
//           <div className="col-span-1 hidden lg:block">CNIC</div>
//           <div className="col-span-1 hidden xl:block">Mobile</div>
//           <div className="col-span-1 hidden xl:block">Designation</div>
//           <div className="col-span-1 hidden xl:block">Service Type</div>
//           <div className="col-span-1 hidden xl:block">Date of Birth</div>
//         </div>

//         {/* Second Header Row for additional fields */}
//         <div className="hidden xl:grid grid-cols-9 gap-1 lg:gap-2 xl:gap-3 bg-black/60 text-white text-xs lg:text-sm text-left font-bold uppercase tracking-wider p-2 lg:p-3">
//           <div className="col-span-1">Status</div>
//           <div className="col-span-1">Grade</div>
//           <div className="col-span-1">Rank</div>
//           <div className="col-span-1">Cast</div>
//           <div className="col-span-1">Station</div>
//           <div className="col-span-1">Address</div>
//           <div className="col-span-1">Mohalla</div>
//           <div className="col-span-1">Tehsil</div>
//           <div className="col-span-1">District</div>
//         </div>

//         {/* Employee Rows */}
//         {employees?.map((employee) => {
//           const isEditing = editingCell?.rowId === employee._id;
//           const isEditable = editableEmployees.has(employee._id);

//           return (
//             <div key={employee._id} className="border-b border-gray-200">
//               {/* First Row - Main Info */}
//               <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-1 lg:gap-2 xl:gap-3 text-left text-xs font-medium p-2 lg:p-3">
//                 {/* Photo */}
//                 <div className="col-span-1 flex justify-start items-center">
//                   {renderImageCell(employee)}
//                 </div>

//                 {/* Personal Number */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "personalNumber", "input")}
//                 </div>

//                 {/* Name */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "firstName", "input")}
//                 </div>

//                 {/* Father's Name - Hidden on mobile */}
//                 <div className="col-span-1 hidden lg:flex items-center min-w-0">
//                   {renderCell(employee, "fatherFirstName", "input")}
//                 </div>

//                 {/* CNIC - Show on md, hide on sm */}
//                 <div className="col-span-1 hidden lg:flex items-center min-w-0">
//                   {renderCell(employee, "cnic", "input")}
//                 </div>

//                 {/* Mobile - Hidden on small screens */}
//                 <div className="col-span-1 hidden xl:flex items-center min-w-0">
//                   {renderCell(employee, "mobileNumber", "input")}
//                 </div>

//                 {/* Designation - Hidden on mobile */}
//                 <div className="col-span-1 hidden xl:flex items-center min-w-0">
//                   {renderCell(employee, "designation", "select", "designations")}
//                 </div>

//                 {/* Service Type - Hidden on small screens */}
//                 <div className="col-span-1 hidden xl:flex items-center min-w-0">
//                   {renderCell(employee, "serviceType", "serviceType")}
//                 </div>

//                 {/* Date of Birth - Hidden on small screens */}
//                 <div className="col-span-1 hidden xl:flex items-center min-w-0">
//                   {renderCell(employee, "dateOfBirth", "date")}
//                 </div>
//               </div>

//               {/* Second Row - Additional Info (Only on XL screens) */}
//               <div className="hidden xl:grid grid-cols-9 gap-1 lg:gap-2 xl:gap-3 text-left text-xs font-medium p-2 lg:p-3 bg-gray-50">
//                 {/* Status */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "status", "select", "statuses")}
//                 </div>

//                 {/* Grade */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "grade", "select", "grades")}
//                 </div>

//                 {/* Rank */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "rank", "select", "ranks")}
//                 </div>

//                 {/* Cast */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "cast", "select", "casts")}
//                 </div>

//                 {/* Station */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "stations", "select", "stations")}
//                 </div>

//                 {/* Address */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   <div className="w-full max-w-32">
//                     {renderCell(employee, "address.line1", "textarea")}
//                   </div>
//                 </div>

//                 {/* Mohalla */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "address.muhala", "input")}
//                 </div>

//                 {/* Tehsil */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "address.tehsil", "select", "tehsil")}
//                 </div>

//                 {/* District */}
//                 <div className="col-span-1 flex items-center min-w-0">
//                   {renderCell(employee, "address.line2", "select", "district")}
//                 </div>
//               </div>

//               {/* Collapsed Info Row for medium screens (lg but not xl) */}
//               <div className="hidden lg:block xl:hidden bg-gray-50 p-2 text-xs">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1">
//                     <div><span className="font-medium">Status:</span> {renderCell(employee, "status", "select", "statuses")}</div>
//                     <div><span className="font-medium">Grade:</span> {renderCell(employee, "grade", "select", "grades")}</div>
//                     <div><span className="font-medium">Rank:</span> {renderCell(employee, "rank", "select", "ranks")}</div>
//                     <div><span className="font-medium">CNIC:</span> {renderCell(employee, "cnic", "input")}</div>
//                   </div>
//                   <div className="space-y-1">
//                     <div><span className="font-medium">Cast:</span> {renderCell(employee, "cast", "select", "casts")}</div>
//                     <div><span className="font-medium">Station:</span> {renderCell(employee, "stations", "select", "stations")}</div>
//                     <div><span className="font-medium">Mobile:</span> {renderCell(employee, "mobileNumber", "input")}</div>
//                     <div><span className="font-medium">DOB:</span> {renderCell(employee, "dateOfBirth", "date")}</div>
//                   </div>
//                 </div>
//                 <div className="mt-2">
//                   <div><span className="font-medium">Address:</span> {renderCell(employee, "address.line1", "textarea")}</div>
//                   <div className="grid grid-cols-3 gap-2 mt-1">
//                     <div><span className="font-medium">Mohalla:</span> {renderCell(employee, "address.muhala", "input")}</div>
//                     <div><span className="font-medium">Tehsil:</span> {renderCell(employee, "address.tehsil", "select", "tehsil")}</div>
//                     <div><span className="font-medium">District:</span> {renderCell(employee, "address.line2", "select", "district")}</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Action buttons row */}
//               <div className="p-2 lg:p-3 bg-gray-100 border-t border-gray-200">
//                 {renderActionButtons(employee, isEditing, isEditable)}
//               </div>
//             </div>
//           );
//         })}

//         {/* Empty State for Desktop */}
//         {employees?.length === 0 && !loading && (
//           <div className="text-center py-8">
//             <p className="text-gray-500">
//               {Object.values(filters).some((filter) => filter !== "")
//                 ? "No employees match your filters"
//                 : "No employees found"}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Confirmation Modal */}
//       {confirmPopup && renderConfirmationModal()}

//       {/* Pagination Component */}
//       <div className="mt-4">
//         <Pagination
//           pagination={pagination}
//           onPageChange={handlePageChange}
//           onPageSizeChange={handlePageSizeChange}
//           showPageSizeOptions={true}
//           pageSizeOptions={[5, 10, 20, 50]}
//         />
//       </div>
//     </div>
//   );
// };

// export default EmployeeGridTable;
