import React from "react";

const StationViewModal = ({ isOpen, onClose, station }) => {
  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Station Details - {station.name}
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
          {/* Station Icon and Basic Info */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-200">
                <svg
                  className="h-12 w-12 text-green-600"
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
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {station.name}
              </h3>
              <p className="text-lg text-gray-600 mt-1">
                {station.tehsil} Tehsil
              </p>
              <div className="mt-2">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  Active Station
                </span>
              </div>
            </div>
          </div>

          {/* Station Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Station Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Station ID</label>
                <p className="text-sm text-gray-900 font-mono">{station._id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Station Name</label>
                <p className="text-sm text-gray-900">{station.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tehsil</label>
                <p className="text-sm text-gray-900">{station.tehsil}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="text-sm text-gray-900">
                  {station.createdAt ? new Date(station.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                  <p className="text-sm text-gray-900">{station.address?.line1 || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                  <p className="text-sm text-gray-900">{station.address?.line2 || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="text-sm text-gray-900">{station.address?.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Complete Address</label>
                  <p className="text-sm text-gray-900">
                    {station.address ? 
                      `${station.address.line1}${station.address.line2 ? ', ' + station.address.line2 : ''}, ${station.address.city}` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <label className="block text-sm font-medium text-blue-700">Tehsil</label>
                </div>
                <p className="text-lg font-semibold text-blue-900 mt-1">{station.tehsil}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <label className="block text-sm font-medium text-green-700">City</label>
                </div>
                <p className="text-lg font-semibold text-green-900 mt-1">{station.address?.city || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Station Statistics */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Station Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <svg className="h-8 w-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-sm text-purple-700">Total Employees</p>
                <p className="text-xl font-bold text-purple-900">
                  {station.employeeCount || 'N/A'}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <svg className="h-8 w-8 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm text-orange-700">Security Level</p>
                <p className="text-xl font-bold text-orange-900">Standard</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <svg className="h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-indigo-700">Operational Since</p>
                <p className="text-xl font-bold text-indigo-900">
                  {station.createdAt ? new Date(station.createdAt).getFullYear() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {station.updatedAt ? new Date(station.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Station Code</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {station._id?.slice(-8).toUpperCase() || 'N/A'}
                  </p>
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

export default StationViewModal;