import React, { useState, useEffect } from "react";
import { useStations } from "../StationHook.js";
import StationModal from "../AddStation/AddStation.jsx";
import StationViewModal from "../ViewStation/ViewStation.jsx";
import DrillUpPage from "../DrillUp/DrillUp.jsx";
import DrillDownPage from "../DrillDown/DrillDown.jsx";
import { getStationLocationsWithEnum } from "../lookUp.js";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

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

  // Filter state
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    tehsil: filters.tehsil || "",
    city: filters.city || "",
  });

  // Drill pages state
  const [currentView, setCurrentView] = useState("list"); // 'list', 'drillUp', 'drillDown'
  const [drillUpData, setDrillUpData] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);

  // Fetch station locations on component mount
  useEffect(() => {
    fetchStationLocations();
  }, []);

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

  const handleDelete = async (id) => {
    await removeStation(id);
  };

  const handleAddStation = () => {
    setIsEditMode(false);
    setEditData(null);
    setIsModalOpen(true);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.trim()) activeFilters.name = filterForm.name.trim();
    if (filterForm.tehsil.trim())
      activeFilters.tehsil = filterForm.tehsil.trim();
    if (filterForm.city.trim()) activeFilters.city = filterForm.city.trim();
    updateFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilterForm({ name: "", tehsil: "", city: "" });
    clearFilters();
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Station Management</h1>
        <button
          onClick={handleAddStation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Add Station
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Filter Stations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Station Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Gulshan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tehsil
            </label>
            <select
              name="tehsil"
              value={filterForm.tehsil}
              onChange={handleFilterChange}
              disabled={loadingLocations}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingLocations ? "Loading..." : "All Tehsils"}
              </option>
              {Object.entries(stationLocations).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {loadingLocations && (
              <p className="text-xs text-gray-500 mt-1">
                Loading station locations...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={filterForm.city}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Karachi"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Station Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tehsil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drill Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeStations.map((station) => (
              <tr key={station._id} className="hover:bg-gray-50">
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
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(station)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(station)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(station._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {safeStations.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No stations found</p>
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
