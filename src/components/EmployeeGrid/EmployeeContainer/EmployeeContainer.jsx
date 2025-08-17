import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../Employee/EmployeeHook.js";
import { getCastsWithEnum } from "../../Employee/AddEmployee/Cast.js";
import { getDesignationsWithEnum } from "../../Employee/AddEmployee/Designation.js";
import { getGradesWithEnum } from "../../Employee/AddEmployee/Grades.js";
import { getRanksWithEnum } from "../../Employee/AddEmployee/Rank.js";
import { getStatusWithEnum } from "../../Employee/AddEmployee/Status.js";
import { getStationDistrictWithEnum } from "../../Station/District.js";
import { getStationLocationsWithEnum } from "../../Station/lookUp.js";
import { getAllStationsWithoutPage, getStations } from "../../Station/StationApi.js";
import { updateEmployee } from "../../Employee/EmployeeApi.js";
import { uploadToCloudinary } from "../../Employee/AddEmployee/Cloudinary.js";
import { toast } from "react-toastify";
import { role_admin } from "../../../constants/Enum.js";
import EmployeeGridTable from "../GridTable/GridTable.jsx";
import { useEmployeeAssets } from "../../Employee/EmployeeAsset.js";

const EmployeeGridContainer = () => {
  const {
    employees,
    loading,
    error,
    pagination,
    filters,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    updateFilters,
    clearFilters,
    fetchEmployees,
    modifyEmployee,
    removeEmployee,
  } = useEmployees();

  // State management
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingCell, setEditingCell] = useState(null);
  const [editingData, setEditingData] = useState({}); // Changed: Now stores data by employee ID
  const [imageModal, setImageModal] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Enum states
  const [enums, setEnums] = useState({
    designations: [],
    grades: [],
    casts: [],
    ranks: [],
    statuses: [],
    district: [],
    tehsil: [],
    stations: []
  });

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  // Check user role
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const storedUserType = localStorage.getItem("userType");
        const userData = localStorage.getItem("userData");
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const currentUserType = storedUserType || parsedUserData?.userType || "";
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

  // Fetch all enum data
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const [
          desigRes, gradeRes, castRes, rankRes, statusRes,
          districtRes, locationRes, stationsRes
        ] = await Promise.all([
          getDesignationsWithEnum(),
          getGradesWithEnum(),
          getCastsWithEnum(),
          getRanksWithEnum(),
          getStatusWithEnum(),
          getStationDistrictWithEnum(),
          getStationLocationsWithEnum(),
          getAllStationsWithoutPage(),
        ]);

        const processEnumData = (response, key) => {
          if (response.success && response.data) {
            if (key === 'stations') {
              return response.data.stations?.map(station => ({
                _id: station._id,
                name: station.name
              })) || [];
            }
            return Object.entries(response.data).map(([_id, name]) => ({ _id, name }));
          }
          return [];
        };

        setEnums({
          designations: processEnumData(desigRes, 'designations'),
          grades: processEnumData(gradeRes, 'grades'),
          casts: processEnumData(castRes, 'casts'),
          ranks: processEnumData(rankRes, 'ranks'),
          statuses: processEnumData(statusRes, 'statuses'),
          district: processEnumData(districtRes, 'districts'),
          tehsil: processEnumData(locationRes, 'locations'),
          stations: processEnumData(stationsRes, 'stations')
        });
      } catch (error) {
        console.error("Error fetching enums:", error);
        toast.error("Failed to load dropdown data");
      }
    };

    fetchEnums();
  }, []);

  // Change page size to 15
  useEffect(() => {
    if (pagination.limit !== 15) {
      changePageSize(15);
    }
  }, [pagination.limit, changePageSize]);

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Image navigation functions
  const handlePrevImage = (employeeId, totalImages) => {
    setImageIndexes((prev) => ({
      ...prev,
      [employeeId]: (prev[employeeId] ?? 0) === 0 ? totalImages - 1 : (prev[employeeId] ?? 0) - 1,
    }));
  };

  const handleNextImage = (employeeId, totalImages) => {
    setImageIndexes((prev) => ({
      ...prev,
      [employeeId]: (prev[employeeId] ?? 0) === totalImages - 1 ? 0 : (prev[employeeId] ?? 0) + 1,
    }));
  };

  // Helper function to get nested value from employee object
  const getNestedValue = (employee, fieldPath) => {
    const pathParts = fieldPath.split('.');
    let value = employee;
    for (const part of pathParts) {
      value = value?.[part];
    }
    return value || '';
  };

  // Editing functions
  const startEditing = (rowId, fieldName, value) => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can edit employees");
      return;
    }
    setEditingCell({ rowId, fieldName });
    // Store editing data by employee ID
    setEditingData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [fieldName]: value
      }
    }));
  };

  const stopEditing = () => {
    setEditingCell(null);
    // Don't clear editingData here - keep it for multiple field editing
  };

  const cancelAllEditing = (employeeId) => {
    setEditingCell(null);
    // Clear editing data for this specific employee
    setEditingData(prev => {
      const newData = { ...prev };
      delete newData[employeeId];
      return newData;
    });
  };

  const handleCellChange = (fieldName, value) => {
    if (!editingCell) return;
    
    const { rowId } = editingCell;
    setEditingData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [fieldName]: value
      }
    }));
  };

  // Helper function to apply nested updates to an object
  const applyNestedUpdate = (obj, path, value) => {
    const pathParts = path.split('.');
    const result = { ...obj };
    
    let current = result;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      } else {
        current[part] = { ...current[part] };
      }
      current = current[part];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    return result;
  };

  const saveCell = async (employee) => {
    try {
      // Get the editing data for this specific employee
      const employeeEditingData = editingData[employee._id] || {};
      
      // Start with the original employee data
      let updatedData = { ...employee };
      
      // Apply all the editing changes, handling nested fields properly
      Object.entries(employeeEditingData).forEach(([fieldPath, value]) => {
        if (fieldPath.includes('.')) {
          // Handle nested fields like address.line1
          updatedData = applyNestedUpdate(updatedData, fieldPath, value);
        } else {
          // Handle direct fields
          updatedData[fieldPath] = value;
        }
      });
      
      // Validate required fields
      if (!updatedData.personalNumber || !updatedData.firstName || !updatedData.cnic || !updatedData.fatherFirstName) {
        toast.error("Personal Number, First Name, CNIC, and Father's First Name are required fields");
        return;
      }

      const result = await modifyEmployee(employee._id, updatedData);
      if (result.success) {
        // Clear editing state for this employee after successful save
        setEditingCell(null);
        setEditingData(prev => {
          const newData = { ...prev };
          delete newData[employee._id];
          return newData;
        });
        // No need to refresh data as modifyEmployee updates the state directly
      } else {
        toast.error("Failed to update employee");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    }
  };

  // Handle image upload - SINGLE FUNCTION ONLY
  const handleImageUpload = async (employee, file) => {
    if (!file) return;

    try {
      toast.info("Uploading image...");
      
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file);
      
      if (uploadResult.success) {
        // Update employee's profile with new image
        const currentImages = Array.isArray(employee.profileUrl) ? employee.profileUrl : [employee.profileUrl].filter(Boolean);
        const updatedImages = [...currentImages, uploadResult.url];
        
        const updatedData = {
          ...employee,
          profileUrl: updatedImages
        };

        // Save updated employee data
        const result = await modifyEmployee(employee._id, updatedData);
        if (result.success) {
          toast.success("Image uploaded successfully");
          // No need to refresh data as modifyEmployee updates the state directly
        } else {
          throw new Error(result.error || 'Failed to save employee data');
        }
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
    }
  };

  // Remove image function - SINGLE FUNCTION ONLY
  const handleRemoveImage = async (employee, imageIndex) => {
    try {
      const currentImages = Array.isArray(employee.profileUrl) ? employee.profileUrl : [employee.profileUrl].filter(Boolean);
      const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
      
      const updatedData = {
        ...employee,
        profileUrl: updatedImages.length > 0 ? updatedImages : [`https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=6366f1&color=ffffff&size=200&rounded=true&bold=true`]
      };

      const result = await modifyEmployee(employee._id, updatedData);
      if (result.success) {
        toast.success("Image removed successfully");
        // No need to refresh data as modifyEmployee updates the state directly
      } else {
        throw new Error(result.error || 'Failed to save employee data');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image: ' + error.message);
    }
  };

  const sortedEmployees = sortData(employees);
  const { getEmployeeAssetsString } = useEmployeeAssets(sortedEmployees);

  const getEnumName = (enumKey, valueId) => {
    if (!valueId) return "";
    const enumData = enums[enumKey] || [];
    if (Array.isArray(valueId)) {
      const names = valueId
        .map((id) => enumData.find((item) => item._id === id)?.name)
        .filter(Boolean);
      return names.join(", ");
    }
    const item = enumData.find((item) => item._id === valueId);
    return item?.name || valueId;
  };

  const exportCSV = () => {
    try {
      const headers = [
        "Personal Number",
        "First Name",
        "Father's Name",
        "CNIC",
        "Mobile",
        "Designation",
        "Service Type",
        "Date of Birth",
        "Status",
        "Grade",
        "Rank",
        "Cast",
        "Station",
        "Address",
        "Mohalla",
        "Tehsil",
        "District",
        "Assigned Assets",
      ];

      const escapeCSVField = (field) => {
        if (field == null) return "";
        const str = String(field);
        if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
          return `"${str.replace(/\"/g, '""')}"`;
        }
        return str;
      };

      const rows = sortedEmployees.map((e) => [
        e.personalNumber || "",
        e.firstName || "",
        e.fatherFirstName || "",
        e.cnic || "",
        e.mobileNumber || "",
        getEnumName("designations", e.designation),
        e.serviceType || "",
        e.dateOfBirth ? new Date(e.dateOfBirth).toLocaleDateString() : "",
        getEnumName("statuses", e.status),
        getEnumName("grades", e.grade),
        getEnumName("ranks", e.rank),
        getEnumName("casts", e.cast),
        getEnumName("stations", e.stations),
        (e.address && e.address.line1) || "",
        (e.address && e.address.muhala) || "",
        getEnumName("tehsil", e.address?.tehsil),
        getEnumName("district", e.address?.line2),
        getEmployeeAssetsString(e._id),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCSVField).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employees_export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      toast.error("Failed to export CSV");
    }
  };

  const exportPDF = () => {
    try {
      const win = window.open("", "_blank");
      if (!win) {
        toast.error("Popup blocked. Please allow popups to export PDF.");
        return;
      }
      const style = `
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h1 { font-size: 18px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      `;
      const headers = [
        "Personal Number",
        "First Name",
        "Father's Name",
        "CNIC",
        "Mobile",
        "Designation",
        "Service Type",
        "Date of Birth",
        "Status",
        "Grade",
        "Rank",
        "Cast",
        "Station",
        "Address",
        "Mohalla",
        "Tehsil",
        "District",
        "Assigned Assets",
      ];
      const rowsHtml = sortedEmployees
        .map((e) => {
          const row = [
            e.personalNumber || "",
            e.firstName || "",
            e.fatherFirstName || "",
            e.cnic || "",
            e.mobileNumber || "",
            getEnumName("designations", e.designation),
            e.serviceType || "",
            e.dateOfBirth ? new Date(e.dateOfBirth).toLocaleDateString() : "",
            getEnumName("statuses", e.status),
            getEnumName("grades", e.grade),
            getEnumName("ranks", e.rank),
            getEnumName("casts", e.cast),
            getEnumName("stations", e.stations),
            (e.address && e.address.line1) || "",
            (e.address && e.address.muhala) || "",
            getEnumName("tehsil", e.address?.tehsil),
            getEnumName("district", e.address?.line2),
            getEmployeeAssetsString(e._id),
          ];
          return `<tr>${row.map((c) => `<td>${String(c ?? "").replace(/</g, "&lt;")}</td>`).join("")}</tr>`;
        })
        .join("");

      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            ${style}
            <title>Employees Export</title>
          </head>
          <body>
            <h1>Employees Export</h1>
            <table>
              <thead>
                <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
          </body>
        </html>
      `;
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Failed to export PDF");
    }
  };

  const handleAddStation = () => {
    navigate("/stations");
  };

  const handleAddAsset = () => {
    navigate("/assets");
  };
  
  const handleBulkStationAssignment = () => {
    navigate("/bulk-station-assignment");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Click Edit button, then double-click any cell to edit 
          </p>
          {!isAdmin && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Viewing in read-only mode - Contact administrator for changes
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm"
              onClick={() => navigate("/employee")}
            >
              Add New Employee
            </button>
          )}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
            onClick={() => navigate("/employees")}
          >
            List View
          </button>
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm"
            onClick={() => setIsExportModalOpen(true)}
          >
            Export
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">         
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

      <EmployeeGridTable
        // data and pagination from parent hook (single source of truth)
        employees={sortedEmployees}
        loading={loading}
        error={error}
        filters={filters}
        pagination={pagination}
        goToPage={goToPage}
        nextPage={nextPage}
        prevPage={prevPage}
        changePageSize={changePageSize}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
        removeEmployee={removeEmployee}

        // editing/ui props
        sortConfig={sortConfig}
        editingCell={editingCell}
        editingData={editingData}
        imageIndexes={imageIndexes}
        enums={enums}
        isAdmin={isAdmin}
        onSort={handleSort}
        onStartEditing={startEditing}
        onStopEditing={stopEditing}
        onCancelEditing={cancelAllEditing}
        onCellChange={handleCellChange}
        onSaveCell={saveCell}
        onPrevImage={handlePrevImage}
        onNextImage={handleNextImage}
        onImageClick={setImageModal}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        onDataRefresh={removeEmployee}
      />

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close export dialog"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-sm mb-4">Choose a format to export the currently visible table data.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setIsExportModalOpen(false); exportCSV(); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => { setIsExportModalOpen(false); exportPDF(); }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
                >
                  PDF
                </button>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500">Note: Export respects current filters and page.</div>
            </div>
          </div>
        </div>
      )}

      {/* <EmployeeGridPagination
        pagination={pagination}
        onPageChange={goToPage}
        onNextPage={nextPage}
        onPrevPage={prevPage}
      /> */}

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={imageModal.image}
              alt={`${imageModal.employee.firstName} ${imageModal.employee.lastName} - Full Size`}
              className="max-w-full max-h-full object-contain"
            />
            
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
              <h3 className="font-medium">
                {imageModal.employee.firstName} {imageModal.employee.lastName}
              </h3>
              <p className="text-sm text-gray-300">
                {imageModal.employee.personalNumber}
              </p>
            </div>
            
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeGridContainer;