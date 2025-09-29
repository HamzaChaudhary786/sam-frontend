// PendingStationApprovals.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getPendingApprovals,
  approveStationAssignment,
  deleteStationAssignment,
  rejectStationAssignment,
} from "../StationAssignment/StationAssignmentApi.js";
import { useNavigate } from "react-router-dom";
import { useGlobalStationView } from "../Station/GlobalStationView.jsx";
import StationViewModal from "../Station/ViewStation/ViewStation.jsx";
import EmployeeViewModal from "../Employee/ViewEmployee/ViewEmployee.jsx";
import StationModal from "../Station/AddStation/AddStation.jsx";
import { useStations } from "../Station/StationHook.js";
import EmpSuggestions from "../../commonComponents/EmpSuggestions.jsx";
import { MultiTextInput } from "../Employee/MultiTextInput.jsx";
import { getEmployeesWithoutPagination } from "../Employee/EmployeeApi.js"; // Import the new API function
import { getAllStationsWithoutPage } from "../Station/StationApi.js";
import { MultiTextInputField } from "../../commonComponents/MultiInputTextField.jsx";

const PendingStationApprovals = ({ onEdit }) => {
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { openStationView } = useGlobalStationView();
  const [isEmployeeViewModalOpen, setIsEmployeeViewModalOpen] = useState(false);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [isStationViewModalOpen, setIsStationViewModalOpen] = useState(false);
  const [selectedStationForView, setSelectedStationForView] = useState(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isStationEditMode, setIsStationEditMode] = useState(false);
  const [stationEditData, setStationEditData] = useState(null);
  const [stationSearchField, setStationSearchField] = useState(''); // tracks which field is being searched
  const [historyStationSearchField, setHistoryStationSearchField] = useState('');


  // State for suggestions
  const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [historyEmployeeSuggestions, setHistoryEmployeeSuggestions] = useState([]);
  const [showHistorySuggestions, setShowHistorySuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState({
    pending: false,
    history: false,
  });
  const [stationSuggestions, setStationSuggestions] = useState([]);
  const [historyStationSuggestions, setHistoryStationSuggestions] = useState([]);
  const [isStationSearching, setIsStationSearching] = useState({
    fromStation: false,
    toStation: false,
    historyFromStation: false,
    historyToStation: false,
  });

  // Separate table filter and states
  const [activeTab, setActiveTab] = useState("pending");
  const [postingHistory, setPostingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [filters, setFilters] = useState({
    employeeName: [],
    fromStation: [], // Changed to array
    toStation: [], // Changed to array
    date: "",
  });

  const [historyFilters, setHistoryFilters] = useState({
    employeeName: [],
    fromStation: [], // Changed to array
    toStation: [], // Changed to array
    date: "",
    isApproved: "",
  });
  const [historyPagination, setHistoryPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Selection state for bulk actions
  const [selectedAssignments, setSelectedAssignments] = useState(new Set());
  const { createStation, modifyStation } = useStations();

  const navigate = useNavigate();

  // Function to fetch employee suggestions using getEmployeesWithoutPagination
  const fetchEmployeeSuggestions = async (query, isHistory = false) => {
    if (!query.trim() || query.length < 2) {
      isHistory ? setHistoryEmployeeSuggestions([]) : setEmployeeSuggestions([]);
      setIsSearching((prev) => ({ ...prev, [isHistory ? "history" : "pending"]: false }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, [isHistory ? "history" : "pending"]: true }));

    try {
      console.log('Fetching suggestions for query:', query); // Debug log
      const response = await getEmployeesWithoutPagination({ name: query });

      console.log('API Response:', response); // Debug log

      if (response.success && response.data) {
        // Handle different response structures
        let employeeData = [];

        if (Array.isArray(response.data)) {
          employeeData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          employeeData = response.data.data;
        } else if (response.data.employees && Array.isArray(response.data.employees)) {
          employeeData = response.data.employees;
        }

        console.log('Employee data extracted:', employeeData); // Debug log

        const formatted = employeeData.map((emp) => {
          const firstName = (emp.firstName || "").trim();
          const lastName = (emp.lastName || "").trim();
          const fullName = `${firstName} ${lastName}`.trim() || firstName || lastName;

          return {
            _id: emp._id,
            firstName: firstName,
            lastName: lastName,
            fullName: fullName,
            fatherFirstName: (emp.fatherFirstName || "").trim(),
            rank: (emp.rank || "").trim(),
            grade: (emp.grade || "").trim(),
            cnic: (emp.cnic || "").trim(),
            personalNumber: (emp.personalNumber || "").trim(),
          };
        }).filter(emp => emp.fullName); // Filter out employees without names

        console.log('Formatted suggestions:', formatted); // Debug log

        isHistory
          ? setHistoryEmployeeSuggestions(formatted)
          : setEmployeeSuggestions(formatted);
      } else {
        console.log('No valid data in response:', response);
        isHistory ? setHistoryEmployeeSuggestions([]) : setEmployeeSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching employee suggestions:", error);
      isHistory ? setHistoryEmployeeSuggestions([]) : setEmployeeSuggestions([]);
    } finally {
      setIsSearching((prev) => ({ ...prev, [isHistory ? "history" : "pending"]: false }));
    }
  }

  const fetchStationSuggestions = async (query, stationType, isHistory = false) => {
    if (!query.trim() || query.length < 2) {
      if (isHistory) {
        setHistoryStationSuggestions([]);
      } else {
        setStationSuggestions([]);
      }
      setIsStationSearching(prev => ({
        ...prev,
        [isHistory ? `history${stationType.charAt(0).toUpperCase() + stationType.slice(1)}` : stationType]: false
      }));
      return;
    }

    setIsStationSearching(prev => ({
      ...prev,
      [isHistory ? `history${stationType.charAt(0).toUpperCase() + stationType.slice(1)}` : stationType]: true
    }));

    try {
      console.log('Fetching station suggestions for query:', query);
      const response = await getAllStationsWithoutPage({ name: query });

      console.log('Station API Response:', response);

      if (response.success && response.data.result) {
        let stationData = [];

        if (Array.isArray(response.data.result)) {
          stationData = response.data.result;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          stationData = response.data.data;
        } else if (response.data.stations && Array.isArray(response.data.stations)) {
          stationData = response.data.stations;
        }

        console.log('Station data extracted:', stationData);

        const formatted = stationData.map((station) => ({
          _id: station._id,
          name: station.name || "",
          location: station.location || "",
          type: station.type || "",
          code: station.code || ""
        })).filter(station => station.name);

        console.log('Formatted station suggestions:', formatted);

        if (isHistory) {
          setHistoryStationSuggestions(formatted);
        } else {
          setStationSuggestions(formatted);
        }
      } else {
        console.log('No valid station data in response:', response);
        if (isHistory) {
          setHistoryStationSuggestions([]);
        } else {
          setStationSuggestions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching station suggestions:", error);
      if (isHistory) {
        setHistoryStationSuggestions([]);
      } else {
        setStationSuggestions([]);
      }
    } finally {
      setIsStationSearching(prev => ({
        ...prev,
        [isHistory ? `history${stationType.charAt(0).toUpperCase() + stationType.slice(1)}` : stationType]: false
      }));
    }
  }
  // Handle filter change for MultiTextInput
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "employeeName" && value.length > 0) {
      fetchEmployeeSuggestions(value[value.length - 1]);
      setShowSuggestions(true);
    } else if (name === "employeeName" && value.length === 0) {
      setShowSuggestions(false);
      setEmployeeSuggestions([]);
    }

    // Handle station suggestions
    if ((name === "fromStation" || name === "toStation") && Array.isArray(value) && value.length > 0) {
      fetchStationSuggestions(value[value.length - 1], name, false);
    }
  };

  // Handle history filter change for MultiTextInput
  const handleHistoryFilterChange = (e) => {
    const { name, value } = e.target;
    setHistoryFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "employeeName" && value.length > 0) {
      fetchEmployeeSuggestions(value[value.length - 1], true);
      setShowHistorySuggestions(true);
    } else if (name === "employeeName" && value.length === 0) {
      setShowHistorySuggestions(false);
      setHistoryEmployeeSuggestions([]);
    }

    // Handle station suggestions for history
    if ((name === "fromStation" || name === "toStation") && Array.isArray(value) && value.length > 0) {
      fetchStationSuggestions(value[value.length - 1], name, true);
    }
  };
  // Handle suggestion selection
  const handleSuggestionSelect = (employee, isHistory = false) => {
    const employeeName = employee.fullName || `${employee.firstName} ${employee.lastName}`.trim();
    if (isHistory) {
      setHistoryFilters((prev) => ({
        ...prev,
        employeeName: [...new Set([...prev.employeeName, employeeName])], // Avoid duplicates
      }));
      setShowHistorySuggestions(false);
      setHistoryEmployeeSuggestions([]);
    } else {
      setFilters((prev) => ({
        ...prev,
        employeeName: [...new Set([...prev.employeeName, employeeName])], // Avoid duplicates
      }));
      setShowSuggestions(false);
      setEmployeeSuggestions([]);
    }
  };

  // Fixed function to fetch posting history with proper filtering
  const fetchPostingHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "400",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Add filters if they exist
      if (historyFilters.date) {
        queryParams.append("startDate", historyFilters.date);
        queryParams.append("endDate", historyFilters.date);
      }
      if (historyFilters.isApproved) {
        queryParams.append("isApproved", historyFilters.isApproved);
      }

      const response = await fetch(
        `http://localhost:5000/api/station-history?${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        let historyData = result.data || [];

        // Apply client-side filtering for fields not supported by API
        if (historyFilters.employeeName.length > 0) {
          historyData = historyData.filter((record) => {
            const firstName = record.employee?.firstName || "";
            const lastName = record.employee?.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            return historyFilters.employeeName.some((name) =>
              fullName.toLowerCase().includes(name.toLowerCase())
            );
          });
        }

        // Fixed: Handle fromStation as array
        if (historyFilters.fromStation.length > 0) {
          historyData = historyData.filter((record) => {
            const fromStation = record.lastStation?.name || "";
            return historyFilters.fromStation.some((stationName) =>
              fromStation.toLowerCase().includes(stationName.toLowerCase())
            );
          });
        }

        // Fixed: Handle toStation as array  
        if (historyFilters.toStation.length > 0) {
          historyData = historyData.filter((record) => {
            const toStation = record.currentStation?.name || "";
            return historyFilters.toStation.some((stationName) =>
              toStation.toLowerCase().includes(stationName.toLowerCase())
            );
          });
        }

        setPostingHistory(historyData);
        setHistoryPagination(result.pagination || {});
      } else {
        toast.error(result.message || "Failed to fetch posting history");
        setPostingHistory([]);
      }
    } catch (error) {
      console.error("Error fetching posting history:", error);
      toast.error("Error fetching posting history");
      setPostingHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Clear history filters
  const clearHistoryFilters = () => {
    setHistoryFilters({
      employeeName: [],
      fromStation: [],
      toStation: [],
      date: "",
      isApproved: "",
    });
    setShowHistorySuggestions(false);
    setHistoryEmployeeSuggestions([]);
    setHistoryStationSuggestions([]);
  };
  // Check if history filters are active
  const hasActiveHistoryFilters = () => {
    return (
      historyFilters.employeeName.length > 0 ||
      historyFilters.fromStation.length > 0 ||
      historyFilters.toStation.length > 0 ||
      historyFilters.date !== "" ||
      historyFilters.isApproved !== ""
    );
  };

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPendingApprovals();

      if (result.success) {
        let assignmentsData = [];

        if (result.data) {
          if (Array.isArray(result.data)) {
            assignmentsData = result.data;
          } else if (Array.isArray(result.data.data)) {
            assignmentsData = result.data.data;
          } else if (typeof result.data === "object" && result.data._id) {
            assignmentsData = [result.data];
          }
        }

        setPendingAssignments(assignmentsData);
      } else {
        setError(result.error || "Failed to fetch pending approvals");
        setPendingAssignments([]);
      }
    } catch (error) {
      setError(
        error.message || "An error occurred while fetching pending approvals"
      );
      setPendingAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStationSuggestionSelect = (station, stationType, isHistory = false) => {
    const stationName = station.name || station;

    if (isHistory) {
      setHistoryFilters((prev) => ({
        ...prev,
        [stationType]: [...new Set([...prev[stationType], stationName])],
      }));
      setHistoryStationSuggestions([]);
    } else {
      setFilters((prev) => ({
        ...prev,
        [stationType]: [...new Set([...prev[stationType], stationName])],
      }));
      setStationSuggestions([]);
    }
  };

  // Apply filters for pending approvals
  const applyFilters = () => {
    if (!Array.isArray(pendingAssignments)) {
      setFilteredAssignments([]);
      return;
    }

    let filtered = [...pendingAssignments];

    // Employee name filter
    if (filters.employeeName.length > 0) {
      filtered = filtered.filter((assignment) => {
        const firstName = assignment.employee?.firstName || "";
        const lastName = assignment.employee?.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        return filters.employeeName.some((name) =>
          fullName.toLowerCase().includes(name.toLowerCase())
        );
      });
    }

    // Date filter
    if (filters.date) {
      filtered = filtered.filter((assignment) => {
        const assignmentDate = new Date(assignment.createdAt)
          .toISOString()
          .split("T")[0];
        return assignmentDate === filters.date;
      });
    }

    // From station filter - updated to handle arrays
    if (filters.fromStation.length > 0) {
      filtered = filtered.filter((assignment) => {
        const fromStation = Array.isArray(assignment.lastStation)
          ? assignment.lastStation?.[0]?.name || ""
          : assignment.lastStation?.name || "";
        return filters.fromStation.some((name) =>
          fromStation.toLowerCase().includes(name.toLowerCase())
        );
      });
    }

    // To station filter - updated to handle arrays
    if (filters.toStation.length > 0) {
      filtered = filtered.filter((assignment) => {
        const toStation = Array.isArray(assignment.currentStation)
          ? assignment.currentStation?.[0]?.name || ""
          : assignment.currentStation?.name || "";
        return filters.toStation.some((name) =>
          toStation.toLowerCase().includes(name.toLowerCase())
        );
      });
    }

    setFilteredAssignments(filtered);
  };

  // Clear filters for pending approvals
  const clearFilters = () => {
    setFilters({
      employeeName: [],
      fromStation: [],
      toStation: [],
      date: "",
    });
    setShowSuggestions(false);
    setEmployeeSuggestions([]);
    setStationSuggestions([]);
  };

  // Check if filters are active for pending approvals
  const hasActiveFilters = () => {
    return (
      filters.employeeName.length > 0 ||
      filters.fromStation.length > 0 ||
      filters.toStation.length > 0 ||
      filters.date !== ""
    );
  };


  // Approve assignment
  const handleApprove = async (assignment) => {
    const firstName = assignment.employee?.firstName || "";
    const lastName = assignment.employee?.lastName || "";
    const employeeName = `${firstName} ${lastName}`.trim() || "this employee";

    if (
      !window.confirm(
        `Are you sure you want to approve the station assignment for ${employeeName}?`
      )
    ) {
      return;
    }

    try {
      const result = await approveStationAssignment(assignment._id);
      if (result.success) {
        toast.success("Station assignment approved successfully");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Bulk approve selected assignments
  const handleBulkApprove = async (selectedIds) => {
    if (selectedIds.length === 0) {
      toast.warning("Please select assignments to approve");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to approve ${selectedIds.length} selected assignment(s)?`
      )
    ) {
      return;
    }

    try {
      const promises = selectedIds.map((id) => approveStationAssignment(id));
      const results = await Promise.all(promises);

      const successful = results.filter((result) => result.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} assignment(s) approved successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} assignment(s) failed to approve`);
      }

      window.location.reload();
    } catch (error) {
      toast.error("Error occurred during bulk approval");
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) {
      toast.warning("Please select assignments to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected assignment(s)?`
      )
    ) {
      return;
    }

    try {
      const promises = selectedIds.map((id) => deleteStationAssignment(id));
      const results = await Promise.all(promises);

      const successful = results.filter((result) => result.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} assignment(s) deleted successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} assignment(s) failed to delete`);
      }

      window.location.reload();
    } catch (error) {
      toast.error("Error occurred during bulk deletion");
    }
  };

  const handleBulkReject = async (selectedIds) => {
    if (selectedIds.length === 0) {
      toast.warning("Please select assignments to reject");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to reject ${selectedIds.length} selected assignment(s)?`
      )
    ) {
      return;
    }

    try {
      const promises = selectedIds.map((id) => rejectStationAssignment(id));
      const results = await Promise.all(promises);

      const successful = results.filter((result) => result.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} assignment(s) rejected successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} assignment(s) failed to reject`);
      }

      window.location.reload();
    } catch (error) {
      toast.error("Error occurred during bulk rejection");
    }
  };

  // Delete assignment
  const handleDelete = async (assignmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this station assignment request?"
      )
    ) {
      return;
    }

    try {
      const result = await deleteStationAssignment(assignmentId);
      if (result.success) {
        toast.success("Station assignment deleted successfully");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (assignmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this station assignment request?"
      )
    ) {
      return;
    }

    try {
      const result = await rejectStationAssignment(assignmentId);
      if (result.success) {
        toast.success("Station assignment rejected successfully");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAssignments(new Set(filteredAssignments.map((a) => a._id)));
    } else {
      setSelectedAssignments(new Set());
    }
  };

  const handleBulkStationAssignment = () => {
    navigate("/bulk-station-assignment");
  };

  const handleSelectAssignment = (assignmentId, checked) => {
    const newSelected = new Set(selectedAssignments);
    if (checked) {
      newSelected.add(assignmentId);
    } else {
      newSelected.delete(assignmentId);
    }
    setSelectedAssignments(newSelected);
  };

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
    console.log("handleStationEdit called with:", stationData);
    setIsStationEditMode(true);
    setStationEditData(stationData);
    setIsStationModalOpen(true);
  };

  const handleCloseStationModal = () => {
    setIsStationModalOpen(false);
    setIsStationEditMode(false);
    setStationEditData(null);
  };

  // Effects
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, pendingAssignments, loading]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [refreshTrigger]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchPostingHistory(1);
    }
  }, [activeTab, historyFilters]);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "pending"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Pending Approvals
            {pendingAssignments.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                {pendingAssignments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "history"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Posting History
          </button>
        </nav>
      </div>

      {/* Pending Approvals Tab Content */}
      {activeTab === "pending" && (
        <>
          {/* Header with Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Transfer Posting Management
              </h2>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <MultiTextInputField
                  label="Employee Name"
                  name="employeeName"
                  value={historyFilters.employeeName}
                  onChange={handleHistoryFilterChange}
                  placeholder="Type employee name..."
                  minLength={2}
                  maxLength={50}
                  enableSuggestions={true}
                  onSearch={(query) => fetchEmployeeSuggestions(query, true)}
                  suggestions={historyEmployeeSuggestions}
                  isSearching={isSearching.history}
                  searchPlaceholder="Type to search employee names..."
                  emptyMessage="No employee names found"
                  minSearchLength={2}
                  onSuggestionSelect={(employee) => handleSuggestionSelect(employee, true)}
                />
              </div>

              <div className="relative">
                <MultiTextInput
                  label="From Station"
                  name="fromStation"
                  value={filters.fromStation}
                  onChange={handleFilterChange}
                  placeholder="Type station name..."
                  minLength={2}
                  maxLength={50}
                  enableSuggestions={true}
                  onSearch={(query) => fetchStationSuggestions(query, 'fromStation', false)}
                  suggestions={stationSuggestions.map(station => station.name)}
                  isSearching={isStationSearching.fromStation}
                  searchPlaceholder="Type to search station names..."
                  emptyMessage="No stations found"
                  minSearchLength={2}
                  onSuggestionSelect={(stationName) => handleStationSuggestionSelect({ name: stationName }, 'fromStation', false)}
                />
              </div>

              <div className="relative">
                <MultiTextInput
                  label="To Station"
                  name="toStation"
                  value={filters.toStation}
                  onChange={handleFilterChange}
                  placeholder="Type station name..."
                  minLength={2}
                  maxLength={50}
                  enableSuggestions={true}
                  onSearch={(query) => fetchStationSuggestions(query, 'toStation', false)}
                  suggestions={stationSuggestions.map(station => station.name)}
                  isSearching={isStationSearching.toStation}
                  searchPlaceholder="Type to search station names..."
                  emptyMessage="No stations found"
                  minSearchLength={2}
                  onSuggestionSelect={(stationName) => handleStationSuggestionSelect({ name: stationName }, 'toStation', false)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={historyFilters.date || ""}
                  onChange={handleHistoryFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="isApproved"
                  value={historyFilters.isApproved}
                  onChange={handleHistoryFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="true">Approved</option>
                  <option value="false">Rejected</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 mt-5">
              {selectedAssignments.size > 0 && (
                <button
                  onClick={() =>
                    handleBulkApprove(Array.from(selectedAssignments))
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve Selected ({selectedAssignments.size})
                </button>
              )}
              {selectedAssignments.size > 0 && (
                <button
                  onClick={() =>
                    handleBulkDelete(Array.from(selectedAssignments))
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Selected ({selectedAssignments.size})
                </button>
              )}
              {selectedAssignments.size > 0 && (
                <button
                  onClick={() =>
                    handleBulkReject(Array.from(selectedAssignments))
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Reject Selected ({selectedAssignments.size})
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
                <span className="hidden lg:inline">Bulk Station Assignment</span>
                <span className="lg:hidden">Bulk Assignment</span>
              </button>
              <div className="flex items-center space-x-2">
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Pending Approvals Found
                </h3>
                <p className="text-gray-600">
                  {hasActiveFilters()
                    ? "No pending assignments match the selected filters."
                    : "All station assignment requests have been processed."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            filteredAssignments.length > 0 &&
                            selectedAssignments.size === filteredAssignments.length
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transfer Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
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
                    {filteredAssignments?.map((assignment) => {
                      const firstName = assignment.employee?.firstName || "";
                      const lastName = assignment.employee?.lastName || "";
                      const employeeName =
                        `${firstName} ${lastName}`.trim() || "Unknown Employee";

                      // Handle both array and object structures for stations
                      const fromStation = Array.isArray(assignment.lastStation)
                        ? assignment.lastStation?.[0]
                        : assignment.lastStation;

                      const toStation = Array.isArray(assignment.currentStation)
                        ? assignment.currentStation?.[0]
                        : assignment.currentStation;

                      return (
                        <tr key={assignment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedAssignments.has(assignment._id)}
                              onChange={(e) =>
                                handleSelectAssignment(
                                  assignment._id,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">
                                <span
                                  onClick={() =>
                                    handleEmployeeView(assignment.employee)
                                  }
                                  className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                                >
                                  {employeeName}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {assignment.employee?.personalNumber || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Rank: {assignment.employee?.rank || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Grade: {assignment.employee?.grade || "N/A"}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <span className="text-gray-500 mr-2 font-medium">
                                  From:
                                </span>
                                <span
                                  onClick={() =>
                                    fromStation && handleStationView(fromStation)
                                  }
                                  className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                                >
                                  {fromStation?.name || "No Previous Station"}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 text-gray-400 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </div>
                              <div className="flex items-center text-sm">
                                <span className="text-gray-500 mr-2 font-medium">
                                  To:
                                </span>
                                <span
                                  onClick={() =>
                                    toStation && handleStationView(toStation)
                                  }
                                  className="text-blue-900 font-semibold hover:text-blue-700 cursor-pointer hover:underline"
                                >
                                  {toStation?.name || "Unknown Station"}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Effective: {formatDate(assignment.fromDate)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {formatDate(assignment.createdAt)}
                            </div>
                            {assignment.editBy && (
                              <div className="text-xs text-gray-500">
                                Requested by: {assignment.editBy.firstName}{" "}
                                {assignment.editBy.lastName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              <div className="text-sm text-gray-500">
                                {assignment.remarks || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleApprove(assignment)}
                                className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                title="Approve Assignment"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
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
                                Approve
                              </button>
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(assignment)}
                                  className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                  title="Edit Assignment"
                                >
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(assignment._id)}
                                className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                title="Delete Assignment"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
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
                                Delete
                              </button>
                              <button
                                onClick={() => handleReject(assignment._id)}
                                className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                title="Reject Assignment"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
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
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Posting History Tab Content */}
      {activeTab === "history" && (
        <>
          {/* History Header with Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Employee Posting History
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing {postingHistory.length} of{" "}
                  {historyPagination.totalRecords || 0} records
                </span>
                {hasActiveHistoryFilters() && (
                  <button
                    onClick={clearHistoryFilters}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* History Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <MultiTextInputField
                  label="Employee Name"
                  name="employeeName"
                  value={historyFilters.employeeName}
                  onChange={handleHistoryFilterChange}
                  placeholder="Type employee name..."
                  minLength={2}
                  maxLength={50}
                  enableSuggestions={true}
                  onSearch={(query) => fetchEmployeeSuggestions(query, true)}
                  suggestions={historyEmployeeSuggestions}
                  isSearching={isSearching.history}
                  searchPlaceholder="Type to search employee names..."
                  emptyMessage="No employee names found"
                  minSearchLength={2}
                  onSuggestionSelect={(employee) => handleSuggestionSelect(employee, true)}
                />
              </div>

              <div className="relative">
                <MultiTextInput
                  label="From Station"
                  name="fromStation"
                  value={historyFilters.fromStation}
                  onChange={handleHistoryFilterChange}
                  placeholder="Type station name..."
                  minLength={2}
                  maxLength={50}
                  enableSuggestions={true}
                  onSearch={(query) => fetchStationSuggestions(query, 'fromStation', true)}
                  suggestions={historyStationSuggestions.map(station => station.name)}
                  isSearching={isStationSearching.historyFromStation}
                  searchPlaceholder="Type to search station names..."
                  emptyMessage="No stations found"
                  minSearchLength={2}
                  onSuggestionSelect={(stationName) => handleStationSuggestionSelect({ name: stationName }, 'fromStation', true)}
                />
              </div>

              <div className="relative">
                <MultiTextInput
                  label="To Station"
                  name="toStation"
                  value={historyFilters.toStation}
                  onChange={handleHistoryFilterChange}
                  placeholder="Type station name..."
                  minLength={2}
                  maxLength={50}
                  enableSuggestions={true}
                  onSearch={(query) => fetchStationSuggestions(query, 'toStation', true)}
                  suggestions={historyStationSuggestions.map(station => station.name)}
                  isSearching={isStationSearching.historyToStation}
                  searchPlaceholder="Type to search station names..."
                  emptyMessage="No stations found"
                  minSearchLength={2}
                  onSuggestionSelect={(stationName) => handleStationSuggestionSelect({ name: stationName }, 'toStation', true)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={historyFilters.date || ""}
                  onChange={handleHistoryFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="isApproved"
                  value={historyFilters.isApproved}
                  onChange={handleHistoryFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="true">Approved</option>
                  <option value="false">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="p-6">
            {historyLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : postingHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Posting History Found
                </h3>
                <p className="text-gray-600">
                  {hasActiveHistoryFilters()
                    ? "No posting records match the selected filters."
                    : "No employee posting records found."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transfer Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Effective Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Approved By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {postingHistory.map((record) => {
                        const firstName = record.employee?.firstName || "";
                        const lastName = record.employee?.lastName || "";
                        const employeeName =
                          `${firstName} ${lastName}`.trim() ||
                          "Unknown Employee";
                        const approverName = record.isApprovedBy
                          ? `${record.isApprovedBy.firstName || ""} ${record.isApprovedBy.lastName || ""
                            }`.trim()
                          : "";

                        return (
                          <tr key={record._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">
                                  <span
                                    onClick={() =>
                                      handleEmployeeView(record.employee)
                                    }
                                    className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                                  >
                                    {employeeName}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {record.employee?.personalNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Rank: {record.employee?.rank || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Grade: {record.employee?.grade || "N/A"}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <span className="text-gray-500 mr-2 font-medium">
                                    From:
                                  </span>
                                  <span
                                    onClick={() =>
                                      record?.lastStation &&
                                      handleStationView(record.lastStation)
                                    }
                                    className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                                  >
                                    {record?.lastStation?.name ||
                                      "No Previous Station"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 text-gray-400 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                                    />
                                  </svg>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-gray-500 mr-2 font-medium">
                                    To:
                                  </span>
                                  <span
                                    onClick={() =>
                                      record?.currentStation &&
                                      handleStationView(record.currentStation)
                                    }
                                    className="text-blue-900 font-semibold hover:text-blue-700 cursor-pointer hover:underline"
                                  >
                                    {record?.currentStation?.name ||
                                      "Unknown Station"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {formatDate(record.fromDate)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Created: {formatDate(record.createdAt)}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${record.isApproved === true
                                  ? "bg-green-100 text-green-800"
                                  : record.isApproved === false
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {record.isApproved === true
                                  ? "Approved"
                                  : record.isApproved === false
                                    ? "Rejected"
                                    : "Pending"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {approverName || "N/A"}
                              </div>
                              {record.approvedAt && (
                                <div className="text-xs text-gray-500">
                                  {formatDate(record.approvedAt)}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                {record.remarks || "N/A"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {historyPagination.totalPages > 1 && (
                  <div
                    className="sticky bottom-0 left-0 z-50 bg-white border-t border-gray-200
               flex items-center justify-between px-4 py-3 shadow-sm"
                  >
                    <div className="text-sm text-gray-700">
                      Showing page {historyPagination.currentPage} of{" "}
                      {historyPagination.totalPages}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchPostingHistory(historyPagination.currentPage - 1)}
                        disabled={!historyPagination.hasPrev}
                        className={`px-3 py-2 text-sm rounded-md ${historyPagination.hasPrev
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        Previous
                      </button>

                      <span className="text-sm text-gray-600">
                        {historyPagination.currentPage} / {historyPagination.totalPages}
                      </span>

                      <button
                        onClick={() => fetchPostingHistory(historyPagination.currentPage + 1)}
                        disabled={!historyPagination.hasNext}
                        className={`px-3 py-2 text-sm rounded-md ${historyPagination.hasNext
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        </>
      )}

      {/* Modals */}
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

export default PendingStationApprovals;




























// // PendingStationApprovals.jsx
// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import {
//   getPendingApprovals,
//   approveStationAssignment,
//   deleteStationAssignment,
//   rejectStationAssignment,
// } from "../StationAssignment/StationAssignmentApi.js";
// import { useNavigate } from "react-router-dom";
// import { useGlobalStationView } from "../Station/GlobalStationView.jsx";
// import StationViewModal from "../Station/ViewStation/ViewStation.jsx";
// import EmployeeViewModal from "../Employee/ViewEmployee/ViewEmployee.jsx";
// import StationModal from "../Station/AddStation/AddStation.jsx";
// import { useStations } from "../Station/StationHook.js";

// const PendingStationApprovals = ({ onEdit }) => {
//   const [pendingAssignments, setPendingAssignments] = useState([]);
//   const [filteredAssignments, setFilteredAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const { openStationView } = useGlobalStationView();
//   const [isEmployeeViewModalOpen, setIsEmployeeViewModalOpen] = useState(false);
//   const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
//   const [isStationViewModalOpen, setIsStationViewModalOpen] = useState(false);
//   const [selectedStationForView, setSelectedStationForView] = useState(null);
//   const [isStationModalOpen, setIsStationModalOpen] = useState(false);
//   const [isStationEditMode, setIsStationEditMode] = useState(false);
//   const [stationEditData, setStationEditData] = useState(null);

//   // Filter state
//   const [filters, setFilters] = useState({
//     employeeName: "",
//     fromStation: "",
//     toStation: "",
//     dateRange: "",
//   });

//   // Selection state for bulk actions
//   const [selectedAssignments, setSelectedAssignments] = useState(new Set());
//   const { createStation, modifyStation } = useStations();

//   // Date range options
//   const dateRangeOptions = [
//     { value: "today", label: "Today" },
//     { value: "week", label: "This Week" },
//     { value: "month", label: "This Month" },
//     { value: "quarter", label: "This Quarter" },
//   ];

//   const navigate = useNavigate();

//   // Fetch pending approvals
//   const fetchPendingApprovals = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const result = await getPendingApprovals();

//       if (result.success) {
//         let assignmentsData = [];

//         if (result.data) {
//           if (Array.isArray(result.data)) {
//             assignmentsData = result.data;
//           } else if (Array.isArray(result.data.data)) {
//             assignmentsData = result.data.data;
//           } else if (typeof result.data === "object" && result.data._id) {
//             assignmentsData = [result.data];
//           }
//         }

//         setPendingAssignments(assignmentsData);
//       } else {
//         setError(result.error || "Failed to fetch pending approvals");
//         setPendingAssignments([]);
//       }
//     } catch (error) {
//       setError(
//         error.message || "An error occurred while fetching pending approvals"
//       );
//       setPendingAssignments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Apply filters
//   const applyFilters = () => {
//     if (!Array.isArray(pendingAssignments)) {
//       setFilteredAssignments([]);
//       return;
//     }

//     let filtered = [...pendingAssignments];

//     // Employee name filter
//     if (filters.employeeName) {
//       filtered = filtered.filter((assignment) => {
//         const firstName = assignment.employee?.firstName || "";
//         const lastName = assignment.employee?.lastName || "";
//         const fullName = `${firstName} ${lastName}`.trim();
//         return fullName
//           .toLowerCase()
//           .includes(filters.employeeName.toLowerCase());
//       });
//     }

//     // Department filter
//     if (filters.department) {
//       filtered = filtered.filter((assignment) => {
//         const department = assignment.employee?.department?.name || "";
//         return department
//           .toLowerCase()
//           .includes(filters.department.toLowerCase());
//       });
//     }
//     if (filters.date) {
//       filtered = filtered.filter((assignment) => {
//         // Replace "createdAt" with your actual date field
//         const assignmentDate = new Date(assignment.createdAt)
//           .toISOString()
//           .split("T")[0]; // format YYYY-MM-DD

//         return assignmentDate === filters.date;
//       });
//     }

//     // From station filter
//     if (filters.fromStation) {
//       filtered = filtered.filter((assignment) => {
//         // const fromStation = assignment.lastStation?.name || "";
//         const fromStation = assignment.lastStation?.[0]?.name || "";

//         return fromStation
//           .toLowerCase()
//           .includes(filters.fromStation.toLowerCase());
//       });
//     }

//     // To station filter
//     if (filters.toStation) {
//       filtered = filtered.filter((assignment) => {
//         // const toStation = assignment.currentStation?.name || "";
//         const toStation = assignment.currentStation?.[0]?.name || "";

//         return toStation
//           .toLowerCase()
//           .includes(filters.toStation.toLowerCase());
//       });
//     }

//     setFilteredAssignments(filtered);
//   };

//   // Handle filter changes
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Clear filters
//   const clearFilters = () => {
//     setFilters({
//       employeeName: "",
//       fromStation: "",
//       toStation: "",
//       date: "",
//     });
//   };

//   // Approve assignment
//   const handleApprove = async (assignment) => {
//     const firstName = assignment.employee?.firstName || "";
//     const lastName = assignment.employee?.lastName || "";
//     const employeeName = `${firstName} ${lastName}`.trim() || "this employee";

//     if (
//       !window.confirm(
//         `Are you sure you want to approve the station assignment for ${employeeName}?`
//       )
//     ) {
//       return;
//     }

//     try {
//       const result = await approveStationAssignment(assignment._id);
//       if (result.success) {
//         toast.success("Station assignment approved successfully");
//         // setRefreshTrigger(prev => prev + 1);
//         window.location.reload(); // Add this line
//       } else {
//         toast.error(result.error);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Bulk approve selected assignments
//   const handleBulkApprove = async (selectedIds) => {
//     if (selectedIds.length === 0) {
//       toast.warning("Please select assignments to approve");
//       return;
//     }

//     if (
//       !window.confirm(
//         `Are you sure you want to approve ${selectedIds.length} selected assignment(s)?`
//       )
//     ) {
//       return;
//     }

//     try {
//       const promises = selectedIds.map((id) => approveStationAssignment(id));
//       const results = await Promise.all(promises);

//       const successful = results.filter((result) => result.success).length;
//       const failed = results.length - successful;

//       if (successful > 0) {
//         toast.success(`${successful} assignment(s) approved successfully`);
//       }
//       if (failed > 0) {
//         toast.error(`${failed} assignment(s) failed to approve`);
//       }

//       // setRefreshTrigger(prev => prev + 1);
//       window.location.reload(); // Add this line
//     } catch (error) {
//       toast.error("Error occurred during bulk approval");
//     }
//   };
//   const handleBulkDelete = async (selectedIds) => {
//     if (selectedIds.length === 0) {
//       toast.warning("Please select assignments to delete");
//       return;
//     }

//     if (
//       !window.confirm(
//         `Are you sure you want to delete ${selectedIds.length} selected assignment(s)?`
//       )
//     ) {
//       return;
//     }

//     try {
//       const promises = selectedIds.map((id) => deleteStationAssignment(id));
//       const results = await Promise.all(promises);

//       const successful = results.filter((result) => result.success).length;
//       const failed = results.length - successful;

//       if (successful > 0) {
//         toast.success(`${successful} assignment(s) deleted successfully`);
//       }
//       if (failed > 0) {
//         toast.error(`${failed} assignment(s) failed to delete`);
//       }

//       // setRefreshTrigger(prev => prev + 1);
//       window.location.reload(); // Add this line
//     } catch (error) {
//       toast.error("Error occurred during bulk deletion");
//     }
//   };
//   const handleBulkReject = async (selectedIds) => {
//     if (selectedIds.length === 0) {
//       toast.warning("Please select assignments to reject");
//       return;
//     }

//     if (
//       !window.confirm(
//         `Are you sure you want to reject ${selectedIds.length} selected assignment(s)?`
//       )
//     ) {
//       return;
//     }

//     try {
//       const promises = selectedIds.map((id) => rejectStationAssignment(id));
//       const results = await Promise.all(promises);

//       const successful = results.filter((result) => result.success).length;
//       const failed = results.length - successful;

//       if (successful > 0) {
//         toast.success(`${successful} assignment(s) rejected successfully`);
//       }
//       if (failed > 0) {
//         toast.error(`${failed} assignment(s) failed to reject`);
//       }

//       // setRefreshTrigger(prev => prev + 1);
//       window.location.reload(); // Add this line
//     } catch (error) {
//       toast.error("Error occurred during bulk rejection");
//     }
//   };

//   // Delete assignment
//   const handleDelete = async (assignmentId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this station assignment request?"
//       )
//     ) {
//       return;
//     }

//     try {
//       const result = await deleteStationAssignment(assignmentId);
//       if (result.success) {
//         toast.success("Station assignment deleted successfully");
//         // setRefreshTrigger(prev => prev + 1);
//         window.location.reload(); // Add this line
//       } else {
//         toast.error(result.error);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleReject = async (assignmentId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to reject this station assignment request?"
//       )
//     ) {
//       return;
//     }

//     try {
//       const result = await rejectStationAssignment(assignmentId);
//       if (result.success) {
//         toast.success("Station assignment rejected successfully");
//         // setRefreshTrigger(prev => prev + 1);
//         window.location.reload(); // Add this line
//       } else {
//         toast.error(result.error);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch {
//       return "N/A";
//     }
//   };

//   // Check if filters are active
//   const hasActiveFilters = () => {
//     return Object.values(filters).some((value) => value !== "");
//   };

//   const handleSelectAll = (checked) => {
//     if (checked) {
//       setSelectedAssignments(new Set(filteredAssignments.map((a) => a._id)));
//     } else {
//       setSelectedAssignments(new Set());
//     }
//   };
//   const handleBulkStationAssignment = () => {
//     navigate("/bulk-station-assignment");
//   };

//   const handleSelectAssignment = (assignmentId, checked) => {
//     const newSelected = new Set(selectedAssignments);
//     if (checked) {
//       newSelected.add(assignmentId);
//     } else {
//       newSelected.delete(assignmentId);
//     }
//     setSelectedAssignments(newSelected);
//   };
//   const handleEmployeeView = (employee) => {
//     setSelectedEmployeeForView(employee);
//     setIsEmployeeViewModalOpen(true);
//   };

//   const handleCloseEmployeeViewModal = () => {
//     setIsEmployeeViewModalOpen(false);
//     setSelectedEmployeeForView(null);
//   };

//   const handleEmployeeEdit = (employeeData) => {
//     navigate("/employee", {
//       state: {
//         isEdit: true,
//         editData: employeeData,
//       },
//     });
//   };

//   const handleStationView = (station) => {
//     setSelectedStationForView(station);
//     setIsStationViewModalOpen(true);
//   };

//   const handleCloseStationViewModal = () => {
//     setIsStationViewModalOpen(false);
//     setSelectedStationForView(null);
//   };

//   const handleStationEdit = (stationData) => {
//     console.log("handleStationEdit called with:", stationData);
//     setIsStationEditMode(true);
//     setStationEditData(stationData);
//     setIsStationModalOpen(true);
//   };
//   const handleCloseStationModal = () => {
//     setIsStationModalOpen(false);
//     setIsStationEditMode(false);
//     setStationEditData(null);
//   };

//   // Effects
//   useEffect(() => {
//     if (!loading) {
//       applyFilters();
//     }
//   }, [filters, pendingAssignments, loading]);

//   useEffect(() => {
//     fetchPendingApprovals();
//   }, [refreshTrigger]);

//   if (loading) {
//     return (
//       <div className="bg-white shadow-md rounded-lg p-6">
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white shadow-md rounded-lg">
//       {/* Header with Filters */}
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-gray-900">
//             Transfer Posting Management
//           </h2>
//           {/* <div className="flex items-center space-x-4">
//             {selectedAssignments.size > 0 && (
//               <button
//                 onClick={() => handleBulkApprove(Array.from(selectedAssignments))}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
//               >
//                 Approve Selected ({selectedAssignments.size})
//               </button>
//             )}
//               <button
//             className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
//             onClick={handleBulkStationAssignment}
//           >
//             <svg
//               className="w-4 h-4 mr-2 flex-shrink-0"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
//               />
//             </svg>
//             <span className="hidden lg:inline">Bulk Station Assignment</span>
//             <span className="lg:hidden">Bulk Assignment</span>
//           </button>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">
//                 Showing {filteredAssignments.length} of {pendingAssignments.length} pending
//               </span>
//               {hasActiveFilters() && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
//                 >
//                   Clear Filters
//                 </button>
//               )}
//             </div>
//           </div> */}
//         </div>

//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Employee Name
//             </label>
//             <input
//               type="text"
//               name="employeeName"
//               value={filters.employeeName}
//               onChange={handleFilterChange}
//               placeholder="Search by name..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               From Station
//             </label>
//             <input
//               type="text"
//               name="fromStation"
//               value={filters.fromStation}
//               onChange={handleFilterChange}
//               placeholder="Search from station..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               To Station
//             </label>
//             <input
//               type="text"
//               name="toStation"
//               value={filters.toStation}
//               onChange={handleFilterChange}
//               placeholder="Search to station..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Date
//             </label>
//             <input
//               type="date"
//               name="date"
//               value={filters.date || ""}
//               onChange={handleFilterChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md
//                focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//           </div>
//         </div>
//         <div className="flex items-center justify-end space-x-4 mt-5">
//           {selectedAssignments.size > 0 && (
//             <button
//               onClick={() => handleBulkApprove(Array.from(selectedAssignments))}
//               className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
//             >
//               Approve Selected ({selectedAssignments.size})
//             </button>
//           )}
//           {selectedAssignments.size > 0 && (
//             <button
//               onClick={() => handleBulkDelete(Array.from(selectedAssignments))}
//               className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//             >
//               Delete Selected ({selectedAssignments.size})
//             </button>
//           )}
//           {selectedAssignments.size > 0 && (
//             <button
//               onClick={() => handleBulkReject(Array.from(selectedAssignments))}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//             >
//               Reject Selected ({selectedAssignments.size})
//             </button>
//           )}
//           {/* <button
//               onClick={() => setRefreshTrigger(prev => prev + 1)}
//               className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
//             >
//               Refresh
//             </button> */}
//           <button
//             className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
//             onClick={handleBulkStationAssignment}
//           >
//             <svg
//               className="w-4 h-4 mr-2 flex-shrink-0"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
//               />
//             </svg>
//             <span className="hidden lg:inline">Bulk Station Assignment</span>
//             <span className="lg:hidden">Bulk Assignment</span>
//           </button>
//           <div className="flex items-center space-x-2">
//             {hasActiveFilters() && (
//               <button
//                 onClick={clearFilters}
//                 className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
//               >
//                 Clear Filters
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="p-6">
//         {error ? (
//           <div className="bg-red-50 border border-red-200 rounded-md p-4">
//             <div className="flex">
//               <svg
//                 className="w-5 h-5 text-red-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-red-800">Error</h3>
//                 <div className="mt-2 text-sm text-red-700">{error}</div>
//               </div>
//             </div>
//           </div>
//         ) : filteredAssignments.length === 0 ? (
//           <div className="text-center py-12">
//             <svg
//               className="w-16 h-16 text-gray-300 mx-auto mb-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="1"
//                 d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No Pending Approvals Found
//             </h3>
//             <p className="text-gray-600">
//               {hasActiveFilters()
//                 ? "No pending assignments match the selected filters."
//                 : "All station assignment requests have been processed."}
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left">
//                     <input
//                       type="checkbox"
//                       checked={
//                         filteredAssignments.length > 0 &&
//                         selectedAssignments.size === filteredAssignments.length
//                       }
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Employee Details
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Transfer Details
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Request Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Remarks
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredAssignments?.map((assignment) => {
//                   const firstName = assignment.employee?.firstName || "";
//                   const lastName = assignment.employee?.lastName || "";
//                   const employeeName =
//                     `${firstName} ${lastName}`.trim() || "Unknown Employee";

//                   return (
//                     <tr key={assignment._id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <input
//                           type="checkbox"
//                           checked={selectedAssignments.has(assignment._id)}
//                           onChange={(e) =>
//                             handleSelectAssignment(
//                               assignment._id,
//                               e.target.checked
//                             )
//                           }
//                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="space-y-1">
//                           <div className="text-sm font-medium text-gray-900">
//                             <span
//                               onClick={() =>
//                                 handleEmployeeView(assignment.employee)
//                               }
//                               className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
//                             >
//                               {employeeName}
//                             </span>
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             ID: {assignment.employee?.personalNumber || "N/A"}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             Rank: {assignment.employee?.rank || "N/A"}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             Grade: {assignment.employee?.grade || "N/A"}
//                           </div>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="space-y-1">
//                           <div className="flex items-center text-sm">
//                             <span className="text-gray-500 mr-2 font-medium">
//                               From:
//                             </span>
//                             <span
//                               onClick={() =>
//                                 assignment?.lastStation?.[0] &&
//                                 handleStationView(assignment.lastStation[0])
//                               }
//                               className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
//                             >
//                               {assignment?.lastStation?.[0]?.name ||
//                                 "No Previous Station"}
//                             </span>
//                           </div>
//                           <div className="flex items-center">
//                             <svg
//                               className="w-4 h-4 text-gray-400 mr-2"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 d="M17 8l4 4m0 0l-4 4m4-4H3"
//                               />
//                             </svg>
//                           </div>
//                           <div className="flex items-center text-sm">
//                             <span className="text-gray-500 mr-2 font-medium">
//                               To:
//                             </span>
//                             <span
//                               onClick={() =>
//                                 assignment?.currentStation?.[0] &&
//                                 handleStationView(assignment.currentStation[0])
//                               }
//                               className="text-blue-900 font-semibold hover:text-blue-700 cursor-pointer hover:underline"
//                             >
//                               {assignment?.currentStation?.[0]?.name ||
//                                 "Unknown Station"}
//                             </span>
//                           </div>
//                           <div className="text-xs text-gray-500 mt-1">
//                             Effective: {formatDate(assignment.fromDate)}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900 font-medium">
//                           {formatDate(assignment.createdAt)}
//                         </div>
//                         {assignment.editBy && (
//                           <div className="text-xs text-gray-500">
//                             Requested by: {assignment.editBy.firstName}{" "}
//                             {assignment.editBy.lastName}
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900 max-w-xs">
//                           <div className="text-sm text-gray-500">
//                             {assignment.remarks || "N/A"}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex items-center space-x-2">
//                           <button
//                             onClick={() => handleApprove(assignment)}
//                             className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
//                             title="Approve Assignment"
//                           >
//                             <svg
//                               className="w-3 h-3 mr-1"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 d="M5 13l4 4L19 7"
//                               />
//                             </svg>
//                             Approve
//                           </button>
//                           {onEdit && (
//                             <button
//                               onClick={() => onEdit(assignment)}
//                               className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
//                               title="Edit Assignment"
//                             >
//                               <svg
//                                 className="w-3 h-3 mr-1"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth="2"
//                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                 />
//                               </svg>
//                               Edit
//                             </button>
//                           )}
//                           <button
//                             onClick={() => handleDelete(assignment._id)}
//                             className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
//                             title="Delete Assignment"
//                           >
//                             <svg
//                               className="w-3 h-3 mr-1"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                               />
//                             </svg>
//                             Delete
//                           </button>
//                           <button
//                             onClick={() => handleReject(assignment._id)}
//                             className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
//                             title="Delete Assignment"
//                           >
//                             <svg
//                               className="w-3 h-3 mr-1"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 d="M6 18L18 6M6 6l12 12"
//                               />
//                             </svg>
//                             Reject
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       <EmployeeViewModal
//         isOpen={isEmployeeViewModalOpen}
//         onClose={handleCloseEmployeeViewModal}
//         employee={selectedEmployeeForView}
//         onEdit={handleEmployeeEdit}
//       />

//       {/* Station View Modal */}
//       <StationViewModal
//         isOpen={isStationViewModalOpen}
//         onClose={handleCloseStationViewModal}
//         station={selectedStationForView}
//         onEdit={handleStationEdit}
//       />
//       <StationModal
//         isOpen={isStationModalOpen}
//         onClose={handleCloseStationModal}
//         isEdit={isStationEditMode}
//         editData={stationEditData}
//         createStation={createStation}
//         modifyStation={modifyStation}
//       />
//     </div>
//   );
// };

// export default PendingStationApprovals;
