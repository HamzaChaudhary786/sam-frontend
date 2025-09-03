import React, { useState, useEffect } from "react";
import { useStations } from "../hook.js";
import StationViewModal from "../MaalKhanaView/MaalKhanaView.jsx";
import DrillUpPage from "../DrillUp/DrillUp.jsx";
import DrillDownPage from "../DrillDown/DrillDown.jsx";
import Pagination from "../pagination.jsx";
import StationFilters from "../Filter.jsx";
import { getStationLocationsWithEnum } from "../../Station/lookUp.js";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StationModal from "../../Station/AddStation/AddStation.jsx";

const StationList = () => {
  const {
    stations,
    loading,
    error,
    removeStation,
    updateFilters,
    clearFilters,
    filters,
    createStation,
    modifyStation,
    // Add these if available from your hook
    currentPage,
    totalPages,
    totalStations,
    itemsPerPage,
    setPage,
    setItemsPerPage,
  } = useStations();

  const [imageIndexes, setImageIndexes] = useState({});
  const [imageModal, setImageModal] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Station locations state
  const [stationLocations, setStationLocations] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);
  const navigate = useNavigate();

  // Mobile view state
  const [showFilters, setShowFilters] = useState(false);

  // Multiple selection state
  const [selectedStations, setSelectedStations] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Drill pages state
  const [currentView, setCurrentView] = useState("list"); // 'list', 'drillUp', 'drillDown'
  const [drillUpData, setDrillUpData] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);

  // Fetch station locations on component mount
  useEffect(() => {
    fetchStationLocations();
  }, []);

  // Reset selection when stations change
  useEffect(() => {
    setSelectedStations(new Set());
    setSelectAll(false);
  }, [stations]);

  // Fetch station locations from API
  const fetchStationLocations = async () => {
    setLoadingLocations(true);
    try {
      const result = await getStationLocationsWithEnum();
      if (result.success) {
        setStationLocations(result.data);
      } else {
        console.error("Error fetching station locations:", result.error);
      }
    } catch (error) {
      console.error("Error fetching station locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Multiple selection handlers
  const handleSelectStation = (stationId) => {
    setSelectedStations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) {
        newSet.delete(stationId);
      } else {
        newSet.add(stationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStations(new Set());
    } else {
      setSelectedStations(new Set(safeStations.map((station) => station._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedStations.size === 0) {
      toast.error("Please select stations to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedStations.size} station(s)?`
      )
    ) {
      try {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const stationId of selectedStations) {
          try {
            // Validate ID format
            if (
              !stationId ||
              typeof stationId !== "string" ||
              stationId.trim() === ""
            ) {
              throw new Error("Invalid station ID format");
            }

            console.log("Attempting to delete station with ID:", stationId);

            const result = await removeStation(stationId.trim());

            if (result && result.success) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`${stationId}: ${result?.error || "Unknown error"}`);
            }
          } catch (error) {
            console.error(`Failed to delete station ${stationId}:`, error);
            errorCount++;
            errors.push(`${stationId}: ${error?.message || "Unknown error"}`);
          }
        }

        setSelectedStations(new Set());
        setSelectAll(false);

        if (successCount > 0 && errorCount === 0) {
          toast.success(`Successfully deleted ${successCount} station(s)`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.warning(
            `Deleted ${successCount} station(s), failed to delete ${errorCount}`
          );
          console.log("Errors:", errors);
        } else {
          toast.error("Failed to delete selected stations");
          console.log("All errors:", errors);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Error deleting stations");
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedStations(new Set());
    setSelectAll(false);
  };

  const handleDelete = async (id) => {
    // Validate ID format
    if (!id || typeof id !== "string" || id.trim() === "") {
      toast.error("Invalid station ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this station?")) {
      try {
        console.log("Attempting to delete station with ID:", id);

        const result = await removeStation(id.trim());

        if (result && result.success) {
          console.log("Station deleted successfully");
        } else {
          console.error("Failed to delete station:", result?.error);
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleAddStation = () => {
    setIsEditMode(false);
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleImportStation = () => {
    navigate("/stationimport");
  };

  const handleEdit = (station) => {
    setIsEditMode(true);
    setEditData(station);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditData(null);
  };

  // Handle view station details
  const handleView = (station) => {
    setSelectedStation(station);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedStation(null);
  };

  // Drill Up - Show employees by station ID
  const handleDrillUp = (station) => {
    setDrillUpData({
      stationId: station._id,
      stationName: station.name,
    });
    setCurrentView("drillUp");
  };

  // Drill Down - Show stations by tehsil
  const handleDrillDown = (station) => {
    setDrillDownData({
      tehsil: station.tehsil,
    });
    setCurrentView("drillDown");
  };

  // Back to main list
  const handleBackToList = () => {
    setCurrentView("list");
    setDrillUpData(null);
    setDrillDownData(null);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (setPage) {
      setPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (setItemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      // Reset to first page when changing items per page
      if (setPage) setPage(1);
    }
  };

  const handlePrevImage = (stationId, imagesLength) => {
    setImageIndexes((prev) => ({
      ...prev,
      [stationId]:
        (prev[stationId] ?? 0) === 0
          ? imagesLength - 1
          : (prev[stationId] ?? 0) - 1,
    }));
  };

  const handleNextImage = (stationId, imagesLength) => {
    setImageIndexes((prev) => ({
      ...prev,
      [stationId]:
        (prev[stationId] ?? 0) === imagesLength - 1
          ? 0
          : (prev[stationId] ?? 0) + 1,
    }));
  };

  // Helper function to get station location name by ID
  const getStationLocationName = (locationId) => {
    return stationLocations[locationId] || locationId;
  };

  // Safety check for stations
  const safeStations = Array.isArray(stations) ? stations : [];

  // Render drill up page
  if (currentView === "drillUp" && drillUpData) {
    return (
      <DrillUpPage
        stationId={drillUpData.stationId}
        stationName={drillUpData.stationName}
        onBack={handleBackToList}
      />
    );
  }

  // Render drill down page
  if (currentView === "drillDown" && drillDownData) {
    return (
      <DrillDownPage tehsil={drillDownData.tehsil} onBack={handleBackToList} />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Maal Khana Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={handleAddStation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
          >
            Add Maal Khana
          </button>
          {/* <button
            onClick={handleImportStation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
          >
            Import Station File
          </button> */}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedStations.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <span className="text-sm text-blue-800 font-medium">
            {selectedStations.size} station(s) selected
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
            >
              Delete Selected
            </button>
            <button
              onClick={handleClearSelection}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Station Filters Component */}
      <StationFilters
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Station Table/Cards - Responsive */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Desktop Table View - Only for screens 1200px+ */}
        <div className="hidden xl:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maal Khana Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tehsil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drill Actions
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeStations.map((station) => (
                  <tr key={station._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStations.has(station._id)}
                        onChange={() => handleSelectStation(station._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start space-y-2">
                        {/* Show main image if available */}
                        {station.stationImageUrl &&
                        station.stationImageUrl.length > 0 ? (
                          <div className="relative">
                            <img
                              src={
                                station.stationImageUrl[
                                  imageIndexes[station._id] ?? 0
                                ]
                              }
                              alt="Station"
                              onClick={() =>
                                setImageModal(
                                  station.stationImageUrl[
                                    imageIndexes[station._id] ?? 0
                                  ]
                                )
                              }
                              className="h-16 w-16 rounded border object-cover cursor-pointer hover:scale-105 transition"
                            />
                            {station.stationImageUrl.length > 1 && (
                              <>
                                <button
                                  onClick={() =>
                                    handlePrevImage(
                                      station._id,
                                      station.stationImageUrl.length
                                    )
                                  }
                                  className="absolute top-1/2 -left-5 transform -translate-y-1/2 text-gray-600 hover:text-black"
                                >
                                  ‹
                                </button>
                                <button
                                  onClick={() =>
                                    handleNextImage(
                                      station._id,
                                      station.stationImageUrl.length
                                    )
                                  }
                                  className="absolute top-1/2 -right-5 transform -translate-y-1/2 text-gray-600 hover:text-black"
                                >
                                  ›
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              className="h-5 w-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        )}

                        <div className="pt-2">
                          <div className="text-sm font-medium text-gray-900">
                            {station.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getStationLocationName(station.tehsil)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {station.address?.line1}
                      </div>
                      <div className="text-sm text-gray-500">
                        {station.address?.line2 && `${station.address.line2}, `}
                        {station.address?.city}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleDrillUp(station)}
                          className="flex items-center justify-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                          title="View employees at this station"
                        >
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Drill Down
                        </button>
                        <button
                          onClick={() => handleDrillDown(station)}
                          className="flex items-center justify-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="View all stations in this tehsil"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Drill Up
                        </button>
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleView(station)}
                          className="px-3 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(station)}
                          className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(station._id)}
                          className="px-3 py-1 text-xs rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View - For screens under 1200px */}
        <div className="xl:hidden">
          {safeStations.map((station) => (
            <div key={station._id} className="border-b border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedStations.has(station._id)}
                  onChange={() => handleSelectStation(station._id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-shrink-0 relative">
                  {/* Station Image */}
                  {station.stationImageUrl &&
                  station.stationImageUrl.length > 0 ? (
                    <div className="relative">
                      <img
                        src={
                          station.stationImageUrl[
                            imageIndexes[station._id] ?? 0
                          ]
                        }
                        alt="Station"
                        onClick={() =>
                          setImageModal(
                            station.stationImageUrl[
                              imageIndexes[station._id] ?? 0
                            ]
                          )
                        }
                        className="h-12 w-12 rounded border object-cover cursor-pointer hover:scale-105 transition"
                      />
                      {station.stationImageUrl.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              handlePrevImage(
                                station._id,
                                station.stationImageUrl.length
                              )
                            }
                            className="absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                            style={{ fontSize: "10px" }}
                          >
                            ‹
                          </button>
                          <button
                            onClick={() =>
                              handleNextImage(
                                station._id,
                                station.stationImageUrl.length
                              )
                            }
                            className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                            style={{ fontSize: "10px" }}
                          >
                            ›
                          </button>
                          <div
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 rounded-full"
                            style={{ fontSize: "8px" }}
                          >
                            {(imageIndexes[station._id] ?? 0) + 1}/
                            {station.stationImageUrl.length}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {station.name}
                    </h3>
                  </div>

                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-gray-500">
                      Tehsil: {getStationLocationName(station.tehsil)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {station.address?.line1 || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {station.address?.line2 && `${station.address.line2}, `}
                      {station.address?.city || "N/A"}
                    </p>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="mt-3">
                    {/* Primary Actions Row */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleView(station)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-center"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(station)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-center"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Drill Actions Row */}
                    {/* <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleDrillUp(station)}
                        className="flex items-center justify-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Drill Down
                      </button>
                      <button
                        onClick={() => handleDrillDown(station)}
                        className="flex items-center justify-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Drill Up
                      </button>
                    </div> */}

                    {/* Delete Action Row */}
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleDelete(station._id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {safeStations.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No Mall Khana found</p>
          </div>
        )}

        {/* Pagination Component */}
        {(totalPages > 1 || safeStations.length > 0) && (
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={currentPage || 1}
              totalPages={totalPages || 1}
              totalItems={totalStations || safeStations.length}
              itemsPerPage={itemsPerPage || 10}
              onPageChange={handlePageChange}
              onItemsPerPageChange={
                setItemsPerPage ? handleItemsPerPageChange : undefined
              }
              showItemsPerPage={!!setItemsPerPage}
              itemsPerPageOptions={[10, 20, 50, 100, 200, 500]}
              showPageInfo={true}
              showFirstLast={true}
              maxVisiblePages={5}
              disabled={loading}
              className="px-6"
            />
          </div>
        )}
      </div>

      {/* Add/Edit Station Modal */}
      <StationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEdit={isEditMode}
        editData={editData}
        createStation={createStation}
        modifyStation={modifyStation}
        isStation={false}
      />

      {/* View Station Modal */}
      <StationViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        station={selectedStation}
      />

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={imageModal}
              alt="Full View"
              className="max-w-full max-h-screen rounded shadow-lg"
            />
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-60 px-3 py-1 rounded hover:bg-opacity-90"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationList;
