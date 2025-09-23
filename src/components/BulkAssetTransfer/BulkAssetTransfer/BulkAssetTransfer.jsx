import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BulkAssetHeader from "../Header/Header.jsx";
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
import { EnumSelect } from "../../SearchableDropdown.jsx";
import { getMaalkhanaOptions } from "../../BulkAsset/BulkAssetApi.js";

const BulkAssetTransfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Header state
  const [headerData, setHeaderData] = useState({
    receiveDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    letterInfo: "",
    description: "",
    mallkhana: null,
  });

  // Transfer rows state - Initialize with 3 empty rows
  const [assignmentRows, setAssignmentRows] = useState(() => {
    return Array.from({ length: 3 }, (_, index) => ({
      id: (Date.now() + index).toString(),
      asset: null,
      employee: null,
      station: null,
      sourceMallkhana: null,
      targetMallkhana: null,
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
  const [employeeAssets, setEmployeeAssets] = useState([]);
  const [stationAssets, setStationAssets] = useState([]);

  const [target, setTarget] = useState("");

  const [isEmployeeViewModalOpen, setIsEmployeeViewModalOpen] = useState(false);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [isStationViewModalOpen, setIsStationViewModalOpen] = useState(false);
  const [selectedStationForView, setSelectedStationForView] = useState(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isStationEditMode, setIsStationEditMode] = useState(false);
  const [stationEditData, setStationEditData] = useState(null);
  const { createStation, modifyStation } = useStations();
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [maalkhanaOptions, setMaalkhanaOptions] = useState([]);
  const [loadingMaalkhana, setLoadingMaalkhana] = useState(false);
  // Loading states for search
  const [isSearching, setIsSearching] = useState({});
  const [mallkhanaAssets, setMallkhanaAssets] = useState([]);
  const [anyModalOpen, setAnyModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

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
      // Clear other asset arrays when mallkhana is selected
      setEmployeeAssets([]);
      setStationAssets([]);
      // Clear other selections for exclusivity
      setHeaderData((prev) => ({ ...prev, station: null, employee: null }));
      setAssignmentRows((prev) =>
        prev.map((row) => ({ ...row, station: null, employee: null }))
      );
    } else {
      setMallkhanaAssets([]);
    }
  }, [headerData.mallkhana]);

  // Add new useEffect for employee
  useEffect(() => {
    if (headerData.employee?._id) {
      fetchEmployeeAssets(headerData.employee._id);
      // Clear other asset arrays when employee is selected
      setMallkhanaAssets([]);
      setStationAssets([]);
      // Clear asset selections when employee changes
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
    } else {
      setEmployeeAssets([]);
    }
  }, [headerData.employee]);

  // Add new useEffect for station
  useEffect(() => {
    if (headerData.station?._id) {
      fetchStationAssets(headerData.station._id);
      // Clear other asset arrays when station is selected
      setMallkhanaAssets([]);
      setEmployeeAssets([]);
      // Clear asset selections when station changes
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
    } else {
      setStationAssets([]);
    }
  }, [headerData.station]);

  const fetchMallkhanaAssets = async (mallkhanaId) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BACKEND_URL}/asset-batch/get-mallkhana-assets/${mallkhanaId}`,
        { headers: getAuthHeaders() }
      );

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
  const fetchEmployeeAssets = async (employeeId) => {
    try {
      setLoading(true);

      // Import getAllAssetAssignments from your AssetApi
      const { getAllAssetAssignments } = await import(
        "../../AssetAssignment/AssetApi.js"
      );

      const response = await getAllAssetAssignments({ employee: employeeId });

      if (response.success && response.data) {
        // Filter only active assignments
        const activeAssignments = response.data.filter(
          (assignment) =>
            assignment.isApproved &&
            assignment.status === "Active" &&
            !assignment.consumedDate &&
            !assignment.returnedDate
        );

        // Extract assets from assignments
        let assets = [];
        activeAssignments.forEach((assignment) => {
          if (assignment.asset && Array.isArray(assignment.asset)) {
            assets = assets.concat(assignment.asset);
          }
        });

        setEmployeeAssets(assets);

        if (assets.length === 0) {
          toast.info("No assets found for selected Employee");
        } else {
          toast.success(`Found ${assets.length} assets for Employee`);
        }
      } else {
        setEmployeeAssets([]);
        toast.info("No assets found for selected Employee");
      }
    } catch (error) {
      console.error("Error fetching employee assets:", error);
      toast.error("Failed to fetch assets for Employee");
      setEmployeeAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStationAssets = async (stationId) => {
    try {
      setLoading(true);

      // Import getStationAssetAssignments from your StationAssetApi
      const { getStationAssetAssignments } = await import(
        "../../StationAssetAssignment/StationAssetApi.js"
      );

      const response = await getStationAssetAssignments(stationId);

      if (response.success && response.data) {
        // Filter only active assignments
        const activeAssignments = response.data.filter(
          (assignment) =>
            assignment.isApproved &&
            assignment.status === "Active" &&
            !assignment.consumedDate &&
            !assignment.returnedDate
        );

        // Extract assets from assignments
        let assets = [];
        activeAssignments.forEach((assignment) => {
          if (assignment.asset && Array.isArray(assignment.asset)) {
            assets = assets.concat(assignment.asset);
          }
        });

        setStationAssets(assets);

        if (assets.length === 0) {
          toast.info("No assets found for selected Station");
        } else {
          toast.success(`Found ${assets.length} assets for Station`);
        }
      } else {
        setStationAssets([]);
        toast.info("No assets found for selected Station");
      }
    } catch (error) {
      console.error("Error fetching station assets:", error);
      toast.error("Failed to fetch assets for Station");
      setStationAssets([]);
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

  // Transfer row handlers
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
      toast.warning("At least one transfer row is required");
      return;
    }
    setAssignmentRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  // Search assets within mallkhana
  const searchAssets = (query, rowId) => {
    // Determine which asset array to search based on what's selected in header
    let assetsToSearch = [];
    let sourceMessage = "";

    if (headerData.mallkhana?._id) {
      assetsToSearch = mallkhanaAssets;
      sourceMessage = "Please select a Mallkhana first";
    } else if (headerData.employee?._id) {
      assetsToSearch = employeeAssets;
      sourceMessage = "Please select an Employee first";
    } else if (headerData.station?._id) {
      assetsToSearch = stationAssets;
      sourceMessage = "Please select a Station first";
    } else {
      toast.warning("Please select a Mallkhana, Employee, or Station first");
      return;
    }

    if (!query.trim()) {
      setSearchResults((prev) => ({
        ...prev,
        assets: { ...prev.assets, [rowId]: [] },
      }));
      return;
    }

    const filteredAssets = assetsToSearch.filter((asset) => {
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
        const stations = result?.data?.result || result.data || [];

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
    // Prevent selecting the same as current employee in header
    if (headerData.employee?._id && employee?._id === headerData.employee._id) {
      toast.warn("Target employee cannot be the same as current employee");
      return;
    }
    setSelectedEmployee(employee);
    // Enforce exclusivity at row: selecting employee clears station and mallkhana field
    setAssignmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, employee, station: null, mallkhana: null }
          : row
      )
    );
    setEmployeeSearch((prev) => ({ ...prev, [rowId]: "" }));
    setSearchResults((prev) => ({
      ...prev,
      employees: { ...prev.employees, [rowId]: [] },
    }));
  };

  const selectStation = (station, rowId) => {
    // Prevent selecting the same as current station in header
    if (headerData.station?._id && station?._id === headerData.station._id) {
      toast.warn("Target station cannot be the same as current station");
      return;
    }
    // Enforce exclusivity at row: selecting station clears employee and mallkhana field
    setAssignmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, station, employee: null, mallkhana: null }
          : row
      )
    );
    setStationSearch((prev) => ({ ...prev, [rowId]: "" }));
    setSearchResults((prev) => ({
      ...prev,
      stations: { ...prev.stations, [rowId]: [] },
    }));
  };

  const selectMallkhana = (mallkhana, rowId) => {
    // Prevent selecting the same as source mallkhana
    if (
      headerData.mallkhana?._id &&
      mallkhana?._id === headerData.mallkhana._id
    ) {
      toast.warn("Target mallkhana cannot be the same as source mallkhana");
      return;
    }

    // Enforce exclusivity at row: selecting mallkhana clears employee and station
    setAssignmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              targetMallkhana: mallkhana,
              employee: null,
              station: null,
            }
          : row
      )
    );
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

    // At least one of Mallkhana, Station, or Employee must be selected in header as source
    if (!headerData.mallkhana && !headerData.station && !headerData.employee) {
      errors.push(
        "At least one of Mallkhana, Station, or Employee is required as source"
      );
    }

    // Validate each assignment row
    assignmentRows.forEach((row, index) => {
      // Skip completely empty rows
      if (!row.asset && !row.employee && !row.station && !row.targetMallkhana) {
        // skip empty row
      } else {
        // Asset is required if row has any other data
        if (!row.asset) {
          errors.push(`Row ${index + 1}: Asset is required`);
        }

        // Check for at least one target selection per row
        const hasAnySelectionInRow = !!(
          row.employee ||
          row.station ||
          row.targetMallkhana
        );

        if (!hasAnySelectionInRow) {
          errors.push(
            `Row ${
              index + 1
            }: At least one of Target Mallkhana, Employee, or Station must be selected`
          );
        }

        // Prevent same source and target mallkhana
        if (
          headerData.mallkhana?._id &&
          row.targetMallkhana?._id === headerData.mallkhana._id
        ) {
          errors.push(
            `Row ${index + 1}: Target mallkhana cannot equal source mallkhana`
          );
        }

        // Prevent same current vs target for station
        if (
          headerData.station?._id &&
          row.station?._id === headerData.station._id
        ) {
          errors.push(
            `Row ${index + 1}: Target station cannot equal current station`
          );
        }

        // Prevent same current vs target for employee
        if (
          headerData.employee?._id &&
          row.employee?._id === headerData.employee._id
        ) {
          errors.push(
            `Row ${index + 1}: Target employee cannot equal current employee`
          );
        }

        // Assignment date is required
        if (!row.assignmentDate) {
          errors.push(`Row ${index + 1}: Transfer date is required`);
        }

        // Validate quantity if asset is selected
        if (row.asset && row.outQuantity) {
          const availableQuantity = Number(row.asset.availableQuantity) || 0;
          const requestedQuantity = Number(row.outQuantity) || 0;

          if (requestedQuantity > availableQuantity) {
            errors.push(
              `Row ${
                index + 1
              }: Issue quantity (${requestedQuantity}) cannot exceed available quantity (${availableQuantity})`
            );
          }

          if (requestedQuantity <= 0) {
            errors.push(
              `Row ${index + 1}: Issue quantity must be greater than 0`
            );
          }
        }
      }
    });

    // Check if at least one non-empty row exists
    const hasNonEmptyRows = assignmentRows.some(
      (row) => row.asset || row.employee || row.station || row.targetMallkhana
    );

    if (!hasNonEmptyRows) {
      errors.push("At least one assignment row must be completed");
    }

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
      // Prepare Transfer data according to your backend structure
      const assignments = assignmentRows.map((row) => ({
        asset: row.asset._id,
        employee: row.employee?._id || null,
        station: row.station?._id || null,
        sourceMallkhana: headerData.mallkhana?._id || null,
        sourceEmployee: headerData.employee?._id || null,
        sourceStation: headerData.station?._id || null,
        targetMallkhana: row.targetMallkhana?._id || null,
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
        employee: headerData.employee,
        station: headerData.station,
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

      if (response.data && response.data.success) {
        toast.success(
          `Successfully created ${assignments.length} asset transfer!`
        );

        // Show success message and navigate
        setTimeout(() => {
          if (
            window.confirm(
              "Assets transfer successfully! Would you like to create more assignments?"
            )
          ) {
            // Reset form
            setHeaderData({
              receiveDate: new Date().toISOString().split("T")[0],
              referenceNumber: "",
              letterInfo: "",
              description: "",
              mallkhana: null,
              employee: null,
              station: null,
            });
            setAssignmentRows([
              {
                id: Date.now().toString(),
                asset: null,
                employee: null,
                station: null,
                sourceMallkhana: null,
                targetMallkhana: null,
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
            setEmployeeAssets([]);
            setStationAssets([]);
          } else {
            navigate("/asset-assignments"); // Navigate to the assignments list page
          }
        }, 1500);
      } else {
        toast.error(
          `Failed to create asset transfer: ${
            response.data?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Bulk asset Transfer error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create asset transfer";
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

  useEffect(() => {
    fetchMaalkhanaOptions();
  }, []);

  const fetchMaalkhanaOptions = async () => {
    setLoadingMaalkhana(true);
    setApiError(null);

    try {
      console.log("Fetching maalkhana options...");
      const result = await getMaalkhanaOptions();

      console.log("API Result:", result);

      if (result.success) {
        let stations = [];

        // Handle different response structures
        if (Array.isArray(result.data)) {
          stations = result.data;
        } else if (result.data && Array.isArray(result.data.stations)) {
          stations = result.data.stations;
        } else if (
          result.data &&
          result.data.data &&
          Array.isArray(result.data.data.stations)
        ) {
          // Sometimes APIs nest data deeper
          stations = result.data.data.stations;
        } else {
          console.warn("Unexpected data structure:", result.data);
          setApiError("Unexpected data structure from API");
        }

        console.log("Extracted stations:", stations);

        if (stations.length === 0) {
          console.warn("No stations found in API response");
          setApiError("No stations available");
        }

        // Transform data to match EnumSelect format
        const options = stations.map((item) => ({
          value: item._id,
          label: item.name,
        }));

        console.log("Final options:", options);
        setMaalkhanaOptions(options);
      } else {
        console.error("API returned success: false", result.error);
        setApiError(result.error || "Failed to fetch maalkhana options");
      }
    } catch (error) {
      console.error("Error fetching maalkhana options:", error);
      setApiError(error.message || "Network error occurred");
    } finally {
      setLoadingMaalkhana(false);
    }
  };

  const maalkhanaEnum = React.useMemo(() => {
    const enumObj = {};
    maalkhanaOptions.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  }, [maalkhanaOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    handleHeaderChange(name, value);
  };

  const handleMaalkhanaChange = (e) => {
    const selectedOption = maalkhanaOptions.find(
      (option) => option.value === e.target.value
    );
    handleHeaderChange("mallkhana", {
      _id: e.target.value,
      name: selectedOption?.label || "",
    });
  };

  // Target Maalkhana change handler (target selection in table header)
  const handleTargetMaalkhanaChange = (e) => {
    const selectedOption = maalkhanaOptions.find(
      (option) => option.value === e.target.value
    );
    if (
      headerData.mallkhana?._id &&
      headerData.mallkhana._id === e.target.value
    ) {
      toast.warn("Source Mallkhana and Target Mallkhana cannot be the same");
      return;
    }
    handleHeaderChange("targetMallkhana", {
      _id: e.target.value,
      name: selectedOption?.label || "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bulk Asset Transfer
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

      {/* Transfer Rows */}
      <div className="bg-white shadow-md rounded-lg overflow-visible mb-10 relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Asset Transfer</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-6 px-2 py-2">
                    {/* Mallkhana */}
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                      <input
                        type="radio"
                        name="target"
                        value="mallkhana"
                        checked={target === "mallkhana"}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Mallkhana
                      </span>
                    </label>

                    {/* Station */}
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                      <input
                        type="radio"
                        name="target"
                        value="station"
                        checked={target === "station"}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Station
                      </span>
                    </label>

                    {/* Employee */}
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                      <input
                        type="radio"
                        name="target"
                        value="employee"
                        checked={target === "employee"}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Employee
                      </span>
                    </label>
                  </div>
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
                  Transfer Date
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
                    {target === "mallkhana" && (
                      <div>
                        <EnumSelect
                          label="Target Maalkhana"
                          name={`targetMallkhana_${row.id}`}
                          value={row.targetMallkhana?._id || ""}
                          onChange={(e) => {
                            const selectedOption = maalkhanaOptions.find(
                              (option) => option.value === e.target.value
                            );
                            if (
                              headerData.mallkhana?._id &&
                              headerData.mallkhana._id === e.target.value
                            ) {
                              toast.warn(
                                "Source Mallkhana and Target Mallkhana cannot be the same"
                              );
                              return;
                            }
                            selectMallkhana(
                              {
                                _id: e.target.value,
                                name: selectedOption?.label || "",
                              },
                              row.id
                            );
                          }}
                          enumObject={maalkhanaEnum}
                          required={true}
                          disabled={loading || loadingMaalkhana}
                          placeholder={
                            loadingMaalkhana
                              ? "Loading..."
                              : apiError
                              ? "Error loading options"
                              : maalkhanaOptions.length === 0
                              ? "No options available"
                              : "Select Target Maalkhana..."
                          }
                        />
                      </div>
                    )}

                    {target === "station" && (
                      <div>
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
                                {searchResults.stations[row.id].map(
                                  (station) => (
                                    <button
                                      key={station._id}
                                      onClick={() =>
                                        selectStation(station, row.id)
                                      }
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
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {target === "employee" && (
                      <div>
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
                                  onClick={() =>
                                    handleEmployeeView(row.employee)
                                  }
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
                                {searchResults.employees[row.id].map(
                                  (employee) => (
                                    <button
                                      key={employee._id}
                                      onClick={() =>
                                        selectEmployee(employee, row.id)
                                      }
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
                                          {employee.firstName}{" "}
                                          {employee.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                          {employee.personalNumber ||
                                            employee.rank ||
                                            employee.pnumber}{" "}
                                          | {employee.cnic}
                                        </div>
                                      </div>
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="text-xs mt-0.5">
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

                    <div className="text-xs mt-0.5">
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
                            {!(
                              row.asset.weaponNumber || row.asset.registerNumber
                            ) && (
                              <>
                                <br />
                                availible Quantity:
                                {row?.asset?.availableQuantity || "N/A"}
                              </>
                            )}
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
                            !headerData.mallkhana &&
                            !headerData.employee &&
                            !headerData.station
                              ? "Select Mallkhana, Employee, or Station first..."
                              : "Search asset..."
                          }
                          disabled={
                            loading ||
                            (!headerData.mallkhana &&
                              !headerData.employee &&
                              !headerData.station)
                          }
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
                              <>
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
                                    {asset.type} - {asset.category}{" "}
                                    {asset?.weaponNumber && (
                                      <>-{asset?.weaponNumber}</>
                                    )}
                                    {asset?.availableQuantity && (
                                      <>-{asset?.availableQuantity}</>
                                    )}
                                  </div>

                                  {(asset.weaponNumber ||
                                    asset.registerNumber) && (
                                    <div className="text-xs text-gray-400 truncate">
                                      {asset.weaponNumber ||
                                        asset.registerNumber}
                                    </div>
                                  )}
                                </button>
                              </>
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

                  {/* Transfer Date */}
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
        {/* Info Messages */}
        {!headerData.mallkhana &&
          !headerData.employee &&
          !headerData.station && (
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
                    Select source first
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Please select a Mallkhana, Employee, or Station in the
                      header section above to load available assets for
                      assignment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {headerData.employee && employeeAssets.length === 0 && !loading && (
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
                    The selected Employee "{headerData.employee.firstName}{" "}
                    {headerData.employee.lastName}" does not have any assets
                    assigned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {headerData.station && stationAssets.length === 0 && !loading && (
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
                    The selected Station "{headerData.station.name}" does not
                    have any assets assigned.
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
              loading ||
              assignmentRows.length === 0 ||
              (!headerData.mallkhana &&
                !headerData.station &&
                !headerData.employee)
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

export default BulkAssetTransfer;
