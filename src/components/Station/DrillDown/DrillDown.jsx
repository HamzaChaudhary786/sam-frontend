import React, { useState, useEffect } from 'react';
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
  ArrowDown
} from 'lucide-react';
import { BACKEND_URL } from '../../../constants/api';

const DrillDownPage = ({ tehsil, onBack, onDrill }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchComprehensiveTehsilData();
  }, [tehsil]);

  const fetchComprehensiveTehsilData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/stations/by-tehsil?tehsil=${tehsil}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comprehensive tehsil data');
      }

      const result = await response.json();
      console.log('API Response:', result); // Debug log
      setData(result.data);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStationSelect = (station) => {
    setSelectedStation(selectedStation?._id === station._id ? null : station);
  };

  const getFacilityIcon = (facility) => {
    const facilityLower = facility.toLowerCase();
    if (facilityLower.includes('mobile') || facilityLower.includes('signal')) return <Wifi className="h-3 w-3" />;
    if (facilityLower.includes('electric')) return <Zap className="h-3 w-3" />;
    if (facilityLower.includes('wall') || facilityLower.includes('boundary')) return <Shield className="h-3 w-3" />;
    if (facilityLower.includes('wireless') || facilityLower.includes('base')) return <Navigation className="h-3 w-3" />;
    if (facilityLower.includes('room') || facilityLower.includes('koth')) return <Lock className="h-3 w-3" />;
    return <Building className="h-3 w-3" />;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* District Navigation Breadcrumb */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <span>District: {data.districtInfo.name}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-900">Tehsil: {data.tehsil}</span>
        </div>
        
        {/* Drill-up Options */}
        {data.drillUpOptions.canDrillUp && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {data.drillUpOptions.buttonText}
            </button>
            <div className="mt-2 text-xs text-gray-500">
              Available Districts: {data.drillUpOptions.availableDistricts.map(d => d.name).join(', ')}
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
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalStations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalActiveEmployees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Station Assets</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalStationAssets}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Stations with Staff</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.stationsWithEmployees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Stations without Staff</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.stationsWithoutEmployees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Requirements Alert */}
      {data.stationsNotMeetingRequirements.count > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Critical Alert:</strong> {data.stationsNotMeetingRequirements.count} station(s) not meeting staff requirements
              </p>
              <div className="mt-2">
                {data.stationsNotMeetingRequirements.stations.map(station => (
                  <div key={station._id} className="text-xs text-red-600">
                    • {station.name}: {station.staffShortage} staff shortage (needs {station.requiredStaff}, has {station.totalEmployees})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facilities Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Facilities Overview ({data.summary.uniqueFacilities} unique facilities)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(data.allStationsFacilitiesSummary.breakdown).map(([facility, count]) => (
            <div key={facility} className="flex items-center p-3 bg-gray-50 rounded-lg">
              {getFacilityIcon(facility)}
              <div className="ml-2">
                <div className="text-xs text-gray-600">{facility}</div>
                <div className="text-sm font-bold text-gray-900">{count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatisticsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employee Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Employee by Designation
        </h3>
        <div className="space-y-3">
          {Object.entries(data.allStationEmployeeSummary.breakdown.byDesignation).map(([designation, count]) => (
            <div key={designation} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{designation}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(count / Math.max(...Object.values(data.allStationEmployeeSummary.breakdown.byDesignation))) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
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
          {Object.entries(data.allStationEmployeeSummary.breakdown.byGrade).map(([grade, count]) => (
            <div key={grade} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{grade}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(count / Math.max(...Object.values(data.allStationEmployeeSummary.breakdown.byGrade))) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
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
          {Object.entries(data.allStationEmployeeSummary.breakdown.byServiceType).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{type}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(count / Math.max(...Object.values(data.allStationEmployeeSummary.breakdown.byServiceType))) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
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
          {Object.entries(data.allStationEmployeeSummary.breakdown.byCast).map(([cast, count]) => (
            <div key={cast} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{cast}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(count / Math.max(...Object.values(data.allStationEmployeeSummary.breakdown.byCast))) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
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
          {Object.entries(data.allStationEmployeeSummary.breakdown.byAge).map(([ageGroup, count]) => (
            <div key={ageGroup} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{ageGroup}</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full" 
                    style={{ 
                      width: `${count > 0 ? (count / Math.max(...Object.values(data.allStationEmployeeSummary.breakdown.byAge))) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
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
              <p className="text-2xl font-bold text-blue-600">{data.summary.totalStationAssets}</p>
              <p className="text-sm text-gray-600">Station Assets</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.summary.totalEmployeeAssets}</p>
              <p className="text-sm text-gray-600">Employee Assets</p>
            </div>
          </div>
          
          {data.employeeAssetsSummary.total > 0 && (
            <div>
              <h6 className="text-sm font-medium text-gray-700 mb-2">Employee Assets by Type</h6>
              {Object.entries(data.employeeAssetsSummary.breakdown.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-sm mb-1">
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

  const renderStationsTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Station Details ({data.stationsSummary.length} stations)
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {data.stationsSummary.map((station) => (
          <div key={station._id} className="p-6">
            <div 
              className="cursor-pointer"
              onClick={() => handleStationSelect(station)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Station Icon/Image */}
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Station Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{station.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        station.totalEmployees > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
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
                      <span className="text-sm">{station.address.fullAddress}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Map className="h-3 w-3 mr-1" />
                        Coords: {station.coordinates.latitude}, {station.coordinates.longitude}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Created: {new Date(station.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${
                      station.totalEmployees > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {station.totalEmployees}
                    </p>
                    <p className="text-xs text-gray-500">Staff</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{station.totalAssets}</p>
                    <p className="text-xs text-gray-500">Assets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{station.facilities.length}</p>
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
                      Facilities ({station.facilities.length})
                    </h5>
                    <div className="space-y-2">
                      {station.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                          {getFacilityIcon(facility)}
                          <span className="ml-2 text-sm text-gray-700">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In-charges */}
                  <div>
                    <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Station In-charges
                    </h5>
                    {station.inCharges.length > 0 ? (
                      <div className="space-y-2">
                        {station.inCharges.map((inCharge, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-medium text-blue-900">{inCharge.employee.name}</div>
                            <div className="text-sm text-blue-700">{inCharge.employee.designation}</div>
                            <div className="text-xs text-blue-600">{inCharge.employee.personalNumber}</div>
                            <div className="text-xs text-blue-600">Type: {inCharge.type}</div>
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

                {/* Station Metrics */}
                <div className="mt-6 pt-6 border-t">
                  <h5 className="text-md font-semibold text-gray-900 mb-3">Station Metrics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{station.totalEmployees}</p>
                      <p className="text-sm text-gray-600">Current Staff</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{station.requiredStaff}</p>
                      <p className="text-sm text-gray-600">Required Staff</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{station.totalAssets}</p>
                      <p className="text-sm text-gray-600">Total Assets</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className={`text-lg font-bold ${station.meetsStaffRequirement ? 'text-green-600' : 'text-red-600'}`}>
                        {station.meetsStaffRequirement ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-gray-600">Requirement Met</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

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
            Back to Stations
          </button>
          <button
            onClick={onDrill}
            className="flex items-center text-Green-600 hover:text-blue-800 mr-4"
          >
            <ArrowDown className="h-5 w-5 mr-1" />
            Drill Down
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={fetchComprehensiveTehsilData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

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
            onClick={onDrill}
            className="flex items-center text-Red-600 hover:text-blue-800 mr-4"
          >
            <ArrowDown className="h-5 w-5 mr-1" />
            Drill Down
          </button>
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tehsil {data.tehsil.charAt(0).toUpperCase() + data.tehsil.slice(1)} Comprehensive View
              </h1>
              <p className="text-sm text-gray-600">
                District: {data.districtInfo.name} • {data.summary.totalStations} stations • {data.summary.totalActiveEmployees} personnel
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date(data.metadata?.requestTime || Date.now()).toLocaleString()}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'statistics', label: 'Statistics', icon: PieChart },
              { id: 'stations', label: 'Stations Detail', icon: Building }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'statistics' && renderStatisticsTab()}
        {activeTab === 'stations' && renderStationsTab()}
      </div>

      {/* Employee List */}
      {data.employees?.data && data.employees.data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              All Employees ({data.employees.pagination.totalEmployees})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cast</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.employees.data.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={employee.profileUrl?.[0]}
                          alt={employee.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.fatherName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.personalNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.cnic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {employee.cast}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.serviceType === 'federal' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.station?.name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {employee.mobileNumber}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Info */}
          {data.employees.pagination && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <span className="text-sm text-gray-700">
                  Page {data.employees.pagination.currentPage} of {data.employees.pagination.totalPages}
                </span>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing employees <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">{data.employees.data.length}</span> of{' '}
                    <span className="font-medium">{data.employees.pagination.totalEmployees}</span> results
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-700">
                    Page {data.employees.pagination.currentPage} of {data.employees.pagination.totalPages}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              Total stations: <strong className="ml-1">{data.summary.totalStations}</strong>
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Active employees: <strong className="ml-1">{data.summary.totalActiveEmployees}</strong>
            </span>
            <span className="flex items-center">
              <Database className="h-4 w-4 mr-1" />
              Total assets: <strong className="ml-1">{data.summary.totalStationAssets + data.summary.totalEmployeeAssets}</strong>
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
            <h4 className="text-sm font-medium text-gray-900 mb-2">Query Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">Stations Found</span>
                <span className="font-semibold text-blue-900">{data.metadata.queryPerformance.stationsFound}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">Employees Found</span>
                <span className="font-semibold text-green-900">{data.metadata.queryPerformance.employeesFound}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-700">Station Assets</span>
                <span className="font-semibold text-purple-900">{data.metadata.queryPerformance.stationAssetsFound}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-orange-700">Employee Assets</span>
                <span className="font-semibold text-orange-900">{data.metadata.queryPerformance.employeeAssetsFound}</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality and Recommendations */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Data Quality Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">Unique Facilities</span>
              <span className="font-semibold text-blue-900">{data.summary.uniqueFacilities}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Requirement Compliance</span>
              <span className="font-semibold text-green-900">
                {Math.round(((data.summary.totalStations - data.stationsNotMeetingRequirements.count) / data.summary.totalStations) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-700">Avg Staff/Station</span>
              <span className="font-semibold text-purple-900">
                {(data.summary.totalActiveEmployees / data.summary.totalStations).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {(data.summary.stationsWithoutEmployees > 0 || data.stationsNotMeetingRequirements.count > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
              Action Items
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {data.summary.stationsWithoutEmployees > 0 && (
                <li>• Urgent: Assign staff to {data.summary.stationsWithoutEmployees} stations with zero employees</li>
              )}
              {data.stationsNotMeetingRequirements.count > 0 && (
                <li>• Priority: Address staff shortages in {data.stationsNotMeetingRequirements.count} stations not meeting requirements</li>
              )}
              {data.summary.totalStationAssets === 0 && (
                <li>• Review: No station assets recorded - verify asset management system</li>
              )}
              {data.allStationEmployeeSummary.breakdown.byAge.Unknown > 0 && (
                <li>• Data Quality: Update missing age information for better analytics</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillDownPage;