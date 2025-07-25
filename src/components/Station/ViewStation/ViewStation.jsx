import React, { useState } from "react";

const StationViewModal = ({ isOpen, onClose, station }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!isOpen || !station) return null;

  // Get station images array or fallback to empty array
  const stationImages = Array.isArray(station.stationImageUrl) 
    ? station.stationImageUrl 
    : station.stationImageUrl 
      ? [station.stationImageUrl] 
      : [];

  const currentImage = stationImages[currentImageIndex] || "/default-station.png";

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? stationImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === stationImages.length - 1 ? 0 : prev + 1
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
            {/* Station Image and Basic Info */}
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 relative">
                {/* Station Image */}
                <img
                  src={currentImage}
                  alt={station.name}
                  className="h-32 w-32 rounded-lg object-cover border-4 border-green-300 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={openImageModal}
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                
                {/* Fallback Icon (hidden by default, shown if image fails) */}
                <div 
                  className="h-32 w-32 rounded-lg bg-green-100 flex items-center justify-center border-4 border-green-200 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ display: stationImages.length > 0 ? 'none' : 'flex' }}
                  onClick={openImageModal}
                >
                  <svg
                    className="h-16 w-16 text-green-600"
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

                {/* Navigation arrows - show only if multiple images */}
                {stationImages.length > 1 && (
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
                {stationImages.length > 1 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} of {stationImages.length}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {station.name}
                </h3>
                <p className="text-lg text-gray-600 mt-1">
                  {station.address?.city || 'N/A'} - {station.tehsil}
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
                  <label className="block text-sm font-medium text-gray-700">Station Name</label>
                  <p className="text-sm text-gray-900">{station.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tehsil</label>
                  <p className="text-sm text-gray-900">{station.tehsil}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">District</label>
                  <p className="text-sm text-gray-900">{station.district}</p>
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

            {/* Facilities Information */}
            {station.facilities && station.facilities.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Station Facilities</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {station.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center p-2 bg-white rounded-md">
                        <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-900">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
      {showImageModal && stationImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={`${station.name} - Full Size`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation arrows for full-size modal */}
            {stationImages.length > 1 && (
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
            {stationImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} of {stationImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StationViewModal;