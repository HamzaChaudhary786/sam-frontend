import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../EmployeeHook";
import {
  STATUS_ENUM,
  DESIGNATION_ENUM,
  GRADE_ENUM,
  CAST_ENUM,
  WEAPON_ENUM,
} from "./EmployeeConstants";
import { useLocationEnum } from "./LocationHook";
import { uploadToCloudinary } from "./Cloudinary";
import { updateEmployee } from "../EmployeeApi";

// Reusable enum select component
const EnumSelect = ({
  label,
  name,
  value,
  onChange,
  enumObject,
  required = false,
  placeholder = "Select an option",
}) => {
  // Handle null/undefined enumObject
  const safeEnumObject = enumObject || {};

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {Object.entries(safeEnumObject).map(([key, value]) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
};

// Image upload component
const ImageUpload = ({ onImageChange, imagePreview }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Employee Photo
      </label>

      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Employee preview"
              className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      </div>
    </div>
  );
};

// Multiple Weapons Component
const MultipleWeapons = ({ weapons, onWeaponsChange }) => {
  const addWeapon = () => {
    const newWeapon = {
      id: Date.now(),
      weaponType: "",
      weaponNumber: "",
      pistolNumber: "",
      assignedRounds: "",
      consumedRounds: "",
    };
    onWeaponsChange([...weapons, newWeapon]);
  };

  const removeWeapon = (weaponId) => {
    onWeaponsChange(weapons.filter((weapon) => weapon.id !== weaponId));
  };

  const updateWeapon = (weaponId, field, value) => {
    onWeaponsChange(
      weapons.map((weapon) =>
        weapon.id === weaponId ? { ...weapon, [field]: value } : weapon
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Weapon Information
        </h3>
        <button
          type="button"
          onClick={addWeapon}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
        >
          + Add Weapon
        </button>
      </div>

      {weapons.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No weapons assigned. Click "Add Weapon" to add one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weapons.map((weapon, index) => (
            <div
              key={weapon.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-gray-800">
                  Weapon {index + 1}
                </h4>
                {weapons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWeapon(weapon.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <EnumSelect
                    label="Weapon Type"
                    name={`weapon_${weapon.id}`}
                    value={weapon.weaponType}
                    onChange={(e) =>
                      updateWeapon(weapon.id, "weaponType", e.target.value)
                    }
                    enumObject={WEAPON_ENUM}
                    required={false}
                    placeholder="Select weapon type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weapon Number
                  </label>
                  <input
                    type="text"
                    value={weapon.weaponNumber}
                    onChange={(e) =>
                      updateWeapon(weapon.id, "weaponNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pistol Number
                  </label>
                  <input
                    type="text"
                    value={weapon.pistolNumber}
                    onChange={(e) =>
                      updateWeapon(weapon.id, "pistolNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Rounds
                  </label>
                  <input
                    type="number"
                    value={weapon.assignedRounds}
                    onChange={(e) =>
                      updateWeapon(weapon.id, "assignedRounds", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consumed Rounds
                  </label>
                  <input
                    type="number"
                    value={weapon.consumedRounds}
                    onChange={(e) =>
                      updateWeapon(weapon.id, "consumedRounds", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddEmployeeForm = ({ onClose, isEdit, editData }) => {
  const navigate = useNavigate();
  const { createEmployee } = useEmployees();
  const {
    locationEnum,
    getStationAddress,
    loading: locationLoading,
    error: locationError,
  } = useLocationEnum();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [weapons, setWeapons] = useState([]);

  const [formData, setFormData] = useState({
    pnumber: "",
    srnumber: "",
    firstName: "",
    lastName: "",
    cast: "",
    cnic: "",
    status: STATUS_ENUM.ACTIVE,
    designation: "",
    mobileNumber: "",
    grade: "",
    achievements: "",
    address: {
      line1: "",
      line2: "",
      city: "",
    },
    dateOfBirth: "",
    location: "",
  });
  console.log(isEdit, editData, "hahahahahahahahahahahahhaahhahahahahaha");
  useEffect(() => {
    const addEmployeeData = () => {
      if (editData && isEdit) {
        // Prefill form from editData
        setFormData({
          pnumber: editData.pnumber || "",
          srnumber: editData.srnumber || "",
          firstName: editData.firstName || "",
          lastName: editData.lastName || "",
          cast: editData.cast || "",
          cnic: editData.cnic || "",
          status: editData.status || STATUS_ENUM.ACTIVE,
          designation: editData.designation || "",
          mobileNumber: editData.mobileNumber || "",
          grade: editData.grade || "",
          achievements: editData.achievements || "",
          address: {
            line1: editData.address?.line1 || "",
            line2: editData.address?.line2 || "",
            city: editData.address?.city || "",
          },
          dateOfBirth: editData.dateOfBirth || "",
          location: editData.location || "",
        });
      } else {
        // Empty form for new employee
        setFormData({
          pnumber: "",
          srnumber: "",
          firstName: "",
          lastName: "",
          cast: "",
          cnic: "",
          status: STATUS_ENUM.ACTIVE,
          designation: "",
          mobileNumber: "",
          grade: "",
          achievements: "",
          address: {
            line1: "",
            line2: "",
            city: "",
          },
          dateOfBirth: "",
          location: "",
        });
      }
    };

    addEmployeeData();
  }, [editData, isEdit]);

  const [validationErrors, setValidationErrors] = useState({});

  // CNIC validation function
  const validateCNIC = (cnic) => {
    const cnicPattern = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    return cnicPattern.test(cnic);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Real-time CNIC validation
      if (name === "cnic" && value && !validateCNIC(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          cnic: "CNIC must follow the pattern: 12345-6789012-3",
        }));
      }
    }
  };

  // Handle location change with auto-fill address
  const handleLocationChange = (e) => {
    const selectedStationId = e.target.value;

    // Update location in formData
    setFormData((prev) => ({
      ...prev,
      location: selectedStationId,
    }));

    // Auto-fill address if station is selected
    if (selectedStationId) {
      const stationAddress = getStationAddress(selectedStationId);
      if (stationAddress) {
        setFormData((prev) => ({
          ...prev,
          address: {
            line1: stationAddress.line1,
            line2: stationAddress.line2,
            city: stationAddress.city,
          },
        }));
      }
    } else {
      // Clear address if no station selected
      setFormData((prev) => ({
        ...prev,
        address: {
          line1: "",
          line2: "",
          city: "",
        },
      }));
    }
  };

  const handleImageChange = (file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  const handleWeaponsChange = (newWeapons) => {
    setWeapons(newWeapons);
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      // Validate CNIC before submission
      if (formData.cnic && !validateCNIC(formData.cnic)) {
        setValidationErrors({
          cnic: "CNIC must follow the pattern: 12345-6789012-3",
        });
        setLoading(false);
        return;
      }

      let photoUrl = null;

      // Upload photo to Cloudinary first if present
      if (imageFile) {
        setUploading(true);
        const uploadResult = await uploadToCloudinary(imageFile);
        setUploading(false);

        if (uploadResult.success) {
          photoUrl = uploadResult.url;
        } else {
          throw new Error(`Photo upload failed: ${uploadResult.error}`);
        }
      }

      // Create JSON object with photo URL
      const submitData = {
        ...formData,
        weapons: weapons,
        profileUrl:
          photoUrl ||
          `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=6366f1&color=ffffff&size=200&rounded=true&bold=true`,
      };
      if (isEdit) {
        const result = await updateEmployee(submitData, editData._id);
      } else {
        const result = await createEmployee(submitData);
      }
      if (result.success) {
        navigate("/employees");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            Warning: {locationError}. Using fallback location options.
          </p>
        </div>
      )}

      <ImageUpload
        onImageChange={handleImageChange}
        imagePreview={imagePreview}
      />

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Police Number *
          </label>
          <input
            type="text"
            name="pnumber"
            value={formData.pnumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serial Number *
          </label>
          <input
            type="text"
            name="srnumber"
            value={formData.srnumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <EnumSelect
            label="Cast"
            name="cast"
            value={formData.cast}
            onChange={handleChange}
            enumObject={CAST_ENUM}
            required={false}
            placeholder="Select cast"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC *
          </label>
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            required
            placeholder="12345-6789012-3"
            pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}"
            title="CNIC must follow the pattern: 12345-6789012-3"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.cnic
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
          {validationErrors.cnic && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.cnic}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number *
          </label>
          <input
            type="text"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Enum Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EnumSelect
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          enumObject={STATUS_ENUM}
          required={true}
          placeholder="Select status"
        />

        <EnumSelect
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          enumObject={DESIGNATION_ENUM}
          required={true}
          placeholder="Select designation"
        />

        <EnumSelect
          label="Grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          enumObject={GRADE_ENUM}
          required={false}
          placeholder="Select grade"
        />
      </div>

      {/* Place of Posting */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Place of Posting
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {locationLoading ? "Loading locations..." : "Select location"}
              </option>
              {Object.entries(locationEnum).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              name="address.line1"
              value={formData.address.line1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="address.line2"
              value={formData.address.line2}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Multiple Weapons Section */}
      <div className="border-t pt-4">
        <MultipleWeapons
          weapons={weapons}
          onWeaponsChange={handleWeaponsChange}
        />
      </div>

      {/* Achievements Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Achievements</h3>
        <div className="mt-4">
          <textarea
            name="achievements"
            value={formData.achievements}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading
            ? "Uploading Photo..."
            : loading
            ? "Adding..."
            : "Add Employee"}
        </button>
      </div>
    </form>
  );
};

export default AddEmployeeForm;
