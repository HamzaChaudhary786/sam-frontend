import React, { useState, useEffect } from "react";
import { useAssets } from "../AssetHook.js";
import AssetModal from "../AddAsset/AddAsset.jsx";
import AssetViewModal from "../ViewAsset/ViewAsset.jsx";
import AssetFilters from "../Filter.jsx";
import { useLookupOptions } from "../../../services/LookUp.js";
import Pagination from "../Pagination.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AssetsList = () => {
  const {
    assets,
    pagination: { currentPage, totalPages, hasNext, hasPrev, totalAssets },
    setPage,
    loading,
    error,
    removeAsset,
    updateFilters,
    clearFilters,
    filters,
    fetchAssets,
  } = useAssets();


  const navigate = useNavigate()
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");
  const { options: assetStatusOptions } = useLookupOptions("assetStatuses");

  const [imageModal, setImageModal] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [pageSize, setPageSize] = useState(500); // Add this line


  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Mobile view state
  const [showFilters, setShowFilters] = useState(false);

  // Multiple selection state
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Reset selection when assets change
  useEffect(() => {
    setSelectedAssets(new Set());
    setSelectAll(false);
  }, [assets]);

  // Multiple selection handlers
  const handleSelectAsset = (assetId) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    // Update filters with new page size and reset to page 1
    const newFilters = { ...filters, limit: newPageSize, page: 1 };
    updateFilters(newFilters);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(safeAssets.map(asset => asset._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.size === 0) {
      toast.error("Please select assets to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedAssets.size} asset(s)?`)) {
      try {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const assetId of selectedAssets) {
          try {
            // Validate ID format
            if (!assetId || typeof assetId !== 'string' || assetId.trim() === '') {
              throw new Error("Invalid asset ID format");
            }

            console.log("Attempting to delete asset with ID:", assetId);

            const result = await removeAsset(assetId.trim());

            if (result && result.success) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`${assetId}: ${result?.error || 'Unknown error'}`);
            }
          } catch (error) {
            console.error(`Failed to delete asset ${assetId}:`, error);
            errorCount++;
            errors.push(`${assetId}: ${error?.message || 'Unknown error'}`);
          }
        }

        setSelectedAssets(new Set());
        setSelectAll(false);

        if (successCount > 0 && errorCount === 0) {
          toast.success(`Successfully deleted ${successCount} asset(s)`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.warning(`Deleted ${successCount} asset(s), failed to delete ${errorCount}`);
          console.log("Errors:", errors);
        } else {
          toast.error("Failed to delete selected assets");
          console.log("All errors:", errors);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Error deleting assets");
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedAssets(new Set());
    setSelectAll(false);
  };

  const handleDelete = async (id) => {
    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim() === '') {
      toast.error("Invalid asset ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        console.log("Attempting to delete asset with ID:", id);

        const result = await removeAsset(id.trim());

        if (result && result.success) {
          console.log("Asset deleted successfully");
        } else {
          console.error("Failed to delete asset:", result?.error);
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
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

  // Helper function to get asset type label
  const getAssetTypeLabel = (typeValue) => {
    return assetTypeOptions.find(option => option.value === typeValue)?.label || typeValue;
  };

  // Helper function to get asset status label
  const getAssetStatusLabel = (statusValue) => {
    return assetStatusOptions.find(option => option.value === statusValue)?.label || statusValue;
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
    <div className="p-3 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Assets Management
        </h1>
        <div className="flex flex-row gap-x-2 items-center ">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium flex items-center justify-center text-sm"
            onClick={() => {
              navigate('/bulk-asset')
            }}
          >
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="hidden lg:inline">Bulk Assets</span>
            <span className="lg:hidden">Bulk Assets</span>
          </button>
          <button
            onClick={handleAddAsset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
          >
            Add Asset
          </button>
        </div>

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedAssets.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <span className="text-sm text-blue-800 font-medium">
            {selectedAssets.size} asset(s) selected
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

      {/* Asset Filters Component */}
      <AssetFilters
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Assets Table/Cards - Responsive */}
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
                    N0.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Status
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
                {safeAssets.map((asset, index) => (
                  <tr key={asset._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAssets.has(asset._id)}
                        onChange={() => handleSelectAsset(asset._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start space-y-2">
                        {asset.assetImageUrl && asset.assetImageUrl.length > 0 ? (
                          <div className="relative">
                            <img
                              src={asset.assetImageUrl[imageIndexes[asset._id] ?? 0]}
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
                                    handlePrevImage(asset._id, asset.assetImageUrl.length)
                                  }
                                  className="absolute top-1/2 -left-5 transform -translate-y-1/2 text-gray-600 hover:text-black"
                                >
                                  ‹
                                </button>
                                <button
                                  onClick={() =>
                                    handleNextImage(asset._id, asset.assetImageUrl.length)
                                  }
                                  className="absolute top-1/2 -right-5 transform -translate-y-1/2 text-gray-600 hover:text-black"
                                >
                                  ›
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="pt-2">
                          <div className="text-sm font-medium text-gray-900">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${asset.type === "vehicles"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                            }`}
                        >
                          {getAssetTypeLabel(asset.type)}
                        </span>
                        {asset.assetStatus && (
                          <div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${asset.assetStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : asset.assetStatus === "maintenance"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {getAssetStatusLabel(asset.assetStatus)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="truncate">
                          {asset.additionalInfo || "No additional information"}
                        </div>
                        {asset.purchaseDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleView(asset)}
                          className="px-3 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(asset)}
                          className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(asset._id)}
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
          {safeAssets.map((asset) => (
            <div key={asset._id} className="border-b border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedAssets.has(asset._id)}
                  onChange={() => handleSelectAsset(asset._id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-shrink-0 relative">
                  {/* Asset Image */}
                  {asset.assetImageUrl && asset.assetImageUrl.length > 0 ? (
                    <div className="relative">
                      <img
                        src={asset.assetImageUrl[imageIndexes[asset._id] ?? 0]}
                        alt="Asset"
                        onClick={() =>
                          setImageModal(
                            asset.assetImageUrl[imageIndexes[asset._id] ?? 0]
                          )
                        }
                        className="h-12 w-12 rounded border object-cover cursor-pointer hover:scale-105 transition"
                      />
                      {asset.assetImageUrl.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              handlePrevImage(asset._id, asset.assetImageUrl.length)
                            }
                            className="absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                            style={{ fontSize: "10px" }}
                          >
                            ‹
                          </button>
                          <button
                            onClick={() =>
                              handleNextImage(asset._id, asset.assetImageUrl.length)
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
                            {(imageIndexes[asset._id] ?? 0) + 1}/{asset.assetImageUrl.length}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {asset.name}
                    </h3>
                  </div>

                  <div className="mt-1 space-y-1">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${asset.type === "vehicles"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                          }`}
                      >
                        {getAssetTypeLabel(asset.type)}
                      </span>
                      {asset.assetStatus && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${asset.assetStatus === "active"
                            ? "bg-green-100 text-green-800"
                            : asset.assetStatus === "maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {getAssetStatusLabel(asset.assetStatus)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {asset.additionalInfo || "No additional information"}
                    </p>
                    {asset.purchaseDate && (
                      <p className="text-xs text-gray-500">
                        Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="mt-3">
                    {/* Primary Actions Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleView(asset)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-center"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(asset)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(asset._id)}
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

        {safeAssets.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No assets found</p>
          </div>
        )}
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}                    // NEW
        onPageSizeChange={handlePageSizeChange} // NEW
        totalItems={totalAssets || 0}          // NEW (from pagination object)
      />

      {/* Add/Edit Asset Modal */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEdit={isEditMode}
        editData={editData}
        onSuccess={fetchAssets}
      />

      {/* View Asset Modal */}
      <AssetViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        asset={selectedAsset}
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

export default AssetsList;