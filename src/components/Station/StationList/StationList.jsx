import React, { useState } from "react";
import { useStations } from "../StationHook.js";
import StationModal from "../AddStation/AddStation.jsx";
import StationViewModal from "../ViewStation/ViewStation.jsx";

const StationList = () => {
  const { stations, loading, error, removeStation, updateFilters, clearFilters, filters } = useStations();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Filter state
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    tehsil: filters.tehsil || "",
    city: filters.city || "",
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      await removeStation(id);
    }
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.trim()) activeFilters.name = filterForm.name.trim();
    if (filterForm.tehsil.trim()) activeFilters.tehsil = filterForm.tehsil.trim();
    if (filterForm.city.trim()) activeFilters.city = filterForm.city.trim();
    updateFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilterForm({ name: "", tehsil: "", city: "" });
    clearFilters();
  };

  // Safety check for stations
  const safeStations = Array.isArray(stations) ? stations : [];

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
        <h1 className="text-2xl font-bold text-gray-900">
          Station Management
        </h1>
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Stations</h3>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tehsils</option>
              <option value="Dera Bugti">Dera Bugti</option>
              <option value="Sui">Sui</option>
              <option value="Pehlawagh">Pehlawagh</option>
            </select>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeStations.map((station) => (
              <tr key={station._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
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
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {station.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {station._id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {station.tehsil}
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
      />

      {/* View Station Modal */}
      <StationViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        station={selectedStation}
      />
    </div>
  );
};

export default StationList;