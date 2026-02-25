import React, { useState, useEffect } from "react";
import { ASSET_TYPE_DISPLAY } from ".././components/Asset/AssetConstants.js";
import { BACKEND_URL } from "../constants/api.js";

const AssetViewModal = ({ isOpen, onClose, asset }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch assignment history
  useEffect(() => {
    if (activeTab === "history" && asset?._id) {
      setIsLoading(true);
      const getToken = () => localStorage.getItem('authToken');

      // Helper function to get headers with token
      const getAuthHeaders = () => {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      };

      fetch(`${BACKEND_URL}/asset-assignments/asset/${asset._id}`, {
        headers: getAuthHeaders(),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch assignment history");
          }
          return response.json();
        })
        .then((response) => {
          // Extract the data array from the response
          setAssignmentHistory(response.data || []);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [activeTab, asset?._id]);

  // Early return AFTER all hooks
  if (!isOpen || !asset) return null;

  // Get asset images array or fallback to empty array
  const assetImages = Array.isArray(asset.assetImageUrl)
    ? asset.assetImageUrl
    : asset.assetImageUrl
      ? [asset.assetImageUrl]
      : [];

  if (!isOpen || !asset) return null;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? assetImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === assetImages.length - 1 ? 0 : prev + 1
    );
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Asset Details - {asset.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6">
              <button
                className={`py-4 px-6 block text-sm font-medium ${activeTab === "view"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("view")}
              >
                Asset View
              </button>
              <button
                className={`py-4 px-6 block text-sm font-medium ${activeTab === "history"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("history")}
              >
                Assignment History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-6">
            {activeTab === "view" && (
              <>
                {/* Asset Image and Basic Info */}
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0 relative">
                    {/* Asset Image */}
                    {/* <img
                      src={currentImage}
                      alt={asset.name}
                      className="h-32 w-32 rounded-lg object-cover border-4 border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={openImageModal}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    /> */}

                    {/* Fallback Icon */}
                    <div
                      className={`h-32 w-32 rounded-lg flex items-center justify-center border-4 cursor-pointer hover:opacity-90 transition-opacity ${asset.type === 'vehicle'
                        ? 'bg-green-100 border-green-200'
                        : asset.type === 'weapons' || asset.type === 'pistol'
                          ? 'bg-red-100 border-red-200'
                          : asset.type === 'round'
                            ? 'bg-yellow-100 border-yellow-200'
                            : 'bg-blue-100 border-blue-200'
                        }`}
                      style={{ display: assetImages.length > 0 ? 'none' : 'flex' }}
                      onClick={openImageModal}
                    >
                      {asset.type === 'vehicle' ? (
                        <svg className="h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                        </svg>
                      ) : asset.type === 'weapons' || asset.type === 'pistol' ? (
                        <svg className="h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                      ) : asset.type === 'round' ? (
                        <svg className="h-16 w-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      ) : (
                        <svg className="h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>

                    {/* Navigation arrows - show only if multiple images */}
                    {assetImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    {assetImages.length > 1 && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1} of {assetImages.length}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {asset.name}
                    </h3>
                    <p className="text-lg text-gray-600 mt-1">
                      {ASSET_TYPE_DISPLAY[asset.type] || asset.type}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${asset.type === 'vehicle'
                        ? 'bg-green-100 text-green-800'
                        : asset.type === 'weapons' || asset.type === 'pistol'
                          ? 'bg-red-100 text-red-800'
                          : asset.type === 'round'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {ASSET_TYPE_DISPLAY[asset.type] || asset.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Basic Asset Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                      <p className="text-sm text-gray-900">{asset.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                      <p className="text-sm text-gray-900">{ASSET_TYPE_DISPLAY[asset.type] || asset.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created Date</label>
                      <p className="text-sm text-gray-900">
                        {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weapon/Equipment Details Section */}
                {(asset.weaponNumber || asset.assignedRounds || asset.consumedRounds) && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {asset.type === 'weapons' || asset.type === 'pistol' ? 'Weapon Details' : 'Equipment Details'}
                    </h4>
                    <div className={`rounded-lg p-4 ${asset.type === 'weapons' || asset.type === 'pistol' ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {asset.weaponNumber && (
                          <div>
                            <label className={`block text-sm font-medium ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-700' : 'text-blue-700'
                              }`}>Weapon Number</label>
                            <p className={`text-sm font-mono ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-900' : 'text-blue-900'
                              }`}>{asset.weaponNumber}</p>
                          </div>
                        )}
                        {asset.assignedRounds && (
                          <div>
                            <label className={`block text-sm font-medium ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-700' : 'text-blue-700'
                              }`}>Assigned Rounds</label>
                            <p className={`text-sm ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-900' : 'text-blue-900'
                              }`}>{asset.assignedRounds}</p>
                          </div>
                        )}
                        {asset.consumedRounds && (
                          <div>
                            <label className={`block text-sm font-medium ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-700' : 'text-blue-700'
                              }`}>Consumed Rounds</label>
                            <p className={`text-sm ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-900' : 'text-blue-900'
                              }`}>{asset.consumedRounds}</p>
                          </div>
                        )}
                        {asset.availableQuantity && (
                          <div>
                            <label className={`block text-sm font-medium ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-700' : 'text-blue-700'
                              }`}>Available Quantity</label>
                            <p className={`text-sm ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-900' : 'text-blue-900'
                              }`}>{asset.availableQuantity}</p>
                          </div>
                        )}
                      </div>

                      {/* Ammunition Status Bar */}
                      {asset.assignedRounds && asset.consumedRounds && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <label className={`block text-sm font-medium ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-700' : 'text-blue-700'
                              }`}>Ammunition Status</label>
                            <span className={`text-sm ${asset.type === 'weapons' || asset.type === 'pistol' ? 'text-red-700' : 'text-blue-700'
                              }`}>
                              {asset.assignedRounds - asset.consumedRounds} / {asset.assignedRounds} remaining
                            </span>
                          </div>
                          <div className={`w-full rounded-full h-2.5 ${asset.type === 'weapons' || asset.type === 'pistol' ? 'bg-red-200' : 'bg-blue-200'
                            }`}>
                            <div
                              className={`h-2.5 rounded-full ${asset.type === 'weapons' || asset.type === 'pistol' ? 'bg-red-600' : 'bg-blue-600'
                                }`}
                              style={{
                                width: `${((asset.assignedRounds - asset.consumedRounds) / asset.assignedRounds) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Vehicle Details Section */}
                {asset.type === 'vehicle' && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {asset.registerNumber && (
                          <div>
                            <label className="block text-sm font-medium text-green-700">Register Number</label>
                            <p className="text-sm text-green-900 font-mono">{asset.registerNumber}</p>
                          </div>
                        )}
                        {asset.chassiNumber && (
                          <div>
                            <label className="block text-sm font-medium text-green-700">Chassis Number</label>
                            <p className="text-sm text-green-900 font-mono">{asset.chassiNumber}</p>
                          </div>
                        )}
                        {asset.engineNumber && (
                          <div>
                            <label className="block text-sm font-medium text-green-700">Engine Number</label>
                            <p className="text-sm text-green-900 font-mono">{asset.engineNumber}</p>
                          </div>
                        )}
                        {asset.make && (
                          <div>
                            <label className="block text-sm font-medium text-green-700">Make</label>
                            <p className="text-sm text-green-900">{asset.make}</p>
                          </div>
                        )}
                        {asset.model && (
                          <div>
                            <label className="block text-sm font-medium text-green-700">Model</label>
                            <p className="text-sm text-green-900">{asset.model}</p>
                          </div>
                        )}
                        {asset.color && (
                          <div>
                            <label className="block text-sm font-medium text-green-700">Color</label>
                            <p className="text-sm text-green-900 capitalize">{asset.color}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Asset Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Asset Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {asset.assetStatus && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Asset Status</label>
                        <p className="text-sm text-gray-900 capitalize">{asset.assetStatus}</p>
                      </div>
                    )}
                    {asset.cost && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cost</label>
                        <p className="text-sm text-gray-900">{asset.cost.toLocaleString()}</p>
                      </div>
                    )}
                    {asset.purchaseDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                        <p className="text-sm text-gray-900">
                          {new Date(asset.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {asset.supplier && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <p className="text-sm text-gray-900">{asset.supplier}</p>
                      </div>
                    )}
                    {asset.availableQuantity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Available Quantity</label>
                        <p className="text-sm text-gray-900">{asset.availableQuantity}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {asset.additionalInfo || 'No additional information available'}
                    </p>
                  </div>
                </div>

                {/* Asset Category Details */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`rounded-lg p-4 ${asset.type === 'vehicle'
                      ? 'bg-green-50'
                      : asset.type === 'weapons' || asset.type === 'pistol'
                        ? 'bg-red-50'
                        : asset.type === 'round'
                          ? 'bg-yellow-50'
                          : 'bg-blue-50'
                      }`}>
                      <div className="flex items-center">
                        {asset.type === 'vehicle' ? (
                          <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                          </svg>
                        ) : asset.type === 'weapons' || asset.type === 'pistol' ? (
                          <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                          </svg>
                        ) : asset.type === 'round' ? (
                          <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        <label className={`block text-sm font-medium ${asset.type === 'vehicle'
                          ? 'text-green-700'
                          : asset.type === 'weapons' || asset.type === 'pistol'
                            ? 'text-red-700'
                            : asset.type === 'round'
                              ? 'text-yellow-700'
                              : 'text-blue-700'
                          }`}>
                          Category
                        </label>
                      </div>
                      <p className={`text-lg font-semibold mt-1 ${asset.type === 'vehicle'
                        ? 'text-green-900'
                        : asset.type === 'weapons' || asset.type === 'pistol'
                          ? 'text-red-900'
                          : asset.type === 'round'
                            ? 'text-yellow-900'
                            : 'text-blue-900'
                        }`}>
                        {ASSET_TYPE_DISPLAY[asset.type] || asset.type}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                        {asset.assetStatus || 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Assignment History</h4>

                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                    </svg>
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    <p>Error: {error}</p>
                  </div>
                )}

                {!isLoading && !error && assignmentHistory.length === 0 && (
                  <div className="bg-gray-50 text-gray-600 p-4 rounded-lg text-center">
                    <p>No assignment history available for this asset.</p>
                  </div>
                )}

                {!isLoading && !error && assignmentHistory.length > 0 && (
                  <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assignment Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigned To
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            From Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            To Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignmentHistory.map((history) => {
                          // Determine assignment type and name
                          let assignmentType = 'Unassigned';
                          let assignedToName = 'N/A';
                          let assignedToDetails = '';

                          if (history.employee) {
                            assignmentType = 'Employee';
                            assignedToName = `${history.employee.firstName} ${history.employee.lastName || ''}`.trim();
                            assignedToDetails = `Personal No: ${history.employee.personalNumber || 'N/A'}`;
                          } else if (history.station) {
                            assignmentType = 'Station';
                            assignedToName = history.station.name;
                            assignedToDetails = history.station.tehsil ? `Tehsil: ${history.station.tehsil}` : '';
                          } else if (history.mallKhana) {
                            assignmentType = 'Mall Khana';
                            assignedToName = history.mallKhana.name;
                            assignedToDetails = history.mallKhana.tehsil ? `Tehsil: ${history.mallKhana.tehsil}` : '';
                          }

                          return (
                            <tr key={history._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${assignmentType === 'Employee' ? 'bg-blue-100 text-blue-800' :
                                    assignmentType === 'Station' ? 'bg-purple-100 text-purple-800' :
                                      assignmentType === 'Mall Khana' ? 'bg-indigo-100 text-indigo-800' :
                                        'bg-gray-100 text-gray-800'
                                  }`}>
                                  {assignmentType}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {assignedToName}
                                </div>
                                {assignedToDetails && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {assignedToDetails}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(history.fromDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {history.toDate ? (
                                  new Date(history.toDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                ) : (
                                  <span className="text-green-600 font-medium">Present</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${history.isApproved
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {history.isApproved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                <div className="line-clamp-2" title={history.description || 'N/A'}>
                                  {history.description || 'N/A'}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {showImageModal && assetImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* <img
              src={currentImage}
              alt={`${asset.name} - Full Size`}
              className="max-w-full max-h-full object-contain"
            /> */}

            {/* Navigation arrows for full-size modal */}
            {assetImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image counter for full-size modal */}
            {assetImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} of {assetImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AssetViewModal;