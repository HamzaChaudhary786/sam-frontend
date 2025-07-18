import React from "react";

const EmployeeViewModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  console.log(employee,"hahahahahahahahahahhahahahahhahahahahhaahhaahah")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Employee Details - {employee.firstName} {employee.lastName}
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
          {/* Employee Photo and Basic Info */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <img
                src={employee.profileUrl}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="h-32 w-32 rounded-full object-cover border-4 border-gray-300"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-lg text-gray-600 mt-1">
                {employee.designation?.name || 'No designation'}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-800"
                      : employee.status === "retired"
                      ? "bg-blue-100 text-blue-800"
                      : employee.status === "terminated"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Police Number</label>
                <p className="text-sm text-gray-900">{employee.pnumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                <p className="text-sm text-gray-900">{employee.srnumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CNIC</label>
                <p className="text-sm text-gray-900">{employee.cnic || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <p className="text-sm text-gray-900">{employee.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="text-sm text-gray-900">
                  {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cast</label>
                <p className="text-sm text-gray-900">{employee.cast?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <p className="text-sm text-gray-900">{employee.designation?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade</label>
                <p className="text-sm text-gray-900">{employee.grade?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-sm text-gray-900">
                  {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Station Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Station Name</label>
                <p className="text-sm text-gray-900">{employee.stations?.name || 'N/A'}</p>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <p className="text-sm text-gray-900">{employee.stations?.address?.line1 || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <p className="text-sm text-gray-900">{employee.stations?.address?.line2 || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <p className="text-sm text-gray-900">{employee.stations?.address?.city || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Weapons/Assets Information */}
          {employee.assets && employee.assets.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Assets</h4>
              <div className="space-y-4">
                {employee.assets.map((asset, index) => (
                  <div key={index} className={`rounded-lg p-4 ${
                    asset.type === 'weapons' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    {/* Asset Header */}
                    <div className="flex items-center mb-3">
                      {asset.type === 'weapons' ? (
                        <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      <h5 className={`font-semibold ${
                        asset.type === 'weapons' ? 'text-red-800' : 'text-blue-800'
                      }`}>
                        {asset.name} ({asset.type})
                      </h5>
                    </div>

                    {/* Basic Asset Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm font-medium ${
                          asset.type === 'weapons' ? 'text-red-700' : 'text-blue-700'
                        }`}>Asset Name</label>
                        <p className={`text-sm ${
                          asset.type === 'weapons' ? 'text-red-900' : 'text-blue-900'
                        }`}>{asset.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${
                          asset.type === 'weapons' ? 'text-red-700' : 'text-blue-700'
                        }`}>Asset Type</label>
                        <p className={`text-sm ${
                          asset.type === 'weapons' ? 'text-red-900' : 'text-blue-900'
                        }`}>{asset.type || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Weapon-specific Information */}
                    {asset.type === 'weapons' && (asset.weaponNumber || asset.pistolNumber) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {asset.weaponNumber && (
                          <div>
                            <label className="block text-sm font-medium text-red-700">Weapon Number</label>
                            <p className="text-sm text-red-900 font-mono">{asset.weaponNumber}</p>
                          </div>
                        )}
                        {asset.pistolNumber && (
                          <div>
                            <label className="block text-sm font-medium text-red-700">Pistol Number</label>
                            <p className="text-sm text-red-900 font-mono">{asset.pistolNumber}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ammunition Information - Only show if both fields exist */}
                    {asset.type === 'weapons' && asset.assignedRounds && asset.consumedRounds && (
                      <div className="mt-4 p-3 bg-red-100 rounded-lg">
                        <h6 className="text-sm font-semibold text-red-800 mb-2">Ammunition Status</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-red-700">Assigned Rounds</label>
                            <p className="text-sm text-red-900 font-semibold">{asset.assignedRounds}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-red-700">Consumed Rounds</label>
                            <p className="text-sm text-red-900 font-semibold">{asset.consumedRounds}</p>
                          </div>
                        </div>
                        
                        {/* Ammunition Progress Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-red-700">Remaining Rounds</span>
                            <span className="text-xs text-red-700">
                              {asset.assignedRounds - asset.consumedRounds} / {asset.assignedRounds}
                            </span>
                          </div>
                          <div className="w-full bg-red-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                              style={{
                                width: `${((asset.assignedRounds - asset.consumedRounds) / asset.assignedRounds) * 100}%`
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            {Math.round(((asset.assignedRounds - asset.consumedRounds) / asset.assignedRounds) * 100)}% remaining
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    {asset.additionalInfo && (
                      <div className="mt-3">
                        <label className={`block text-sm font-medium ${
                          asset.type === 'weapons' ? 'text-red-700' : 'text-blue-700'
                        }`}>Additional Information</label>
                        <p className={`text-sm ${
                          asset.type === 'weapons' ? 'text-red-900' : 'text-blue-900'
                        }`}>{asset.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stations Information */}
          {employee.stations && Array.isArray(employee.stations) && employee.stations.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Stations</h4>
              <div className="space-y-3">
                {employee.stations.map((station, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Station Name</label>
                        <p className="text-sm text-gray-900">{station.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tehsil</label>
                        <p className="text-sm text-gray-900">{station.tehsil || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <p className="text-sm text-gray-900">
                          {station.address ? 
                            `${station.address.line1}${station.address.line2 ? ', ' + station.address.line2 : ''}, ${station.address.city}` 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {employee.achievements && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {employee.achievements || 'No achievements recorded'}
                </p>
              </div>
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
  );
};

export default EmployeeViewModal;