import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Building,
  MapPin,
  Phone,
  User,
  Shield,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  Wifi,
  Navigation,
  ArrowUp,
} from "lucide-react";
import { BACKEND_URL } from "../../../constants/api";
import { IoEyeSharp } from "react-icons/io5";
import EmployeeViewModal from "../../Employee/ViewEmployee/ViewEmployee";
import { useNavigate } from "react-router-dom";

const DrillStationPage = ({
  stationId,
  stationName,
  onBack,
  onDrillTehsil,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewEmployee, setIsViewEmployee] = useState(false);
  const [isEmployee, setIsEmployee] = useState();
  const navigate = useNavigate();
  const [editData, setEditData] = useState({});

  const handleClose = () => {
    setIsViewEmployee(!isViewEmployee);
  };

  useEffect(() => {
    fetchStationEmployees();
  }, [stationId]);

  const fetchStationEmployees = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/employee/station-drill-down-summary?stationId=${stationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch station employees");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  if (!data?.success) {
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
            onClick={onDrillTehsil}
            className="flex items-center text-Red-600 hover:text-blue-800 mr-4"
          >
            <ArrowUp className="h-5 w-5 mr-1" />
            Drill Up
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">No data available for this station</p>
        </div>
      </div>
    );
  }

  const {
    stationInfo,
    employeeSummary,
    employeeList,
    inCharges,
    minimumRequirements,
    stationAssetsSummary,
    stationAssetsList,
    employeeAssetsSummary,
    drillUpOptions,
    pagination,
  } = data;



  const handleEdit = async (data) => {
    setEditData(data);
    navigate("/employee", {
      state: {
        isEdit: true,
        editData: data,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Stations
          </button>
          <button
            onClick={onDrillTehsil}
            className="flex items-center text-Red-600 hover:text-blue-800 mr-4"
          >
            <ArrowUp className="h-5 w-5 mr-1" />
            Drill Up
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {stationInfo?.name || stationName}
            </h1>
            <p className="text-sm text-gray-600">
              Station Details & Employee Information
            </p>
          </div>
        </div>
        {drillUpOptions?.canDrillUp && (
          <div className="text-sm text-gray-600">
            <Navigation className="h-4 w-4 inline mr-1" />
            {drillUpOptions.tehsil}, {drillUpOptions.district}
          </div>
        )}
      </div>

      {/* Station Info Card */}
      {stationInfo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Station Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Station</p>
                <p className="font-medium">{stationInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">
                  {stationInfo.tehsil}, {stationInfo.district}
                </p>
                {stationInfo.address && (
                  <p className="text-sm text-gray-500">
                    {stationInfo.address.line1}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stationInfo.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {stationInfo.status}
                </span>
              </div>
            </div>
            {stationInfo.coordinates && (
              <div className="flex items-center">
                <Navigation className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Coordinates</p>
                  <p className="font-medium text-sm">
                    {stationInfo.coordinates.latitude},{" "}
                    {stationInfo.coordinates.longitude}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {stationInfo.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-900">{stationInfo.description}</p>
            </div>
          )}

          {/* Facilities */}
          {stationInfo.facilities && stationInfo.facilities.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Facilities</p>
              <div className="flex flex-wrap gap-2">
                {stationInfo.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {facility === "Mobile signals" && (
                      <Wifi className="h-3 w-3 mr-1" />
                    )}
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Station Images */}
          {stationInfo.images && stationInfo.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Station Images</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stationInfo.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Station image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => window.open(image, "_blank")}
                    />
                    <Camera className="h-4 w-4 absolute top-2 right-2 text-white opacity-75" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minimum Requirements Section */}
      {minimumRequirements && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Minimum Requirements vs Current Status
          </h3>

          {/* Staff Requirements */}
          {minimumRequirements.staff && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Staff Requirements
                </h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Current:{" "}
                    <span className="font-semibold">
                      {minimumRequirements.staff.current}
                    </span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Required:{" "}
                    <span className="font-semibold">
                      {minimumRequirements.staff.required}
                    </span>
                  </span>
                  <span
                    className={`text-sm font-semibold ${minimumRequirements.staff.shortage > 0
                      ? "text-red-600"
                      : "text-green-600"
                      }`}
                  >
                    {minimumRequirements.staff.shortage > 0
                      ? `Shortage: ${minimumRequirements.staff.shortage}`
                      : "Fully Staffed"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Current Staff</p>
                      <p className="text-xl font-bold text-blue-600">
                        {minimumRequirements.staff.current}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Required Staff</p>
                      <p className="text-xl font-bold text-green-600">
                        {minimumRequirements.staff.required}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${minimumRequirements.staff.shortage > 0
                    ? "bg-red-50"
                    : "bg-green-50"
                    }`}
                >
                  <div className="flex items-center">
                    {minimumRequirements.staff.shortage > 0 ? (
                      <XCircle className="h-6 w-6 text-red-600 mr-2" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">
                        {minimumRequirements.staff.shortage > 0
                          ? "Shortage"
                          : "Status"}
                      </p>
                      <p
                        className={`text-xl font-bold ${minimumRequirements.staff.shortage > 0
                          ? "text-red-600"
                          : "text-green-600"
                          }`}
                      >
                        {minimumRequirements.staff.shortage > 0
                          ? minimumRequirements.staff.shortage
                          : "Complete"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Details Breakdown */}
              {minimumRequirements.staffDetails &&
                minimumRequirements.staffDetails.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Staff Requirements by Designation
                    </h5>
                    <div className="space-y-2">
                      {minimumRequirements.staffDetails.map((staff, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {staff.designation}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              Required:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {staff.numberOfPersonal}
                            </span>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Asset Requirements */}
          {minimumRequirements.assets && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Asset Requirements
                </h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Current:{" "}
                    <span className="font-semibold">
                      {minimumRequirements.assets.current}
                    </span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Required:{" "}
                    <span className="font-semibold">
                      {minimumRequirements.assets.required?.length || 0}
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-6 w-6 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Current Assets</p>
                      <p className="text-xl font-bold text-blue-600">
                        {minimumRequirements.assets.current}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Required Assets</p>
                      <p className="text-xl font-bold text-orange-600">
                        {minimumRequirements.assets.required?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Assets Details */}
              {minimumRequirements.assets.required &&
                minimumRequirements.assets.required.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Required Assets
                    </h5>
                    <div className="space-y-2">
                      {minimumRequirements.assets.required.map(
                        (asset, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded"
                          >
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-gray-600 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {asset.assets?.name}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({asset.assets?.type})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                Quantity:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {asset.quantity}
                              </span>
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Assets Summary */}
      {(stationAssetsSummary?.total > 0 ||
        employeeAssetsSummary?.total > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assets Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Station Assets</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Building className="h-6 w-6 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Station Assets
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {stationAssetsSummary?.total || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Employee Assets
                </h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-6 w-6 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Employee Assets
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {employeeAssetsSummary?.total || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {stationAssetsList && stationAssetsList.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Station Assets ({stationAssetsList.length})
            </h3>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category/Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stationAssetsList.map((asset, index) => (
                    <tr key={asset.stationAssetId || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {asset.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {asset.assetId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asset.category}</div>
                        <div className="text-sm text-gray-500">{asset.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${asset.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {asset.isApproved ? (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-green-600">Approved</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 text-red-600 mr-1" />
                              <span className="text-red-600">Pending</span>
                            </div>
                          )}
                        </div>
                        {asset.approvedBy && (
                          <div className="text-xs text-gray-500">
                            By: {asset.approvedBy.firstName} {asset.approvedBy.lastName}
                          </div>
                        )}
                        {asset.approvalDate && (
                          <div className="text-xs text-gray-500">
                            Date: {new Date(asset.approvalDate).toLocaleDateString()}
                          </div>
                        )}
                        {asset.approvalComment && (
                          <div className="text-xs text-gray-500 mt-1">
                            Comment: {asset.approvalComment}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {stationAssetsList.map((asset, index) => (
              <div key={asset.stationAssetId || index} className="border-b border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                  <Package className="h-8 w-8 text-blue-600 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {asset.name}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${asset.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-500">
                        Category: {asset.category} | Type: {asset.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        Asset ID: {asset.assetId}
                      </p>
                      {asset.isApproved ? (
                        <div className="flex items-center text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                          {asset.approvedBy && (
                            <span className="ml-1">
                              by {asset.approvedBy.firstName} {asset.approvedBy.lastName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending Approval
                        </div>
                      )}
                      {asset.approvalDate && (
                        <p className="text-xs text-gray-500">
                          Approved: {new Date(asset.approvalDate).toLocaleDateString()}
                        </p>
                      )}
                      {asset.approvalComment && (
                        <p className="text-xs text-gray-500">
                          Comment: {asset.approvalComment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {stationAssetsList.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assets assigned to this station</p>
            </div>
          )}
        </div>
      )}

      {/* Employee Summary Cards */}
      {employeeSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeSummary.total || 0}
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
                  {employeeSummary.active || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Inactive Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(employeeSummary.total || 0) - (employeeSummary.active || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Station In-Charges */}
      {inCharges && inCharges.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Station In-Charges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inCharges.map((incharge, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {incharge.type.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </span>
                </div>
                {incharge.employee && (
                  <div className="space-y-1">
                    <p className="font-medium">{incharge.employee.name}</p>
                    <p className="text-sm text-gray-600">
                      {incharge.employee.designation}
                    </p>
                    <p className="text-sm text-gray-600">
                      {incharge.employee.personalNumber}
                    </p>
                    {incharge.employee.mobileNumber && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {incharge.employee.mobileNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Breakdown */}
      {employeeSummary?.breakdown && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Employee Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* By Designation */}
            {employeeSummary.breakdown.byDesignation &&
              Object.keys(employeeSummary.breakdown.byDesignation).length >
              0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    By Designation
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      employeeSummary.breakdown.byDesignation
                    ).map(([designation, count]) => (
                      <div
                        key={designation}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {designation}
                        </span>
                        <span className="font-medium text-gray-900">{`${count} / ${employeeSummary.total}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* By Grade */}
            {employeeSummary.breakdown.byGrade &&
              Object.keys(employeeSummary.breakdown.byGrade).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">By Grade</h4>
                  <div className="space-y-2">
                    {Object.entries(employeeSummary.breakdown.byGrade).map(
                      ([grade, count]) => (
                        <div
                          key={grade}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">{grade}</span>
                          <span className="font-medium text-gray-900">{`${count} / ${employeeSummary.total}`}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* By Service Type */}
            {employeeSummary.breakdown.byServiceType &&
              Object.keys(employeeSummary.breakdown.byServiceType).length >
              0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    By Service Type
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      employeeSummary.breakdown.byServiceType
                    ).map(([serviceType, count]) => (
                      <div
                        key={serviceType}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {serviceType}
                        </span>
                        <span className="font-medium text-gray-900">{`${count} / ${employeeSummary.total}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* By Age Group */}
            {employeeSummary.breakdown.byAge &&
              Object.keys(employeeSummary.breakdown.byAge).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    By Age Group
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(employeeSummary.breakdown.byAge).map(
                      ([ageGroup, count]) => (
                        <div
                          key={ageGroup}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">
                            {ageGroup}
                          </span>
                          <span className="font-medium text-gray-900">{`${count} / ${employeeSummary.total}`}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* By Cast */}
            {employeeSummary.breakdown.byCast &&
              Object.keys(employeeSummary.breakdown.byCast).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">By Cast</h4>
                  <div className="space-y-2">
                    {Object.entries(employeeSummary.breakdown.byCast).map(
                      ([cast, count]) => (
                        <div
                          key={cast}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">{cast}</span>
                          <span className="font-medium text-gray-900">{`${count} / ${employeeSummary.total}`}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* By Status */}
            {employeeSummary.breakdown.byStatus &&
              Object.keys(employeeSummary.breakdown.byStatus).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">By Status</h4>
                  <div className="space-y-2">
                    {Object.entries(employeeSummary.breakdown.byStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700 capitalize">
                            {status}
                          </span>
                          <span className="font-medium text-gray-900">{`${count} / ${employeeSummary.total}`}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Employee List */}
      {employeeList && employeeList.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Employee Details
              </h3>
              {pagination && (
                <div className="text-sm text-gray-600">
                  Showing {employeeList.length} of {pagination.totalEmployees}{" "}
                  employees
                  {pagination.totalPages > 1 && (
                    <span className="ml-2">
                      (Page {pagination.currentPage} of {pagination.totalPages})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personal Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNIC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                {console.log(employeeList, "all employee data")}
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeList.map((employee) => {
                    const isStationIncharge =
                      employee.stations?.stationIncharge?.some(
                        (incharge) => incharge.employee === employee._id
                      );
                    const isMallkhanaIncharge = employee.assignedAssets?.some(
                      (asset) => asset.asset[0]?.mallkhana !== null
                    );
                    const hasAward = employee.assignedAwards?.some(
                      (award) => award.isMonitor === true
                    );
                    const disciplinaryObjects =
                      employee?.disciplinaryActions?.filter(
                        (dis) => dis.isDisciplinaryAction === true
                      ) || [];

                    return (
                      <React.Fragment key={employee._id}>
                        {/* Main Employee Row */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {employee.firstName
                                    ?.split(" ")
                                    .map((n) => n.charAt(0))
                                    .join("")
                                    .substring(0, 2)}
                                </span>
                              </div>
                              <div
                                className="ml-3 cursor-pointer"
                                onClick={() => {
                                  setIsEmployee(employee);
                                  setIsViewEmployee(!isViewEmployee);
                                }}
                              >
                                <div className="text-sm font-medium text-gray-700">
                                  Name: {employee.firstName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Father: {employee.fatherFirstName}
                                </div>
                                {employee.age && (
                                  <div className="text-sm text-gray-500">
                                    Age: {employee.age}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1 m-2">
                                  {isStationIncharge && (
                                    <div className="bg-blue-100 text-blue-800 w-fit text-[8px] font-medium px-2 py-1 rounded">
                                      <p>S.Incharge</p>
                                    </div>
                                  )}
                                  {isMallkhanaIncharge && (
                                    <div className="bg-blue-100 text-blue-800 w-fit text-[8px] font-medium px-2 py-1 rounded">
                                      <p>M.Incharge</p>
                                    </div>
                                  )}
                                  {hasAward && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                      Award
                                    </span>
                                  )}
                                  {disciplinaryObjects.length > 0 && disciplinaryObjects[0]?.description && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                      {disciplinaryObjects[0].description}
                                    </span>
                                  )}
                                </div>
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
                            {employee.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 mr-1" />
                              {employee.mobileNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex flex-row gap-x-3 ">
                            <div>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {employee.status}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Asset Details Row */}
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <div className="font-medium text-gray-900 mb-2">
                                Assigned Assets ({employee.assets?.length || 0})
                              </div>

                              {employee.assets && employee.assets.length > 0 ? (
                                <div className="space-y-3">
                                  {employee.assets.map((asset, index) => (
                                    <div
                                      key={asset.employeeAssetId || index}
                                      className="bg-white rounded-lg p-3 border border-gray-200"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                          <span className="font-medium text-gray-600">Asset:</span>
                                          <div className="text-gray-900">{asset.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {asset.category} - {asset.type}
                                          </div>
                                        </div>

                                        <div>
                                          <span className="font-medium text-gray-600">Status:</span>
                                          <div className={`inline-flex px-2 py-1 text-xs rounded-full ${asset.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {asset.status}
                                          </div>
                                        </div>

                                        <div>
                                          <span className="font-medium text-gray-600">Assigned Date:</span>
                                          <div className="text-gray-900">
                                            {new Date(asset.assignedDate).toLocaleDateString()}
                                          </div>
                                        </div>

                                        <div>
                                          <span className="font-medium text-gray-600">Approval:</span>
                                          <div className={`inline-flex px-2 py-1 text-xs rounded-full ${asset.isApproved
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {asset.isApproved ? 'Approved' : 'Pending'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Round History for ammunition assets */}
                                      {asset.roundHistory && asset.roundHistory.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                          <div className="font-medium text-gray-600 mb-2">Round History:</div>
                                          <div className="space-y-1">
                                            {asset.roundHistory.slice(-2).map((round, roundIndex) => (
                                              <div key={roundIndex} className="text-xs text-gray-600 flex justify-between">
                                                <span>{round.Reason}</span>
                                                <span>
                                                  Assigned: {round.assignedRounds}
                                                  {round.consumedRounds && ` | Consumed: ${round.consumedRounds}`}
                                                </span>
                                                <span>{new Date(round.Date).toLocaleDateString()}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Approval Details */}
                                      {asset.isApproved && asset.approvedBy && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          Approved by: {asset.approvedBy.firstName} {asset.approvedBy.lastName}
                                          {asset.approvalDate && ` on ${new Date(asset.approvalDate).toLocaleDateString()}`}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 text-center py-4 bg-white rounded-lg border border-gray-200">
                                  No assets assigned to this employee
                                </div>
                              )}

                              {/* Awards Section */}
                              {employee.assignedAwards && employee.assignedAwards.length > 0 && (
                                <div className="mt-4">
                                  <div className="font-medium text-gray-900 mb-2">
                                    Awards ({employee.assignedAwards.length})
                                  </div>
                                  <div className="space-y-2">
                                    {employee.assignedAwards.map((award, index) => (
                                      <div key={award._id || index} className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-medium text-yellow-900">{award.achievementReason}</div>
                                            <div className="text-sm text-yellow-700">
                                              {award.achievementType} - {award.benefit}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium text-yellow-900">₹{award.amount}</div>
                                            <div className="text-xs text-yellow-600">
                                              {new Date(award.date).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <EmployeeViewModal
              isOpen={isViewEmployee}
              onClose={handleClose}
              employee={isEmployee}
              onEdit={handleEdit}
            />
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {employeeList.map((employee) => (
              <div key={employee._id} className="border-b border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {employee.firstName
                        ?.split(" ")
                        .map((n) => n.charAt(0))
                        .join("")
                        .substring(0, 2) || employee.name
                          ?.split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {employee.name || employee?.firstName}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {employee.status}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-500">
                        Father: {employee.fatherName || employee.fatherFirstName}
                        {employee.age && ` | Age: ${employee.age}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Personal Number: {employee.personalNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        CNIC: {employee.cnic}
                      </p>
                      <p className="text-xs text-gray-500">
                        {employee.designation} | {employee.rank}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {employee.mobileNumber || "N/A"}
                      </p>
                    </div>

                    {/* Mobile Asset Details */}
                    {employee.assets && employee.assets.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-2">
                          Assigned Assets ({employee.assets.length})
                        </div>
                        {employee.assets.map((asset, index) => (
                          <div key={asset.employeeAssetId || index} className="bg-gray-50 rounded p-2 mb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-xs font-medium text-gray-900">{asset.name}</div>
                                <div className="text-xs text-gray-500">{asset.category} - {asset.type}</div>
                              </div>
                              <div className={`text-xs px-2 py-1 rounded ${asset.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {asset.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {employeeList.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No employees found at this station
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded">
                {pagination.currentPage}
              </span>
              <button
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillStationPage;
