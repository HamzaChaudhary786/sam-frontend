import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../EmployeeHook";
import { STATUS_ENUM } from "./EmployeeConstants";
import { useLocationEnum } from "./LocationHook";
import { uploadToCloudinary } from "./Cloudinary";
import { updateEmployee } from "../EmployeeApi";
import { getCastsWithEnum } from "./Cast";
import { getDesignationsWithEnum } from "./Designation";
import { getGradesWithEnum } from "./Grades";
import { getWeaponsWithEnum, getAssetById } from "./Weapons";
import { addEmployee } from "../EmployeeApi";
import { BACKEND_URL } from "../../../constants/api.js";

const API_URL = BACKEND_URL;

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
        {Object.entries(safeEnumObject).map(([id, itemName]) => (
          <option key={id} value={id}>
            {itemName}
          </option>
        ))}
      </select>
    </div>
  );
};

// Image upload component
const ImageUpload = ({ onImageChange, imagePreview, profile }) => {
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
          {imagePreview || profile ? (
            <img
              src={imagePreview || profile}
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

// Enhanced Multiple Assets Component (handles both weapons and vehicles)
const MultipleAssets = ({ assets, onAssetsChange, assetEnum, allAssetsData }) => {
  // Auto-populate asset details when asset type is selected
  const handleAssetTypeChange = (assetId, newAssetType) => {
    console.log(`🔄 Asset type changed to: ${newAssetType}`);

    if (newAssetType && isWeaponAsset(newAssetType)) {
      // Find the asset details from the full assets data
      const assetDetails = allAssetsData.find(asset => asset._id === newAssetType);
      
      if (assetDetails) {
        console.log(`🔫 Auto-populating weapon details from cache:`, assetDetails);

        // Update asset with found details
        onAssetsChange((prevAssets) =>
          prevAssets.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  assetType: newAssetType,
                  weaponNumber: assetDetails.weaponNumber || "",
                  pistolNumber: assetDetails.pistolNumber || "",
                  assignedRounds: assetDetails.assignedRounds || "",
                  consumedRounds: assetDetails.consumedRounds || "",
                }
              : asset
          )
        );
      } else {
        console.log(`⚠️ No cached data found for asset: ${newAssetType}`);
        // Fallback: Try API call
        handleAssetTypeChangeWithAPI(assetId, newAssetType);
      }
    } else {
      // For vehicles or when clearing selection
      console.log(`🚗 Vehicle or empty selection, no auto-population needed`);
      updateAsset(assetId, "assetType", newAssetType);
    }
  };

  // Fallback API call if cached data not available
  const handleAssetTypeChangeWithAPI = async (assetId, newAssetType) => {
    try {
      console.log(`📥 Fallback: Fetching asset details via API for: ${newAssetType}`);
      
      // Use your existing API function
      const result = await getAssetById(newAssetType);
      
      console.log("🔍 API Response:", result);

      if (result.success && result.asset) {
        const assetDetails = result.asset;
        console.log(`🔫 Auto-populating weapon details from API:`, assetDetails);

        // Update asset with fetched details
        onAssetsChange((prevAssets) =>
          prevAssets.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  assetType: newAssetType,
                  weaponNumber: assetDetails.weaponNumber || "",
                  pistolNumber: assetDetails.pistolNumber || "",
                  assignedRounds: assetDetails.assignedRounds || "",
                  consumedRounds: assetDetails.consumedRounds || "",
                }
              : asset
          )
        );
      } else {
        console.log(`❌ Failed to fetch asset details via API:`, result.error);
        // Just update the asset type
        updateAsset(assetId, "assetType", newAssetType);
      }
    } catch (error) {
      console.error("Error fetching asset details via API:", error);
      // Just update the asset type
      updateAsset(assetId, "assetType", newAssetType);
    }
  };

  const addAsset = () => {
    const newAsset = {
      id: Date.now(),
      assetType: "",
      weaponNumber: "",
      pistolNumber: "",
      assignedRounds: "",
      consumedRounds: "",
    };
    onAssetsChange([...assets, newAsset]);
  };

  const removeAsset = (assetId) => {
    onAssetsChange(assets.filter((asset) => asset.id !== assetId));
  };

  const updateAsset = (assetId, field, value) => {
    console.log(`🔄 Updating asset ${assetId}, field: ${field}, value: ${value}`);
    onAssetsChange(
      assets.map((asset) =>
        asset.id === assetId ? { ...asset, [field]: value } : asset
      )
    );
  };

  // Get asset name from allAssetsData instead of enum
  const getAssetName = (assetId) => {
    if (!assetId || !allAssetsData || !Array.isArray(allAssetsData)) {
      return "Unknown Asset";
    }
    
    const assetDetails = allAssetsData.find(asset => asset._id === assetId);
    return assetDetails?.name || "Unknown Asset";
  };

  // Data-driven weapon detection using the type field
  const isWeaponAsset = (assetId) => {
    if (!assetId || !allAssetsData || !Array.isArray(allAssetsData)) {
      return false;
    }

    // Find the asset details from the full assets data
    const assetDetails = allAssetsData.find(asset => asset._id === assetId);
    
    // Check if the asset type is "weapons"
    return assetDetails?.type === "weapons";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Asset Information</h3>
        <button
          type="button"
          onClick={addAsset}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
        >
          + Add Asset
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No assets assigned. Click "Add Asset" to add one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset, index) => {
            const isWeapon = asset.assetType ? isWeaponAsset(asset.assetType) : false;

            return (
              <div
                key={asset.id}
                className={`border rounded-lg p-4 ${
                  isWeapon
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4
                    className={`text-md font-medium ${
                      isWeapon ? "text-red-800" : "text-blue-800"
                    }`}
                  >
                    <div className="flex items-center">
                      {isWeapon ? (
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      )}
                      Asset {index + 1}
                      {asset.assetType && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({getAssetName(asset.assetType)})
                        </span>
                      )}
                    </div>
                  </h4>
                  {assets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAsset(asset.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <EnumSelect
                      label="Asset Type"
                      name={`asset_${asset.id}`}
                      value={asset.assetType}
                      onChange={(e) => {
                        const newAssetType = e.target.value;
                        handleAssetTypeChange(asset.id, newAssetType);
                      }}
                      enumObject={assetEnum}
                      required={false}
                      placeholder="Select asset type"
                    />
                  </div>
                  
                  {/* Weapon-specific fields */}
                  {isWeapon && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-red-700 mb-1">
                          Weapon Number
                        </label>
                        <input
                          type="text"
                          value={asset.weaponNumber || ""}
                          onChange={(e) =>
                            updateAsset(asset.id, "weaponNumber", e.target.value)
                          }
                          placeholder="Enter weapon serial number"
                          className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-red-700 mb-1">
                          Pistol Number
                        </label>
                        <input
                          type="text"
                          value={asset.pistolNumber || ""}
                          onChange={(e) =>
                            updateAsset(asset.id, "pistolNumber", e.target.value)
                          }
                          placeholder="Enter pistol number"
                          className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-red-700 mb-1">
                          Assigned Rounds
                        </label>
                        <input
                          type="number"
                          value={asset.assignedRounds || ""}
                          onChange={(e) =>
                            updateAsset(asset.id, "assignedRounds", e.target.value)
                          }
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-red-700 mb-1">
                          Consumed Rounds
                        </label>
                        <input
                          type="number"
                          value={asset.consumedRounds || ""}
                          onChange={(e) =>
                            updateAsset(asset.id, "consumedRounds", e.target.value)
                          }
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
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
  const [assets, setAssets] = useState([]);
  const [castEnum, setCastEnum] = useState({});
  const [designationEnum, setDesignationEnum] = useState({});
  const [gradeEnum, setGradeEnum] = useState({});
  const [assetEnum, setAssetEnum] = useState({});
  const [allAssetsData, setAllAssetsData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

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

  useEffect(() => {
    // Helper function to format date for input[type="date"]
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    };

    const addEmployeeData = () => {
      if (editData && isEdit) {
        // Prefill form from editData
        setFormData({
          pnumber: editData.pnumber || "",
          srnumber: editData.srnumber || "",
          firstName: editData.firstName || "",
          lastName: editData.lastName || "",
          cast: editData.cast?._id || "",
          cnic: editData.cnic || "",
          status: editData.status || STATUS_ENUM.ACTIVE,
          designation: editData.designation?._id || "",
          mobileNumber: editData.mobileNumber || "",
          grade: editData.grade?._id || "",
          achievements: editData.achievements || "",
          address: {
            line1: editData.address?.line1 || "",
            line2: editData.address?.line2 || "",
            city: editData.address?.city || "",
          },
          dateOfBirth: formatDateForInput(editData.dateOfBirth),
          location: editData.location || "",
        });

        // Handle ALL assets (weapons AND vehicles) properly for edit mode
        if (editData.assets && editData.assets.length > 0) {
          const assetsFromData = editData.assets.map((asset, index) => ({
            id: Date.now() + index,
            assetType: asset._id || "",
            weaponNumber: asset.weaponNumber || "",
            pistolNumber: asset.pistolNumber || "",
            assignedRounds: asset.assignedRounds || "",
            consumedRounds: asset.consumedRounds || "",
          }));
          setAssets(assetsFromData);
        } else {
          setAssets([]);
        }

        setProfile(editData.profileUrl || "");
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
        setAssets([]);
      }
    };

    const fetchEnums = async () => {
      try {
        const [castRes, desigRes, gradeRes, assetRes] = await Promise.all([
          getCastsWithEnum(),
          getDesignationsWithEnum(),
          getGradesWithEnum(),
          getWeaponsWithEnum(),
        ]);

        console.log("🧪 assetRes from backend:", assetRes);

        if (castRes.success) {
          setCastEnum(castRes.data);
        }
        if (desigRes.success) setDesignationEnum(desigRes.data);
        if (gradeRes.success) setGradeEnum(gradeRes.data);
        if (assetRes.success) {
          setAssetEnum(assetRes.data);
          
          // Fetch the full asset data for auto-population
          try {
            const fullAssetsResponse = await fetch(`${API_URL}/assets`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              }
            });
            const fullAssetsData = await fullAssetsResponse.json();
            console.log("📦 Full assets data:", fullAssetsData);
            setAllAssetsData(fullAssetsData);
          } catch (error) {
            console.error("❌ Error fetching full assets data:", error);
          }
        }
      } catch (error) {
        console.error("❌ Error in fetchEnums:", error);
      }
    };

    addEmployeeData();
    fetchEnums();
  }, [editData, isEdit]);

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

  const handleAssetsChange = (newAssets) => {
    setAssets(newAssets);
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  // Enhanced handleSubmit to properly format asset data
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

      // Extract only asset IDs from assets array (both weapons and vehicles)
      const assetIds = assets
        .filter((asset) => asset.assetType)
        .map((asset) => asset.assetType);

      // Create JSON object with asset IDs array
      const submitData = {
        ...formData,
        assets: assetIds,
        profileUrl:
          photoUrl ||
          profile ||
          `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=6366f1&color=ffffff&size=200&rounded=true&bold=true`,
      };

      console.log("📤 Submitting data:", submitData);
      console.log("🔧 Asset IDs being sent:", assetIds);

      let result;

      if (isEdit) {
        result = await updateEmployee(submitData, editData._id);
      } else {
        result = await addEmployee(submitData);
      }

      if (result?.success) {
        navigate("/employees");
      } else {
        throw new Error(result?.error || "Unknown error occurred");
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
        profile={profile}
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
            enumObject={castEnum}
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
          enumObject={designationEnum}
          required={true}
          placeholder="Select designation"
        />

        <EnumSelect
          label="Grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          enumObject={gradeEnum}
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

      {/* Multiple Assets Section */}
      <div className="border-t pt-4">
        <MultipleAssets
          assets={assets}
          onAssetsChange={handleAssetsChange}
          assetEnum={assetEnum}
          allAssetsData={allAssetsData}
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
            placeholder="Enter any achievements, awards, or notable accomplishments..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading
            ? "Uploading Photo..."
            : loading
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
            ? "Update Employee"
            : "Add Employee"}
        </button>
      </div>
    </form>
  );
};

export default AddEmployeeForm;