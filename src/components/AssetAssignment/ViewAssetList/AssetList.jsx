// AssetList.jsx - Updated with new API integration
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAllAssetAssignments,
  deleteAssetAssignment,
  bulkDeleteAssetAssignments,
  bulkApproveAssetAssignments,
  approveAssetAssignment,
  processAndFilterAssignments,
  // NEW: Import the specialized action functions
  issueRoundsToAssignment,
  consumeRoundsFromAssignment,
  transferAssetAssignment,
  returnAssetAssignment,
} from "../AssetApi.js";
import { getAssetTypesWithEnum } from "../TypeLookup.js";
import { role_admin } from "../../../constants/Enum.js";
import AssetFilters from "../filter.jsx";
import AssetTable from "../AssetTable/AssetTable.jsx";
import IssueRoundsModal from "../IssueRound.jsx";
import ConsumeRoundsModal from "../ConsumeRound.jsx";
import TransferReturnModal from "../TransferAsset.jsx";
import { BACKEND_URL } from "../../../constants/api.js";

const AssetList = ({
  employee,
  employees: propEmployees,
  onEdit,
  refreshTrigger,
}) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [assetTypes, setAssetTypes] = useState({});
  const [filters, setFilters] = useState({
    assetType: "",
    approvalStatus: "",
  });

  // Local employee state management
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Fetch employees from API if not provided as prop
  const fetchEmployees = async () => {
    if (
      propEmployees &&
      Array.isArray(propEmployees) &&
      propEmployees.length > 0
    ) {
      setEmployees(propEmployees);
      return;
    }

    setEmployeesLoading(true);
    setEmployeesError("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/employee?limit=2000&page=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      let employeesData = [];

      if (result.employees && Array.isArray(result.employees)) {
        employeesData = result.employees;

        if (
          result.pagination &&
          result.pagination.hasNext &&
          employeesData.length < result.pagination.totalEmployees
        ) {
          if (result.pagination.totalEmployees <= 2000) {
            try {
              const allEmployeesResponse = await fetch(
                `${BACKEND_URL}/employee?limit=${result.pagination.totalEmployees}&page=1`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (allEmployeesResponse.ok) {
                const allEmployeesResult = await allEmployeesResponse.json();
                if (
                  allEmployeesResult.employees &&
                  Array.isArray(allEmployeesResult.employees)
                ) {
                  employeesData = allEmployeesResult.employees;
                }
              }
            } catch (retryError) {
              // Silent fail on retry
            }
          }
        }
      } else {
        throw new Error(
          "Invalid API response structure - expected 'employees' array"
        );
      }

      if (employeesData.length > 0) {
        setEmployees(employeesData);
      } else {
        setEmployees([]);
        setEmployeesError("No employees found");
      }
    } catch (error) {
      setEmployeesError(error.message || "Failed to fetch employees");
      setEmployees([]);
      tryAlternativeEmployeeSource();
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Alternative method to get employees data
  const tryAlternativeEmployeeSource = () => {
    try {
      const storedEmployees =
        localStorage.getItem("employees") ||
        sessionStorage.getItem("employees");
      if (storedEmployees) {
        const parsedEmployees = JSON.parse(storedEmployees);
        if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
          setEmployees(parsedEmployees);
          setEmployeesError("");
          return;
        }
      }

      if (window.appData && window.appData.employees) {
        setEmployees(window.appData.employees);
        setEmployeesError("");
        return;
      }
    } catch (error) {
      // Silent fail
    }
  };

  // Fetch asset types for filtering
  const fetchAssetTypes = async () => {
    try {
      const result = await getAssetTypesWithEnum();
      if (result.success) {
        setAssetTypes(result.data);
      } else {
        setAssetTypes({});
      }
    } catch (error) {
      setAssetTypes({});
    }
  };

  // Fetch asset assignments
  const fetchAssetAssignments = async () => {
    if (!employee?._id) {
      setError("No employee selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getAllAssetAssignments({ employee: employee._id });

      if (result.success) {
        setAssignments(result.data || []);
      } else {
        setError(result.error || "Failed to fetch asset assignments");
        setAssignments([]);
      }
    } catch (error) {
      setError(
        error.message || "An error occurred while fetching asset assignments"
      );
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes from AssetFilters component
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Apply filters using API helper
  useEffect(() => {
    if (!loading && assignments.length >= 0) {
      const filtered = processAndFilterAssignments(
        assignments,
        filters,
        assetTypes
      );
      setFilteredAssignments(filtered);
    }
  }, [filters, assignments, loading, assetTypes]);

  // Handle checkbox selection
  const handleSelectItem = (assignmentId) => {
    setSelectedItems((prev) =>
      prev.includes(assignmentId)
        ? prev.filter((id) => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredAssignments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAssignments.map((a) => a._id));
    }
  };

  // Modal handlers
  const handleIssueRounds = (assignment) => {
    setIssueRoundsModal({
      isOpen: true,
      assignment: assignment,
    });
  };

  const handleConsumeRounds = (assignment) => {
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

  // ===============================
  // UPDATED: API call handlers for modals using new APIs
  // ===============================

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
        fetchAssetAssignments(); // Refresh the data
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
        shellCollected: parseInt(data.shellCollected, 10),
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
        fetchAssetAssignments(); // Refresh the data
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
        // Find the selected employee name for better messaging
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
          // Include round history if provided
          roundHistory: data.roundHistory
            ? {
                Date: data.date || new Date().toISOString(),
                Reason: data.reason || "Asset return",
                assignedRounds: "0",
                consumedRounds: data.returnRounds?.toString() || "0",
              }
            : null,
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
        fetchAssetAssignments(); // Refresh the data
      } else {
        toast.error(result.error || "Failed to process request");
      }
    } catch (error) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!isAdmin) {
      toast.error(
        "Access denied: Only administrators can delete asset assignments"
      );
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Please select items to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedItems.length} asset assignment(s)?`
      )
    ) {
      return;
    }

    try {
      const result = await bulkDeleteAssetAssignments(selectedItems);
      if (result.success) {
        toast.success(
          `${selectedItems.length} asset assignment(s) deleted successfully`
        );
        setSelectedItems([]);
        fetchAssetAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (!isAdmin) {
      toast.error(
        "Access denied: Only administrators can approve asset assignments"
      );
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Please select items to approve");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to approve ${selectedItems.length} asset assignment(s)?`
      )
    ) {
      return;
    }

    try {
      const result = await bulkApproveAssetAssignments(selectedItems);
      if (result.success) {
        toast.success(
          `${selectedItems.length} asset assignment(s) approved successfully`
        );
        setSelectedItems([]);
        fetchAssetAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete single assignment
  const handleDelete = async (assignmentId) => {
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
      const result = await deleteAssetAssignment(assignmentId);
      if (result.success) {
        toast.success("Asset assignment deleted successfully");
        fetchAssetAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Approve assignment
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
        fetchAssetAssignments();
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

  // Get asset names
  const getAssetNames = (assets) => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return "No assets assigned";
    }

    const validAssets = assets.filter((asset) => asset && asset.name);
    if (validAssets.length === 0) {
      return "No valid assets";
    }

    return validAssets.map((asset) => asset.name).join(", ");
  };

  // Get asset types
  const getAssetTypes = (assets) => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return [];
    }

    const validTypes = assets
      .filter((asset) => asset && asset.type)
      .map((asset) => asset.type);

    return [...new Set(validTypes)];
  };

  // Get approval status
  const getApprovalStatus = (assignment) => {
    if (assignment.isApproved) {
      return {
        status: "approved",
        label: "Approved",
        class: "bg-green-100 text-green-800",
      };
    } else {
      return {
        status: "pending",
        label: "Pending",
        class: "bg-yellow-100 text-yellow-800",
      };
    }
  };

  // Check if assignment is consumed
  const isConsumed = (assignment) => {
    return assignment.consumedDate && assignment.consumedReason;
  };

  // Effects
  useEffect(() => {
    fetchAssetAssignments();
    fetchAssetTypes();
    fetchEmployees();
  }, [employee, refreshTrigger]);

  // Update employees when prop changes
  useEffect(() => {
    if (
      propEmployees &&
      Array.isArray(propEmployees) &&
      propEmployees.length > 0
    ) {
      setEmployees(propEmployees);
      setEmployeesError("");
    }
  }, [propEmployees]);

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
      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Asset Assignments
            </h2>
            {!isAdmin && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Viewing in read-only mode - Contact administrator for approvals
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredAssignments.length} of {assignments.length}{" "}
              assignments
            </span>
            <div className="text-xs text-gray-500 border-l pl-2">
              Employees: {employees.length}
              {employeesLoading && " (loading...)"}
              {employeesError && " (error)"}
            </div>
          </div>
        </div>

        {/* Employee loading/error state */}
        {employeesError && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
            <div className="flex items-center">
              <div className="text-orange-600 mr-2">⚠️</div>
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Employee Data Issue
                </p>
                <p className="text-xs text-orange-600">{employeesError}</p>
                <button
                  onClick={fetchEmployees}
                  className="text-xs text-orange-600 underline hover:text-orange-800 mt-1"
                >
                  Retry loading employees
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Asset Filters Component */}
        <AssetFilters
          onFiltersChange={handleFiltersChange}
          selectedCount={selectedItems.length}
          onBulkApprove={handleBulkApprove}
          onBulkDelete={handleBulkDelete}
          isAdmin={isAdmin}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Asset Assignments Table */}
      <div className="overflow-x-auto">
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No assets assigned</p>
            <p className="text-gray-400 text-sm mt-1">
              No assets have been assigned to this employee yet.
            </p>
          </div>
        ) : (
          <AssetTable
            filteredAssignments={filteredAssignments}
            selectedItems={selectedItems}
            handleSelectItem={handleSelectItem}
            handleSelectAll={handleSelectAll}
            handleApprove={handleApprove}
            onEdit={onEdit}
            handleDelete={handleDelete}
            isAdmin={isAdmin}
            formatDate={formatDate}
            getAssetNames={getAssetNames}
            getApprovalStatus={getApprovalStatus}
            isConsumed={isConsumed}
            getAssetTypes={getAssetTypes}
            onIssueRounds={handleIssueRounds}
            onConsumeRounds={handleConsumeRounds}
            onTransferReturn={handleTransferReturn}
          />
        )}
      </div>

      {/* Issue Rounds Modal */}
      <IssueRoundsModal
        isOpen={issueRoundsModal.isOpen}
        onClose={() => setIssueRoundsModal({ isOpen: false, assignment: null })}
        onSave={handleIssueRoundsSave}
        assignment={issueRoundsModal.assignment}
        loading={modalLoading}
      />

      {/* Consume Rounds Modal */}
      <ConsumeRoundsModal
        isOpen={consumeRoundsModal.isOpen}
        onClose={() =>
          setConsumeRoundsModal({ isOpen: false, assignment: null })
        }
        onSave={handleConsumeRoundsSave}
        assignment={consumeRoundsModal?.assignment}
        loading={modalLoading}
      />

      {/* Transfer/Return Modal */}
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
  );
};

export default AssetList;
