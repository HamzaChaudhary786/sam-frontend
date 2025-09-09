// StationAssetList.jsx - Complete updated version with modal functionality
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  getStationAssetAssignments, 
  deleteStationAssetAssignment, 
  bulkDeleteStationAssetAssignments,
  bulkApproveStationAssetAssignments,
  approveStationAssetAssignment,
  processAndFilterStationAssignments,
  getAssetNames,
  getAssetTypes,
  getApprovalStatus,
  formatDate,
} from "../StationAssetApi.js";
import { getAssetTypesWithEnum } from "../../AssetAssignment/TypeLookup.js";
import { role_admin } from "../../../constants/Enum.js";
import { BACKEND_URL } from "../../../constants/api.js";

// NEW: Import the same APIs and components from AssetAssignment
import { 
  issueRoundsToAssignment,
  consumeRoundsFromAssignment,
  transferAssetAssignment,
  returnAssetAssignment
} from "../StationAssetApi.js";

import StationAssetFilters from "../Filter.jsx";
import StationAssetTable from "../AssetTable/AssetTable.jsx";

// NEW: Import the modal components from AssetAssignment
import IssueRoundsModal from "../IssueRound.jsx";
import ConsumeRoundsModal from "../ConsumeRound.jsx";
import TransferReturnModal from "../TransferAsset.jsx";

const StationAssetList = ({ station, onEdit, refreshTrigger }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [assetTypes, setAssetTypes] = useState({});
  const [filters, setFilters] = useState({
    assetType: "",
    approvalStatus: "",
    fromDate: "",
    toDate: "",
  });

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // NEW: Employee state management for transfer functionality
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");

  // NEW: Modal states
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
        console.error("Error checking user role:", error);
        setUserType("");
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // NEW: Fetch employees for transfer functionality
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError("");

    try {
      const response = await fetch(`${BACKEND_URL}/employee?limit=2000&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      let employeesData = [];
      
      if (result.employees && Array.isArray(result.employees)) {
        employeesData = result.employees;
        
        if (result.pagination && result.pagination.hasNext && employeesData.length < result.pagination.totalEmployees) {
          if (result.pagination.totalEmployees <= 2000) {
            try {
              const allEmployeesResponse = await fetch(`${BACKEND_URL}/employee?limit=${result.pagination.totalEmployees}&page=1`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
              });
              
              if (allEmployeesResponse.ok) {
                const allEmployeesResult = await allEmployeesResponse.json();
                if (allEmployeesResult.employees && Array.isArray(allEmployeesResult.employees)) {
                  employeesData = allEmployeesResult.employees;
                }
              }
            } catch (retryError) {
              // Silent fail on retry
            }
          }
        }
      }
      
      setEmployees(employeesData);
    } catch (error) {
      setEmployeesError(error.message || "Failed to fetch employees");
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
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

  // Fetch station asset assignments
  const fetchStationAssetAssignments = async () => {
    if (!station?._id) {
      setError("No station selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getStationAssetAssignments(station._id);
      
      if (result.success) {
        setAssignments(result.data || []);
      } else {
        setError(result.error || "Failed to fetch station asset assignments");
        setAssignments([]);
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching station asset assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes from StationAssetFilters component
  const handleFiltersChange = (newFilters) => {
    if (newFilters.clearSelection) {
      setSelectedItems([]);
      return;
    }
    setFilters(newFilters);
  };

  // Apply filters using API helper
  useEffect(() => {
    if (!loading && assignments.length >= 0) {
      const filtered = processAndFilterStationAssignments(assignments, filters, assetTypes);
      setFilteredAssignments(filtered);
    }
  }, [filters, assignments, loading, assetTypes]);

  // Handle checkbox selection
  const handleSelectItem = (assignmentId) => {
    setSelectedItems(prev => 
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredAssignments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAssignments.map(a => a._id));
    }
  };

  // NEW: Modal handlers
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

  // NEW: API call handlers for modals using existing APIs
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
        fetchStationAssetAssignments(); // Refresh the data
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
        roundsConsumed: parseInt(data?.roundsConsumed) || 0,
        shellCollected: parseInt(data?.shellCollected) || 0,
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
        fetchStationAssetAssignments(); // Refresh the data
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
        const selectedEmployee = employees.find(emp => emp._id === data.newEmployeeId);
        const newEmployeeName = selectedEmployee ? 
          `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 
          'another employee';

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
          roundHistory: data.roundHistory ? {
            Date: data.date || new Date().toISOString(),
            Reason: data.reason || "Asset return",
            assignedRounds: "0",
            consumedRounds: data.returnRounds?.toString() || "0"
          } : null,
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
        fetchStationAssetAssignments(); // Refresh the data
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
      toast.error("Access denied: Only administrators can delete station asset assignments");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Please select items to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} station asset assignment(s)?`)) {
      return;
    }
    
    try {
      const result = await bulkDeleteStationAssetAssignments(selectedItems);
      if (result.success) {
        toast.success(`${selectedItems.length} station asset assignment(s) deleted successfully`);
        setSelectedItems([]);
        fetchStationAssetAssignments();
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
      toast.error("Access denied: Only administrators can approve station asset assignments");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Please select items to approve");
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ${selectedItems.length} station asset assignment(s)?`)) {
      return;
    }

    try {
      const result = await bulkApproveStationAssetAssignments(
        selectedItems,
        "Bulk approval for station asset assignments"
      );
      if (result.success) {
        toast.success(`${selectedItems.length} station asset assignment(s) approved successfully`);
        setSelectedItems([]);
        fetchStationAssetAssignments();
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
      toast.error("Access denied: Only administrators can delete station asset assignments");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this station asset assignment?")) {
      return;
    }

    try {
      const result = await deleteStationAssetAssignment(assignmentId);
      if (result.success) {
        toast.success("Station asset assignment deleted successfully");
        fetchStationAssetAssignments();
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
      toast.error("Access denied: Only administrators can approve station asset assignments");
      return;
    }

    if (!window.confirm("Are you sure you want to approve this station asset assignment?")) {
      return;
    }

    try {
      const result = await approveStationAssetAssignment(
        assignment._id,
        "Station asset assignment approved"
      );
      if (result.success) {
        toast.success("Station asset assignment approved successfully");
        fetchStationAssetAssignments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Effects
  useEffect(() => {
    fetchStationAssetAssignments();
    fetchAssetTypes();
    fetchEmployees(); // NEW: Fetch employees for transfer functionality
  }, [station, refreshTrigger]);

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
              Station Asset Assignments
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assets assigned to <span className="font-medium">{station.name}</span>
            </p>
            {!isAdmin && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Viewing in read-only mode - Contact administrator for approvals
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredAssignments.length} of {assignments.length} assignments
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
                <p className="text-sm text-orange-700 font-medium">Employee Data Issue</p>
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

        {/* Station Asset Filters Component */}
        <StationAssetFilters
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

      {/* Station Asset Assignments Table */}
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
              No assets have been assigned to this station yet.
            </p>
          </div>
        ) : (
          <StationAssetTable
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
            getAssetTypes={getAssetTypes}
            // NEW: Pass modal handlers to table
            onIssueRounds={handleIssueRounds}
            onConsumeRounds={handleConsumeRounds}
            onTransferReturn={handleTransferReturn}
          />
        )}
      </div>

      {/* NEW: Modal Components */}
      {/* Issue Rounds Modal */}
      {console.log(issueRoundsModal.assignment,"my testing data 123456")}
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
        onClose={() => setConsumeRoundsModal({ isOpen: false, assignment: null })}
        onSave={handleConsumeRoundsSave}
        assignment={consumeRoundsModal.assignment}
        loading={modalLoading}
      />

      {/* Transfer/Return Modal */}
      <TransferReturnModal
        isOpen={transferReturnModal.isOpen}
        onClose={() => setTransferReturnModal({ isOpen: false, assignment: null })}
        onSave={handleTransferReturnSave}
        assignment={transferReturnModal.assignment}
        employees={employees}
        loading={modalLoading}
      />
    </div>
  );
};

export default StationAssetList;