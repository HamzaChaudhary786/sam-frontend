// StationAssetTable.jsx
import React from "react";

const StationAssetTable = ({ 
  filteredAssignments, 
  selectedItems, 
  handleSelectItem, 
  handleSelectAll, 
  handleApprove, 
  onEdit, 
  handleDelete, 
  isAdmin,
  formatDate,
  getAssetNames,
  getApprovalStatus,
  getAssetTypes,
}) => {
  if (filteredAssignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">
          No asset assignments match your filter criteria
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Try adjusting your filter criteria to see more results.
        </p>
      </div>
    );
  }

  return (
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredAssignments.length && filteredAssignments.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Assets
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Assignment Details
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Dates
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredAssignments.map((assignment) => {
          const assetTypes = getAssetTypes(assignment.asset);
          const approvalStatus = getApprovalStatus(assignment);
          
          return (
            <tr key={assignment._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(assignment._id)}
                  onChange={() => handleSelectItem(assignment._id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {getAssetNames(assignment.asset)}
                </div>
                {assignment.asset && Array.isArray(assignment.asset) && assignment.asset.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {assignment.asset
                      .filter(asset => asset && (asset.assetId || asset.serialNumber))
                      .map((asset, index) => (
                        <div key={index}>
                          {asset.assetId && `ID: ${asset.assetId}`}
                          {asset.serialNumber && ` | Serial: ${asset.serialNumber}`}
                          {asset.type && (
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              asset.type === "weapons"
                                ? "bg-red-100 text-red-800"
                                : asset.type === "vehicle"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {asset.type}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {/* Station Information */}
                  <div className="font-medium">
                    Station: {assignment.station?.name || "N/A"}
                  </div>
                  {assignment.employee && (
                    <div className="text-xs text-gray-500 mt-1">
                      Employee: {assignment.employee.firstName} {assignment.employee.lastName}
                    </div>
                  )}
                  {assignment.mallKhana && (
                    <div className="text-xs text-gray-500">
                      Mall Khana: {assignment.mallKhana.name}
                    </div>
                  )}
                  {assignment.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {assignment.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <div className="font-medium">
                    From: {formatDate(assignment.fromDate)}
                  </div>
                  {assignment.toDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      To: {formatDate(assignment.toDate)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {formatDate(assignment.createDate || assignment.createdAt)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${approvalStatus.class}`}
                  >
                    {approvalStatus.label}
                  </span>
                  {assignment.isApproved && assignment.isApprovedBy && (
                    <div className="text-xs text-gray-500">
                      Approved by:{" "}
                      {assignment.isApprovedBy.name ||
                        assignment.isApprovedBy.firstName ||
                        "System"}
                    </div>
                  )}
                  {assignment.approvalDate && (
                    <div className="text-xs text-gray-500">
                      Approved on: {formatDate(assignment.approvalDate)}
                    </div>
                  )}
                  {assignment.approvalComment && (
                    <div className="text-xs text-gray-500 max-w-xs truncate" title={assignment.approvalComment}>
                      Comment: {assignment.approvalComment}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2 flex-wrap">
                  {!assignment.isApproved && (
                    <>
                      {/* Approve Button - Admin Only */}
                      {isAdmin ? (
                        <button
                          onClick={() => handleApprove(assignment)}
                          className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors mb-1"
                          title="Approve Assignment"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </button>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-400 rounded-md cursor-not-allowed mb-1"
                          title="Only administrators can approve assignments"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </button>
                      )}
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(assignment)}
                        className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors mb-1"
                        title="Edit Assignment"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      
                      {/* Delete Button - Admin Only */}
                      {isAdmin ? (
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors mb-1"
                          title="Delete Assignment"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-400 rounded-md cursor-not-allowed mb-1"
                          title="Only administrators can delete assignments"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Approved State - Show different buttons */}
                  {assignment.isApproved && (
                    <>
                      {/* View/Edit Button for approved assignments */}
                      <button
                        onClick={() => onEdit(assignment)}
                        className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors mb-1"
                        title="View Assignment Details"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </button>

                      {/* Approved Status Indicator */}
                      <span className="inline-flex items-center px-3 py-1 text-xs text-gray-500 bg-gray-50 rounded-md mb-1">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Approved
                      </span>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default StationAssetTable;