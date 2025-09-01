import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../EmployeeHook";
import { getCastsWithEnum } from "../AddEmployee/Cast.js";
import { getDesignationsWithEnum } from "../AddEmployee/Designation.js";
import { getGradesWithEnum } from "../AddEmployee/Grades.js";
import EmployeeViewModal from "../ViewEmployee/ViewEmployee.jsx";
import EmployeeFilters from "../Filters.jsx";
import Pagination from "../Pagination.jsx";
import EmployeeMultiSelect from "../MultiSelectGrid.jsx";
import { toast } from "react-toastify";
import { role_admin } from "../../../constants/Enum.js";
import MultiStationAssignmentForm from "../Multipostingform.jsx";
import MultiSalaryDeductionForm from "../Multisalarydeductin.jsx";
import MultiAchievementForm from "../MultiAchievement.jsx";
import MultiStatusAssignmentForm from "../MultiStatus.jsx";
import MultiAssetAssignmentForm from "../MultiAsset.jsx";
import { useEmployeeAssets } from "../EmployeeAsset.js";
import ClickableEmployeeName from "../ClickableName.jsx";
import { usePermissions } from "../../../hook/usePermission.js";

const EmployeeList = ({
  initialFilters = {}, // 🆕 Accept initial filters from parent
  hideHeader = false, // 🆕 Option to hide the header section
  compactView = false, // 🆕 Option for compact view
  stationContext = null, // 🆕 Context when embedded in station view
}) => {
  const {
    employees,
    loading,
    error,
    removeEmployee,
    updateFilters,
    clearFilters,
    filters,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
  } = useEmployees(initialFilters); // 🆕 Pass initial filters
  // Multi Station Assignment Modal state
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

  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Image navigation state for each employee
  const [imageIndexes, setImageIndexes] = useState({});
  const [imageModal, setImageModal] = useState(null);

  // Filter dropdown options (moved to EmployeeFilters component)
  const [designationEnum, setDesignationEnum] = useState([]);
  const [gradeEnum, setGradeEnum] = useState([]);

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Mobile view state
  const [showFilters, setShowFilters] = useState(false);
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const { getEmployeeAssetsString, loading: assetsLoading } =
    useEmployeeAssets(safeEmployees);
  const permissions = usePermissions();
  const navigate = useNavigate();

  // Handle multi-posting functionality
  function handleMultiPosting(selectedEmployeeObjects) {
    console.log("🚀 Multi-posting triggered!", selectedEmployeeObjects);
    alert(`Multi-posting for ${selectedEmployeeObjects.length} employees!`); // Temporary for testing
    setSelectedEmployeesForPosting(selectedEmployeeObjects);
    setIsMultiStationModalOpen(true);
  }

  // Handle multi station assignment success
  const handleMultiStationSuccess = () => {
    setIsMultiStationModalOpen(false);
    setSelectedEmployeesForPosting([]);
    multiSelect.clearSelection();
    toast.success("Multi station assignments completed!");
  };

  // Handle multi station assignment cancel
  const handleMultiStationCancel = () => {
    setIsMultiStationModalOpen(false);
    setSelectedEmployeesForPosting([]);
  };

  function handleMultiDeduction(selectedEmployeeObjects) {
    console.log("🚀 Multi-deduction triggered!", selectedEmployeeObjects);
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
    console.log("🚀 Multi-achievement triggered!", selectedEmployeeObjects);
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
    console.log(
      "🚀 Multi-asset assignment triggered!",
      selectedEmployeeObjects
    );
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

  // Multi-select functionality using the component
  const multiSelect = EmployeeMultiSelect({
    employees: safeEmployees,
    isAdmin,
    removeEmployee,
    loading,
    onMultiPosting: handleMultiPosting, // Add this line!
    onMultiDeduction: handleMultiDeduction, // Add this line!
    onMultiAchievement: handleMultiAchievement, // ✅ Add this line!
    onMultiStatus: handleMultiStatus, // Add this line
    onMultiAsset: handleMultiAsset, // ✅ Add this line!
    disabled: compactView, // 🆕 Disable multiselect in compact view
  });

  // Check user role from localStorage
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const storedUserType = localStorage.getItem("userType");
        const userData = localStorage.getItem("userData");
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const currentUserType =
          storedUserType || parsedUserData?.userType || "";

        setUserType(currentUserType);
        setIsAdmin(currentUserType === role_admin);
      } catch (error) {
        console.error("Error checking user role:", error);
        setUserType("");
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // Fetch dropdown options for helper functions (still needed for display purposes)
  useEffect(() => {
    const fetchDisplayOptions = async () => {
      try {
        const [desigRes, gradeRes] = await Promise.all([
          getDesignationsWithEnum(),
          getGradesWithEnum(),
        ]);

        if (desigRes.success && desigRes.data) {
          const designationArray = Object.entries(desigRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setDesignationEnum(designationArray);
        }

        if (gradeRes.success && gradeRes.data) {
          const gradeArray = Object.entries(gradeRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setGradeEnum(gradeArray);
        }
      } catch (error) {
        console.error("Error fetching display options:", error);
      }
    };

    fetchDisplayOptions();
  }, []);

  // Helper function to get designation name by ID
  const getDesignationName = (designationId) => {
    if (typeof designationId === "object" && designationId?.name) {
      return designationId.name;
    }

    // If it's an ID, find the name from designationEnum
    if (Array.isArray(designationEnum) && designationEnum.length > 0) {
      const designation = designationEnum.find((d) => d._id === designationId);
      return designation?.name || designationId || "N/A";
    }

    return designationId || "N/A";
  };

  // Helper function to get grade name by ID
  const getGradeName = (gradeId) => {
    if (typeof gradeId === "object" && gradeId?.name) {
      return gradeId.name;
    }

    // If it's an ID, find the name from gradeEnum
    if (Array.isArray(gradeEnum) && gradeEnum.length > 0) {
      const grade = gradeEnum.find((g) => g._id === gradeId);
      return grade?.name || gradeId || "N/A";
    }

    return gradeId || "N/A";
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

  // Helper function to get total images count
  const getImageCount = (employee) => {
    return Array.isArray(employee.profileUrl)
      ? employee.profileUrl.length
      : employee.profileUrl
      ? 1
      : 0;
  };

  // Image navigation functions
  const handlePrevImage = (employeeId, totalImages) => {
    setImageIndexes((prev) => ({
      ...prev,
      [employeeId]:
        (prev[employeeId] ?? 0) === 0
          ? totalImages - 1
          : (prev[employeeId] ?? 0) - 1,
    }));
  };

  const handleNextImage = (employeeId, totalImages) => {
    setImageIndexes((prev) => ({
      ...prev,
      [employeeId]:
        (prev[employeeId] ?? 0) === totalImages - 1
          ? 0
          : (prev[employeeId] ?? 0) + 1,
    }));
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can delete employees");
      return;
    }

    // Validate ID format
    if (!id || typeof id !== "string" || id.trim() === "") {
      toast.error("Invalid employee ID");
      return;
    }

    try {
      console.log("Attempting to delete employee with ID:", id);

      // The hook function expects just the string ID and returns a result object
      const result = await removeEmployee(id.trim());

      if (result && result.success) {
        // Success toast is handled by the API function, don't duplicate
        console.log("Employee deleted successfully");
      } else {
        // Error handling is done by the hook, but we can add additional handling if needed
        console.error("Failed to delete employee:", result?.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      // The hook already shows error toasts, so we don't need to duplicate them
    }
  };

  const handleAddEmployee = () => {
    navigate("/employee");
  };

  const handleHistory = async (employee) => {
    navigate("/history", {
      state: {
        isEdit: true,
        id: employee._id,
        currentEmployeeData: employee,
      },
    });
  };

  const handleEdit = async (data) => {
    setEditData(data);
    navigate("/employee", {
      state: {
        isEdit: true,
        editData: data,
      },
    });
  };

  const handleBulkStationAssignment = () => {
    navigate("/bulk-station-assignment");
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleAddStation = () => {
    navigate("/stations");
  };

  const handleAddAsset = () => {
    navigate("/assets");
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

  // Pagination handlers
  const handlePageChange = (page) => {
    goToPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    changePageSize(pageSize);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log(permissions, "my permissions hahahhaha");

  return (
    <div className={compactView ? "p-0" : "p-3 sm:p-6 lg:p-0"}>
      {/* Header Section - Responsive */}
      {!hideHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {stationContext
                ? `Employees at ${stationContext.stationName}`
                : "Employee Management"}
            </h1>
            {stationContext && (
              <p className="text-sm text-gray-500 mt-1">
                Showing employees posted at this station
              </p>
            )}
            {!isAdmin && !stationContext && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Viewing in read-only mode - Contact administrator for changes
              </p>
            )}
          </div>

          {/* Header Buttons - Only show if not in station context */}
          {!stationContext && (
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
              {permissions?.userData?.roles?.some((role) =>
                role.accessRequirement?.some(
                  (access) =>
                    (access.resourceName.toLowerCase() === "employee"  &&
                      access.canAdd === true)
                )
              ) && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
                  onClick={handleAddEmployee}
                >
                  Add Employee
                </button>
              )}
              {permissions?.hasStationAccess && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
                  onClick={handleAddStation}
                >
                  Stations
                </button>
              )}
              {permissions?.hasAssetAccess && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
                  onClick={handleAddAsset}
                >
                  Assets
                </button>
              )}
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
                onClick={handleBulkStationAssignment}
              >
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="hidden lg:inline">
                  Bulk Station Assignment
                </span>
                <span className="lg:hidden">Bulk Assignment</span>
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Bulk Actions Bar - Using the component */}
      {!compactView && multiSelect.renderBulkActionsBar()}

      {/* Employee Filters Component */}
      {!compactView && (
        <EmployeeFilters
          filters={filters}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
      )}

      {/* Employee Table/Cards - Responsive */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Desktop Table View - Only for screens 1200px+ */}
        <div className="hidden xl:block">
          <div className="w-full">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  {!compactView && (
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-8">
                      {multiSelect.renderSelectAllCheckbox()}
                    </th>
                  )}
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-[30%]">
                    Employee
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-[18%]">
                    Info
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-[17%]">
                    Assets
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-[28%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeEmployees.map((employee) => {
                  const currentImageIndex = imageIndexes[employee._id] || 0;
                  const totalImages = getImageCount(employee);
                  const currentImage = getEmployeeImage(
                    employee,
                    currentImageIndex
                  );

                  return (
                    <tr
                      key={employee._id}
                      className={`hover:bg-gray-50 ${
                        multiSelect.isSelected(employee._id) ? "bg-blue-50" : ""
                      }`}
                    >
                      {!compactView && (
                        <td className="px-1 py-2">
                          {multiSelect.renderEmployeeCheckbox(employee)}
                        </td>
                      )}

                      {/* Employee Info Column - Ultra Compact */}
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <div className="h-6 w-6 flex-shrink-0 relative">
                            <img
                              className="w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              src={currentImage}
                              alt={`${employee.firstName} ${employee.lastName}`}
                              onClick={() =>
                                setImageModal({ image: currentImage, employee })
                              }
                            />

                            {/* Navigation arrows for multiple images */}
                            {totalImages > 1 && (
                              <>
                                <button
                                  onClick={() =>
                                    handlePrevImage(employee._id, totalImages)
                                  }
                                  className="absolute -left-0.5 top-1/2 transform -translate-y-1/2 bg-white rounded-full text-[8px] shadow-sm hover:bg-gray-100 transition-colors w-3 h-3 flex items-center justify-center"
                                >
                                  ‹
                                </button>
                                <button
                                  onClick={() =>
                                    handleNextImage(employee._id, totalImages)
                                  }
                                  className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 bg-white rounded-full text-[8px] shadow-sm hover:bg-gray-100 transition-colors w-3 h-3 flex items-center justify-center"
                                >
                                  ›
                                </button>
                                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-0.5 rounded-full text-[6px]">
                                  {currentImageIndex + 1}/{totalImages}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-xs font-medium text-gray-900 truncate"
                              onClick={() => handleView(employee)}
                            >
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs font-medium text-gray-700 truncate">
                              {employee.fatherFirstName}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {employee.personalNumber || employee.pnumber}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {getDesignationName(employee.designation)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Information Column - Ultra Compact */}
                      <td className="px-1 py-2">
                        <div
                          className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded mb-0.5 ${
                            employee.status === "active"
                              ? "bg-green-100 text-green-800"
                              : employee.status === "retired"
                              ? "bg-blue-100 text-blue-800"
                              : employee.status === "terminated"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {employee.status}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {employee.mobileNumber}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {employee.address?.tehsil || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {employee.serviceType || "N/A"}
                        </div>
                      </td>

                      {/* Assets Column - Ultra Compact */}
                      <td className="px-1 py-2">
                        <div className="text-xs text-gray-900">
                          {assetsLoading ? (
                            <span className="text-gray-500 animate-pulse">
                              Loading...
                            </span>
                          ) : (
                            <div className="break-words line-clamp-2 overflow-hidden">
                              {getEmployeeAssetsString(employee._id)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Employee Actions Column - Ultra Compact Grid */}
                      <td className="px-2 py-2">
                        <div className="grid grid-cols-3 gap-0.5 text-[10px]">
                          <button
                            onClick={() => handleView(employee)}
                            className="px-1 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                          >
                            View
                          </button>
                          {permissions?.userData?.roles?.some((role) =>
                            role.accessRequirement?.some(
                              (access) =>
                                access.resourceName.toLowerCase() ===
                                  "employee" && access.canEdit === true
                            )
                          ) && (
                            <button
                              onClick={() => handleEdit(employee)}
                              className="px-1 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            >
                              Edit
                            </button>
                          )}
                          {permissions?.userData?.roles?.some((role) =>
                            role.accessRequirement?.some(
                              (access) =>
                                access.resourceName.toLowerCase() ===
                                  "employee" && access.canDelete === true
                            )
                          ) && (
                            <button
                              onClick={() => handleDelete(employee._id)}
                              className="px-1 py-0.5 text-[10px] rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                            >
                              Delete
                            </button>
                          )}

                          <button
                            onClick={() => handleAssets(employee)}
                            className="px-1 py-0.5 text-[10px] rounded bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition"
                          >
                            Assets
                          </button>
                          <button
                            onClick={() => handlePosting(employee)}
                            className="px-1 py-0.5 text-[10px] rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                          >
                            Posting
                          </button>
                          <button
                            onClick={() => handleStatus(employee)}
                            className="px-1 py-0.5 text-[10px] rounded bg-teal-100 text-teal-700 hover:bg-teal-200 transition"
                          >
                            History
                          </button>

                          <button
                            onClick={() => handleAchievements(employee)}
                            className="px-1 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition col-span-1"
                          >
                            Awards
                          </button>
                          <button
                            onClick={() => handleDeductions(employee)}
                            className="px-1 py-0.5 text-[10px] rounded bg-pink-100 text-pink-700 hover:bg-pink-200 transition col-span-2"
                          >
                            Deduction
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

        {/* Mobile/Tablet Card View - For screens under 1200px */}
        <div className="xl:hidden">
          {safeEmployees.map((employee) => {
            const currentImageIndex = imageIndexes[employee._id] || 0;
            const totalImages = getImageCount(employee);
            const currentImage = getEmployeeImage(employee, currentImageIndex);

            return (
              <div
                key={employee._id}
                className={`border-b border-gray-200 p-4 ${
                  multiSelect.isSelected(employee._id) ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Using the component's render function */}
                  {!compactView && multiSelect.renderEmployeeCheckbox(employee)}
                  <div className="flex-shrink-0 relative">
                    <img
                      className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      src={currentImage}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      onClick={() =>
                        setImageModal({ image: currentImage, employee })
                      }
                    />

                    {/* Navigation arrows for mobile */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={() =>
                            handlePrevImage(employee._id, totalImages)
                          }
                          className="absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                          style={{ fontSize: "10px" }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            handleNextImage(employee._id, totalImages)
                          }
                          className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                          style={{ fontSize: "10px" }}
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-sm font-medium text-gray-900 truncate"
                        onClick={() => handleView(employee)}
                      >
                        {employee.firstName}
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {employee.fatherFirstName}
                        </h3>
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.status === "active"
                            ? "bg-green-100 text-green-800"
                            : employee.status === "retired"
                            ? "bg-blue-100 text-blue-800"
                            : employee.status === "terminated"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </div>

                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-500">
                        {employee.personalNumber || employee.pnumber} |{" "}
                        {employee.srnumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        CNIC: {employee.cnic}
                      </p>
                      <p className="text-xs text-gray-500">
                        {employee.mobileNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {employee.address?.line1 || "N/A"},{" "}
                        {employee.address?.city || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getDesignationName(employee.designation)} - Grade:{" "}
                        {getGradeName(employee.grade)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Service: {employee.serviceType || "N/A"} - Cast:{" "}
                        {employee.cast?.name || "N/A"}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">Assets: </span>
                      {assetsLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        <span>{getEmployeeAssetsString(employee._id)}</span>
                      )}
                    </div>

                    {/* Mobile Action Buttons - Stacked vertically in columns */}
                    <div className="mt-3">
                      {/* Primary Actions Row */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => handleView(employee)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-center"
                        >
                          View
                        </button>

                        {permissions?.userData?.roles?.some((role) =>
                          role.accessRequirement?.some(
                            (access) =>
                              access.resourceName.toLowerCase() ===
                                "employee" && access.canEdit === true
                          )
                        ) && (
                          <button
                            onClick={() => handleEdit(employee)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-center"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {/* Secondary Actions Row */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => handleAssets(employee)}
                          className="px-3 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 text-center"
                        >
                          Assets
                        </button>
                        <button
                          onClick={() => handlePosting(employee)}
                          className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-center"
                        >
                          Posting
                        </button>
                      </div>

                      {/* Third Actions Row */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => handleStatus(employee)}
                          className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 text-center"
                        >
                          History
                        </button>
                        <button
                          onClick={() => handleAchievements(employee)}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-center"
                        >
                          Achievements
                        </button>
                      </div>

                      {/* Fourth Actions Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleDeductions(employee)}
                          className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 text-center"
                        >
                          Deductions
                        </button>

                        {permissions?.userData?.roles?.some((role) =>
                          role.accessRequirement?.some(
                            (access) =>
                              access.resourceName.toLowerCase() ===
                                "employee" && access.canDelete === true
                          )
                        ) && (
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className=" px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-center"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {safeEmployees.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>
      {/* Multi Station Assignment Modal */}
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
      {/* Pagination Component */}
      {!compactView ? (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeOptions={true}
          pageSizeOptions={[500, 10, 20, 50, 100, 200, 5]}
        />
      ) : (
        // Simplified pagination for embedded view
        safeEmployees.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing {safeEmployees.length} of{" "}
              {pagination.totalEmployees || safeEmployees.length} employees
            </p>
          </div>
        )
      )}

      {/* Employee View Modal */}
      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        employee={selectedEmployee}
        onEdit={handleEdit} // Add this line
      />

      {/* Full Size Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={imageModal.image}
              alt={`${imageModal.employee.firstName} ${imageModal.employee.lastName} - Full Size`}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
