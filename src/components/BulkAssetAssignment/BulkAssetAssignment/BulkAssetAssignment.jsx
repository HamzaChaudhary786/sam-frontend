import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BulkAssetHeader from "../../BulkAsset/Header/Header.jsx";
import BulkAssetFilters from "../../BulkAsset/Filter/Filter.jsx";
import {
  getEmployees,
  getEmployeesWithoutPagination,
} from "../../Employee/EmployeeApi.js";
import {
  getAllStationsWithoutPage,
  getStations,
} from "../../Station/StationApi.js";
import axios from "axios";
import { BACKEND_URL } from "../../../constants/api.js";
import AssetAssignmentsList from "../List/List.jsx";
import EmployeeViewModal from "../../Employee/ViewEmployee/ViewEmployee.jsx";
import StationViewModal from "../../Station/ViewStation/ViewStation.jsx";
import StationModal from "../../Station/AddStation/AddStation.jsx";
import { useStations } from "../../Station/StationHook.js";

const BulkAssetAssignment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Header state
  const [headerData, setHeaderData] = useState({
    receiveDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    letterInfo: "",
    description: "",
    mallkhana: null, // { _id: '', name: '' }
  });

  // Filters state
  const [filters, setFilters] = useState({
    assetType: "",
    category: "",
  });

  // Assignment rows state - Initialize with 3 empty rows
  const [assignmentRows, setAssignmentRows] = useState(() => {
    return Array.from({ length: 3 }, (_, index) => ({
      id: (Date.now() + index).toString(),
      asset: null,
      employee: null,
      station: null,
      outQuantity: null,
      assignmentDate: new Date().toISOString().split("T")[0],
      remarks: "",
    }));
  });

  // Search states
  const [assetSearch, setAssetSearch] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState({});
  const [stationSearch, setStationSearch] = useState({});
  const [searchResults, setSearchResults] = useState({
    assets: {},
    employees: {},
    stations: {},
  });

  const [isEmployeeViewModalOpen, setIsEmployeeViewModalOpen] = useState(false);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [isStationViewModalOpen, setIsStationViewModalOpen] = useState(false);
  const [selectedStationForView, setSelectedStationForView] = useState(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isStationEditMode, setIsStationEditMode] = useState(false);
  const [stationEditData, setStationEditData] = useState(null);
  const { createStation, modifyStation } = useStations();
  const [selectedEmployee, setSelectedEmployee] = useState({});

  // Loading states for search
  const [isSearching, setIsSearching] = useState({});
  const [mallkhanaAssets, setMallkhanaAssets] = useState([]);
  const [anyModalOpen, setAnyModalOpen] = useState(false);

  // Helper function to get token
  const getToken = () => localStorage.getItem("authToken");
  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Helper function to get employee image
  const getEmployeeImage = (employee) => {
    if (!employee) return "/default-avatar.png";
    if (
      Array.isArray(employee?.profileUrl) &&
      employee?.profileUrl.length > 0
    ) {
      return employee.profileUrl[0];
    }
    return employee.profileUrl || "/default-avatar.png";
  };
  // Add modal handlers
  const handleEmployeeView = (employee) => {
    setSelectedEmployeeForView(employee);
    setIsEmployeeViewModalOpen(true);
  };

  const handleCloseEmployeeViewModal = () => {
    setIsEmployeeViewModalOpen(false);
    setSelectedEmployeeForView(null);
  };

  const handleEmployeeEdit = (employeeData) => {
    navigate("/employee", {
      state: {
        isEdit: true,
        editData: employeeData,
      },
    });
  };

  const handleStationView = (station) => {
    setSelectedStationForView(station);
    setIsStationViewModalOpen(true);
  };

  const handleCloseStationViewModal = () => {
    setIsStationViewModalOpen(false);
    setSelectedStationForView(null);
  };

  const handleStationEdit = (stationData) => {
    setIsStationEditMode(true);
    setStationEditData(stationData);
    setIsStationModalOpen(true);
  };

  const handleCloseStationModal = () => {
    setIsStationModalOpen(false);
    setIsStationEditMode(false);
    setStationEditData(null);
  };

  // Fetch Mallkhana assets when mallkhana is selected
  useEffect(() => {
    if (headerData.mallkhana?._id) {
      fetchMallkhanaAssets(headerData.mallkhana._id);
    } else {
      setMallkhanaAssets([]);
      // Clear asset selections when mallkhana changes
      setAssignmentRows((prev) =>
        prev.map((row) => ({
          ...row,
          asset: null,
        }))
      );
      // Clear asset search results
      setSearchResults((prev) => ({
        ...prev,
        assets: {},
      }));
    }
  }, [headerData.mallkhana]);

  const fetchMallkhanaAssets = async (mallkhanaId) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BACKEND_URL}/asset-batch/get-mallkhana-assets/${mallkhanaId}`,
        { headers: getAuthHeaders() }
      );

      console.log("Assets API response:", response.data);

      if (response.data && response.data.success) {
        // Handle the actual response structure based on your API
        let assets = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          // If data is an array, extract assets from each item
          response.data.data.forEach((item) => {
            if (item.asset && Array.isArray(item.asset)) {
              assets = assets.concat(item.asset);
            }
          });
        } else if (
          response.data.data &&
          response.data.data.asset &&
          Array.isArray(response.data.data.asset)
        ) {
          // If there's a single data object with asset array
          assets = response.data.data.asset;
        }

        setMallkhanaAssets(assets);

        if (assets.length === 0) {
          toast.info("No assets found in selected Mallkhana");
        } else {
          toast.success(`Found ${assets.length} assets in Mallkhana`);
        }
      } else {
        setMallkhanaAssets([]);
        toast.info("No assets found in selected Mallkhana");
      }
    } catch (error) {
      console.error("Error fetching mallkhana assets:", error);
      toast.error("Failed to fetch assets from Mallkhana");
      setMallkhanaAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Header handlers
  const handleHeaderChange = (name, value) => {
    setHeaderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Assignment row handlers
  const handleAssignmentChange = (rowId, field, value) => {
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now().toString(),
      asset: null,
      employee: null,
      station: null,
      outQuantity: null,
      assignmentDate: new Date().toISOString().split("T")[0],
      remarks: "",
    };
    setAssignmentRows((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (rowId) => {
    if (assignmentRows.length === 1) {
      toast.warning("At least one assignment row is required");
      return;
    }
    setAssignmentRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  // Search assets within mallkhana
  const searchAssets = (query, rowId) => {
    if (!headerData.mallkhana?._id) {
      toast.warning("Please select a Mallkhana first");
      return;
    }

    if (!query.trim()) {
      setSearchResults((prev) => ({
        ...prev,
        assets: { ...prev.assets, [rowId]: [] },
      }));
      return;
    }

    const filteredAssets = mallkhanaAssets.filter((asset) => {
      const searchTerm = query.toLowerCase();
      return (
        (asset.name && asset.name.toLowerCase().includes(searchTerm)) ||
        (asset.type && asset.type.toLowerCase().includes(searchTerm)) ||
        (asset.category && asset.category.toLowerCase().includes(searchTerm)) ||
        (asset.weaponNumber &&
          asset.weaponNumber.toLowerCase().includes(searchTerm)) ||
        (asset.registerNumber &&
          asset.registerNumber.toLowerCase().includes(searchTerm))
      );
    });

    setSearchResults((prev) => ({
      ...prev,
      assets: { ...prev.assets, [rowId]: filteredAssets },
    }));
  };

  // Search employees
  const searchEmployees = async (query, rowId) => {
    if (!query.trim()) {
      setSearchResults((prev) => ({
        ...prev,
        employees: { ...prev.employees, [rowId]: [] },
      }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, [`employee_${rowId}`]: true }));

    try {
      const result = await getEmployeesWithoutPagination({
        name: query,
        limit: 25,
      });

      if (result.success) {
        const employees = result.data.employees || result.data || [];
        setSearchResults((prev) => ({
          ...prev,
          employees: { ...prev.employees, [rowId]: employees },
        }));
      } else {
        console.error("Employee search failed:", result.error);
        toast.error("Failed to search employees");
      }
    } catch (error) {
      console.error("Employee search error:", error);
      toast.error("Error searching employees");
    } finally {
      setIsSearching((prev) => ({ ...prev, [`employee_${rowId}`]: false }));
    }
  };

  // Search stations
  const searchStations = async (query, rowId) => {
    if (!query.trim()) {
      setSearchResults((prev) => ({
        ...prev,
        stations: { ...prev.stations, [rowId]: [] },
      }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, [`station_${rowId}`]: true }));

    try {
      const result = await getAllStationsWithoutPage({
        name: query,
        limit: 25,
      });

      if (result.success) {
        let stations = [];
        if (Array.isArray(result.data)) {
          stations = result.data;
        } else if (result.data && Array.isArray(result.data.stations)) {
          stations = result.data.stations;
        }

        const filteredStations = stations.filter(
          (station) =>
            station.name &&
            station.name.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults((prev) => ({
          ...prev,
          stations: { ...prev.stations, [rowId]: filteredStations },
        }));
      } else {
        console.error("Station search failed:", result.error);
        toast.error("Failed to search stations");
      }
    } catch (error) {
      console.error("Station search error:", error);
      toast.error("Error searching stations");
    } finally {
      setIsSearching((prev) => ({ ...prev, [`station_${rowId}`]: false }));
    }
  };

  // Select handlers
  const selectAsset = (asset, rowId) => {
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, asset } : row))
    );
    setAssetSearch((prev) => ({ ...prev, [rowId]: "" }));
    setSearchResults((prev) => ({
      ...prev,
      assets: { ...prev.assets, [rowId]: [] },
    }));
  };

  const selectEmployee = (employee, rowId) => {
    console.log("Selected employee:", employee);
    setSelectedEmployee(employee);
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, employee } : row))
    );
    setEmployeeSearch((prev) => ({ ...prev, [rowId]: "" }));
    setSearchResults((prev) => ({
      ...prev,
      employees: { ...prev.employees, [rowId]: [] },
    }));
  };

  const selectStation = (station, rowId) => {
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, station } : row))
    );
    setStationSearch((prev) => ({ ...prev, [rowId]: "" }));
    setSearchResults((prev) => ({
      ...prev,
      stations: { ...prev.stations, [rowId]: [] },
    }));
  };

  // Clear selection handlers
  const clearAsset = (rowId) => {
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, asset: null } : row))
    );
  };

  const clearEmployee = (rowId) => {
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, employee: null } : row))
    );
  };

  const clearStation = (rowId) => {
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, station: null } : row))
    );
  };

  // Validation
  const validateForm = () => {
    const errors = [];

    if (!headerData.mallkhana) {
      errors.push("Mallkhana selection is required");
    }

    assignmentRows.forEach((row, index) => {
      if (!row.asset && !row.employee && !row.station) {
        //continue
      } else {
        if (!row.asset) {
          errors.push(`Row ${index + 1}: Asset is required`);
        }
        if (!row.employee && !row.station) {
          errors.push(
            `Row ${
              index + 1
            }: At least one of Employee or Station must be selected`
          );
        }
        if (!row.assignmentDate) {
          errors.push(`Row ${index + 1}: Assignment date is required`);
        }
      }
    });

    return errors;
  };

  // Save all assignments
  // Replace the entire handleSaveAll function with this:

  const handleSaveAll = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(
        `Please fix the following errors:\n${validationErrors.join("\n")}`
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare assignment data according to your backend structure
      const assignments = assignmentRows.map((row) => ({
        asset: row.asset._id,
        employee: row.employee?._id || null,
        station: row.station?._id || null,
        outQuantity: row.outQuantity || null,
        assignmentDate: row.assignmentDate,
        remarks: row.remarks || "",
      }));

      const assignmentData = {
        batchInfo: {
          receiveDate: headerData.receiveDate,
          referenceNumber: headerData.referenceNumber,
          letterInfo: headerData.letterInfo,
          description: headerData.description,
        },
        assignments: assignments,
        mallkhana: headerData.mallkhana,
      };

      // Make the actual API call to your backend
      const response = await axios.post(
        `${BACKEND_URL}/asset-batch/bulk-station-employee-assignments`,
        assignmentData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        toast.success(
          `Successfully created ${assignments.length} asset assignments!`
        );

        // Show success message and navigate
        setTimeout(() => {
          if (
            window.confirm(
              "Assets assigned successfully! Would you like to create more assignments?"
            )
          ) {
            // Reset form
            setHeaderData({
              receiveDate: new Date().toISOString().split("T")[0],
              referenceNumber: "",
              letterInfo: "",
              description: "",
              mallkhana: null,
            });
            setAssignmentRows([
              {
                id: Date.now().toString(),
                asset: null,
                employee: null,
                station: null,
                outQuantity: null,
                assignmentDate: new Date().toISOString().split("T")[0],
                remarks: "",
              },
            ]);
            setSearchResults({ assets: {}, employees: {}, stations: {} });
            setAssetSearch({});
            setEmployeeSearch({});
            setStationSearch({});
            setMallkhanaAssets([]);
          } else {
            navigate("/asset-assignments"); // Navigate to the assignments list page
          }
        }, 1500);
      } else {
        toast.error(
          `Failed to create asset assignments: ${
            response.data?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Bulk asset assignment error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create asset assignments";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cancel all changes
  const handleCancelAll = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost."
      )
    ) {
      navigate("/assets");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bulk Asset Assignment
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Assign assets from Mallkhana to employees and/or stations in bulk.
          </p>
        </div>
      </div>

      {/* Header Component */}
      <BulkAssetHeader
        headerData={headerData}
        onHeaderChange={handleHeaderChange}
        loading={loading}
      />

      {/* Filters Component */}
      {/* <BulkAssetFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
      /> */}

      {/* Assignment Rows */}
      <div className="bg-white shadow-md rounded-lg overflow-visible mb-10 relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Asset Assignments
          </h3>
          <button
            onClick={handleAddRow}
            disabled={loading}
            className="fixed top-24 right-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors shadow-lg z-50"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station (Optional)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee (Optional)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Quantity
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignmentRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {/* Station Column */}
                  <td className="px-6 py-4 relative">
                    {row.station ? (
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            <span
                              onClick={() => handleStationView(row.station)}
                              className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                            >
                              {row.station.name}
                            </span>
                          </div>
                          {row.station.district && (
                            <div className="text-xs text-gray-500 truncate">
                              {row.station.district}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => clearStation(row.id)}
                          disabled={loading}
                          className="text-xs text-red-600 hover:text-red-800 ml-2 flex-shrink-0 disabled:opacity-50"
                          title="Clear selection"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search station... (optional)"
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[200px]"
                          value={stationSearch[row.id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setStationSearch((prev) => ({
                              ...prev,
                              [row.id]: value,
                            }));
                            searchStations(value, row.id);
                          }}
                        />
                        {isSearching[`station_${row.id}`] && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}

                        {searchResults.stations[row.id]?.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.stations[row.id].map((station) => (
                              <button
                                key={station._id}
                                onClick={() => selectStation(station, row.id)}
                                disabled={loading}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900 truncate">
                                  {station.name}
                                </div>
                                {station.district && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {station.district}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {console.log(
                    "Selected employee: hahahhahahhahahahhah",
                    selectedEmployee
                  )}
                  {/* Employee Column */}
                  <td className="px-6 py-4 relative">
                    {row.employee ? (
                      <div className="flex items-center">
                        <img
                          className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
                          src={getEmployeeImage(row?.employee)}
                          alt={`${row.employee.firstName} ${row.employee.lastName}`}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            <div
                              onClick={() => handleEmployeeView(row.employee)}
                              className="text-gray-900 text-sm hover:text-blue-600 cursor-pointer hover:underline"
                            >
                              {row.employee.firstName}
                            </div>
                            <div className="text-xs">
                              {row.employee.fatherFirstName}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {row.employee.personalNumber ||
                              row.employee.pnumber ||
                              row.employee.rank}
                          </div>
                        </div>
                        <button
                          onClick={() => clearEmployee(row.id)}
                          disabled={loading}
                          className="text-xs text-red-600 hover:text-red-800 ml-2 flex-shrink-0 disabled:opacity-50"
                          title="Clear selection"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search employee... (optional)"
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[250px]"
                          value={employeeSearch[row.id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEmployeeSearch((prev) => ({
                              ...prev,
                              [row.id]: value,
                            }));
                            searchEmployees(value, row.id);
                          }}
                        />
                        {isSearching[`employee_${row.id}`] && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}

                        {searchResults.employees[row.id]?.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.employees[row.id].map((employee) => (
                              <button
                                key={employee._id}
                                onClick={() => selectEmployee(employee, row.id)}
                                disabled={loading}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50 flex items-center border-b border-gray-100 last:border-b-0"
                              >
                                <img
                                  className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
                                  src={getEmployeeImage(employee)}
                                  alt={`${employee.firstName} ${employee.lastName}`}
                                  onError={(e) => {
                                    e.target.src = "/default-avatar.png";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {employee.firstName} {employee.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {employee.personalNumber ||
                                      employee.rank ||
                                      employee.pnumber}{" "}
                                    | {employee.cnic}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td>
                    <div>
                      Employee:
                      {row?.employee?.assignedAssets?.map((item) => (
                        <div key={item._id} className="flex flex-row">
                          {item.asset?.map((itm) => (
                            <span key={itm._id} className="text-xs mt-0.5">
                              {itm.name}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                    {console.log(row, "this is my row X hahahha")}
                    <div>
                      Stations:
                      {row?.station?.stationAssets?.map((item) => (
                        <div key={item._id} className="flex flex-row">
                          {item.asset?.map((itm) => (
                            <span key={itm._id} className="text-xs mt-0.5">
                              {itm.name}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </td>
                  {/* Asset Column */}
                  <td className="px-6 py-4 relative">
                    {row.asset ? (
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {row.asset.name || "Unnamed Asset"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            Type: {row.asset.type || "N/A"}
                            <br />
                            Category: {row.asset.category || "N/A"}
                            <br />
                            availible Quantity:
                            {row?.asset?.availableQuantity || "N/A"}
                          </div>
                          {(row.asset.weaponNumber ||
                            row.asset.registerNumber) && (
                            <div className="text-xs text-gray-500 truncate">
                              {row.asset.weaponNumber ||
                                row.asset.registerNumber}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => clearAsset(row.id)}
                          disabled={loading}
                          className="text-xs text-red-600 hover:text-red-800 ml-2 flex-shrink-0 disabled:opacity-50"
                          title="Clear selection"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={
                            !headerData.mallkhana
                              ? "Select Mallkhana first..."
                              : "Search asset..."
                          }
                          disabled={loading || !headerData.mallkhana}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[250px]"
                          value={assetSearch[row.id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAssetSearch((prev) => ({
                              ...prev,
                              [row.id]: value,
                            }));
                            searchAssets(value, row.id);
                          }}
                        />

                        {searchResults.assets[row.id]?.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.assets[row.id].map((asset) => (
                              <button
                                key={asset._id}
                                onClick={() => selectAsset(asset, row.id)}
                                disabled={loading}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900 truncate">
                                  {asset.name || "Unnamed Asset"}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {asset.type} - {asset.category}
                                </div>
                                {(asset.weaponNumber ||
                                  asset.registerNumber) && (
                                  <div className="text-xs text-gray-400 truncate">
                                    {asset.weaponNumber || asset.registerNumber}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.outQuantity}
                      disabled={loading}
                      onChange={(e) => {
                        if (
                          Number(row?.asset?.availableQuantity) <
                          Number(e.target.value)
                        ) {
                          toast.warn(
                            "Issue quantity should be less than available quantity"
                          );
                        }

                        handleAssignmentChange(
                          row.id,
                          "outQuantity",
                          e.target.value
                        );
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                      placeholder="issue quantity.."
                    />
                  </td>

                  {/* Assignment Date */}
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={row.assignmentDate}
                      disabled={loading}
                      onChange={(e) =>
                        handleAssignmentChange(
                          row.id,
                          "assignmentDate",
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                    />
                  </td>

                  {/* Remarks */}
                  <td className="px-6 py-4">
                    <textarea
                      placeholder="Remarks..."
                      value={row.remarks}
                      disabled={loading}
                      onChange={(e) =>
                        handleAssignmentChange(
                          row.id,
                          "remarks",
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full disabled:bg-gray-100"
                      rows="2"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={assignmentRows.length === 1 || loading}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Remove this assignment"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Message */}
        {!headerData.mallkhana && (
          <div className="p-4 bg-yellow-50 border-t border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Select a Mallkhana first
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Please select a Mallkhana in the header section above to
                    load available assets for assignment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {headerData.mallkhana && mallkhanaAssets.length === 0 && !loading && (
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  No assets found
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The selected Mallkhana "{headerData.mallkhana.name}" does
                    not have any assets available for assignment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AssetAssignmentsList onModalStateChange={setAnyModalOpen} />

      {/* Fixed Bottom Action Buttons */}
      {!anyModalOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md p-4 flex gap-3 justify-end z-50">
          <button
            onClick={handleCancelAll}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Cancel All
          </button>
          <button
            onClick={handleSaveAll}
            disabled={
              loading || assignmentRows.length === 0 || !headerData.mallkhana
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save All
              </>
            )}
          </button>
        </div>
      )}
      {/* Add these modals before the closing div */}
      <EmployeeViewModal
        isOpen={isEmployeeViewModalOpen}
        onClose={handleCloseEmployeeViewModal}
        employee={selectedEmployeeForView}
        onEdit={handleEmployeeEdit}
      />

      <StationViewModal
        isOpen={isStationViewModalOpen}
        onClose={handleCloseStationViewModal}
        station={selectedStationForView}
        onEdit={handleStationEdit}
      />

      <StationModal
        isOpen={isStationModalOpen}
        onClose={handleCloseStationModal}
        isEdit={isStationEditMode}
        editData={stationEditData}
        createStation={createStation}
        modifyStation={modifyStation}
      />
    </div>
  );
};

export default BulkAssetAssignment;
