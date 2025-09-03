// AchievementForm.jsx - Modal Version with Dynamic Lookup and Admin-Only Approval Fields
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createAchievement, updateAchievement } from "../AchievementsApi.js";
import { getStatusWithEnum } from "../LookUp.js"; // Update with correct path
import { role_admin } from "../../../constants/Enum.js";
import { usePermissions } from "../../../hook/usePermission.js";

const AchievementForm = ({
  employee,
  editingAchievement,
  isOpen,
  onSuccess,
  onCancel,
}) => {
  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const permissions = usePermissions();
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

  // Dynamic achievement types from API
  const [achievementTypes, setAchievementTypes] = useState({});
  const [isLoadingAchievementTypes, setIsLoadingAchievementTypes] =
    useState(false);

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
      const result = await getStatusWithEnum(); // Using your existing API function

      if (result.success) {
        setAchievementTypes(result.data);
        console.log("✅ Achievement types loaded for form:", result.data);
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

    try {
      const submitData = {
        employee: employee._id,
        achievementType: formData.achievementType,
        benefit: formData.benefit,
        achievementReason: formData.achievementReason,
        isMonitor: formData.isMonitor,
        amount:
          formData.isMonitor && formData.amount
            ? parseFloat(formData.amount)
            : 0,
        // Only include approval fields when editing and user is admin
        ...(editingAchievement &&
          isAdmin && {
            isApproved: formData.isApproved,
            approvalComment: formData.approvalComment,
          }),
      };

      let result;
      if (editingAchievement) {
        result = await updateAchievement(editingAchievement._id, submitData);
      } else {
        result = await createAchievement(submitData);
      }

      if (result.success) {
        toast.success(
          `Achievement ${
            editingAchievement ? "updated" : "created"
          } successfully`
        );
        resetForm();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
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

  // Effect to fetch achievement types when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(achievementTypes).length === 0) {
      fetchAchievementTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingAchievement) {
      setFormData({
        achievementType: editingAchievement.achievementType || "",
        benefit: editingAchievement.benefit || "",
        amount: editingAchievement.amount || "",
        achievementReason: editingAchievement.achievementReason || "",
        isMonitor: editingAchievement.isMonitor || false,
        isApproved: editingAchievement.isApproved || false,
        approvalComment: editingAchievement.approvalComment || "",
      });
    } else {
      resetForm();
    }
  }, [editingAchievement, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingAchievement ? "Edit Achievement" : "Add New Achievement"}
            </h2>
            {/* <p className="text-sm text-gray-600 mt-1">
              {editingAchievement ? "Update" : "Create"} achievement for{" "}
              <span className="font-medium">
                {employee.firstName} {employee.lastName}
              </span>{" "}
              ({employee.personalNumber || employee.pnumber})
            </p> */}
            {editingAchievement && !isAdmin && (
              <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">
                Note: Only administrators can modify approval settings
              </p>
            )}
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
                  {isLoadingAchievementTypes
                    ? "Loading types..."
                    : "Select achievement type"}
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
              Provide detailed information about this achievement
            </p>
          </div>

          {/* Approval Section - Only show when editing and user is admin */}
          {editingAchievement &&
            permissions?.userData?.roles?.some((role) =>
              role.accessRequirement?.some(
                (access) =>
                  access.resourceName.toLowerCase() === "employee" &&
                  access.canApprove === true
              )
            ) && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-green-800 mb-3">
                      Approval Settings
                    </h3>

                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        name="isApproved"
                        checked={formData.isApproved}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Mark as Approved
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approval Comments *
                      </label>
                      <textarea
                        name="approvalComment"
                        value={formData.approvalComment}
                        onChange={handleChange}
                        placeholder="Enter detailed approval comments..."
                        rows={2}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Provide comprehensive details about the approval status
                        or additional notes
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

          {/* Non-Admin Approval Info - Show when editing but user is not admin */}
          {editingAchievement &&
            permissions?.userData?.roles?.some((role) =>
              role.accessRequirement?.some(
                (access) =>
                  access.resourceName.toLowerCase() === "employee" &&
                  access.canApprove === true
              )
            ) && (
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Current Approval Status
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            editingAchievement.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {editingAchievement.isApproved
                            ? "Approved"
                            : "Pending Approval"}
                        </span>
                      </p>
                      {editingAchievement.approvalComment && (
                        <p className="text-xs text-gray-500 mt-2">
                          <span className="font-medium">Admin Comment:</span>{" "}
                          {editingAchievement.approvalComment}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Contact an administrator to modify approval settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Info Notes */}
          {editingAchievement && isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Achievement Update Process
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {formData.isApproved
                      ? "This achievement will be updated as approved and will be active immediately."
                      : "This achievement will be updated as pending approval and will need to be approved before becoming active."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {editingAchievement && !isAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Achievement Update Process
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This achievement will be updated and may require
                    administrator approval before becoming active.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!editingAchievement && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-green-400 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Achievement Creation Process
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    This achievement will be created as pending approval and
                    will need to be approved before becoming active.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                (editingAchievement && isAdmin && !formData.approvalComment) || // Only require approval comment when editing as admin
                (formData.isMonitor && !formData.amount)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? editingAchievement
                  ? "Updating..."
                  : "Adding..."
                : editingAchievement
                ? "Update Achievement"
                : "Add Achievement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AchievementForm;
