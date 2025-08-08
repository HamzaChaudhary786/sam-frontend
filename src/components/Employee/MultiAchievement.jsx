// MultiAchievementForm.jsx - Multi Achievement Assignment Form
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createAchievement } from "../Acheivements/AchievementsApi.js";
import { getStatusWithEnum } from "../Acheivements/LookUp.js";
import { role_admin } from "../../constants/Enum.js";

const MultiAchievementForm = ({
  selectedEmployees = [],
  isOpen,
  onSuccess,
  onCancel,
}) => {
  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    achievementType: "",
    benefit: "",
    amount: "",
    achievementReason: "",
    isMonitor: false,
    isApproved: false,
    approvalComment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Dynamic achievement types from API
  const [achievementTypes, setAchievementTypes] = useState({});
  const [isLoadingAchievementTypes, setIsLoadingAchievementTypes] = useState(false);

  // Check user role from localStorage
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const storedUserType = localStorage.getItem("userType");
        const userData = localStorage.getItem("userData");
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const currentUserType =
          storedUserType || parsedUserData?.userType || "";

        setUserType(currentUserType);
        setIsAdmin(currentUserType === role_admin);
      } catch (error) {
        console.error("Error checking user role:", error);
        setUserType("");
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // Fetch achievement types from API
  const fetchAchievementTypes = async () => {
    setIsLoadingAchievementTypes(true);
    try {
      const result = await getStatusWithEnum();
      
      if (result.success) {
        setAchievementTypes(result.data);
        console.log("✅ Achievement types loaded for multi-form:", result.data);
      } else {
        toast.error("Failed to load achievement types");
        console.error("❌ Failed to fetch achievement types:", result.error);
      }
    } catch (error) {
      toast.error("Error loading achievement types");
      console.error("❌ Error fetching achievement types:", error);
    } finally {
      setIsLoadingAchievementTypes(false);
    }
  };

  // Effect to fetch achievement types when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(achievementTypes).length === 0) {
      fetchAchievementTypes();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      achievementType: "",
      benefit: "",
      amount: "",
      achievementReason: "",
      isMonitor: false,
      isApproved: false,
      approvalComment: "",
    });
    setResults([]);
    setShowResults(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isMonitor" && !checked ? { amount: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (selectedEmployees.length === 0) {
      toast.error("No employees selected");
      setIsSubmitting(false);
      return;
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const employee of selectedEmployees) {
        try {
          const submitData = {
            employee: employee._id,
            achievementType: formData.achievementType,
            benefit: formData.benefit,
            achievementReason: formData.achievementReason,
            isMonitor: formData.isMonitor,
            amount: formData.isMonitor && formData.amount
              ? parseFloat(formData.amount)
              : 0,
            // Admin can set approval status during creation
            ...(isAdmin && {
              isApproved: formData.isApproved,
              approvalComment: formData.approvalComment,
            }),
          };

          const result = await createAchievement(submitData);

          if (result.success) {
            successCount++;
            results.push({
              employee: `${employee.firstName} ${employee.lastName} (${employee.personalNumber || employee.pnumber})`,
              status: "success",
              message: "Achievement created successfully",
            });
          } else {
            errorCount++;
            results.push({
              employee: `${employee.firstName} ${employee.lastName} (${employee.personalNumber || employee.pnumber})`,
              status: "error",
              message: result.error || "Unknown error occurred",
            });
          }
        } catch (error) {
          errorCount++;
          results.push({
            employee: `${employee.firstName} ${employee.lastName} (${employee.personalNumber || employee.pnumber})`,
            status: "error",
            message: error.message || "Unknown error occurred",
          });
        }
      }

      setResults(results);
      setShowResults(true);

      // Show summary toast
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully created ${successCount} achievement(s)`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(
          `Created ${successCount} achievement(s), failed ${errorCount}`
        );
      } else {
        toast.error("Failed to create any achievements");
      }

    } catch (error) {
      console.error("Multi-achievement creation error:", error);
      toast.error("Error creating achievements");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleCompleteProcess = () => {
    resetForm();
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Multi Achievement Assignment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create achievements for {selectedEmployees.length} selected employee(s)
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!showResults ? (
          <>
            {/* Selected Employees Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Selected Employees ({selectedEmployees.length})
              </h3>
              <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedEmployees.map((employee, index) => (
                    <span
                      key={employee._id || index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {employee.firstName} {employee.lastName} (
                      {employee.personalNumber || employee.pnumber})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievement Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Achievement Type *
                  </label>
                  <select
                    name="achievementType"
                    value={formData.achievementType}
                    onChange={handleChange}
                    required
                    disabled={isLoadingAchievementTypes}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingAchievementTypes ? "Loading types..." : "Select achievement type"}
                    </option>
                    {Object.entries(achievementTypes).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {isLoadingAchievementTypes && (
                    <p className="text-xs text-blue-500 mt-1">
                      Loading available achievement types...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefit *
                  </label>
                  <input
                    type="text"
                    name="benefit"
                    value={formData.benefit}
                    onChange={handleChange}
                    placeholder="Enter benefit details"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="flex items-center space-x-4 col-span-1 md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isMonitor"
                      checked={formData.isMonitor}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-900">Monitory</label>
                  </div>

                  {formData.isMonitor && (
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (PKR) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors w-48"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievement Reason *
                </label>
                <textarea
                  name="achievementReason"
                  value={formData.achievementReason}
                  onChange={handleChange}
                  placeholder="Enter reason for achievement..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be applied to all selected employees
                </p>
              </div>

              {/* Admin Approval Section */}
              {isAdmin && (
                <div className="border-t border-gray-200 pt-4">
                  <div className=" rounded-md p-4">
                    {/* <h3 className="text-sm font-medium text-green-800 mb-3">
                      Approval Settings
                    </h3> */}
                    
                    {/* <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        name="isApproved"
                        checked={formData.isApproved}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Pre-approve all achievements
                      </label>
                    </div> */}

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approval Comments
                      </label>
                      <textarea
                        name="approvalComment"
                        value={formData.approvalComment}
                        onChange={handleChange}
                        placeholder="Enter approval comments (optional)..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comments will be applied to all achievements if pre-approved
                      </p>
                    </div> */}
                  </div>
                </div>
              )}

              {/* Info Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Multi Achievement Process
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {isAdmin && formData.isApproved 
                        ? "All achievements will be created as approved and will be active immediately."
                        : "All achievements will be created as pending approval and will need administrator approval before becoming active."
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    isLoadingAchievementTypes ||
                    !formData.achievementType || 
                    !formData.benefit ||
                    !formData.achievementReason ||
                    (formData.isMonitor && !formData.amount) ||
                    selectedEmployees.length === 0
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting
                    ? "Creating Achievements..."
                    : `Create ${selectedEmployees.length} Achievement(s)`}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Multi Achievement Results
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Process completed for {selectedEmployees.length} employee(s)
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      result.status === "success"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {result.status === "success" ? (
                          <svg
                            className="w-4 h-4 text-green-500"
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
                        ) : (
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {result.employee}
                        </div>
                        <div
                          className={`text-sm ${
                            result.status === "success"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {result.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4 border-t border-gray-200">
              <button
                onClick={handleCompleteProcess}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Complete Process
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiAchievementForm;