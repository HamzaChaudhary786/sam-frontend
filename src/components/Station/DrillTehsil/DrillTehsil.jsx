import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Building,
  Users,
  MapPin,
  Award,
  Calendar,
  Phone,
  UserCheck,
  PieChart,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  UserX,
  Map,
  Shield,
  Activity,
  Database,
  Layers,
  Navigation,
  Home,
  ChevronRight,
  Wifi,
  Zap,
  Lock,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronDown,
  Package,
  Truck,
  Wrench,
  Info,
  Eye,
  Loader2,
  User
} from "lucide-react";
import { BACKEND_URL } from "../../../constants/api";
import DrillDistrictPage from "../DrillDistrict/DrillDistrict.jsx";
import EmployeeViewModal from "../../Employee/ViewEmployee/ViewEmployee.jsx";
import { useNavigate } from "react-router-dom";

const DrillTehsilPage = ({ tehsil, onBack, onDrillStation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDistrictView, setShowDistrictView] = useState(false);
  const [isViewEmployee, setIsViewEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [employees, setEmployees] = useState([]);

  // Grouped stations state for employee display
  const [expandedStations, setExpandedStations] = useState(new Set());

  const navigate = useNavigate();
  const [editData, setEditData] = useState({});
  const handleEdit = async (data) => {
    setEditData(data);
    navigate("/employee", {
      state: {
        isEdit: true,
        editData: data,
      },
    });
  };

  const handleClose = () => {
    setIsViewEmployee(!isViewEmployee);
  };

  // Memoized fetch functions
  const fetchComprehensiveTehsilData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First call: Get all data for statistics and summaries (without pagination)
      const response = await fetch(
        `${BACKEND_URL}/stations/by-tehsil?tehsil=${encodeURIComponent(
          tehsil
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tehsil data: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "API returned unsuccessful status");
      }

      console.log("API Response:", result);
      setData(result.data);

      // Set total employees count from the response
      if (result.data.summary?.totalActiveEmployees) {
        setTotalEmployees(result.data.summary.totalActiveEmployees);
      }

      // Set initial employees data (first page)
      if (result.data.employees?.data) {
        setEmployees(result.data.employees.data);
      }
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, [tehsil]);

  // Update the fetchEmployees function to properly handle pagination
  const fetchEmployees = useCallback(
    async (page = 1) => {
      if (!data) return;

      setEmployeesLoading(true);
      try {
        // Fetch employees for specific page
        const response = await fetch(
          `${BACKEND_URL}/stations/by-tehsil?tehsil=${encodeURIComponent(
            tehsil
          )}&page=${page}&limit=${employeesPerPage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch employees: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data?.employees) {
          // Update employees with paginated data
          setEmployees(result.data.employees.data || []);

          // Update pagination info
          if (result.data.employees.pagination) {
            setTotalEmployees(
              result.data.employees.pagination.totalEmployees || 0
            );
          }
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        // Keep existing employees data on error
      } finally {
        setEmployeesLoading(false);
      }
    },
    [tehsil, employeesPerPage, data]
  );
  // Update the useEffect for initial data load
  useEffect(() => {
    if (tehsil) {
      fetchComprehensiveTehsilData();
      setCurrentPage(1); // Reset to first page
    }
  }, [tehsil, fetchComprehensiveTehsilData]);

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEmployees(page);
  };

  // Group employees by station
  const groupEmployeesByStation = useCallback((employeesList) => {
    if (!Array.isArray(employeesList)) return {};

    return employeesList.reduce((acc, employee) => {
      const stationName = employee.stations?.name || "Unassigned";
      const stationId = employee.stations?._id || "unassigned";

      if (!acc[stationName]) {
        acc[stationName] = {
          stationId,
          stationInfo: employee.stations,
          employees: [],
        };
      }
      acc[stationName].employees.push(employee);
      return acc;
    }, {});
  }, []);

  // Toggle station expansion
  const toggleStationExpansion = (stationName) => {
    const newExpanded = new Set(expandedStations);
    if (newExpanded.has(stationName)) {
      newExpanded.delete(stationName);
    } else {
      newExpanded.add(stationName);
    }
    setExpandedStations(newExpanded);
  };

  // Handle drill operations
  const handleDrillUpToDistrict = () => {
    setShowDistrictView(true);
  };

  const handleBackFromDistrict = () => {
    setShowDistrictView(false);
  };

  const fetchComprehensiveTehsilDataForNewTehsil = async (newTehsil) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await fetch(
        `${BACKEND_URL}/stations/by-tehsil?tehsil=${encodeURIComponent(
          newTehsil
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tehsil data");
      }

      const result = await response.json();
      setData(result.data);
      setSelectedStation(null);
      setActiveTab("overview");

      if (result.data.employees?.data) {
        setEmployees(result.data.employees.data);
        setTotalEmployees(
          result.data.employees.pagination?.totalEmployees ||
          result.data.employees.data.length
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const handleStationSelect = (station) => {
    setSelectedStation(selectedStation?._id === station._id ? null : station);
  };

  const getFacilityIcon = (facility) => {
    const facilityLower = facility.toLowerCase();
    if (facilityLower.includes("mobile") || facilityLower.includes("signal"))
      return <Wifi className="h-3 w-3" />;
    if (facilityLower.includes("electric")) return <Zap className="h-3 w-3" />;
    if (facilityLower.includes("wall") || facilityLower.includes("boundary"))
      return <Shield className="h-3 w-3" />;
    if (facilityLower.includes("wireless") || facilityLower.includes("base"))
      return <Navigation className="h-3 w-3" />;
    if (facilityLower.includes("room") || facilityLower.includes("koth"))
      return <Lock className="h-3 w-3" />;
    return <Building className="h-3 w-3" />;
  };
  const getAssetIcon = (assetType) => {
    switch (assetType?.toLowerCase()) {
      case 'truck':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'ak-47':
      case 'weapon':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'equipment':
        return <Wrench className="h-5 w-5 text-green-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEmployeeView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewEmployee(true);
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    loading,
  }) => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || loading}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {Math.min((currentPage - 1) * employeesPerPage + 1, totalItems)}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * employeesPerPage, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>

          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || loading}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Render Overview Tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* District Navigation Breadcrumb */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <span>District: {data.districtInfo?.name}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-900">
            Tehsil: {data.tehsil}
          </span>
        </div>

        {/* Drill-up Options */}
        {data.drillUpOptions?.canDrillUp && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleDrillUpToDistrict}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {data.drillUpOptions.buttonText}
            </button>
            <div className="mt-2 text-xs text-gray-500">
              Available Districts:{" "}
              {data.drillUpOptions.availableDistricts
                ?.map((d) => d.name)
                .join(", ")}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Stations</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary?.totalStations || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary?.totalActiveEmployees || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Station Assets</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary?.totalStationAssets || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Stations with Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary?.stationsWithEmployees || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Stations without Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary?.stationsWithoutEmployees || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Requirements Alert */}
      {data.stationsNotMeetingRequirements?.count > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Critical Alert:</strong>{" "}
                {data.stationsNotMeetingRequirements.count} station(s) not
                meeting staff requirements
              </p>
              <div className="mt-2">
                {data.stationsNotMeetingRequirements.stations?.map(
                  (station) => (
                    <div key={station._id} className="text-xs text-red-600">
                      • {station.name}: {station.staffShortage} staff shortage
                      (needs {station.requiredStaff}, has{" "}
                      {station.totalEmployees})
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facilities Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Facilities Overview ({data.summary?.uniqueFacilities || 0} unique
          facilities)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(
            data.allStationsFacilitiesSummary?.breakdown || {}
          ).map(([facility, count]) => (
            <div
              key={facility}
              className="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              {getFacilityIcon(facility)}
              <div className="ml-2">
                <div className="text-xs text-gray-600">{facility}</div>
                <div className="text-sm font-bold text-gray-900">
                  {count} / {data.summary?.totalStations || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Statistics Tab
  const renderStatisticsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employee Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Employee by Designation
        </h3>
        <div className="space-y-3">
          {Object.entries(
            data.allStationEmployeeSummary?.breakdown?.byDesignation || {}
          ).map(([designation, count]) => (
            <div
              key={designation}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-gray-600 capitalize">
                {designation}
              </span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(count /
                        Math.max(
                          ...Object.values(
                            data.allStationEmployeeSummary.breakdown
                              .byDesignation
                          )
                        )) *
                        100
                        }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Employee by Grade
        </h3>
        <div className="space-y-3">
          {Object.entries(
            data.allStationEmployeeSummary?.breakdown?.byGrade || {}
          ).map(([grade, count]) => (
            <div key={grade} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{grade}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${(count /
                        Math.max(
                          ...Object.values(
                            data.allStationEmployeeSummary.breakdown.byGrade
                          )
                        )) *
                        100
                        }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Service Type Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(
            data.allStationEmployeeSummary?.breakdown?.byServiceType || {}
          ).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{type}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(count /
                        Math.max(
                          ...Object.values(
                            data.allStationEmployeeSummary.breakdown
                              .byServiceType
                          )
                        )) *
                        100
                        }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Cast Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(
            data.allStationEmployeeSummary?.breakdown?.byCast || {}
          ).map(([cast, count]) => (
            <div key={cast} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{cast}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${(count /
                        Math.max(
                          ...Object.values(
                            data.allStationEmployeeSummary.breakdown.byCast
                          )
                        )) *
                        100
                        }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Age Group Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(
            data.allStationEmployeeSummary?.breakdown?.byAge || {}
          ).map(([ageGroup, count]) => (
            <div key={ageGroup} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{ageGroup}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${count > 0
                        ? (count /
                          Math.max(
                            ...Object.values(
                              data.allStationEmployeeSummary.breakdown.byAge
                            )
                          )) *
                        100
                        : 0
                        }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Asset Summary
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {data.summary?.totalStationAssets || 0}
              </p>
              <p className="text-sm text-gray-600">Station Assets</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {data.summary?.totalEmployeeAssets || 0}
              </p>
              <p className="text-sm text-gray-600">Employee Assets</p>
            </div>
          </div>

          {data.employeeAssetsSummary?.total > 0 && (
            <div>
              <h6 className="text-sm font-medium text-gray-700 mb-2">
                Employee Assets by Type
              </h6>
              {Object.entries(
                data.employeeAssetsSummary.breakdown.byType || {}
              ).map(([type, count]) => (
                <div
                  key={type}
                  className="flex justify-between items-center text-sm mb-1"
                >
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Stations Tab
  const renderStationsTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Station Details ({data.stationsSummary?.length || 0} stations)
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {data.stationsSummary?.map((station) => {
          // Filter employees assigned to this station
          const stationEmployees = data.employees?.data?.filter(
            (employee) => employee.stations?._id === station._id
          ) || [];

          return (
            <div key={station._id} className="p-6">
              <div
                className="cursor-pointer"
                onClick={() => handleStationSelect(station)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {station.name}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${station.totalEmployees > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {station.totalEmployees} employees
                        </span>
                        {!station.meetsStaffRequirement && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Staff shortage: {station.staffShortage}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {station.address?.fullAddress || "Address not available"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          Coords: {station.coordinates?.latitude || "N/A"},{" "}
                          {station.coordinates?.longitude || "N/A"}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Created:{" "}
                          {station.createdAt
                            ? new Date(station.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDrillStation(station);
                        }}
                        className="flex items-center text-green-600 hover:text-green-800 mr-4 transition-colors"
                      >
                        <ArrowDown className="h-5 w-5 mr-1" />
                        Drill Down
                      </button>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${station.totalEmployees > 0
                            ? "text-blue-600"
                            : "text-red-600"
                          }`}
                      >
                        {station.totalEmployees}
                      </p>
                      <p className="text-xs text-gray-500">Staff</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {station.totalAssets || 0}
                      </p>
                      <p className="text-xs text-gray-500">Assets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">
                        {station.facilities?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Facilities</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Station Details */}
              {selectedStation?._id === station._id && (
                <div className="mt-6 border-t pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Station Facilities */}
                    <div>
                      <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <Layers className="h-4 w-4 mr-2" />
                        Facilities ({station.facilities?.length || 0})
                      </h5>
                      <div className="space-y-2">
                        {station.facilities?.map((facility, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 bg-gray-50 rounded"
                          >
                            {getFacilityIcon(facility)}
                            <span className="ml-2 text-sm text-gray-700">
                              {facility}
                            </span>
                          </div>
                        )) || (
                            <p className="text-sm text-gray-500">
                              No facilities listed
                            </p>
                          )}
                      </div>
                    </div>

                    {/* In-charges */}
                    <div>
                      <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Station In-charges
                      </h5>
                      {station.inCharges?.length > 0 ? (
                        <div className="space-y-2">
                          {station.inCharges.map((inCharge, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 rounded-lg"
                            >
                              <div className="font-medium text-blue-900">
                                {inCharge.employee?.name || "N/A"}
                              </div>
                              <div className="text-sm text-blue-700">
                                {inCharge.employee?.designation || "N/A"}
                              </div>
                              <div className="text-xs text-blue-600">
                                {inCharge.employee?.personalNumber || "N/A"}
                              </div>
                              <div className="text-xs text-blue-600">
                                Type: {inCharge.type || "N/A"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <UserX className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No in-charges assigned</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Station Assets */}
                  <div className="mt-6 pt-6 border-t">
                    <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Station Assets ({station.rawStationAssets?.length || 0})
                    </h5>
                    {station.rawStationAssets?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {station.rawStationAssets.map((assetRecord, index) => {
                          const asset = assetRecord.asset?.[0];
                          return (
                            <div key={assetRecord._id || index} className="bg-gray-50 rounded-lg p-4 border">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                  {getAssetIcon(asset?.type)}
                                  <h6 className="ml-2 font-medium text-gray-900">
                                    {asset?.name || "Unnamed Asset"}
                                  </h6>
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${assetRecord.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {assetRecord.status || "Unknown"}
                                </span>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Type:</span>
                                  <span className="text-gray-900 font-medium">
                                    {asset?.type || "N/A"}
                                  </span>
                                </div>

                                {asset?.model && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Model:</span>
                                    <span className="text-gray-900">{asset.model}</span>
                                  </div>
                                )}

                                {asset?.make && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Make:</span>
                                    <span className="text-gray-900">{asset.make}</span>
                                  </div>
                                )}

                                {asset?.color && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Color:</span>
                                    <span className="text-gray-900">{asset.color}</span>
                                  </div>
                                )}

                                {asset?.weaponNumber && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Weapon No:</span>
                                    <span className="text-gray-900 font-mono">{asset.weaponNumber}</span>
                                  </div>
                                )}

                                <div className="flex justify-between">
                                  <span className="text-gray-600">Assigned:</span>
                                  <span className="text-gray-900">
                                    {formatDate(assetRecord.assignedDate)}
                                  </span>
                                </div>

                                {assetRecord.assignedBy && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Assigned By:</span>
                                    <span className="text-gray-900">{assetRecord.assignedBy}</span>
                                  </div>
                                )}

                                {asset?.cost && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cost:</span>
                                    <span className="text-gray-900 font-medium">
                                      ${asset.cost.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-gray-200">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Created: {formatDate(assetRecord.createdAt)}
                                  </div>
                                  {assetRecord.updatedAt !== assetRecord.createdAt && (
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Updated: {formatDate(assetRecord.updatedAt)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg mb-6">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No assets assigned to this station</p>
                      </div>
                    )}
                  </div>

                  {/* Employee Assets */}
                  <div className="mt-6 pt-6 border-t">
                    <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Employee Assets ({stationEmployees.length} employees)
                    </h5>
                    {stationEmployees.length > 0 ? (
                      <div className="space-y-6">
                        {stationEmployees.map((employee, empIndex) => (
                          <div key={employee._id || empIndex} className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-center mb-3">
                              <User className="h-5 w-5 mr-2 text-gray-600" />
                              <h6 className="font-medium text-gray-900">
                                {employee.firstName} ({employee.personalNumber})
                              </h6>
                              <span className="ml-2 text-sm text-gray-600">
                                {employee.designation || "N/A"}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {employee.assets?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {employee.assets.map((asset, assetIndex) => (
                                    <div key={asset._id || assetIndex} className="p-3 bg-white rounded-lg border">
                                      <div className="flex items-center mb-2">
                                        {getAssetIcon(asset.type)}
                                        <span className="ml-2 font-medium text-gray-900">
                                          {asset.name || "Unnamed Asset"}
                                        </span>
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Type:</span>
                                          <span className="text-gray-900">{asset.type || "N/A"}</span>
                                        </div>
                                        {asset.model && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Model:</span>
                                            <span className="text-gray-900">{asset.model}</span>
                                          </div>
                                        )}
                                        {asset.make && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Make:</span>
                                            <span className="text-gray-900">{asset.make}</span>
                                          </div>
                                        )}
                                        {asset.color && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Color:</span>
                                            <span className="text-gray-900">{asset.color}</span>
                                          </div>
                                        )}
                                        {asset.weaponNumber && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Weapon No:</span>
                                            <span className="text-gray-900 font-mono">{asset.weaponNumber}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Assigned:</span>
                                          <span className="text-gray-900">
                                            {formatDate(asset.assignedDate)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Status:</span>
                                          <span
                                            className={`text-sm ${asset.assignmentStatus === "Active"
                                                ? "text-green-600"
                                                : "text-gray-600"
                                              }`}
                                          >
                                            {asset.assignmentStatus || "Unknown"}
                                          </span>
                                        </div>
                                        {asset.approvalComment && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Approval:</span>
                                            <span className="text-gray-900">{asset.approvalComment}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600">No assets assigned to this employee</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg mb-6">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No employees assigned to this station</p>
                      </div>
                    )}
                  </div>

                  {/* Station Metrics */}
                  <div className="pt-6 border-t">
                    <h5 className="text-md font-semibold text-gray-900 mb-3">
                      Station Metrics
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {station.totalEmployees || 0}
                        </p>
                        <p className="text-sm text-gray-600">Current Staff</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {station.requiredStaff || 0}
                        </p>
                        <p className="text-sm text-gray-600">Required Staff</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {station.totalAssets || 0}
                        </p>
                        <p className="text-sm text-gray-600">Total Assets</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p
                          className={`text-lg font-bold ${station.meetsStaffRequirement
                              ? "text-green-600"
                              : "text-red-600"
                            }`}
                        >
                          {station.meetsStaffRequirement ? "Yes" : "No"}
                        </p>
                        <p className="text-sm text-gray-600">Requirement Met</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }) || (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No stations found for this tehsil.</p>
            </div>
          )}
      </div>
    </div>
  );
  // Show district view if needed
  if (showDistrictView) {
    return (
      <DrillDistrictPage
        district={data?.districtInfo?.name}
        tehsil={tehsil}
        onBack={handleBackFromDistrict}
        onDrillTehsil={(selectedTehsil) => {
          setShowDistrictView(false);
          fetchComprehensiveTehsilDataForNewTehsil(selectedTehsil);
        }}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Stations
          </button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">
              Loading tehsil data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Stations
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">Error: {error}</p>
          </div>
          <button
            onClick={() => fetchComprehensiveTehsilData()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate pagination values correctly
  const totalPages = Math.ceil(totalEmployees / employeesPerPage);
  const groupedEmployees = groupEmployeesByStation(employees);
  const sortedStationNames = Object.keys(groupedEmployees).sort();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Stations
          </button>
          <button
            onClick={() => onDrillStation(null)}
            className="flex items-center text-red-600 hover:text-red-800 mr-4 transition-colors"
          >
            <ArrowDown className="h-5 w-5 mr-1" />
            Drill Down
          </button>
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tehsil{" "}
                {data.tehsil?.charAt(0).toUpperCase() + data.tehsil?.slice(1)}{" "}
                Comprehensive View
              </h1>
              <p className="text-sm text-gray-600">
                District: {data.districtInfo?.name} •{" "}
                {data.summary?.totalStations || 0} stations •{" "}
                {data.summary?.totalActiveEmployees || 0} personnel
              </p>
            </div>
          </div>
          <button
            onClick={handleDrillUpToDistrict}
            className="flex items-center text-red-600 hover:text-red-800 ml-4 transition-colors"
          >
            <ArrowUp className="h-5 w-5 mr-1" />
            Drill Up
          </button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>
            Last updated:{" "}
            {new Date(
              data.metadata?.requestTime || Date.now()
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "statistics", label: "Statistics", icon: PieChart },
              { id: "stations", label: "Stations Detail", icon: Building },
              { id: "employees", label: "Employees", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.id === "employees" && totalEmployees > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {totalEmployees}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "statistics" && renderStatisticsTab()}
        {activeTab === "stations" && renderStationsTab()}

        {activeTab === "employees" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  All Employees ({totalEmployees} total)
                </h3>
                {employeesLoading && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Loading...
                  </div>
                )}
              </div>
            </div>

            {employeesLoading && employees.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600">Loading employees...</span>
                </div>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No employees found for this tehsil.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {sortedStationNames.map((stationName) => {
                  const stationData = groupedEmployees[stationName];
                  const isExpanded = expandedStations.has(stationName);

                  return (
                    <div key={stationName}>
                      {/* Station Header */}
                      <div
                        className="bg-blue-50 px-6 py-4 border-b border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleStationExpansion(stationName)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-blue-900 flex items-center">
                            <Building className="h-5 w-5 mr-2" />
                            Station: {stationName}
                            <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                              {stationData.employees.length} employees
                            </span>
                          </h4>
                          <ChevronDown
                            className={`h-5 w-5 text-blue-700 transition-transform ${isExpanded ? "transform rotate-180" : ""
                              }`}
                          />
                        </div>
                        {stationData.stationInfo && (
                          <div className="mt-2 text-sm text-blue-700">
                            <div>
                              Address:{" "}
                              {stationData.stationInfo.address?.fullAddress ||
                                "N/A"}
                            </div>
                            <div>
                              Tehsil: {stationData.stationInfo.tehsil || "N/A"}{" "}
                              | District:{" "}
                              {stationData.stationInfo.district || "N/A"}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Employee Table for this station - only show if expanded */}
                      {isExpanded && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Personal No.
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  CNIC
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Designation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Service Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Assigned Assets
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Contact
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {stationData.employees.map((employee) => {
                                const isStationIncharge =
                                  employee?.stations?.stationIncharge?.some(
                                    (incharge) =>
                                      incharge?.employee?.toString() ===
                                      employee?._id?.toString()
                                  );

                                const disciplinaryObjects =
                                  employee?.disciplinaryActions?.filter(
                                    (dis) => dis.isDisciplinaryAction === true
                                  ) || [];

                                const hasAward = employee.assignedAwards?.some(
                                  (award) => award.isMonitor === true
                                );

                                // Group assets by type for better display
                                const assetsByType = {};
                                (employee.assets || []).forEach(asset => {
                                  const type = asset.type || 'Other';
                                  if (!assetsByType[type]) {
                                    assetsByType[type] = [];
                                  }
                                  assetsByType[type].push(asset);
                                });

                                const getAssetIcon = (assetType) => {
                                  const type = assetType?.toLowerCase();
                                  if (type?.includes('truck') || type?.includes('vehicle')) return '🚛';
                                  if (type?.includes('rifle') || type?.includes('ak') || type?.includes('9mm')) return '🔫';
                                  return '📦';
                                };

                                const getAssetColor = (assetType) => {
                                  const type = assetType?.toLowerCase();
                                  if (type?.includes('truck') || type?.includes('vehicle')) return 'bg-blue-100 text-blue-800';
                                  if (type?.includes('rifle') || type?.includes('ak') || type?.includes('9mm')) return 'bg-red-100 text-red-800';
                                  return 'bg-gray-100 text-gray-800';
                                };

                                return (
                                  <tr
                                    key={employee._id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <img
                                          src={
                                            employee.profileUrl?.[0] ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                              employee?.firstName || "N"
                                            )}&background=6366f1&color=ffffff&size=40&rounded=true`
                                          }
                                          alt={employee?.firstName}
                                          className="h-10 w-10 rounded-full object-cover"
                                          onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                              employee?.firstName || "N"
                                            )}&background=6366f1&color=ffffff&size=40&rounded=true`;
                                          }}
                                        />
                                        <div
                                          className="ml-4 cursor-pointer"
                                          onClick={() =>
                                            handleEmployeeView(employee)
                                          }
                                        >
                                          <div className="text-sm font-medium text-gray-900">
                                            {employee?.firstName || "N/A"}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {employee?.fatherFirstName || "N/A"}
                                          </div>
                                          {isStationIncharge && (
                                            <div className="bg-blue-100 text-blue-800 text-[10px] font-medium px-2 py-1 rounded">
                                              <p>Station Incharge</p>
                                            </div>
                                          )}
                                          {hasAward && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                              Award
                                            </span>
                                          )}
                                          {
                                            disciplinaryObjects.length > 0 && disciplinaryObjects[0]?.description && (
                                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                                {disciplinaryObjects[0].description}
                                              </span>
                                            )
                                          }
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {employee?.personalNumber || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {employee?.cnic || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {employee?.designation || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {employee?.grade || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.serviceType === "federal"
                                          ? "bg-green-100 text-green-800"
                                          : employee.serviceType ===
                                            "provincial"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                          }`}
                                      >
                                        {employee.serviceType || "N/A"}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="max-w-xs">
                                        {Object.keys(assetsByType).length > 0 ? (
                                          <div className="space-y-1">
                                            {Object.entries(assetsByType).map(([type, assets]) => (
                                              <div key={type} className="flex items-center space-x-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssetColor(type)}`}>
                                                  <span className="mr-1">{getAssetIcon(type)}</span>
                                                  {type} ({assets.length})
                                                </span>
                                              </div>
                                            ))}
                                            <div className="text-xs text-gray-500 mt-1">
                                              Total: {employee.assets?.length || 0} assets
                                            </div>
                                            {/* Show weapon numbers if available */}
                                            {employee.assets?.some(asset => asset.weaponNumber) && (
                                              <div className="text-xs text-gray-400 mt-1">
                                                {employee.assets
                                                  .filter(asset => asset.weaponNumber)
                                                  .slice(0, 2)
                                                  .map(asset => asset.weaponNumber)
                                                  .join(', ')}
                                                {employee.assets.filter(asset => asset.weaponNumber).length > 2 && '...'}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-xs text-gray-400">No assets assigned</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                                        {employee.mobileNumber || "N/A"}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Station Summary */}
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>
                            Station Total: {stationData.employees.length} employees
                          </span>
                          <span>
                            Total Assets: {stationData.employees.reduce((total, emp) => total + (emp.assets?.length || 0), 0)}
                          </span>
                          <span>
                            Click to {isExpanded ? "collapse" : "expand"} employee details
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalEmployees}
              onPageChange={handlePageChange}
              loading={employeesLoading}
            />
          </div>
        )}
      </div>

      {/* Footer Summary - Only show if data exists */}
      {data.summary && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                Total stations:{" "}
                <strong className="ml-1">{data.summary.totalStations}</strong>
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Active employees:{" "}
                <strong className="ml-1">
                  {data.summary.totalActiveEmployees}
                </strong>
              </span>
              <span className="flex items-center">
                <Database className="h-4 w-4 mr-1" />
                Total assets:{" "}
                <strong className="ml-1">
                  {(data.summary.totalStationAssets || 0) +
                    (data.summary.totalEmployeeAssets || 0)}
                </strong>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Staffed: {data.summary.stationsWithEmployees}
              </span>
              <span className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Understaffed: {data.summary.stationsWithoutEmployees}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          {data.metadata?.queryPerformance && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Query Performance
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">Stations Found</span>
                  <span className="font-semibold text-blue-900">
                    {data.metadata.queryPerformance.stationsFound}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">
                    Employees Found
                  </span>
                  <span className="font-semibold text-green-900">
                    {data.metadata.queryPerformance.employeesFound}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-700">
                    Station Assets
                  </span>
                  <span className="font-semibold text-purple-900">
                    {data.metadata.queryPerformance.stationAssetsFound}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-orange-700">
                    Employee Assets
                  </span>
                  <span className="font-semibold text-orange-900">
                    {data.metadata.queryPerformance.employeeAssetsFound}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Data Quality and Recommendations */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Data Quality Overview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">Unique Facilities</span>
                <span className="font-semibold text-blue-900">
                  {data.summary?.uniqueFacilities || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">
                  Requirement Compliance
                </span>
                <span className="font-semibold text-green-900">
                  {data.summary?.totalStations
                    ? Math.round(
                      ((data.summary.totalStations -
                        (data.stationsNotMeetingRequirements?.count || 0)) /
                        data.summary.totalStations) *
                      100
                    )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-700">
                  Avg Staff/Station
                </span>
                <span className="font-semibold text-purple-900">
                  {data.summary?.totalStations
                    ? (
                      (data.summary.totalActiveEmployees || 0) /
                      data.summary.totalStations
                    ).toFixed(1)
                    : "0.0"}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {((data.summary?.stationsWithoutEmployees || 0) > 0 ||
            (data.stationsNotMeetingRequirements?.count || 0) > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                  Action Items
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {(data.summary?.stationsWithoutEmployees || 0) > 0 && (
                    <li>
                      • Urgent: Assign staff to{" "}
                      {data.summary.stationsWithoutEmployees} stations with zero
                      employees
                    </li>
                  )}
                  {(data.stationsNotMeetingRequirements?.count || 0) > 0 && (
                    <li>
                      • Priority: Address staff shortages in{" "}
                      {data.stationsNotMeetingRequirements.count} stations not
                      meeting requirements
                    </li>
                  )}
                  {(data.summary?.totalStationAssets || 0) === 0 && (
                    <li>
                      • Review: No station assets recorded - verify asset
                      management system
                    </li>
                  )}
                  {(data.allStationEmployeeSummary?.breakdown?.byAge?.Unknown ||
                    0) > 0 && (
                      <li>
                        • Data Quality: Update missing age information for better
                        analytics
                      </li>
                    )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Employee View Modal */}
      {isViewEmployee && selectedEmployee && (
        <EmployeeViewModal
          isOpen={isViewEmployee}
          onClose={handleClose}
          employee={selectedEmployee}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default DrillTehsilPage;
