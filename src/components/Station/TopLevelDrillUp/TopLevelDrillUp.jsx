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
} from "lucide-react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../constants/api";

const TopLevelDrillPage = ({
  onBack,
  onDrillDistrict
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTopLevelData();
  }, []);

  const fetchTopLevelData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching top level data');

      const topLevelURL = `${BACKEND_URL}/stations/top-level-drill-up?page=1&limit=10`;
      console.log('Calling top-level-drill-up API:', topLevelURL);

      const topLevelResponse = await fetch(
        topLevelURL,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (topLevelResponse.ok) {
        const topLevelResult = await topLevelResponse.json();
        console.log('Top-level-drill-up response:', topLevelResult);
        setData(topLevelResult);
      } else {
        console.error('Top-level-drill-up API failed:', topLevelResponse.status, topLevelResponse.statusText);
        throw new Error("Failed to fetch top level data");
      }
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDistrictData = () => {
    console.log('Getting district data from:', data);
    return data?.districts || [];
  };

  const getSummaryData = () => {
    console.log('Getting summary data from:', data);
    
    if (data?.overallInfo) {
      return {
        totalDistricts: data.overallInfo.totalDistricts,
        totalTehsils: data.overallInfo.totalTehsils,
        totalStations: data.overallInfo.totalStations,
        totalEmployees: data.overallInfo.totalEmployees,
        totalAssets: data.overallInfo.totalAssets,
        activeStations: data.overallInfo.totalStations - (data.overallInfo.totalStationsNotMeetingReq || 0),
        totalFacilities: data.overallInfo.totalFacilities,
        totalDesignations: data.overallInfo.totalDesignations,
        totalGrades: data.overallInfo.totalGrades,
        totalRanks: data.overallInfo.totalRanks,
        totalServiceTypes: data.overallInfo.totalServiceTypes,
        totalCasts: data.overallInfo.totalCasts
      };
    }

    console.log('No summary data found, returning defaults');
    return {
      totalDistricts: 0,
      totalTehsils: 0,
      totalStations: 0,
      totalEmployees: 0,
      totalAssets: 0,
      activeStations: 0,
      totalFacilities: 0,
      totalDesignations: 0,
      totalGrades: 0,
      totalRanks: 0,
      totalServiceTypes: 0,
      totalCasts: 0
    };
  };

  const getStatisticsData = () => {
    return data?.statistics || {};
  };

  const getFacilitiesData = () => {
    return data?.summaries?.facilities || [];
  };

  const handleDistrictSelect = (selectedDistrictName) => {
    setSelectedDistrict(selectedDistrict === selectedDistrictName ? null : selectedDistrictName);
  };

  const renderOverviewTab = () => {
    const summary = getSummaryData();
    const districtData = getDistrictData();
    const facilities = getFacilitiesData();

    return (
      <div className="space-y-6">
        {/* System Navigation Breadcrumb */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="h-4 w-4" />
            <span className="font-medium text-gray-900">System Overview: All Districts</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Map className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Districts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalDistricts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Tehsils</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalTehsils}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Stations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalStations}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalEmployees}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalAssets}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Stations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.activeStations}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Overview */}
        {facilities.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              System-wide Facility Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {facilities.map((facility) => (
                <div
                  key={facility._id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{facility._id}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Count:</span>
                      <span className="font-medium">{facility.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* District Breakdown */}
        {districtData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Map className="h-5 w-5 mr-2" />
              District Distribution ({districtData.length} districts)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {districtData.map((districtItem) => (
                <div
                  key={districtItem.district}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleDistrictSelect(districtItem.district)}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{districtItem.district}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stations:</span>
                      <span className="font-medium">{`${districtItem.totalStations || 0} / ${summary.totalStations}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tehsils:</span>
                      <span className="font-medium">{`${districtItem.totalTehsils || 0} / ${summary.totalTehsils}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employees:</span>
                      <span className="font-medium">{`${districtItem.totalEmployees || 0} / ${summary.totalEmployees}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assets:</span>
                      <span className="font-medium">{`${districtItem.totalAssets || 0} / ${summary.totalAssets}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Non-compliant:</span>
                      <span className="font-medium text-red-600">{districtItem.stationsNotMeetingRequirements || 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDistrict && onDrillDistrict(districtItem.district);
                    }}
                    
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Drill Down →
                  </button>
                </div>
              ))}
            </div>

            {/* Selected District Details */}
            {selectedDistrict && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Details for District: {selectedDistrict}
                </h3>
                {(() => {
                  const selectedDistrictData = districtData.find(d => d.district === selectedDistrict);
                  if (!selectedDistrictData) return null;
                  
                  return (
                    <div className="space-y-4">
                      {/* District Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-600">{selectedDistrictData.totalStations}</p>
                          <p className="text-sm text-gray-600">Total Stations</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-lg font-bold text-green-600">{selectedDistrictData.totalEmployees}</p>
                          <p className="text-sm text-gray-600">Total Employees</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-lg font-bold text-purple-600">{selectedDistrictData.totalAssets}</p>
                          <p className="text-sm text-gray-600">Total Assets</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-lg font-bold text-red-600">{selectedDistrictData.stationsNotMeetingRequirements}</p>
                          <p className="text-sm text-gray-600">Non-compliant</p>
                        </div>
                      </div>

                      {/* District Facilities */}
                      {selectedDistrictData.summaries?.facilities && (
                        <div>
                          <h5 className="text-md font-semibold text-gray-900 mb-2">District Facilities</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedDistrictData.summaries.facilities.map((facility) => (
                              <div key={facility._id} className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{facility._id}: {facility.count}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Non-compliant Stations Details */}
                      {selectedDistrictData.stationsNotMeetingReqDetails?.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                            Stations Not Meeting Requirements
                          </h4>
                          <div className="space-y-2">
                            {selectedDistrictData.stationsNotMeetingReqDetails.map((station) => (
                              <div key={station.stationId} className="p-3 bg-white rounded-lg">
                                <h5 className="font-semibold text-gray-900">{station.stationName}</h5>
                                <div className="mt-1 space-y-1">
                                  {station.missingRequirements.map((req, index) => (
                                    <div key={index} className="text-sm">
                                      <p className="text-gray-600">
                                        {req.type === 'staff' ? 'Staff Shortage' : 
                                         req.type === 'asset' ? 'Asset Shortage' : 'Facility Missing'}:
                                        <span className="ml-1 font-medium">
                                          {req.type === 'facility' ? req.required : 
                                           `Required: ${req.required}, Available: ${req.available}`}
                                        </span>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStatisticsTab = () => {
    const statistics = getStatisticsData();
    const summary = getSummaryData();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Statistics by Designation */}
        {statistics.employeeStats?.byDesignation && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Employee by Designation
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.employeeStats.byDesignation).map(([designation, count]) => (
                <div key={designation} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{designation || 'Unknown'}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(statistics.employeeStats.byDesignation), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{`${count} / ${summary.totalDesignations}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee Statistics by Grade */}
        {statistics.employeeStats?.byGrade && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Employee by Grade
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.employeeStats.byGrade).map(([grade, count]) => (
                <div key={grade} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{grade || 'Unknown'}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(statistics.employeeStats.byGrade), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{`${count} / ${summary.totalGrades}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee Statistics by Rank */}
        {statistics.employeeStats?.byRank && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Employee by Rank
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.employeeStats.byRank).map(([rank, count]) => (
                <div key={rank} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{rank || 'Unknown'}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(statistics.employeeStats.byRank), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{`${count} / ${summary.totalRanks}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asset Distribution */}
        {statistics.assetStats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Asset Distribution
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{statistics.assetStats.stationAssets}</p>
                  <p className="text-sm text-gray-600">Station Assets</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{statistics.assetStats.employeeAssets}</p>
                  <p className="text-sm text-gray-600">Employee Assets</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            System Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">System Occupancy Rate</span>
              <span className="font-semibold text-gray-900">
                {summary.totalStations > 0
                  ? Math.round((summary.activeStations / summary.totalStations) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg Employees per Station</span>
              <span className="font-semibold text-gray-900">
                {summary.totalStations > 0
                  ? (summary.totalEmployees / summary.totalStations).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Assets per Employee</span>
              <span className="font-semibold text-gray-900">
                {summary.totalEmployees > 0
                  ? (summary.totalAssets / summary.totalEmployees).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Stations Not Meeting Requirements</span>
              <span className="font-semibold text-red-600">{statistics.summary?.stationsNotMeetingRequirements || 0}</span>
            </div>
          </div>
        </div>

        {/* Facility Distribution */}
        {statistics.facilities && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Facility Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.facilities).map(([facility, count]) => (
                <div key={facility} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{facility || 'Unknown'}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(statistics.facilities), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{`${count} / ${summary.totalFacilities}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDistrictsTab = () => {
    const districtData = getDistrictData();

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Map className="h-5 w-5 mr-2" />
            District Details ({districtData.length} districts)
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {districtData.map((districtItem) => (
            <div key={districtItem.district} className="p-6">
              <div
                className="cursor-pointer"
                onClick={() => handleDistrictSelect(districtItem.district)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Map className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          District {districtItem.district}
                        </h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {districtItem.totalStations} stations
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {districtItem.totalTehsils} Tehsils
                        </span>
                        <span className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {districtItem.totalStations} Stations
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {districtItem.totalEmployees} Employees
                        </span>
                        <span className="flex items-center">
                          <Database className="h-3 w-3 mr-1" />
                          {districtItem.totalAssets} Assets
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {onDrillDistrict && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDrillDistrict(districtItem.district);
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ArrowDown className="h-5 w-5 mr-1" />
                        Drill Down
                      </button>
                    )}
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {districtItem.totalEmployees}
                      </p>
                      <p className="text-xs text-gray-500">Staff</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {districtItem.totalAssets}
                      </p>
                      <p className="text-xs text-gray-500">Assets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">
                        {districtItem.stationsNotMeetingRequirements}
                      </p>
                      <p className="text-xs text-gray-500">Non-compliant</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDistrict === districtItem.district && (
                <div className="mt-6 border-t pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">
                        {districtItem.totalTehsils}
                      </p>
                      <p className="text-sm text-gray-600">Total Tehsils</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">
                        {districtItem.totalStations}
                      </p>
                      <p className="text-sm text-gray-600">Total Stations</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">
                        {districtItem.totalEmployees}
                      </p>
                      <p className="text-sm text-gray-600">Total Employees</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">
                        {districtItem.totalAssets}
                      </p>
                      <p className="text-sm text-gray-600">Total Assets</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">
                        {districtItem.stationsNotMeetingRequirements}
                      </p>
                      <p className="text-sm text-gray-600">Non-compliant Stations</p>
                    </div>
                  </div>
                  
                  {/* District Facilities */}
                  {districtItem.summaries?.facilities && districtItem.summaries.facilities.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-md font-semibold text-gray-900 mb-2">District Facilities</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {districtItem.summaries.facilities.map((facility) => (
                          <div key={facility._id} className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{facility._id}: {facility.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={fetchTopLevelData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summary = getSummaryData();
  const statistics = getStatisticsData();
  const districtDataList = getDistrictData();

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
            Back
          </button>
          <div className="flex items-center">
            <Map className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                System Overview - All Districts
              </h1>
              <p className="text-sm text-gray-600">
                {summary.totalDistricts} districts • {summary.totalTehsils} tehsils • {summary.totalStations} stations • {summary.totalEmployees} personnel
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "overview", label: "System Overview", icon: Activity },
              { id: "statistics", label: "Statistics", icon: PieChart },
              { id: "districts", label: "District Details", icon: Map },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "statistics" && renderStatisticsTab()}
        {activeTab === "districts" && renderDistrictsTab()}
      </div>

      {/* Footer Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <Map className="h-4 w-4 mr-1" />
              System Level: <strong className="ml-1">All Districts</strong>
            </span>
            <span className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              Total stations: <strong className="ml-1">{summary.totalStations}</strong>
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Total employees: <strong className="ml-1">{summary.totalEmployees}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Active stations: {summary.activeStations}
            </span>
            <span className="flex items-center text-blue-600">
              <Map className="h-4 w-4 mr-1" />
              Districts: {summary.totalDistricts}
            </span>
            <span className="flex items-center text-purple-600">
              <MapPin className="h-4 w-4 mr-1" />
              Tehsils: {summary.totalTehsils}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopLevelDrillPage;