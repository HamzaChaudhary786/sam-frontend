// SalaryDeductionForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createSalaryDeduction,
  updateSalaryDeduction,
} from "../SalaryDeductionApi.js";
import { getStatusWithEnum } from "../Lookup.js"; // Update with correct path

const SalaryDeductionForm = ({
  employee,
  editingDeduction,
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    deductionType: "",
    month: "",
    year: new Date().getFullYear(),
    deductionReason: "",
    amount: "",
    isApproved: false,
    approvalComment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic deduction types from API
  const [deductionTypes, setDeductionTypes] = useState({});
  const [isLoadingDeductionTypes, setIsLoadingDeductionTypes] = useState(false);

  // Months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Years (current year ± 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Fetch deduction types from API
  const fetchDeductionTypes = async () => {
    setIsLoadingDeductionTypes(true);
    try {
      const result = await getStatusWithEnum(); // Using your existing API function
      
      if (result.success) {
        setDeductionTypes(result.data);
        console.log("✅ Deduction types loaded for form:", result.data);
      } else {
        toast.error("Failed to load deduction types");
        console.error("❌ Failed to fetch deduction types:", result.error);
      }
    } catch (error) {
      toast.error("Error loading deduction types");
      console.error("❌ Error fetching deduction types:", error);
    } finally {
      setIsLoadingDeductionTypes(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      deductionType: "",
      month: "",
      year: new Date().getFullYear(),
      deductionReason: "",
      amount: "",
      isApproved: false,
      approvalComment: "",
    });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        employee: employee._id,
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        year: parseInt(formData.year),
      };

      let result;
      if (editingDeduction) {
        result = await updateSalaryDeduction(editingDeduction._id, submitData);
      } else {
        result = await createSalaryDeduction(submitData);
      }

      if (result.success) {
        toast.success(
          `Salary deduction ${
            editingDeduction ? "updated" : "created"
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

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Effect to fetch deduction types when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(deductionTypes).length === 0) {
      fetchDeductionTypes();
    }
  }, [isOpen]);

  // Effect to populate form when editing
  useEffect(() => {
    if (editingDeduction) {
      setFormData({
        deductionType: editingDeduction.deductionType || "",
        month: editingDeduction.month || "",
        year: editingDeduction.year || new Date().getFullYear(),
        deductionReason: editingDeduction.deductionReason || "",
        amount: editingDeduction.amount || "",
        isApproved: editingDeduction.isApproved || false,
        approvalComment: editingDeduction.approvalComment || "",
      });
    } else {
      resetForm();
    }
  }, [editingDeduction, isOpen]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingDeduction
                ? "Edit Salary Deduction"
                : "Add Salary Deduction"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingDeduction ? "Update" : "Create"} salary deduction for{" "}
              <span className="font-medium">
                {employee.firstName} {employee.lastName}
              </span>{" "}
              ({employee.personalNumber || employee.pnumber})
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deduction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deduction Type *
            </label>
            <select
              name="deductionType"
              value={formData.deductionType}
              onChange={handleChange}
              required
              disabled={isLoadingDeductionTypes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingDeductionTypes ? "Loading types..." : "Select deduction type"}
              </option>
              {Object.entries(deductionTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {isLoadingDeductionTypes && (
              <p className="text-xs text-red-500 mt-1">
                Loading available deduction types...
              </p>
            )}
          </div>

          {/* Month and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              >
                <option value="">Select month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Deduction Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deduction Reason *
            </label>
            <textarea
              name="deductionReason"
              value={formData.deductionReason}
              onChange={handleChange}
              placeholder="Enter detailed reason for this deduction..."
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-vertical"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide comprehensive details about why this deduction is being made
            </p>
          </div>

          {/* Approval Section - Only show when editing */}
          {editingDeduction && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-3">
                  Approval Settings
                </h3>
                
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    name="isApproved"
                    checked={formData.isApproved}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors"
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
                    placeholder="Enter detailed reason for this approval/comments..."
                    rows={2}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-vertical"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide approval comments or additional notes about this deduction
                  </p>
                </div>
              </div>

              {/* Info Note for Edit */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Deduction Update Process
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {formData.isApproved 
                        ? "This deduction will be updated as approved and will be active immediately."
                        : "This deduction will be updated as pending approval and will need to be approved before becoming active."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Info Note for Create */}
          {!editingDeduction && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-orange-800">
                    Deduction Creation Process
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    This deduction will be created as pending approval and will need to be approved before becoming active.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
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
                isLoadingDeductionTypes ||
                !formData.deductionType ||
                !formData.month ||
                !formData.amount ||
                !formData.deductionReason ||
                (editingDeduction && !formData.approvalComment)
              }
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? editingDeduction
                  ? "Updating..."
                  : "Adding..."
                : editingDeduction
                ? "Update Deduction"
                : "Add Deduction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryDeductionForm;