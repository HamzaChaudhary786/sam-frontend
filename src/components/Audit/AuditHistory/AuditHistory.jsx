// AuditHistoryComponent.jsx - Employee Audit History with Pagination
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  getEmployeeAuditHistory,
  getEmployeeUpdateRecords,
  getEmployeeDeleteRecords,
  formatAuditDate,
  getActionBadgeColor,
  formatEmployeeName,
  formatUserName
} from "../AuditApi.js";

const AuditHistoryComponent = ({ employee, onClose }) => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    action: "",
  });

  // Fetch audit history based on active tab
  const fetchAuditHistory = async () => {
    if (!employee?._id) {
      setError("No employee selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      let result;
      const requestFilters = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      };

      switch (activeTab) {
        case "updates":
          result = await getEmployeeUpdateRecords(employee._id, requestFilters);
          break;
        case "deletes":
          result = await getEmployeeDeleteRecords(employee._id, requestFilters);
          break;
        case "all":
        default:
          result = await getEmployeeAuditHistory(employee._id, requestFilters);
          break;
      }
      
      if (result.success) {
        setAuditData(result.data);
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            ...result.pagination
          }));
        }
      } else {
        setError(result.error || "Failed to fetch audit history");
        setAuditData(null);
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching audit history");
      setAuditData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Render changed fields
  const renderChangedFields = (changedFields) => {
    if (!changedFields || changedFields.length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded">
        <p className="text-sm font-medium text-gray-700 mb-2">Changed Fields:</p>
        <div className="space-y-2">
          {changedFields.map((field, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium text-gray-600">{field.fieldName}:</span>
              <span className="text-red-600 line-through ml-2">{field.oldValue || "null"}</span>
              <span className="mx-2">→</span>
              <span className="text-green-600 font-medium">{field.newValue || "null"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Effects
  useEffect(() => {
    fetchAuditHistory();
  }, [employee, activeTab, pagination.currentPage, filters]);

  if (!employee) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Please select an employee to view audit history.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Audit History - {formatEmployeeName(employee)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Employee ID: {employee.personalNumber} | CNIC: {employee.cnic}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All History
          </button>
          <button
            onClick={() => handleTabChange("updates")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "updates"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Updates Only
          </button>
          <button
            onClick={() => handleTabChange("deletes")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "deletes"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Deletes Only
          </button>
        </div>

        {/* Filters */}
        {activeTab === "all" && (
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Records per page
              </label>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), currentPage: 1 }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Audit Records */}
      {!loading && !error && auditData && (
        <div className="p-6">
          {/* Summary (for all history tab) */}
          {activeTab === "all" && auditData.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{auditData.summary.totalRecords}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{auditData.summary.CREATE || 0}</p>
                <p className="text-sm text-gray-600">Creates</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{auditData.summary.UPDATE || 0}</p>
                <p className="text-sm text-gray-600">Updates</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{auditData.summary.DELETE || 0}</p>
                <p className="text-sm text-gray-600">Deletes</p>
              </div>
            </div>
          )}

          {/* Records List */}
          {auditData.auditRecords && auditData.auditRecords.length > 0 ? (
            <div className="space-y-4">
              {auditData.auditRecords.map((record) => (
                <div key={record._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionBadgeColor(record.action)}`}>
                        {record.action}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatUserName(record.userId)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.userId?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatAuditDate(record.createdAt)}
                      </p>
                      {record.metadata?.ipAddress && (
                        <p className="text-xs text-gray-500">
                          IP: {record.metadata.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  {record.metadata?.reason && (
                    <div className="mb-3 p-2 bg-blue-50 rounded">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Reason:</span> {record.metadata.reason}
                      </p>
                    </div>
                  )}

                  {/* Changed Fields */}
                  {renderChangedFields(record.changedFields)}

                  {/* Old/New Records for CREATE/DELETE */}
                  {record.action === "CREATE" && record.newRecord && (
                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800 mb-2">Created Record:</p>
                      <pre className="text-xs text-green-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(record.newRecord, null, 2)}
                      </pre>
                    </div>
                  )}

                  {record.action === "DELETE" && record.oldRecord && (
                    <div className="mt-3 p-3 bg-red-50 rounded">
                      <p className="text-sm font-medium text-red-800 mb-2">Deleted Record:</p>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(record.oldRecord, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No audit records found</p>
              <p className="text-gray-400 text-sm mt-1">
                No {activeTab === "all" ? "audit" : activeTab} records found for this employee.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalRecords} total records)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                  {pagination.currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={fetchAuditHistory}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Loading..." : "Refresh History"}
        </button>
      </div>
    </div>
  );
};

export default AuditHistoryComponent;