// StationAssetAssignment.jsx - Main Page Component
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StationAssetForm from "../components/StationAssetAssignment/AssetForm/AssetForm.jsx";
import StationAssetList from "../components/StationAssetAssignment/AssetList/AssetList.jsx";
import { role_admin } from "../constants/Enum.js";

const StationAssetAssignment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get station from location state or redirect if not available
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Initialize station from location state
  useEffect(() => {
    const initializeStation = () => {
      try {
        const stationData = location.state?.station;
        
        if (!stationData) {
          toast.error("No station data found. Redirecting to stations list.");
          navigate("/stations");
          return;
        }

        setStation(stationData);
      } catch (error) {
        console.error("Error initializing station data:", error);
        toast.error("Error loading station data. Redirecting to stations list.");
        navigate("/stations");
      } finally {
        setLoading(false);
      }
    };

    initializeStation();
  }, [location.state, navigate]);

  // Handle opening the asset assignment form
  const handleAddAsset = () => {
    if (!isAdmin) {
      toast.error("Access denied: Only administrators can assign assets to stations");
      return;
    }
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  // Handle editing an existing asset assignment
  const handleEdit = (assignment) => {
    setEditingAsset(assignment);
    setIsFormOpen(true);
  };

  // Handle form success (creation or update)
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAsset(null);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/stations");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!station) {
    return (
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">Station not found</p>
        <p className="text-gray-400 text-sm mt-1">
          Please select a station from the stations list.
        </p>
        <button
          onClick={handleBack}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Back to Stations
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Stations
          </button>
          
          <div className="border-l border-gray-300 pl-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Station Asset Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage assets for{" "}
              <span className="font-medium text-gray-800">{station.name}</span>
            </p>
            {station.address && (
              <p className="text-xs text-gray-500 mt-1">
                {station.address.line1}, {station.address.city}
              </p>
            )}
            {!isAdmin && (
              <p className="text-xs sm:text-sm text-orange-600 mt-1">
                Viewing in read-only mode - Contact administrator for changes
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {isAdmin ? (
            <button
              onClick={handleAddAsset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Assign Asset
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center cursor-not-allowed"
              title="Only administrators can assign assets"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Assign Asset
            </button>
          )}
        </div>
      </div>

      {/* Station Info Card */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-4">
          {/* Station Image */}
          {station.stationImageUrl && station.stationImageUrl.length > 0 && (
            <div className="flex-shrink-0">
              <img
                src={station.stationImageUrl[0]}
                alt={station.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
          )}
          
          {/* Station Details */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
              {station.address && (
                <div>
                  <span className="font-medium">Address:</span>{" "}
                  {station.address.line1}
                  {station.address.line2 && `, ${station.address.line2}`}
                  {station.address.city && `, ${station.address.city}`}
                </div>
              )}
              {station.tehsil && (
                <div>
                  <span className="font-medium">Tehsil:</span> {station.tehsil}
                </div>
              )}
              {station.district && (
                <div>
                  <span className="font-medium">District:</span> {station.district}
                </div>
              )}
              {station.status && (
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      station.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {station.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Station Asset List Component */}
      <StationAssetList
        station={station}
        onEdit={handleEdit}
        refreshTrigger={refreshTrigger}
      />

      {/* Station Asset Form Modal */}
      <StationAssetForm
        station={station}
        editingAsset={editingAsset}
        isOpen={isFormOpen}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default StationAssetAssignment;