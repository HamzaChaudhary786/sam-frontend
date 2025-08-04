import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../EmployeeHook";
import { STATUS_ENUM } from "../AddEmployee/EmployeeConstants";
import { getCastsWithEnum } from "../AddEmployee/Cast.js";
import { getDesignationsWithEnum } from "../AddEmployee/Designation.js";
import { getGradesWithEnum } from "../AddEmployee/Grades.js";
import EmployeeViewModal from "../ViewEmployee/ViewEmployee.jsx";
import Pagination from "../Pagination.jsx";
import { toast } from "react-toastify";
import { role_admin } from "../../../constants/Enum.js";

const EmployeeList = () => {
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
  } = useEmployees();

  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Image navigation state for each employee
  const [imageIndexes, setImageIndexes] = useState({});
  const [imageModal, setImageModal] = useState(null);

  // Filter dropdown options
  const [designationEnum, setDesignationEnum] = useState([]);
  const [gradeEnum, setGradeEnum] = useState([]);

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Mobile view state
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    address: filters.address || "",
    status: filters.status || "",
    designation: filters.designation || "",
    grade: filters.grade || "",
    personalNumber: filters.personalNumber || "",
    cnic: filters.cnic || "",
  });

  const navigate = useNavigate();

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

  // Fetch dropdown options for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log("Fetching designations and grades...");
        const [desigRes, gradeRes] = await Promise.all([
          getDesignationsWithEnum(),
          getGradesWithEnum(),
        ]);

        console.log("Designation response:", desigRes);
        console.log("Grade response:", gradeRes);

        if (desigRes.success && desigRes.data) {
          // Convert object to array format
          const designationArray = Object.entries(desigRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setDesignationEnum(designationArray);
          console.log("Set designations array:", designationArray);
        } else {
          console.error("Invalid designation response:", desigRes);
        }

        if (gradeRes.success && gradeRes.data) {
          // Convert object to array format
          const gradeArray = Object.entries(gradeRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setGradeEnum(gradeArray);
          console.log("Set grades array:", gradeArray);
        } else {
          console.error("Invalid grade response:", gradeRes);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
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

    await removeEmployee(id);
  };

  const handleAddEmployee = () => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can add employees");
      return;
    }
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleAddStation = () => {
    navigate("/stations");
  };
   const handleEditGrid = () => {
    navigate("/editgrid");
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

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.trim()) activeFilters.name = filterForm.name.trim();
    if (filterForm.address.trim()) activeFilters.address = filterForm.address.trim();
    if (filterForm.personalNumber.trim())
      activeFilters.personalNumber = filterForm.personalNumber.trim();
    if (filterForm.cnic.trim()) activeFilters.cnic = filterForm.cnic.trim();
    updateFilters(activeFilters);
    setShowFilters(false); // Close filters on mobile after applying
  };

  const handleClearFilters = () => {
    setFilterForm({
      name: "",
      address: "",
      status: "",
      designation: "",
      grade: "",
      personalNumber: "",
      cnic: "",
    });
    clearFilters();
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    goToPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    changePageSize(pageSize);
  };

  // Safety check for employees
  const safeEmployees = Array.isArray(employees) ? employees : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Employee Management
          </h1>
          {!isAdmin && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Viewing in read-only mode - Contact administrator for changes
            </p>
          )}
        </div>

        {/* Header Buttons - Stack vertically on small/medium screens */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
          {isAdmin && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
              onClick={handleAddEmployee}
            >
              Add Employee
            </button>
          )}
           <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
            onClick={handleEditGrid}
          >
            Edit Employee Grid
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
            onClick={handleAddStation}
          >
            Stations
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
            onClick={handleAddAsset}
          >
            Assets
          </button>
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
            <span className="hidden lg:inline">Bulk Station Assignment</span>
            <span className="lg:hidden">Bulk Assignment</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Filter Toggle Button - Show on medium and small screens */}
      <div className="xl:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
            />
          </svg>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filter Section - Responsive */}
      <div
        className={`bg-white shadow-md rounded-lg p-4 mb-6 ${
          showFilters ? "block" : "hidden"
        } xl:block`}
      >
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Filter Employees
        </h3>

        {/* Filter Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., Hamza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={filterForm.address}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., Lahore"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Number
            </label>
            <input
              type="text"
              name="personalNumber"
              value={filterForm.personalNumber}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., Emp-234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNIC
            </label>
            <input
              type="text"
              name="cnic"
              value={filterForm.cnic}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., 1234567891010"
            />
          </div>

          {/* Filter Buttons - Stack vertically on mobile/tablet */}
          <div className="flex flex-col space-y-2 sm:col-span-2 xl:col-span-4">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table/Cards - Responsive */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Desktop Table View - Only for screens 1200px+ */}
        <div className="hidden xl:block">
          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y divide-gray-200"
              style={{ minWidth: "1200px" }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[280px]">
                    Employee Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                    Employee Actions
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
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <img
                              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
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
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Personal Number:{" "}
                              {employee.personalNumber || employee.pnumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              CNIC: {employee.cnic}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getGradeName(employee.grade)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div
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
                        </div>
                          <div className="text-sm text-gray-500">
                          {employee.mobileNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.address?.line1 || "N/A"},{" "}
                          {employee.address?.tehsil || "N/A"}
                        </div>
                      
                         <div className="text-sm text-gray-500">
                          Cast: {employee.cast || "N/A"}
                        </div>
                         <div className="text-sm text-gray-500">
                          Service: {employee.serviceType || "N/A"}
                        </div>
                      </td>
                      <td className=" px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleView(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            >
                              Edit
                            </button>
                            {isAdmin ? (
                              <button
                                onClick={() => handleDelete(employee._id)}
                                className="px-3 py-1 text-xs rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                              >
                                Delete
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
                              >
                                Delete
                              </button>
                            )}
                            <button
                              onClick={() => handleAssets(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition"
                            >
                              Assets
                            </button>
                            <button
                              onClick={() => handlePosting(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                            >
                              Posting
                            </button>
                            <button
                              onClick={() => handleStatus(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-teal-100 text-teal-700 hover:bg-teal-200 transition"
                            >
                              History
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleAchievements(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                            >
                              Achievements
                            </button>
                            <button
                              onClick={() => handleDeductions(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-pink-100 text-pink-700 hover:bg-pink-200 transition"
                            >
                              Deduction
                            </button>
                            {/* <button
                              onClick={() => handleHistory(employee)}
                              className="px-3 py-1 text-xs rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                            >
                              History
                            </button> */}
                          </div>
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
              <div key={employee._id} className="border-b border-gray-200 p-4">
                <div className="flex flex-col md:flex-row items-start space-x-3">
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
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {employee.firstName} {employee.lastName}
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
                        <button
                          onClick={() => handleEdit(employee)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-center"
                        >
                          Edit
                        </button>
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
                        {/* <button
                          onClick={() => handleHistory(employee)}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-center"
                        >
                          History
                        </button> */}
                      
      
                        {isAdmin ? (
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className=" px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-center"
                          >
                            Delete 
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full px-3 py-1 text-xs bg-gray-100 text-gray-400 rounded-md cursor-not-allowed text-center"
                          >
                            Delete Employee 
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

      {/* Pagination Component */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        showPageSizeOptions={true}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {/* Employee View Modal */}
      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        employee={selectedEmployee}
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