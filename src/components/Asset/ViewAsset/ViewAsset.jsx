import React from "react";
import { ASSET_TYPE_DISPLAY } from "../AssetConstants.js";

const AssetViewModal = ({ isOpen, onClose, asset }) => {
  if (!isOpen || !asset) return null;

  return (
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Asset Icon and Basic Info */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className={`h-24 w-24 rounded-full flex items-center justify-center border-4 ${
                asset.type === 'vehicles' 
                  ? 'bg-blue-100 border-blue-200' 
                  : 'bg-red-100 border-red-200'
              }`}>
                {asset.type === 'vehicles' ? (
                  <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {asset.name}
              </h3>
              <p className="text-lg text-gray-600 mt-1">
                {ASSET_TYPE_DISPLAY[asset.type] || asset.type}
              </p>
              <div className="mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  asset.type === 'vehicles' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
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
                <label className="block text-sm font-medium text-gray-700">Asset ID</label>
                <p className="text-sm text-gray-900 font-mono">{asset._id}</p>
              </div>
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
              <div className={`rounded-lg p-4 ${
                asset.type === 'vehicles' ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center">
                  {asset.type === 'vehicles' ? (
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  )}
                  <label className={`block text-sm font-medium ${
                    asset.type === 'vehicles' ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    Category
                  </label>
                </div>
                <p className={`text-lg font-semibold mt-1 ${
                  asset.type === 'vehicles' ? 'text-blue-900' : 'text-red-900'
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
                <p className="text-lg font-semibold text-gray-900 mt-1">Active</p>
              </div>
            </div>
          </div>

          {/* Asset Statistics */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <svg className="h-8 w-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-purple-700">In Service Since</p>
                <p className="text-xl font-bold text-purple-900">
                  {asset.createdAt ? new Date(asset.createdAt).getFullYear() : 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <svg className="h-8 w-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-700">Condition</p>
                <p className="text-xl font-bold text-green-900">Good</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <svg className="h-8 w-8 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-sm text-orange-700">Assigned To</p>
                <p className="text-xl font-bold text-orange-900">
                  {asset.assignedTo || 'Unassigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Code</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {asset._id?.slice(-8).toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Value</label>
                  <p className="text-sm text-gray-900">
                    {asset.value ? `$${asset.value.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance Status</label>
                  <p className="text-sm text-gray-900">Up to Date</p>
                </div>
              </div>
            </div>
          </div>
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
  );
};

export default AssetViewModal;