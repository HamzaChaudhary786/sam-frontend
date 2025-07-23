import React, { useState } from "react";
import { useAssets } from "../AssetHook.js";
import AssetModal from "../AddAsset/AddAsset.jsx";
import AssetViewModal from "../ViewAsset/ViewAsset.jsx";
import { useLookupOptions } from "../../../services/LookUp.js";
const AssetsList = () => {
  const {
    assets,
    loading,
    error,
    removeAsset,
    updateFilters,
    clearFilters,
    filters,
    fetchAssets,
  } = useAssets();
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");
  const [imageModal, setImageModal] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Filter state
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    type: filters.type || "",
  });

  const handleDelete = async (id) => {
    await removeAsset(id);
  };

  const handleAddAsset = () => {
    setIsEditMode(false);
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (asset) => {
    setIsEditMode(true);
    setEditData(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditData(null);
  };

  // Handle view asset details
  const handleView = (asset) => {
    setSelectedAsset(asset);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedAsset(null);
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
    if (filterForm.type) activeFilters.type = filterForm.type;
    updateFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilterForm({ name: "", type: "" });
    clearFilters();
  };
  const handlePrevImage = (assetId, imagesLength) => {
    setImageIndexes((prev) => ({
      ...prev,
      [assetId]:
        (prev[assetId] ?? 0) === 0
          ? imagesLength - 1
          : (prev[assetId] ?? 0) - 1,
    }));
  };

  const handleNextImage = (assetId, imagesLength) => {
    setImageIndexes((prev) => ({
      ...prev,
      [assetId]:
        (prev[assetId] ?? 0) === imagesLength - 1
          ? 0
          : (prev[assetId] ?? 0) + 1,
    }));
  };

  // Safety check for assets
  const safeAssets = Array.isArray(assets) ? assets : [];

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
        <h1 className="text-2xl font-bold text-gray-900">Assets Management</h1>
        <button
          onClick={handleAddAsset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Add Asset
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
          Filter Assets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AK27"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              name="type"
              value={filterForm.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

      {/* Assets Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Additional Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeAssets.map((asset) => (
              <tr key={asset._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap ">
                  <div className="flex flex-col items-start space-y-1">
                    {asset.assetImageUrl && asset.assetImageUrl.length > 0 ? (
                      <div className="relative">
                        <img
                          src={
                            asset.assetImageUrl[imageIndexes[asset._id] ?? 0]
                          }
                          alt="Asset"
                          onClick={() =>
                            setImageModal(
                              asset.assetImageUrl[imageIndexes[asset._id] ?? 0]
                            )
                          }
                          className="h-16 w-16 rounded border object-cover cursor-pointer hover:scale-105 transition"
                        />
                        {asset.assetImageUrl.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                handlePrevImage(
                                  asset._id,
                                  asset.assetImageUrl.length
                                )
                              }
                              className="absolute top-1/2 -left-5 transform -translate-y-1/2 text-gray-600 hover:text-black"
                            >
                              ‹
                            </button>
                            <button
                              onClick={() =>
                                handleNextImage(
                                  asset._id,
                                  asset.assetImageUrl.length
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
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-200">
                        No image
                      </div>
                    )}
                    <div className="pt-2 text-sm font-medium text-gray-900">
                      {asset.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      asset.type === "vehicles"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {assetTypeOptions.find(
                      (option) => option.value === asset.type
                    )?.label || asset.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {asset.additionalInfo || "No additional information"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(asset)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(asset)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(asset._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {safeAssets.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No assets found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Asset Modal */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEdit={isEditMode}
        editData={editData}
        onSuccess={fetchAssets} // NEW LINE
      />

      {/* View Asset Modal */}
      <AssetViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        asset={selectedAsset}
      />
      {/* Lightbox Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={imageModal}
              alt="Enlarged"
              className="max-w-full max-h-screen rounded shadow-lg"
            />
            <button
              className="absolute top-2 right-2 text-white bg-black bg-opacity-60 px-3 py-1 rounded hover:bg-opacity-90"
              onClick={() => setImageModal(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsList;
