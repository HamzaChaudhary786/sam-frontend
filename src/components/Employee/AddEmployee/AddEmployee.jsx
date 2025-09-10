import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../EmployeeHook";
import { useLocationEnum } from "./LocationHook";
import { uploadToCloudinary } from "./Cloudinary";
import { updateEmployee } from "../EmployeeApi";
import { getCastsWithEnum } from "./Cast";
import { getDesignationsWithEnum } from "./Designation";
import { getGradesWithEnum } from "./Grades";
import { addEmployee } from "../EmployeeApi";
import { BACKEND_URL } from "../../../constants/api.js";
import { getStatusWithEnum } from "./Status.js";
import { getRanksWithEnum } from "./Rank.js";
import { EnumSelect } from "../../SearchableDropdown.jsx";
import { getStationDistrictWithEnum } from "../../Station/District.js";
import { getStationLocationsWithEnum } from "../../Station/lookUp.js";
import { MultiEnumSelect } from "../../Multiselect.jsx";
import { getTrainingsWithEnum } from "./Training.js";
const API_URL = BACKEND_URL;

// Fixed Multiple Image upload component
const ImageUpload = ({ onImageChange, imagePreviews, profileUrls }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            // Pass the new files and updated previews
            onImageChange([...newFiles], [...imagePreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
        newFiles.push(file);
      }
    });
  };

  const removeImage = (index) => {
    const existingUrlsCount = (profileUrls || []).length;

    if (index < existingUrlsCount) {
      // Removing an existing profile URL
      const newProfileUrls = profileUrls.filter((_, i) => i !== index);
      // Call parent component's update function to update profileUrls
      onImageChange([], imagePreviews, newProfileUrls);
    } else {
      // Removing a new preview image
      const previewIndex = index - existingUrlsCount;
      const newPreviews = imagePreviews.filter((_, i) => i !== previewIndex);
      onImageChange([], newPreviews, profileUrls);
    }
  };

  const displayImages = [...(profileUrls || []), ...imagePreviews];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Employee Photos
      </label>

      <div className="flex flex-wrap gap-4 mb-4">
        {displayImages.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image}
              alt={`Employee photo ${index + 1}`}
              className="h-24 w-24 rounded-lg object-cover border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {displayImages.length === 0 && (
          <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
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

      <div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, GIF up to 5MB each. You can select multiple images.
        </p>
      </div>
    </div>
  );
};

const AddEmployeeForm = ({ onClose, isEdit, editData }) => {
  const navigate = useNavigate();
  const { createEmployee } = useEmployees();
  const {
    locationEnum,
    getStationAddress,
    getStationDistrict,
    loading: locationLoading,
    error: locationError,
  } = useLocationEnum();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [castEnum, setCastEnum] = useState({});
  const [designationEnum, setDesignationEnum] = useState({});
  const [statusEnum, setStatusEnum] = useState({});
  const [gradeEnum, setGradeEnum] = useState({});
  const [rankEnum, setRankEnum] = useState({});
  const [profile, setProfile] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [enumsLoaded, setEnumsLoaded] = useState(false);
  const [trainingEnum, setTrainingEnum] = useState({});

  // Separate state for station address (for display only)
  const [stationAddress, setStationAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    tehsil: "",
  });
  // const [stationDistrict, setStationDistrict] = useState({
  //   district: "",
  // });

  const [stationLocations, setStationLocations] = useState({}); // State for station locations
  const [districtLocations, setDistrictLocations] = useState({}); // State for district locations
  const [loadingLocations, setLoadingLocations] = useState(false); // Loading state for locations

  const [formData, setFormData] = useState({
    personalNumber: "",
    firstName: "",
    lastName: "",
    fatherFirstName: "",
    fatherLastName: "",
    cast: "",
    cnic: "",
    status: "active",
    statusDescription: "", // New field for status description
    designation: "",
    rank: "",
    mobileNumber: "",
    grade: "",
    serviceType: "provincial",
    training: [], // Add this new field
    address: {
      line1: "",
      line2: "",
      muhala: "",
      tehsil: "",
    },
    dateOfBirth: "",
    stations: "",
  });

  useEffect(() => {
    fetchStationLocations();
    fetchDistrictLocations();
  }, []);

  const fetchStationLocations = async () => {
    setLoadingLocations(true);
    try {
      const result = await getStationLocationsWithEnum();
      if (result.success) {
        setStationLocations(result.data);
      } else {
        setError("Failed to load station locations");
        console.error("Error fetching station locations:", result.error);
      }
    } catch (error) {
      setError("Failed to load station locations");
      console.error("Error fetching station locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch district locations from API
  const fetchDistrictLocations = async () => {
    try {
      const result = await getStationDistrictWithEnum();
      if (result.success) {
        setDistrictLocations(result.data);
      } else {
        console.error("Error fetching district locations:", result.error);
        // Don't set error here as it's not critical - user can still proceed
      }
    } catch (error) {
      console.error("Error fetching district locations:", error);
      // Don't set error here as it's not critical - user can still proceed
    }
  };

  // Helper function to determine if stations field should be read-only
  const isStationsReadOnly = () => {
    return true;
    if (!isEdit) return false; // Never read-only in add mode

    // Check if stations data exists and is not null/empty
    const stationsValue = editData?.stations;
    return (
      stationsValue &&
      (typeof stationsValue === "string"
        ? stationsValue.trim() !== ""
        : typeof stationsValue === "object"
          ? stationsValue._id
          : false)
    );
  };

  // Helper function to determine if status field should be read-only
  const isStatusReadOnly = () => {
    if (!isEdit) return false; // Never read-only in add mode

    // Check if status data exists and is not null/empty
    const statusValue = editData?.status;
    return (
      statusValue &&
      (typeof statusValue === "string"
        ? statusValue.trim() !== ""
        : typeof statusValue === "object"
          ? statusValue._id
          : false)
    );
  };

  function addToObjectAssign(obj, key, value) {
    return Object.assign({}, obj, { [key]: value });
  }

  useEffect(() => {
    // First, fetch the enums
    const fetchEnums = async () => {
      try {
        const [castRes, desigRes, gradeRes, statusRes, Rank, trainingRes] =
          await Promise.all([
            getCastsWithEnum(),
            getDesignationsWithEnum(),
            getGradesWithEnum(),
            getStatusWithEnum(),
            getRanksWithEnum(),
            getTrainingsWithEnum(), // Add this line
          ]);

        if (castRes.success) {
          setCastEnum(castRes.data);
        }
        if (desigRes.success) setDesignationEnum(desigRes.data);
        if (gradeRes.success) setGradeEnum(gradeRes.data);
        if (statusRes.success) setStatusEnum(statusRes.data);
        if (Rank.success) setRankEnum(Rank.data);
        if (trainingRes.success) setTrainingEnum(trainingRes.data); // Add this line

        setEnumsLoaded(true);
      } catch (error) {
        console.error("❌ Error in fetchEnums:", error);
        setEnumsLoaded(true); // Set to true even on error to avoid infinite loading
      }
    };

    fetchEnums();
  }, []);

  useEffect(() => {
    // Only set form data after enums are loaded
    if (!enumsLoaded) return;

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

    if (editData && isEdit) {
      // Prefill form from editData
      const formattedDate = formatDateForInput(editData.dateOfBirth);

      setFormData({
        personalNumber: editData.personalNumber || "",
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        fatherFirstName: editData.fatherFirstName || "",
        fatherLastName: editData.fatherLastName || "",
        training: editData.training || [],
        cast:
          typeof editData.cast === "object"
            ? editData.cast?._id
            : editData.cast || "",
        cnic: editData.cnic || "",
        status:
          typeof editData.status === "object"
            ? editData.status?._id
            : editData.status || "",
        statusDescription: editData.statusDescription || "",
        designation:
          typeof editData.designation === "object"
            ? editData.designation?._id
            : editData.designation || "",
        rank:
          typeof editData.rank === "object"
            ? editData.rank?._id
            : editData.rank || "",
        mobileNumber: editData.mobileNumber || "",
        grade:
          typeof editData.grade === "object"
            ? editData.grade?._id
            : editData.grade || "",
        serviceType: editData.serviceType || "federal",
        address: {
          line1: editData.address?.line1 || "",
          line2: editData.address?.line2 || "",
          muhala: editData.address?.muhala || "",
          tehsil: editData.address?.tehsil || "",
        },
        dateOfBirth: formattedDate,
        stations:
          typeof editData.stations === "object"
            ? editData.stations?._id
            : editData.stations || "",
      });

      // Set station address for display (separate from personal address)
      setStationAddress({
        line1: editData.stations?.address?.line1 || "",
        line2: editData.stations?.address?.line2 || "",
        city: editData.stations?.address?.city || "",
        tehsil: editData.stations?.address?.tehsil || "",
      });
      // setStationDistrict({
      //   district: editData.stations?.district || "",
      // });
      setProfile(editData.profileUrl || []);
    } else {
      // Empty form for new employee
      setFormData({
        personalNumber: "",
        firstName: "",
        lastName: "",
        fatherFirstName: "",
        fatherLastName: "",
        cast: "",
        cnic: "",
        status: "",
        statusDescription: "",
        designation: "",
        mobileNumber: "",
        training: [],
        grade: "",
        rank: "",
        serviceType: "provincial",
        address: {
          line1: "",
          line2: "", // this is district
          muhala: "",
          tehsil: "",
        },
        dateOfBirth: "",
        age: "",
        stations: "",
      });
      setStationAddress({
        line1: "",
        line2: "",
        city: "",
        tehsil: "",
      });
      // setStationDistrict({
      //   district: "",
      // });
    }
  }, [editData, isEdit, enumsLoaded]);

  // CNIC validation function
  const validateCNIC = (cnic) => {
    // Check if CNIC is exactly 13 digits with no hyphens
    const cnicPattern = /^[0-9]{13}$/;
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
      setFormData((prev) => {
        const newData = {
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value,
          },
        };
        return newData;
      });
    } else {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };

        // Clear status description if status is changed to active
        if (name === "status" && value === "active") {
          newData.statusDescription = "";
        }
        return newData;
      });

      // Real-time CNIC validation
      if (name === "cnic" && value && !validateCNIC(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          cnic: "CNIC must be exactly 13 digits with no hyphens (e.g., 3520212345671)",
        }));
      }
    }
  };

  const handleTrainingsEnumChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      training: value,
    }));
  };

  // Handle location change with auto-fill station address (separate from personal address)
  const handleLocationChange = (e) => {
    const selectedStationId = e.target.value;

    // Update location in formData
    setFormData((prev) => ({
      ...prev,
      stations: selectedStationId,
    }));

    // Auto-fill STATION address (not personal address)
    if (selectedStationId) {
      const stationAddressData = getStationAddress(selectedStationId);
      const stationDistrictData = getStationDistrict(selectedStationId); // ADD THIS

      if (stationAddressData) {
        setStationAddress({
          line1: stationAddressData.line1,
          line2: stationAddressData.line2,
          city: stationAddressData.city,
          tehsil: stationAddressData.tehsil,
        });
      }
      // setStationDistrict({
      //   district: stationDistrictData,
      // });
    } else {
      // Clear station address if no station selected
      setStationAddress({
        line1: "",
        line2: "",
        city: "",
        district: "",
        tehsil: "",
      });
      // setStationDistrict({
      //   district: "",
      // });
    }
  };

  // Updated handleImageChange to handle profile URL updates
  const handleImageChange = (files, previews, updatedProfileUrls = null) => {
    setImageFiles(files);
    setImagePreviews(previews);

    // If updatedProfileUrls is provided, update the profile state
    if (updatedProfileUrls !== null) {
      setProfile(updatedProfileUrls);
    }
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  // Enhanced handleSubmit to properly format data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      // Validate CNIC before submission
      if (formData.cnic && !validateCNIC(formData.cnic)) {
        setValidationErrors({
          cnic: "CNIC must be exactly 13 digits with no hyphens (e.g., 3520212345671)",
        });
        setLoading(false);
        return;
      }

      let photoUrls = [...(profile || [])]; // Start with existing profile URLs

      // Upload new photos to Cloudinary if present
      if (imageFiles && imageFiles.length > 0) {
        setUploading(true);

        for (const file of imageFiles) {
          const uploadResult = await uploadToCloudinary(file);
          if (uploadResult.success) {
            photoUrls.push(uploadResult.url);
          } else {
            throw new Error(`Photo upload failed: ${uploadResult.error}`);
          }
        }
        setUploading(false);
      }

      // Ensure we have at least one photo URL (fallback to avatar)
      if (photoUrls.length === 0) {
        photoUrls = [
          `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=6366f1&color=ffffff&size=200&rounded=true&bold=true`,
        ];
      }

      // Create JSON object with proper format - match your backend API structure
      const submitData = {
        ...formData,
        profileUrl: photoUrls,
      };
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

  const isStationIncharge =
    editData.stations?.stationIncharge?.some(
      (incharge) => incharge.employee === editData._id
    );
  const isMallkhanaIncharge = editData.assignedAssets?.some(
    (asset) => asset.asset[0]?.mallkhana !== null
  );
  const hasAward = editData.assignedAwards?.some(
    (award) => award.isMonitor === true
  );
  // const hasDisciplinary = editData.disciplinaryActions?.some(
  //   (dis) => dis.isDisciplinaryAction === true
  // );
  const disciplinaryObjects =
    editData?.disciplinaryActions?.filter(
      (dis) => dis.isDisciplinaryAction === true
    ) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
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
        imagePreviews={imagePreviews}
        profileUrls={profile}
      />

      {isEdit && (
        <>
          <hr className="w-full border-t pt-6" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold italic my-3">
              Tags
            </h1>
            <div className="flex flex-row gap-x-3 flex-wrap ">
              {isStationIncharge && (
                <span className="bg-blue-100 text-blue-800 w-fit text-xs font-medium px-2 py-1 rounded">
                  Station Incharge
                </span>
              )}
              {isMallkhanaIncharge && (
                <span className="bg-green-100 text-green-800 w-fit text-xs font-medium px-2 py-1 rounded">
                  Mallkhana Incharge
                </span>
              )}
              {hasAward && (
                <span className="bg-yellow-100 text-yellow-800 w-fit text-xs font-medium px-2 py-1 rounded">
                  Award
                </span>
              )}
            </div>
            {disciplinaryObjects.length > 0 && disciplinaryObjects[0]?.description && (
              <span className="bg-yellow-100 text-yellow-800 w-fit text-xs font-medium px-2 py-1 rounded">
                {disciplinaryObjects[0].description}
              </span>
            )}

          </div>
          <hr className="w-full border-t my-6" />

        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personal Number *
          </label>
          <input
            type="text"
            name="personalNumber"
            value={formData.personalNumber}
            onChange={handleChange}
            required
            placeholder="EMP-12345"
            readOnly={isEdit}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEdit ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""
              }`}
          />
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500">
              Personal number cannot be changed in edit
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Type *
          </label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="provincial">Provincial</option>
            <option value="federal">Federal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="Enter employee's complete name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Father's Full Name *
          </label>
          <input
            type="text"
            name="fatherFirstName"
            value={formData.fatherFirstName}
            onChange={handleChange}
            required
            placeholder="Enter father's full name"
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
            placeholder="3520212345671"
            pattern="[0-9]{13}"
            title="CNIC must be exactly 13 digits with no hyphens"
            maxLength="13"
            readOnly={isEdit}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.cnic
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
              } ${isEdit ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""}`}
          />
          {validationErrors.cnic && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.cnic}</p>
          )}
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500">
              CNIC cannot be changed in edit
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="text"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
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
            readOnly={isEdit}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEdit ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""
              }`}
          />
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500">
              Date of birth cannot be changed in edit
            </p>
          )}
        </div>
      </div>

      {/* Enum Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <EnumSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            enumObject={statusEnum}
            required={true}
            placeholder="Select status"
            readOnly={isStatusReadOnly()} // Use the helper function for status
          />
          {isStatusReadOnly() && (
            <p className="mt-1 text-xs text-gray-500">
              Status field is read-only because a status is already assigned
            </p>
          )}
        </div>

        <EnumSelect
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          enumObject={designationEnum}
          required={false}
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
        <EnumSelect
          label="Rank"
          name="rank"
          value={formData.rank}
          onChange={handleChange}
          enumObject={rankEnum}
          required={false}
          placeholder="Select rank"
        />
        <div className="grid grid-cols-1 gap-4">
          <MultiEnumSelect
            label="Employee Trainings"
            name="training"
            value={formData.training}
            onChange={handleTrainingsEnumChange}
            enumObject={trainingEnum}
            placeholder="Search and select trainings..."
            readOnly={false}
          />
        </div>
      </div>

      {/* Personal Address Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Personal Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={3}
              // type="text"
              name="address.line1"
              value={formData.address.line1}
              onChange={handleChange}
              placeholder="Full Address Of Employee..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mohalla
            </label>
            <input
              type="text"
              name="address.muhala"
              value={formData.address.muhala}
              onChange={handleChange}
              placeholder="Satellite Town"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnumSelect
              label="Tehsil"
              name="address.tehsil"
              value={formData.address.tehsil}
              onChange={handleChange}
              enumObject={stationLocations}
              required={false}
              placeholder={
                loadingLocations
                  ? "Loading locations..."
                  : "Search and select tehsil..."
              }
              readOnly={loadingLocations}
            />

            {/* Replace regular select with EnumSelect for District */}
            <EnumSelect
              label="District"
              name="address.line2"
              value={formData.address.line2}
              onChange={handleChange}
              enumObject={districtLocations}
              required={false}
              placeholder="Search and select district..."
            />
          </div>
        </div>
      </div>

      {/* Place of Posting Section - Only show in Edit mode */}
      {isEdit && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Place of Posting
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station
              </label>
              <select
                name="stations"
                value={formData.stations}
                onChange={handleLocationChange}
                required={isEdit} // Only required in edit mode
                disabled={isStationsReadOnly()} // Use the helper function
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isStationsReadOnly()
                  ? "bg-gray-50 text-gray-600 cursor-not-allowed"
                  : ""
                  }`}
              >
                <option value="">
                  {locationLoading ? "Loading stations..." : "Select station"}
                </option>
                {Object.entries(locationEnum).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {isStationsReadOnly() && (
                <p className="mt-1 text-xs text-gray-500">
                  Station field is read-only because a station is already
                  assigned
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Address
              </label>
              <input
                type="text"
                value={stationAddress.line1}
                readOnly
                placeholder="Station address will appear here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Address Mohalla
              </label>
              <input
                type="text"
                value={stationAddress.line2}
                readOnly
                placeholder="Station address line 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station City & Tehsil
              </label>
              <input
                type="text"
                value={`${stationAddress.city} - ${stationAddress.tehsil}`}
                readOnly
                placeholder="Station city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-end space-x-3 p-4 bg-white border-t shadow-md z-50"       >
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
