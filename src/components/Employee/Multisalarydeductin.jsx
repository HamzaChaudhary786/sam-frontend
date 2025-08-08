// MultiSalaryDeductionForm.jsx - FIXED VERSION (Following Station Assignment Pattern)
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createSalaryDeduction } from "../SalaryDeduction/SalaryDeductionApi.js";
import { getStatusWithEnum } from "../SalaryDeduction/Lookup.js";
import { role_admin } from "../../constants/Enum.js";

const MultiSalaryDeductionForm = ({
  selectedEmployees = [],
  isOpen,
  onSuccess,
  onCancel,
}) => {
  // User role state
  const [userType, setUserType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    deductionType: "",
    month: "",
    year: new Date().getFullYear(),
    deductionReason: "",
    amount: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    current: 0,
    total: 0,
    currentEmployeeName: ""
  });
  
  // Dynamic deduction types from API
  const [deductionTypes, setDeductionTypes] = useState({});
  const [isLoadingDeductionTypes, setIsLoadingDeductionTypes] = useState(false);

  // Months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Years (current year ± 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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

  // Fetch deduction types from API
  const fetchDeductionTypes = async () => {
    setIsLoadingDeductionTypes(true);
    try {
      const result = await getStatusWithEnum();

      if (result.success) {
        setDeductionTypes(result.data);
        console.log("✅ Deduction types loaded for multi-form:", result.data);
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

  // Reset form - EXACTLY like station form
  const resetForm = () => {
    setFormData({
      deductionType: "",
      month: "",
      year: new Date().getFullYear(),
      deductionReason: "",
      amount: "",
    });
    setProcessingProgress({
      current: 0,
      total: 0,
      currentEmployeeName: ""
    });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔥 FIXED: Handle form submission - EXACTLY like station form pattern
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      setProcessingProgress({
        current: 0,
        total: selectedEmployees.length,
        currentEmployeeName: ""
      });

      for (let i = 0; i < selectedEmployees.length; i++) {
        const employee = selectedEmployees[i];
        
        setProcessingProgress(prev => ({
          ...prev,
          current: i + 1,
          currentEmployeeName: `${employee.firstName} ${employee.lastName}`
        }));

        try {
          const submitData = {
            employee: employee._id,
            deductionType: formData.deductionType,
            month: formData.month,
            year: parseInt(formData.year),
            deductionReason: formData.deductionReason,
            amount: parseFloat(formData.amount) || 0,
          };

          console.log(`🔄 Processing deduction ${i + 1}/${selectedEmployees.length} for:`, {
            employeeName: `${employee.firstName} ${employee.lastName}`,
            personalNumber: employee.personalNumber || employee.pnumber,
            deductionData: submitData
          });

          const result = await createSalaryDeduction(submitData);

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`${employee.firstName} ${employee.lastName}: ${result.error}`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`${employee.firstName} ${employee.lastName}: ${error.message}`);
        }

        // Small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Show results - EXACTLY like station form
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully created deductions for ${successCount} employee(s)`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Created deductions for ${successCount} employee(s), failed for ${errorCount}`);
        console.log("Errors:", errors);
      } else {
        toast.error("Failed to create deductions for all selected employees");
        console.log("All errors:", errors);
      }

      resetForm();
      onSuccess();

    } catch (error) {
      toast.error("Error creating salary deductions");
      console.error("Multi deduction creation error:", error);
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

  // Effect to reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Multi Employee Salary Deduction
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create salary deductions for {selectedEmployees.length} selected employee(s)
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Selected Employees List */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 max-h-40 overflow-y-auto">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Selected Employees ({selectedEmployees.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedEmployees.map((employee, index) => (
              <div key={employee._id} className="text-sm text-red-700">
                {index + 1}. {employee.firstName} {employee.lastName}
                <span className="text-red-600 ml-1">
                  ({employee.personalNumber || employee.pnumber})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        {isSubmitting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-800">
                Processing Deductions...
              </span>
              <span className="text-sm text-yellow-700">
                {processingProgress.current} / {processingProgress.total}
              </span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(processingProgress.current / processingProgress.total) * 100}%` 
                }}
              ></div>
            </div>
            {processingProgress.currentEmployeeName && (
              <p className="text-xs text-yellow-700">
                Currently processing: {processingProgress.currentEmployeeName}
              </p>
            )}
          </div>
        )}

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
              disabled={isLoadingDeductionTypes || isSubmitting}
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
            <p className="text-xs text-gray-500 mt-1">
              All selected employees will have this deduction type
            </p>
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
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors disabled:opacity-50"
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
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors disabled:opacity-50"
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
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              This amount will be applied to all selected employees
            </p>
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
              placeholder="Enter reason for deduction for all selected employees..."
              rows={4}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-vertical disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will apply to all selected employees' deductions
            </p>
          </div>

          {/* Info Note */}
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  Multi Deduction Process
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  All deductions will be created as pending approval and will need administrator approval before becoming active.
                </p>
              </div>
            </div>
          </div>

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
                !formData.deductionReason
              }
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting
                ? "Creating Deductions..."
                : `Create ${selectedEmployees.length} Deduction${selectedEmployees.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiSalaryDeductionForm;