import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const IssueRoundsModal = ({
  isOpen,
  onClose,
  onSave,
  assignment,
  loading,
}) => {
  const [formData, setFormData] = useState({
    rounds: "",
    issueDate: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        rounds: "",
        issueDate: today,
        description: "",
      });
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setFormData({
      rounds: "",
      issueDate: "",
      description: "",
    });
    onClose();
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.rounds || !formData.issueDate || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    if (parseInt(formData.rounds) <= 0) {
      alert("Number of rounds must be greater than 0");
      return;
    }

    // Pass assignment ID and form data to parent
    onSave({
      assignmentId: assignment._id,
      ...formData,
      rounds: parseInt(formData.rounds),
    });
  };

  const getAssetNames = (assets) => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return "No assets assigned";
    }
    
    const validAssets = assets.filter(asset => asset && asset.name);
    if (validAssets.length === 0) {
      return "No valid assets";
    }
    
    return validAssets.map(asset => asset.name).join(", ");
  };

  const getEmployeeName = (employee) => {
    if (!employee) return "Unknown Employee";
    return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown Employee";
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Issue Rounds
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Asset and Employee Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                Assignment Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Employee
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {getEmployeeName(assignment.employee)}
                  </p>
                  {assignment.employee?.personalNumber && (
                    <p className="text-xs text-gray-500">
                      ID: {assignment.employee.personalNumber}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Assets
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {getAssetNames(assignment.asset)}
                  </p>
                  {assignment.asset && Array.isArray(assignment.asset) && assignment.asset.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {assignment.asset
                        .filter(asset => asset && (asset.serialNumber || asset.weaponNumber))
                        .map((asset, index) => (
                          <div key={index}>
                            {asset.serialNumber && `Serial: ${asset.serialNumber}`}
                            {asset.weaponNumber && ` | Weapon: ${asset.weaponNumber}`}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Issue Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rounds to Issue *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.rounds}
                  onChange={(e) => handleInputChange("rounds", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of rounds"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleInputChange("issueDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for issuing rounds..."
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Issuing..." : "Issue Rounds"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueRoundsModal;