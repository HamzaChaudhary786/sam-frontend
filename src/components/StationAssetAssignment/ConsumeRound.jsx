import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ConsumeRoundsModal = ({
  isOpen,
  onClose,
  onSave,
  assignment,
  loading,
}) => {
  const [formData, setFormData] = useState({
    roundsConsumed: "",
    shellCollected: "",
    date: "",
    reason: "",
    isCompleteConsumption: false,
  });
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        roundsConsumed: "",
        shellCollected: "",
        date: today,
        reason: "",
        isCompleteConsumption: false,
      });
    }
  }, [isOpen]);

  // CALCULATE TOTALS FROM ROUND HISTORY
  const calculateRoundTotals = (assignment) => {
    if (!assignment?.roundStation || !Array.isArray(assignment.roundStation)) {
      return { assignedRounds: 0, consumedRounds: 0 };
    }

    let totalAssigned = 0;
    let totalConsumed = 0;
    let totalShells = 0;

    assignment.roundStation.forEach((entry) => {
      if (entry.assignedRounds) {
        totalAssigned += parseInt(entry.assignedRounds) || 0;
      }
      if (entry.consumedRounds) {
        totalConsumed += parseInt(entry.consumedRounds) || 0;
      }
      if (entry.shellCollected) {
        totalShells += parseInt(entry.shellCollected) || 0;
      }
    });

    return {
      assignedRounds: totalAssigned,
      consumedRounds: totalConsumed,
      collectedShells: totalShells,
    };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setFormData({
      roundsConsumed: "",
      shellCollected: "",
      date: "",
      reason: "",
      isCompleteConsumption: false,
    });
    onClose();
  };

  const handleSave = () => {
    // Basic validation
    if (
      !formData.roundsConsumed ||
      !formData.shellCollected ||
      !formData.date ||
      !formData.reason
    ) {
      alert("Please fill in all required fields");
      return;
    }
    const rounds = parseInt(formData?.roundsConsumed, 10);
    const shells = parseInt(formData?.shellCollected, 10);

    if (isNaN(rounds) || isNaN(shells)) {
      alert("Invalid input: shells and rounds must be valid numbers.");
      return;
    }

    if (shells > rounds) {
      alert(
        `Number of shells collected (${shells}) must be less than or equal to consumed rounds (${rounds}).`
      );
      return;
    }

    if (rounds <= 0) {
      alert("Number of rounds must be greater than 0");
      return;
    }

    // Calculate available rounds from round history
    const { assignedRounds, consumedRounds, collectedShells } =
      calculateRoundTotals(assignment);

    const availableRounds = assignedRounds - consumedRounds;

    if (rounds > availableRounds) {
      alert(`Cannot consume more than ${availableRounds} available rounds`);
      return;
    }

    // Convert date to ISO string if it's not already
    const dateValue = formData.date.includes("T")
      ? formData.date
      : `${formData.date}T00:00:00.000Z`;

    // Check if this consumption will use all available rounds
    const isCompleteConsumption = rounds >= availableRounds;

    // Pass data in the format expected by the API
    onSave({
      roundsConsumed: rounds,
      reason: formData.reason,
      shellCollected: formData?.shellCollected,
      date: dateValue,
      isCompleteConsumption: isCompleteConsumption,
    });
  };

  const getAssetNames = (assets) => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return "No assets assigned";
    }

    const validAssets = assets.filter((asset) => asset && asset.name);
    if (validAssets.length === 0) {
      return "No valid assets";
    }

    return validAssets.map((asset) => asset.name).join(", ");
  };

  const getEmployeeName = (employee) => {
    if (!employee) return "Unknown Employee";
    return (
      `${employee.name || ""} ${employee.lastName || ""}`.trim() ||
      "Unknown Employee"
    );
  };

  if (!isOpen || !assignment) return null;

  // Calculate round totals from round history
  const { assignedRounds, consumedRounds, collectedShells } =
    calculateRoundTotals(assignment);
  const availableRounds = assignedRounds - consumedRounds;

  // Debug log
  console.log("🔍 Round calculation:", {
    roundStation: assignment.roundStation,
    calculated: { assignedRounds, consumedRounds, availableRounds },
    original: {
      assignedRounds: assignment.assignedRounds,
      consumedRounds: assignment.consumedRounds,
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Consume Rounds
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
                    Station
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {getEmployeeName(assignment.station)}
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
                  {assignment.asset &&
                    Array.isArray(assignment.asset) &&
                    assignment.asset.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {assignment.asset
                          .filter(
                            (asset) =>
                              asset &&
                              (asset.serialNumber || asset.weaponNumber)
                          )
                          .map((asset, index) => (
                            <div key={index}>
                              {asset.serialNumber &&
                                `Serial: ${asset.serialNumber}`}
                              {asset.weaponNumber &&
                                ` | Weapon: ${asset.weaponNumber}`}
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Round Summary - Now calculated from round history */}
              <div className="grid grid-cols-4 gap-4 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Assigned</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {assignedRounds}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Consumed</p>
                  <p className="text-lg font-semibold text-red-600">
                    {consumedRounds}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Shells</p>
                  <p className="text-lg font-semibold text-red-600">
                    {collectedShells}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-lg font-semibold text-green-600">
                    {availableRounds}
                  </p>
                </div>
              </div>

              {/* Round History Display */}
              {assignment.roundStation &&
                assignment.roundStation.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <h5 className="text-xs font-medium text-gray-600 mb-2">
                      Recent Round History:
                    </h5>
                    <div className="max-h-24 overflow-y-auto">
                      {assignment.roundStation.slice(-3).map((entry, index) => (
                        <div
                          key={entry._id || index}
                          className="text-xs text-gray-500 mb-1"
                        >
                          <span className="font-medium">{entry.Reason}</span>
                          {parseInt(entry.assignedRounds) > 0 && (
                            <span className="text-blue-600">
                              {" "}
                              (+{entry.assignedRounds} assigned)
                            </span>
                          )}
                          {parseInt(entry.consumedRounds) > 0 && (
                            <span className="text-red-600">
                              {" "}
                              (-{entry.consumedRounds} consumed)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {availableRounds <= 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">
                      No Rounds Available
                    </p>
                    <p className="text-xs text-yellow-600">
                      All assigned rounds have been consumed. No rounds
                      available for consumption.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Consume Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rounds to Consume *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={availableRounds}
                    value={formData.roundsConsumed}
                    onChange={(e) =>
                      handleInputChange("roundsConsumed", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={`Enter number of rounds (max: ${availableRounds})`}
                    required
                  />
                  {formData.roundsConsumed &&
                    parseInt(formData.roundsConsumed) > availableRounds && (
                      <p className="text-xs text-red-600 mt-1">
                        Cannot consume more than {availableRounds} available
                        rounds
                      </p>
                    )}
                  {formData.roundsConsumed &&
                    parseInt(formData.roundsConsumed) === availableRounds && (
                      <p className="text-xs text-blue-600 mt-1">
                        ℹ️ This will consume all remaining rounds and mark the
                        assignment as complete
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of shell Collected *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData?.roundsConsumed}
                    value={formData?.shellCollected}
                    onChange={(e) =>
                      handleInputChange("shellCollected", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={`Enter number of shell collected`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consumption Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Consumption *
                  </label>
                  <textarea
                    rows="3"
                    value={formData.reason}
                    onChange={(e) =>
                      handleInputChange("reason", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter reason for consuming rounds (e.g., training exercise, practice session, qualification test, etc.)..."
                    required
                  />
                </div>
              </div>
            )}

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
                disabled={loading || availableRounds <= 0}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Processing..." : "Consume Rounds"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumeRoundsModal;
