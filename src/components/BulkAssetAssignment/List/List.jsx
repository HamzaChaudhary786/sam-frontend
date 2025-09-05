import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { BACKEND_URL } from "../../../constants/api.js";
import { role_admin } from "../../../constants/Enum.js";
import { useNavigate } from "react-router-dom";
import {
  deleteAssetAssignment,
  approveAssetAssignment,
  issueRoundsToAssignment,
  consumeRoundsFromAssignment,
  transferAssetAssignment,
  returnAssetAssignment,
} from "../../AssetAssignment/AssetApi.js";
import IssueRoundsModal from "../../AssetAssignment/IssueRound.jsx";
import ConsumeRoundsModal from "../../AssetAssignment/ConsumeRound.jsx";
import TransferReturnModal from "../../AssetAssignment/TransferAsset.jsx";
import EmployeeViewModal from "../../Employee/ViewEmployee/ViewEmployee.jsx";
import StationViewModal from "../../Station/ViewStation/ViewStation.jsx";
import StationModal from "../../Station/AddStation/AddStation.jsx";
import { useStations } from "../../Station/StationHook.js";

const AssetAssignmentsList = ({ onModalStateChange }) => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: "all", // "employee", "station", "all"
    employee: "",
    station: "",
    asset: "",
    batch: "",
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployeeViewModalOpen, setIsEmployeeViewModalOpen] = useState(false);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [isStationViewModalOpen, setIsStationViewModalOpen] = useState(false);
  const [selectedStationForView, setSelectedStationForView] = useState(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isStationEditMode, setIsStationEditMode] = useState(false);
  const [stationEditData, setStationEditData] = useState(null);
  const { createStation, modifyStation } = useStations();

  // Employees data for transfer modal
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Modal states
  const [issueRoundsModal, setIssueRoundsModal] = useState({
    isOpen: false,
    assignment: null,
  });
  const [consumeRoundsModal, setConsumeRoundsModal] = useState({
    isOpen: false,
    assignment: null,
  });
  const [transferReturnModal, setTransferReturnModal] = useState({
    isOpen: false,
    assignment: null,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Helper function to get token
  const getToken = () => localStorage.getItem("authToken");
  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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
        setUserType("");
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // Notify parent when modal state changes
  // Update the existing useEffect to include new modals
  useEffect(() => {
    const isAnyModalOpen =
      issueRoundsModal.isOpen ||
      consumeRoundsModal.isOpen ||
      transferReturnModal.isOpen ||
      isEmployeeViewModalOpen ||
      isStationViewModalOpen ||
      isStationModalOpen;
    if (onModalStateChange) {
      onModalStateChange(isAnyModalOpen);
    }
  }, [
    issueRoundsModal.isOpen,
    consumeRoundsModal.isOpen,
    transferReturnModal.isOpen,
    isEmployeeViewModalOpen,
    isStationViewModalOpen,
    isStationModalOpen,
    onModalStateChange,
  ]);

  // Fetch employees for transfer functionality
  const fetchEmployees = async () => {
    if (employees.length > 0) return; // Already loaded

    setEmployeesLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/employee?limit=2000&page=1`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.data && response.data.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Helper function to get employee image
  const getEmployeeImage = (employee) => {
    if (!employee) return "/default-avatar.png";
    if (Array.isArray(employee.profileUrl) && employee.profileUrl.length > 0) {
      return employee.profileUrl[0];
    }
    return employee.profileUrl || "/default-avatar.png";
  };

  // Helper function to get station incharge information
  const getStationInchargeInfo = (station) => {
    if (
      !station ||
      !station.stationIncharge ||
      !Array.isArray(station.stationIncharge)
    ) {
      return null;
    }

    // Find first incharge (priority) or any incharge
    const firstIncharge = station.stationIncharge.find(
      (inc) => inc.type === "firstIncharge"
    );
    const incharge = firstIncharge || station.stationIncharge[0];

    if (!incharge || !incharge.employee) {
      return null;
    }

    return {
      name: `${incharge.employee.firstName} ${
        incharge.employee.lastName || ""
      }`.trim(),
      fName: `${incharge.employee.fatherFirstName} ${
        incharge.employee.fatherLastName || ""
      }`.trim(),
      type:
        incharge.type === "firstIncharge"
          ? "First Incharge"
          : "Second Incharge",
      personalNumber: incharge.employee.personalNumber,
      rank: incharge.employee.rank,
      cnic: incharge.employee.cnic,
    };
  };

  // Add these handler functions
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

  // Fetch assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await axios.get(
        `${BACKEND_URL}/asset-batch/get-employee-station-assignments?${queryParams.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (response.data && response.data.success) {
        if (filters.type === "all") {
          // Combine employee and station assignments
          const combinedAssignments = [
            ...(response.data.employees || []).map((emp) => ({
              ...emp,
              assignmentType: "employee",
            })),
            ...(response.data.stations || []).map((station) => ({
              ...station,
              assignmentType: "station",
            })),
          ];
          setAssignments(combinedAssignments);
        } else {
          setAssignments(response.data.data || []);
        }

        setPagination((prev) => ({
          ...prev,
          total: response.data.total || 0,
        }));
      } else {
        toast.error("Failed to fetch assignments");
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Error fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAssignments();
    fetchEmployees();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchAssignments();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      type: "all",
      employee: "",
      station: "",
      asset: "",
      batch: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "issued":
        return "bg-green-100 text-green-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      case "transferred":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Check if assignment is for employee (not station)
  const isEmployeeAssignment = (assignment) => {
    return assignment.assignmentType === "employee" || assignment.employee;
  };

  // Check if asset supports rounds (weapons)
  const supportsRounds = (assignment) => {
    if (!assignment.asset) return false;
    const assetArray = Array.isArray(assignment.asset)
      ? assignment.asset
      : [assignment.asset];
    return assetArray.some((asset) => {
      if (!asset) return false;

      // Check by category
      const category = asset.category?.toLowerCase();
      if (category === "weapons" || category === "weaponround") {
        return true;
      }

      // Check by type for weapon-related assets
      const type = asset.type?.toLowerCase();
      if (
        type &&
        (type.includes("weapon") ||
          type.includes("rifle") ||
          type.includes("pistol") ||
          type.includes("mp5") ||
          type.includes("ak47") ||
          type.includes("g3") ||
          type.includes("magazine"))
      ) {
        return true;
      }

      return false;
    });
  };

  // Modal handlers
  const handleApprove = async (assignment) => {
    if (!isAdmin) {
      toast.error(
        "Access denied: Only administrators can approve asset assignments"
      );
      return;
    }

    if (
      !window.confirm("Are you sure you want to approve this asset assignment?")
    ) {
      return;
    }

    try {
      const result = await approveAssetAssignment(assignment._id);
      if (result.success) {
        toast.success("Asset assignment approved successfully");
        fetchAssignments();
      } else {
        toast.error(result.error || "Failed to approve assignment");
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve assignment");
    }
  };

  const handleDelete = async (assignment) => {
    if (!isAdmin) {
      toast.error(
        "Access denied: Only administrators can delete asset assignments"
      );
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete this asset assignment?")
    ) {
      return;
    }

    try {
      const result = await deleteAssetAssignment(assignment._id);
      if (result.success) {
        toast.success("Asset assignment deleted successfully");
        fetchAssignments();
      } else {
        toast.error(result.error || "Failed to delete assignment");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete assignment");
    }
  };

  const handleIssueRounds = (assignment) => {
    if (!supportsRounds(assignment)) {
      toast.warning("This asset type doesn't support round management");
      return;
    }
    setIssueRoundsModal({
      isOpen: true,
      assignment: assignment,
    });
  };

  const handleConsumeRounds = (assignment) => {
    // if (!supportsRounds(assignment)) {
    //   toast.warning("This asset type doesn't support round management");
    //   return;
    // }

    setConsumeRoundsModal({
      isOpen: true,
      assignment: assignment,
    });
  };

  const handleTransferReturn = (assignment) => {
    if (employees.length === 0 && !employeesLoading) {
      toast.warning("Loading employee data... Please try again in a moment.");
      fetchEmployees();
      return;
    }

    setTransferReturnModal({
      isOpen: true,
      assignment: assignment,
    });
  };

  // Modal save handlers
  const handleIssueRoundsSave = async (data) => {
    if (!issueRoundsModal.assignment?._id) {
      toast.error("No assignment selected");
      return;
    }

    setModalLoading(true);
    try {
      const issueData = {
        roundsIssued: parseInt(data.roundsIssued) || 0,
        reason: data.reason || "Rounds issued",
        date: data.date || new Date().toISOString(),
      };

      const result = await issueRoundsToAssignment(
        issueRoundsModal.assignment._id,
        issueData
      );

      if (result.success) {
        toast.success(result.message || "Rounds issued successfully");
        setIssueRoundsModal({ isOpen: false, assignment: null });
        fetchAssignments();
      } else {
        toast.error(result.error || "Failed to issue rounds");
      }
    } catch (error) {
      toast.error(error.message || "Failed to issue rounds");
    } finally {
      setModalLoading(false);
    }
  };

  const handleConsumeRoundsSave = async (data) => {
    if (!consumeRoundsModal.assignment?._id) {
      toast.error("No assignment selected");
      return;
    }

    setModalLoading(true);
    try {
      const consumeData = {
        roundsConsumed: parseInt(data.roundsConsumed) || 0,
        shellCollected: parseInt(data.shellCollected) || 0,
        reason: data.reason || "Rounds consumed",
        date: data.date || new Date().toISOString(),
        isCompleteConsumption: data.isCompleteConsumption || false,
      };

      const result = await consumeRoundsFromAssignment(
        consumeRoundsModal.assignment._id,
        consumeData
      );

      if (result.success) {
        toast.success(result.message || "Rounds consumed successfully");
        setConsumeRoundsModal({ isOpen: false, assignment: null });
        fetchAssignments();
      } else {
        toast.error(result.error || "Failed to consume rounds");
      }
    } catch (error) {
      toast.error(error.message || "Failed to consume rounds");
    } finally {
      setModalLoading(false);
    }
  };

  const handleTransferReturnSave = async (data) => {
    if (!transferReturnModal.assignment?._id) {
      toast.error("No assignment selected");
      return;
    }

    setModalLoading(true);
    try {
      let result;

      if (data.action === "transfer") {
        const selectedEmployee = employees.find(
          (emp) => emp._id === data.newEmployeeId
        );
        const newEmployeeName = selectedEmployee
          ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
          : "another employee";

        const transferData = {
          newEmployeeId: data.newEmployeeId,
          newEmployeeName: newEmployeeName,
          reason: data.reason || "Asset transfer",
          date: data.date || new Date().toISOString(),
          transferRounds: parseInt(data.transferRounds) || 0,
          notes: data.notes || "",
        };

        result = await transferAssetAssignment(
          transferReturnModal.assignment._id,
          transferData
        );
      } else if (data.action === "return") {
        const returnData = {
          reason: data.reason || "Asset return",
          date: data.date || new Date().toISOString(),
          returnRounds: parseInt(data.returnRounds) || 0,
          notes: data.notes || "",
        };

        result = await returnAssetAssignment(
          transferReturnModal.assignment._id,
          returnData
        );
      } else {
        throw new Error("Invalid action specified");
      }

      if (result.success) {
        const action = data.action === "transfer" ? "transferred" : "returned";
        toast.success(result.message || `Asset ${action} successfully`);
        setTransferReturnModal({ isOpen: false, assignment: null });
        fetchAssignments();
      } else {
        toast.error(result.error || "Failed to process request");
      }
    } catch (error) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 mb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Asset Assignments
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all asset assignments to employees and stations.
          </p>
          {!isAdmin && (
            <p className="text-xs text-orange-600 mt-1">
              Viewing in read-only mode - Contact administrator for actions
            </p>
          )}
        </div>
        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Assignment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="employee">Employee Only</option>
                <option value="station">Station Only</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="issued">Issued</option>
                <option value="returned">Returned</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Assignment Results ({assignments.length})
            </h3>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assignments...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && assignments.length === 0 && (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 mb-2">No assignments found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your filters or create new assignments
            </p>
          </div>
        )}

        {/* Assignments Table */}
        {!loading && assignments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments?.map((assignment, index) => (
                  <>
                    <tr
                      key={assignment._id || index}
                      className="hover:bg-gray-50"
                    >
                      {/* Asset */}
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {Array.isArray(assignment.asset)
                                ? assignment.asset.map((a) => a.name).join(", ")
                                : assignment.asset?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {Array.isArray(assignment.asset)
                                ? `${assignment.asset.length} assets`
                                : `${assignment.asset?.type || "N/A"} - ${
                                    assignment.asset?.category || "N/A"
                                  }`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-6 py-4">
                        {assignment.assignmentType === "employee" ||
                        assignment.employee ? (
                          <div className="flex items-center">
                            <img
                              className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
                              src={getEmployeeImage(assignment.employee)}
                              alt=""
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                <span
                                  onClick={() =>
                                    handleEmployeeView(assignment.employee)
                                  }
                                  className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                                >
                                  {assignment.employee?.firstName}{" "}
                                  {assignment.employee?.lastName}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {assignment.employee?.personalNumber ||
                                  assignment.employee?.pnumber}
                              </div>
                            </div>
                          </div>
                        ) : assignment.station ? (
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              <span
                                onClick={() =>
                                  handleStationView(assignment.station)
                                }
                                className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                              >
                                {assignment.station.name}
                              </span>
                            </div>
                            {assignment.station.district && (
                              <div className="text-xs text-gray-500 truncate">
                                {assignment.station.district}
                              </div>
                            )}
                            {(() => {
                              const inchargeInfo = getStationInchargeInfo(
                                assignment.station
                              );
                              return inchargeInfo ? (
                                <div className="text-xs text-blue-600 truncate mt-1">
                                  <span className="font-medium">
                                    {inchargeInfo.type}:
                                  </span>{" "}
                                  {inchargeInfo.name}
                                  <br />
                                  {inchargeInfo.fName}
                                  <br />
                                  {inchargeInfo.rank &&
                                    ` (${inchargeInfo.rank})`}
                                  <br />
                                  {inchargeInfo.grade &&
                                    ` (${inchargeInfo.grade})`}
                                  {inchargeInfo.personalNumber &&
                                    ` (${inchargeInfo.personalNumber})`}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            assignment.assignmentType === "employee" ||
                            assignment.employee
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {assignment.assignmentType === "employee" ||
                          assignment.employee
                            ? "Employee"
                            : "Station"}
                        </span>
                      </td>

                      {/* Assignment Date */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(assignment.assignedDate)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            assignment.status
                          )}`}
                        >
                          {assignment.status || "N/A"}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div
                          className="truncate max-w-32"
                          title={assignment.assetBatch?.referenceNumber}
                        >
                          {assignment.assetBatch?.referenceNumber || "N/A"}
                        </div>
                      </td>

                      {/* Actions - Only show for employee assignments */}
                      <td className="px-6 py-4">
                        {isEmployeeAssignment(assignment) ? (
                          <div className="flex items-center space-x-2">
                            {/* Approve Button */}
                            {!assignment.isApproved && isAdmin && (
                              <button
                                onClick={() => handleApprove(assignment)}
                                className="text-green-600 hover:text-green-900 text-xs font-medium bg-green-50 hover:bg-green-100 px-2 py-1 rounded"
                                title="Approve Assignment"
                              >
                                Approve
                              </button>
                            )}

                            {/* Issue Rounds Button */}
                            {supportsRounds(assignment) && isAdmin && (
                              <button
                                onClick={() => handleIssueRounds(assignment)}
                                className="text-blue-600 hover:text-blue-900 text-xs font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                                title="Issue Rounds"
                              >
                                Issue
                              </button>
                            )}

                            {/* Consume Rounds Button */}
                            {supportsRounds(assignment) && isAdmin && (
                              <button
                                onClick={() => handleConsumeRounds(assignment)}
                                className="text-orange-600 hover:text-orange-900 text-xs font-medium bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded"
                                title="Consume Rounds"
                              >
                                Consume
                              </button>
                            )}

                            {/* Transfer/Return Button */}
                            {isAdmin && (
                              <button
                                onClick={() => handleTransferReturn(assignment)}
                                className="text-purple-600 hover:text-purple-900 text-xs font-medium bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded"
                                title="Transfer or Return"
                              >
                                Transfer
                              </button>
                            )}

                            {/* Delete Button */}
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(assignment)}
                                className="text-red-600 hover:text-red-900 text-xs font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                                title="Delete Assignment"
                              >
                                Delete
                              </button>
                            )}

                            {/* Show message if no admin access */}
                            {!isAdmin && (
                              <span className="text-xs text-gray-400 italic">
                                Admin only
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Station assignment
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                      >
                        <div className="space-y-3">
                          {assignment.asset?.map((itm, assetIndex) => (
                            <div
                              key={itm._id}
                              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                            >
                              {/* Asset Header */}
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-800">
                                  Asset #{assetIndex + 1}
                                </h4>
                                {itm.serialNumber && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Serial: {itm.serialNumber}
                                  </span>
                                )}
                              </div>

                              {/* Rounds Information */}
                              {(itm.assignedRounds ||
                                itm.consumedRounds ||
                                itm.availableRounds) && (
                                <div className="mb-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                                  <h5 className="text-xs font-semibold text-yellow-800 mb-2">
                                    Rounds Information
                                  </h5>
                                  <div className="grid grid-cols-3 gap-4 text-xs">
                                    {itm.assignedRounds && (
                                      <div className="text-center">
                                        <div className="text-yellow-600 font-medium">
                                          Assigned
                                        </div>
                                        <div className="text-gray-800 font-bold">
                                          {itm.assignedRounds}
                                        </div>
                                      </div>
                                    )}
                                    {itm.consumedRounds && (
                                      <div className="text-center">
                                        <div className="text-red-600 font-medium">
                                          Consumed
                                        </div>
                                        <div className="text-gray-800 font-bold">
                                          {itm.consumedRounds}
                                        </div>
                                      </div>
                                    )}
                                    {itm.shellCollected && (
                                      <div className="text-center">
                                        <div className="text-red-600 font-medium">
                                          Consumed
                                        </div>
                                        <div className="text-gray-800 font-bold">
                                          {itm.shellCollected}
                                        </div>
                                      </div>
                                    )}
                                    {itm.availableRounds && (
                                      <div className="text-center">
                                        <div className="text-green-600 font-medium">
                                          Available
                                        </div>
                                        <div className="text-gray-800 font-bold">
                                          {itm.availableRounds}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Vehicle Information */}
                              {itm.category
                                ?.toLowerCase()
                                .includes("vehicle") && (
                                <div className="mb-3 p-3 bg-green-50 rounded-md border border-green-200">
                                  <h5 className="text-xs font-semibold text-green-800 mb-2">
                                    Vehicle Details
                                  </h5>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                    {itm.registerNumber && (
                                      <div>
                                        <span className="text-green-600 font-medium">
                                          Registration:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                          {itm.registerNumber}
                                        </div>
                                      </div>
                                    )}
                                    {itm.color && (
                                      <div>
                                        <span className="text-green-600 font-medium">
                                          Color:
                                        </span>
                                        <div className="text-gray-800">
                                          {itm.color}
                                        </div>
                                      </div>
                                    )}
                                    {itm.make && (
                                      <div>
                                        <span className="text-green-600 font-medium">
                                          Make:
                                        </span>
                                        <div className="text-gray-800">
                                          {itm.make}
                                        </div>
                                      </div>
                                    )}
                                    {itm.chassiNumber && (
                                      <div>
                                        <span className="text-green-600 font-medium">
                                          Chassis #:
                                        </span>
                                        <div className="text-gray-800 font-mono text-xs">
                                          {itm.chassiNumber}
                                        </div>
                                      </div>
                                    )}
                                    {itm.engineNumber && (
                                      <div>
                                        <span className="text-green-600 font-medium">
                                          Engine #:
                                        </span>
                                        <div className="text-gray-800 font-mono text-xs">
                                          {itm.engineNumber}
                                        </div>
                                      </div>
                                    )}
                                    {itm.condition && (
                                      <div>
                                        <span className="text-green-600 font-medium">
                                          Condition:
                                        </span>
                                        <div className="text-gray-800">
                                          {itm.condition}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Weapon Information */}
                              {itm.weaponNumber && (
                                <div className="mb-3 p-3 bg-red-50 rounded-md border border-red-200">
                                  <h5 className="text-xs font-semibold text-red-800 mb-2">
                                    Weapon Details
                                  </h5>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                    <div>
                                      <span className="text-red-600 font-medium">
                                        Weapon #:
                                      </span>
                                      <div className="text-gray-800 font-mono">
                                        {itm.weaponNumber}
                                      </div>
                                    </div>
                                    {itm.category && (
                                      <div>
                                        <span className="text-red-600 font-medium">
                                          Type:
                                        </span>
                                        <div className="text-gray-800">
                                          {itm.category}
                                        </div>
                                      </div>
                                    )}
                                    {itm.shellCollected && (
                                      <div>
                                        <span className="text-red-600 font-medium">
                                          Shell Collected:
                                        </span>
                                        <div className="text-gray-800">
                                          {itm.shellCollected}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* General Asset Information */}
                              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                  General Information
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                  {itm.assetStatus && (
                                    <div>
                                      <span className="text-gray-600 font-medium">
                                        Status:
                                      </span>
                                      <div className="text-gray-800">
                                        {itm.assetStatus}
                                      </div>
                                    </div>
                                  )}
                                  {itm.cost && (
                                    <div>
                                      <span className="text-gray-600 font-medium">
                                        Cost:
                                      </span>
                                      <div className="text-gray-800">
                                        PKR {itm.cost}
                                      </div>
                                    </div>
                                  )}
                                  {itm.outQuantity && (
                                    <div>
                                      <span className="text-gray-600 font-medium">
                                        Issued:
                                      </span>
                                      <div className="text-gray-800">
                                        {itm.outQuantity}
                                      </div>
                                    </div>
                                  )}
                                  {itm.availableQuantity && (
                                    <div>
                                      <span className="text-gray-600 font-medium">
                                        Available:
                                      </span>
                                      <div className="text-gray-800">
                                        {itm.availableQuantity}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Rounds Modal */}
      <div className={issueRoundsModal.isOpen ? "z-[60px]" : ""}>
        <IssueRoundsModal
          isOpen={issueRoundsModal.isOpen}
          onClose={() =>
            setIssueRoundsModal({ isOpen: false, assignment: null })
          }
          onSave={handleIssueRoundsSave}
          assignment={issueRoundsModal.assignment}
          loading={modalLoading}
        />
      </div>

      {/* Consume Rounds Modal */}
      <div className={consumeRoundsModal.isOpen ? "z-[60px]" : ""}>
        <ConsumeRoundsModal
          isOpen={consumeRoundsModal.isOpen}
          onClose={() =>
            setConsumeRoundsModal({ isOpen: false, assignment: null })
          }
          onSave={handleConsumeRoundsSave}
          assignment={consumeRoundsModal?.assignment}
          loading={modalLoading}
        />
      </div>

      {/* Transfer/Return Modal */}
      <div className={transferReturnModal.isOpen ? "z-[60px]" : ""}>
        <TransferReturnModal
          isOpen={transferReturnModal.isOpen}
          onClose={() =>
            setTransferReturnModal({ isOpen: false, assignment: null })
          }
          onSave={handleTransferReturnSave}
          assignment={transferReturnModal.assignment}
          employees={employees}
          loading={modalLoading}
        />
      </div>
      {/* Add these modals after the existing Transfer/Return Modal */}
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

export default AssetAssignmentsList;
