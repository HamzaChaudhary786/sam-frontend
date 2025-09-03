import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// Searchable Select Component
const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div
          className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center">
            <span
              className={selectedOption ? "text-gray-900" : "text-gray-500"}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b">
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      value === option.value
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-900"
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-sm text-gray-500">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TransferReturnModal = ({
  isOpen,
  onClose,
  onSave,
  assignment,
  employees,
  loading,
}) => {
  // FIXED: Use correct field names that match API expectations
  const [formData, setFormData] = useState({
    action: "",
    date: "",           // Changed from 'transferDate' to 'date'
    reason: "",         // Changed from 'description' to 'reason'
    newEmployeeId: "",
    notes: "",          // Added notes field for additional info
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        action: "",
        date: today,        // Use 'date' instead of 'transferDate'
        reason: "",         // Use 'reason' instead of 'description'
        newEmployeeId: "",
        notes: "",
      });
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setFormData({
      action: "",
      date: "",
      reason: "",
      newEmployeeId: "",
      notes: "",
    });
    onClose();
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.action || !formData.date || !formData.reason) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.action === "transfer" && !formData.newEmployeeId) {
      alert("Please select an employee to transfer to");
      return;
    }

    // Safety check for employee comparison
    if (formData.action === "transfer" && formData.newEmployeeId === assignment.employee?._id) {
      alert("Cannot transfer to the same employee");
      return;
    }

    // Additional safety check for employee existence
    if (formData.action === "transfer") {
      const targetEmployee = safeEmployees.find(emp => emp && emp._id === formData.newEmployeeId);
      if (!targetEmployee) {
        alert("Selected employee not found. Please select a valid employee.");
        return;
      }
    }

    // Convert date to ISO string if needed
    const dateValue = formData.date.includes('T') ? formData.date : `${formData.date}T00:00:00.000Z`;

    // FIXED: Pass data in the correct format expected by AssetList.jsx
    const saveData = {
      action: formData.action,
      date: dateValue,
      reason: formData.reason,
      notes: formData.notes,
    };

    // Add transfer-specific fields
    if (formData.action === "transfer") {
      saveData.newEmployeeId = formData.newEmployeeId;
    }

    console.log("🚀 Sending transfer/return data:", saveData);

    onSave(saveData);
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
    
    // Handle your specific employee structure
    const firstName = employee.name || "";
    const lastName = employee.lastName ? employee.lastName.trim() : "";
    
    // Combine names, handling cases where lastName might be empty
    let fullName = firstName;
    if (lastName) {
      fullName = `${firstName} ${lastName}`;
    }
    
    return fullName || "Unknown Employee";
  };

  if (!isOpen || !assignment) return null;

  // Enhanced safety check for employees prop with detailed logging
  const safeEmployees = (() => {
    if (!employees) {
      console.warn("No employees prop provided");
      return [];
    }
    
    if (!Array.isArray(employees)) {
      console.warn("Employees prop is not an array:", typeof employees);
      return [];
    }
    
    const validEmployees = employees.filter(emp => {
      // Check for your specific employee structure
      const hasId = emp && emp._id;
      const hasName = emp && (emp.firstName || emp.lastName);
      const isValid = hasId && hasName;
      
      if (!isValid) {
        console.warn("Invalid employee found:", emp);
      }
      return isValid;
    });
    
    return validEmployees;
  })();

  // Prepare employee options for SearchableSelect (exclude current employee)
  const employeeOptions = (() => {
    const currentEmployeeId = assignment.employee?._id;

    const availableEmployees = safeEmployees.filter(emp => {
      const shouldInclude = emp._id !== currentEmployeeId;
      return shouldInclude;
    });
    
    const options = [
      { value: "", label: "Select Employee" },
      ...availableEmployees.map((employee) => {
        const firstName = employee.firstName ? employee.firstName.trim() : "";
        const lastName = employee.lastName ? employee.lastName.trim() : "";
        
        // Create full name, handling empty lastName
        let fullName = firstName;
        if (lastName) {
          fullName = `${firstName} ${lastName}`;
        }
        
        const label = fullName || "Unknown Employee";
        const subtitle = employee.personalNumber || employee.employeeId || employee.cnic || "No ID";
        
        return {
          value: employee._id,
          label: label,
          subtitle: subtitle,
        };
      }),
    ];
    
    return options;
  })();

  const actionOptions = [
    { value: "", label: "Select Action" },
    { value: "return", label: "Return Asset" },
    { value: "transfer", label: "Transfer Asset" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Transfer / Return Asset
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
                Current Assignment Details
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
                  {assignment.employee?.department && (
                    <p className="text-xs text-gray-500">
                      Dept: {assignment.employee.department}
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

            {/* Transfer/Return Form */}
            <div className="space-y-4">
              <div>
                <SearchableSelect
                  label="Action"
                  name="action"
                  value={formData.action}
                  onChange={handleChange}
                  options={actionOptions}
                  placeholder="Select action (Transfer or Return)"
                  required={true}
                  disabled={loading}
                />
              </div>

              {formData.action === "transfer" && (
                <div>
                  <SearchableSelect
                    label="Transfer To Employee"
                    name="newEmployeeId"
                    value={formData.newEmployeeId}
                    onChange={handleChange}
                    options={employeeOptions}
                    placeholder={employeeOptions.length <= 1 ? "No employees available" : "Search and select employee"}
                    required={true}
                    disabled={loading || employeeOptions.length <= 1}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.action === "transfer" ? "Transfer" : "Return"} Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    formData.action === "transfer" 
                      ? "Enter reason for transfer (e.g., department change, role reassignment)..." 
                      : "Enter reason for return (e.g., project completion, equipment replacement)..."
                  }
                  required
                />
              </div>
            </div>

            {/* Summary Preview */}
            {formData.action && (
              <div className={`rounded-lg p-3 border ${
                formData.action === "transfer" 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-orange-50 border-orange-200"
              }`}>
                <h5 className={`text-sm font-medium mb-2 ${
                  formData.action === "transfer" ? "text-blue-800" : "text-orange-800"
                }`}>
                  {formData.action === "transfer" ? "Transfer" : "Return"} Summary:
                </h5>
                <div className={`text-sm ${
                  formData.action === "transfer" ? "text-blue-700" : "text-orange-700"
                }`}>
                  <p>• Asset: <span className="font-medium">{getAssetNames(assignment.asset)}</span></p>
                  <p>• From: <span className="font-medium">{getEmployeeName(assignment.station)}</span></p>
                  {formData.action === "transfer" && formData.newEmployeeId && (
                    <p>• To: <span className="font-medium">
                      {employeeOptions.find(emp => emp.value === formData.newEmployeeId)?.label || "Selected Employee"}
                    </span></p>
                  )}
                  
                  {formData.reason && (
                    <p>• Reason: <span className="font-medium">{formData.reason}</span></p>
                  )}
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
                disabled={loading || !formData.action}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.action === "transfer" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {loading 
                  ? "Processing..." 
                  : formData.action === "transfer" 
                    ? "Transfer Asset" 
                    : formData.action === "return"
                    ? "Return Asset"
                    : "Confirm Action"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferReturnModal;