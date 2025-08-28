// Final BulkStationAssignment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getEmployees } from "../Employee/EmployeeApi.js";
import {
  bulkCreateStationAssignments,
  getStationsWithEnum,
  getEmployeeCurrentStation,
} from "./StationApi.js";
import { getStations } from "../Station/StationApi.js";
import StationViewModal from "../Station/ViewStation/ViewStation.jsx";
import EmployeeViewModal from "../Employee/ViewEmployee/ViewEmployee.jsx";
import StationModal from "../Station/AddStation/AddStation.jsx";
import { useStations } from "../Station/StationHook.js";

const BulkStationAssignment = () => {
  const navigate = useNavigate();

  // State management - Initialize with one empty assignment
  // const [assignments, setAssignments] = useState([{
  //   id: Date.now().toString(),
  //   employee: null,
  //   station: null,
  //   fromDate: new Date().toISOString().split('T')[0],
  //   approvalComment: ""
  // }]);
  const [assignments, setAssignments] = useState(() => {
    return Array.from({ length: 3 }, (_, index) => ({
      id: (Date.now() + index).toString(),
      employee: null,
      station: null,
      fromDate: new Date().toISOString().split("T")[0],
      approvalComment: "",
    }));
  });
  const [saving, setSaving] = useState(false);
  const [isEmployeeViewModalOpen, setIsEmployeeViewModalOpen] = useState(false);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [isStationViewModalOpen, setIsStationViewModalOpen] = useState(false);
  const [selectedStationForView, setSelectedStationForView] = useState(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isStationEditMode, setIsStationEditMode] = useState(false);
  const [stationEditData, setStationEditData] = useState(null);

  // Search states
  const [employeeSearch, setEmployeeSearch] = useState({});
  const [stationSearch, setStationSearch] = useState({});
  const [searchResults, setSearchResults] = useState({
    employees: {},
    stations: {},
  });

  // Loading states for search
  const [isSearching, setIsSearching] = useState({});
  const { createStation, modifyStation } = useStations();

  // Helper function to get employee image
  const getEmployeeImage = (employee) => {
    if (Array.isArray(employee.profileUrl)) {
      return employee.profileUrl[0] || "/default-avatar.png";
    }
    return employee.profileUrl || "/default-avatar.png";
  };

  const addNewAssignment = () => {
    const newId = Date.now().toString();
    setAssignments((prev) => [
      ...prev,
      {
        id: newId,
        employee: null,
        station: null,
        fromDate: new Date().toISOString().split("T")[0],
        approvalComment: "",
      },
    ]);
  };

  // Remove assignment row
  const removeAssignment = (id) => {
    if (assignments.length === 1) {
      toast.warning("At least one assignment row is required");
      return;
    }
    setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
  };

  // Search employees
  const searchEmployees = async (query, assignmentId) => {
    console.log("🔍 Searching employees:", { query, assignmentId });

    if (!query.trim()) {
      setSearchResults((prev) => ({
        ...prev,
        employees: { ...prev.employees, [assignmentId]: [] },
      }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, [`employee_${assignmentId}`]: true }));

    try {
      const result = await getEmployees({
        name: query,
        limit: 25,
      });

      console.log("👥 Employee search result:", result);

      if (result.success) {
        const employees = result.data.employees || result.data || [];
        console.log("📋 Found employees:", employees.length);
        setSearchResults((prev) => ({
          ...prev,
          employees: { ...prev.employees, [assignmentId]: employees },
        }));
      } else {
        console.error("❌ Employee search failed:", result.error);
        toast.error("Failed to search employees");
      }
    } catch (error) {
      console.error("💥 Employee search error:", error);
      toast.error("Error searching employees");
    } finally {
      setIsSearching((prev) => ({
        ...prev,
        [`employee_${assignmentId}`]: false,
      }));
    }
  };

  // Search stations
  const searchStations = async (query, assignmentId) => {
    if (!query.trim()) {
      setSearchResults((prev) => ({
        ...prev,
        stations: { ...prev.stations, [assignmentId]: [] },
      }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, [`station_${assignmentId}`]: true }));

    try {
      // const result = await getStationsWithEnum();
      const result = await getStations({
        name: query,
        limit: 25,
      });

      if (result.success) {
        let stations = [];

        // Handle different response structures
        if (Array.isArray(result.data)) {
          stations = result.data;
        } else if (result.data && Array.isArray(result.data.stations)) {
          stations = result.data.stations;
        } else if (typeof result.data === "object" && result.data !== null) {
          stations = Object.entries(result.data).map(([_id, name]) => ({
            _id,
            name,
          }));
        }

        // Filter stations based on query
        const filteredStations = stations.filter(
          (station) =>
            station.name &&
            station.name.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults((prev) => ({
          ...prev,
          stations: { ...prev.stations, [assignmentId]: filteredStations },
        }));
      } else {
        console.error("Station API error:", result.error);
        toast.error("Failed to search stations");
      }
    } catch (error) {
      console.error("Station search error:", error);
      toast.error("Error searching stations");
    } finally {
      setIsSearching((prev) => ({
        ...prev,
        [`station_${assignmentId}`]: false,
      }));
    }
  };

  // Select employee
  const selectEmployee = (employee, assignmentId) => {
    console.log("Selected employee:", employee);
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, employee }
          : assignment
      )
    );

    setEmployeeSearch((prev) => ({ ...prev, [assignmentId]: "" }));
    setSearchResults((prev) => ({
      ...prev,
      employees: { ...prev.employees, [assignmentId]: [] },
    }));
  };

  // Select station
  const selectStation = (station, assignmentId) => {
    console.log("Selected station:", station);
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, station } : assignment
      )
    );

    setStationSearch((prev) => ({ ...prev, [assignmentId]: "" }));
    setSearchResults((prev) => ({
      ...prev,
      stations: { ...prev.stations, [assignmentId]: [] },
    }));
  };

  // Update assignment field
  const updateAssignment = (assignmentId, field, value) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, [field]: value }
          : assignment
      )
    );
  };

  // Validate assignments
  const validateAssignments = () => {
    const errors = [];

    assignments.forEach((assignment, index) => {
      if (!assignment.employee) {
        errors.push(`Row ${index + 1}: Employee is required`);
      }
      if (!assignment.station) {
        errors.push(`Row ${index + 1}: Station is required`);
      }
      if (!assignment.fromDate) {
        errors.push(`Row ${index + 1}: From date is required`);
      }
    });

    return errors;
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

  // Save bulk assignments using the bulk API
  const saveBulkAssignments = async () => {
    console.log("=== STARTING BULK SAVE ===");
    console.log("Current assignments:", assignments);

    const validationErrors = validateAssignments();

    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors);
      toast.error(
        `Please fix the following errors:\n${validationErrors.join("\n")}`
      );
      return;
    }

    setSaving(true);

    try {
      console.log("Preparing bulk assignments with current stations...");

      // First, get current stations for all employees
      const assignmentsWithCurrentStations = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            console.log(
              `Fetching current station for employee: ${assignment.employee.firstName} ${assignment.employee.lastName}`
            );

            const currentStationResult = await getEmployeeCurrentStation(
              assignment.employee._id
            );
            let lastStation = null;

            if (currentStationResult.success && currentStationResult.data) {
              // Handle different response structures
              if (currentStationResult.data.currentStation) {
                lastStation =
                  currentStationResult.data.currentStation._id ||
                  currentStationResult.data.currentStation;
              } else if (currentStationResult.data._id) {
                lastStation = currentStationResult.data._id;
              }
              console.log(
                `Found current station for ${assignment.employee.firstName}: ${lastStation}`
              );
            } else {
              console.log(
                `No current station found for ${assignment.employee.firstName}`
              );
            }

            return {
              employee: assignment.employee._id,
              currentStation: assignment.station._id,
              lastStation: lastStation,
              fromDate: assignment.fromDate,
              remarks: assignment.approvalComment || "",
            };
          } catch (error) {
            console.error(
              `Error fetching current station for ${assignment.employee.firstName}:`,
              error
            );
            // Continue with null lastStation if we can't fetch it
            return {
              employee: assignment.employee._id,
              currentStation: assignment.station._id,
              lastStation: null,
              fromDate: assignment.fromDate,
              remarks: assignment.approvalComment || "",
            };
          }
        })
      );

      console.log(
        "Assignments with current stations:",
        assignmentsWithCurrentStations
      );
      console.log("Calling bulk create API...");

      const result = await bulkCreateStationAssignments(
        assignmentsWithCurrentStations
      );

      console.log("Bulk create result:", result);

      if (result.success) {
        const { successCount, errorCount, successful, failed } = result.data;

        console.log(`Success: ${successCount}, Errors: ${errorCount}`);

        if (successCount > 0) {
          toast.success(
            `Successfully created ${successCount} station assignments! They are now pending approval.`,
            { autoClose: 5000 }
          );
          navigate("/pendingapprovals");
          window.location.reload(); // Add this line
        }

        if (errorCount > 0) {
          const errorMessages = failed
            .map((f) => `Row ${f.index + 1}: ${f.error}`)
            .join("\n");
          toast.error(`${errorCount} assignments failed:\n${errorMessages}`, {
            autoClose: 8000,
          });
        }

        if (errorCount === 0) {
          setTimeout(() => {
            if (
              window.confirm(
                "All assignments were successful! Would you like to create more assignments?"
              )
            ) {
              // Reset to single empty row
              setAssignments([
                {
                  id: Date.now().toString(),
                  employee: null,
                  station: null,
                  fromDate: new Date().toISOString().split("T")[0],
                  approvalComment: "",
                },
              ]);
            } else {
              navigate("/employees");
            }
          }, 2000);
        }
      } else {
        console.error("Bulk create failed:", result.error);
        toast.error(`Failed to save bulk assignments: ${result.error}`);
      }
    } catch (error) {
      console.error("Bulk assignment error:", error);
      toast.error("Failed to save bulk assignments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bulk Station Assignment
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Assign multiple employees to stations using the bulk API endpoint.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={addNewAssignment}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
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
          <button
            onClick={() => navigate("/pendingapprovals")}
            disabled={saving}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Transfer Posting Management
          </button>
          <button
            onClick={() => navigate("/employees")}
            disabled={saving}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Back to Employees
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-visible">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  From Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  To Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  From Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment, index) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 relative">
                    {assignment.employee ? (
                      <div className="flex items-center">
                        <img
                          className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
                          src={getEmployeeImage(assignment.employee)}
                          alt={`${assignment.employee.firstName} ${assignment.employee.lastName}`}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            <span
                              onClick={() =>
                                handleEmployeeView(assignment.employee)
                              }
                              className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                            >
                              {assignment.employee.firstName}{" "}
                              {assignment.employee.lastName}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {assignment.employee.personalNumber ||
                              assignment.employee.pnumber}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            updateAssignment(assignment.id, "employee", null)
                          }
                          disabled={saving}
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
                          placeholder="Search employee..."
                          disabled={saving}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[250px]"
                          value={employeeSearch[assignment.id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEmployeeSearch((prev) => ({
                              ...prev,
                              [assignment.id]: value,
                            }));
                            searchEmployees(value, assignment.id);
                          }}
                        />
                        {isSearching[`employee_${assignment.id}`] && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}

                        {searchResults.employees[assignment.id]?.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.employees[assignment.id].map(
                              (employee) => (
                                <button
                                  key={employee._id}
                                  onClick={() =>
                                    selectEmployee(employee, assignment.id)
                                  }
                                  disabled={saving}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50 flex items-center"
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
                                      {employee.firstName}
                                    </div>
                                    <div className="text-xs text-gray-700 truncate">
                                      {employee.fatherFirstName}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {employee.personalNumber ||
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
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0">
                        <div>
                          <span
                            onClick={() =>
                              assignment.employee?.stations &&
                              handleStationView(assignment.employee.stations)
                            }
                            className="text-gray-900 hover:text-blue-600 cursor-pointer hover:underline"
                          >
                            {assignment.employee?.stations?.name ||
                              "not assigned"}
                          </span>
                        </div>
                        <div>{assignment.employee?.stations?.tehsil}</div>
                        <div>{assignment.employee?.stations?.district}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 relative">
                    {assignment.station ? (
                      <div className="flex items-center">
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
                        </div>
                        <button
                          onClick={() =>
                            updateAssignment(assignment.id, "station", null)
                          }
                          disabled={saving}
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
                          placeholder="Search station..."
                          disabled={saving}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[200px]"
                          value={stationSearch[assignment.id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setStationSearch((prev) => ({
                              ...prev,
                              [assignment.id]: value,
                            }));
                            searchStations(value, assignment.id);
                          }}
                        />
                        {isSearching[`station_${assignment.id}`] && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}

                        {searchResults.stations[assignment.id]?.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.stations[assignment.id].map(
                              (station) => (
                                <button
                                  key={station._id}
                                  onClick={() =>
                                    selectStation(station, assignment.id)
                                  }
                                  disabled={saving}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50"
                                >
                                  <div className="font-medium text-gray-900 truncate">
                                    {station.name}
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={assignment.fromDate}
                      disabled={saving}
                      onChange={(e) =>
                        updateAssignment(
                          assignment.id,
                          "fromDate",
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <textarea
                      placeholder="Remarks..."
                      value={assignment.approvalComment}
                      disabled={saving}
                      onChange={(e) =>
                        updateAssignment(
                          assignment.id,
                          "approvalComment",
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full disabled:bg-gray-100"
                      rows="2"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => removeAssignment(assignment.id)}
                      disabled={assignments.length === 1 || saving}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
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
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveBulkAssignments}
          disabled={
            saving || assignments.every((a) => !a.employee || !a.station)
          }
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium flex items-center"
        >
          {saving ? (
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
              Save Bulk Assignments (
              {assignments.filter((a) => a.employee && a.station).length})
            </>
          )}
        </button>
      </div>
      <EmployeeViewModal
        isOpen={isEmployeeViewModalOpen}
        onClose={handleCloseEmployeeViewModal}
        employee={selectedEmployeeForView}
        onEdit={handleEmployeeEdit}
      />

      {/* Station View Modal */}
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

export default BulkStationAssignment;
