import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, Users, MapPin, Award, Calendar, Phone, UserCheck } from 'lucide-react';

const DrillDownPage = ({ tehsil, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchStationsByTehsil();
  }, [tehsil]);

  const fetchStationsByTehsil = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/stations/by-tehsil?tehsil=${tehsil}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stations data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStationSelect = (station) => {
    setSelectedStation(selectedStation?.stationId === station.stationId ? null : station);
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
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Stations
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Stations in {data?.tehsil}
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Employees/Station</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.averageEmployeesPerStation}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">With Employees</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.stationsWithEmployees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Without Employees</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.stationsWithoutEmployees}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Statistics */}
      {data?.overallStatistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Designation Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Designation Distribution</h3>
            <div className="space-y-3">
              {Object.entries(data.overallStatistics.designationDistribution).map(([designation, count]) => (
                <div key={designation} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{designation}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / Math.max(...Object.values(data.overallStatistics.designationDistribution))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Type Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Type Distribution</h3>
            <div className="space-y-3">
              {Object.entries(data.overallStatistics.serviceTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{type}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${type === 'Permanent' ? 'bg-green-600' : 'bg-yellow-600'}`}
                        style={{ 
                          width: `${(count / Math.max(...Object.values(data.overallStatistics.serviceTypeDistribution))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{data.overallStatistics.ageStatistics.averageAge}</p>
                <p className="text-sm text-gray-600">Average Age</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {data.overallStatistics.ageStatistics.minAge} - {data.overallStatistics.ageStatistics.maxAge}
                </p>
                <p className="text-sm text-gray-600">Age Range</p>
              </div>
            </div>
          </div>

          {/* Age Group Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Group Distribution</h3>
            <div className="space-y-3">
              {Object.entries(data.overallStatistics.ageGroupDistribution).map(([ageGroup, count]) => (
                <div key={ageGroup} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{ageGroup} years</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / Math.max(...Object.values(data.overallStatistics.ageGroupDistribution))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Station Details</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {data?.stations?.map((station) => (
            <div key={station.stationId} className="p-6">
              <div 
                className="cursor-pointer"
                onClick={() => handleStationSelect(station)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Station Images */}
                    <div className="flex-shrink-0">
                      {station.stationImages && station.stationImages.length > 0 ? (
                        <img 
                          src={station.stationImages[0]} 
                          alt="Station" 
                          className="h-16 w-16 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Station Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{station.stationName}</h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {station.employeeStats.totalActiveEmployees} employees
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{station.address.fullAddress}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>ID: {station.stationId}</span>
                        <span>Coords: {station.coordinates.latitude}, {station.coordinates.longitude}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{station.employeeStats.totalActiveEmployees}</p>
                      <p className="text-xs text-gray-500">Active Staff</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{station.employeeStats.uniqueDesignations}</p>
                      <p className="text-xs text-gray-500">Designations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{station.employeeStats.ageStatistics.averageAge}</p>
                      <p className="text-xs text-gray-500">Avg Age</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Station Details */}
              {selectedStation?.stationId === station.stationId && (
                <div className="mt-6 border-t pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Employee by Designation */}
                    <div>
                      <h5 className="text-md font-semibold text-gray-900 mb-3">Employees by Designation</h5>
                      <div className="space-y-4">
                        {Object.entries(station.employeesByDesignation).map(([designation, employees]) => (
                          <div key={designation}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-700">{designation}</span>
                              <span className="text-sm text-gray-500">({employees.length})</span>
                            </div>
                            <div className="space-y-2">
                              {employees.map((employee) => (
                                <div key={employee.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-xs">
                                      {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{employee.fullName}</p>
                                    <p className="text-xs text-gray-500">{employee.personalNumber} • Age: {employee.age}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{employee.mobileNumber}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Station Statistics */}
                    <div>
                      <h5 className="text-md font-semibold text-gray-900 mb-3">Station Statistics</h5>
                      
                      {/* Grade Breakdown */}
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Grade Distribution</h6>
                        <div className="space-y-1">
                          {Object.entries(station.employeeStats.gradeBreakdown).map(([grade, count]) => (
                            <div key={grade} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{grade}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Service Type Breakdown */}
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Service Type</h6>
                        <div className="space-y-1">
                          {Object.entries(station.employeeStats.serviceTypeBreakdown).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{type}</span>
                              <span className={`font-medium ${type === 'Permanent' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Age Statistics */}
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Age Information</h6>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <p className="font-bold text-blue-600">{station.employeeStats.ageStatistics.averageAge}</p>
                            <p className="text-xs text-gray-600">Avg Age</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <p className="font-bold text-green-600">
                              {station.employeeStats.ageStatistics.minAge}-{station.employeeStats.ageStatistics.maxAge}
                            </p>
                            <p className="text-xs text-gray-600">Range</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* All employees table for this station */}
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-900 mb-3">Complete Employee List</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Personal No.</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {station.allEmployees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-xs">
                                      {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                                    <div className="text-xs text-gray-500">Age: {employee.age}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {employee.personalNumber}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {employee.designation}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {employee.grade}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  employee.serviceType === 'Permanent' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {employee.serviceType}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {employee.mobileNumber}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total stations in {data?.tehsil}: {data?.summary?.totalStations}</span>
          <span>Total active employees: {data?.summary?.totalActiveEmployees}</span>
          <span>Generated at: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DrillDownPage;