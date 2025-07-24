import React, { useState, useEffect } from "react";
import { useAssets } from "../AssetHook.js";
import { useLookupAssetStatusOption, useLookupOptions } from "../../../services/LookUp.js";

const AssetModal = ({
  isOpen,
  onClose,
  isEdit = false,
  editData = null,
  onSuccess,
}) => {
  const { createAsset, modifyAsset } = useAssets();
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");
  const { options: assetStatusOptions } = useLookupAssetStatusOption("assetStatus");


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialFormState = {
    name: "",
    type: "",
    // Weapon fields
    weaponNumber: "",
    // Pistol fields
    pistolNumber: "",
    // Vehicle fields
    vehicleNumber: "",
    registerNumber: "",
    chassiNumber: "",
    condition: "",
    engineNumber: "",
    model: "",
    make: "",
    color: "",
    assetStatus: "",
    purchaseDate: "",
    supplier: "",
    cost: "",
    // Weapon round fields
    numberOfRounds: "",
    weaponName: "",
    availableQuantity: "",
    // Common fields
    additionalInfo: "",
    pictures: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  console.log(editData, "hahahahahahahahaha this is edit data")
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        type: editData.type || "",
        weaponNumber: editData.weaponNumber || "",
        pistolNumber: editData.pistolNumber || "",
        vehicleNumber: editData.vehicleNumber || "",
        registerNumber: editData.registerNumber || "",
        chassiNumber: editData.chassiNumber || "",
        engineNumber: editData.engineNumber || "",
        purchaseDate: editData.purchaseDate || "",
        condition: editData.condition || "",
        assetStatus: editData.assetStatus || "",
        cost: editData.cost || "",
        supplier: editData.supplier || "",
        model: editData.model || "",
        make: editData.make || "",
        color: editData.color || "",
        availableQuantity: editData.availableQuantity || "",
        numberOfRounds: editData.numberOfRounds || "",
        weaponName: editData.weaponName || "",
        additionalInfo: editData.additionalInfo || "",
        pictures: editData.pictures || editData.assetImageUrl || [],
      });
    } else {
      setFormData(initialFormState);
    }
    setError("");
  }, [isEdit, editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    // Reset all type-specific fields when type changes
    setFormData((prev) => ({
      ...initialFormState,
      name: prev.name,
      type: newType,
      additionalInfo: prev.additionalInfo,
      pictures: prev.pictures,
    }));
  };

  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      pictures: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let uploadedUrls = [];

      if (formData.pictures.length > 0) {
        for (const pic of formData.pictures) {
          if (typeof pic === "string") {
            uploadedUrls.push(pic);
          } else {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", "Assets"); // replace
            const res = await fetch(
              "https://api.cloudinary.com/v1_1/dxisw0kcc/image/upload",
              { method: "POST", body: data }
            );
            const result = await res.json();
            if (result.secure_url) {
              uploadedUrls.push(result.secure_url);
            }
          }
        }
      }

      const submitData = {
        name: formData.name,
        type: formData.type,
        additionalInfo: formData.additionalInfo,
        assetImageUrl: uploadedUrls,
      };

      // Add type-specific fields based on selected type
      switch (formData.type) {
        case "weapons":
          submitData.weaponNumber = formData.weaponNumber;
          submitData.pistolNumber = "";
          submitData.assignedRounds = "";
          submitData.consumedRounds = "";
          submitData.availableQuantity = formData.availableQuantity;

          break;
        case "pistol":
          submitData.pistolNumber = formData.pistolNumber;
          submitData.weaponNumber = "";
          submitData.assignedRounds = "";
          submitData.consumedRounds = "";
          submitData.availableQuantity = formData.availableQuantity;

          break;
        case "vehicle":
          submitData.vehicleNumber = formData.vehicleNumber;
          submitData.registerNumber = formData.registerNumber;
          submitData.chassiNumber = formData.chassiNumber;
          submitData.engineNumber = formData.engineNumber;
          submitData.model = formData.model;
          submitData.make = formData.make;
          submitData.color = formData.color;
          // Explicitly set weapon fields to empty for vehicles
          submitData.weaponNumber = "";
          submitData.pistolNumber = "";
          submitData.assignedRounds = "";
          submitData.consumedRounds = "";
          break;
        case "round":
          submitData.numberOfRounds = formData.numberOfRounds;
          submitData.weaponName = formData.weaponName;
          submitData.weaponNumber = "";
          submitData.pistolNumber = "";
          submitData.assignedRounds = "";
          submitData.consumedRounds = "";
          submitData.availableQuantity = formData.availableQuantity;

          break;
      }

      let response;
      if (isEdit) {
        response = await modifyAsset(editData._id, submitData);
      } else {
        response = await createAsset(submitData);
      }

      if (response.success) {
        onSuccess?.();
        setFormData(initialFormState);
        onClose();
      } else {
        setError(response.error || "Failed to save asset");
      }
    } catch (err) {
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setFormData(initialFormState);
    onClose();
  };

  const handleMetenance = () => {
    alert("under construction")
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {


      case "weapons":
        return (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-red-800 mb-4">Weapon Information</h3>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">
                Weapon Number *
              </label>
              <input
                type="text"
                name="weaponNumber"
                value={formData.weaponNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-red-300 rounded-md"
                placeholder="Enter weapon number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Available Quantity
              </label>
              <input
                type="number"
                name="availableQuantity"
                value={formData.availableQuantity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-green-300 rounded-md"
                placeholder="Enter stock quantity"
              />
            </div>
          </div>
        );

      case "pistol":
        return (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-orange-800 mb-4">Pistol Information</h3>
            <div>
              <label className="block text-sm font-medium text-orange-700 mb-1">
                Pistol Number *
              </label>
              <input
                type="text"
                name="pistolNumber"
                value={formData.pistolNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-orange-300 rounded-md"
                placeholder="Enter pistol number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Available Quantity
              </label>
              <input
                type="number"
                name="availableQuantity"
                value={formData.availableQuantity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-green-300 rounded-md"
                placeholder="Enter stock quantity"
              />
            </div>
          </div>
        );

      case "vehicle":
        return (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-blue-300 rounded-md"
                  placeholder="Enter vehicle number (e.g., ABC-123)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Register Number *
                </label>
                <input
                  type="text"
                  name="registerNumber"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-blue-300 rounded-md"
                  placeholder="Enter register number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Chassi Number *
                </label>
                <input
                  type="text"
                  name="chassiNumber"
                  value={formData.chassiNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-blue-300 rounded-md"
                  placeholder="Enter chassi number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Engine Number *
                </label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-blue-300 rounded-md"
                  placeholder="Enter engine number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-blue-300 rounded-md"
                  placeholder="Enter model year (e.g., 2020)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-blue-300 rounded-md"
                  placeholder="Enter make (e.g., Toyota)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-blue-300 rounded-md"
                  placeholder="Enter vehicle color"
                />
              </div>
            </div>
          </div>
        );

      case "round":
        return (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-green-800 mb-4"> Round Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Number of Rounds *
                </label>
                <input
                  type="number"
                  name="numberOfRounds"
                  value={formData.numberOfRounds}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-green-300 rounded-md"
                  placeholder="Enter number of rounds"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Weapon Name *
                </label>
                <input
                  type="text"
                  name="weaponName"
                  value={formData.weaponName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-green-300 rounded-md"
                  placeholder="Enter weapon name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Available Quantity
                </label>
                <input
                  type="number"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-green-300 rounded-md"
                  placeholder="Enter stock quantity"
                />
              </div>

            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getPlaceholderText = () => {
    switch (formData.type) {
      case "weapons":
        return "e.g., Fully automatic rifle for field operations";
      case "pistol":
        return "e.g., Service pistol for personal defense";
      case "vehicle":
        return "e.g., Off-road patrol vehicle for mountainous terrain";
      case "round":
        return "e.g., High-velocity rounds for training purposes";
      default:
        return "Enter additional information";
    }
  };

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Asset" : "Add New Asset"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Black Hawk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select asset type</option>
                {assetTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Asset Pictures
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePicturesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {formData.pictures.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {formData.pictures.map((pic, index) => (
                  <div
                    key={index}
                    className="w-full h-20 overflow-hidden rounded-md border"
                  >
                    <img
                      src={typeof pic === "string" ? pic : URL.createObjectURL(pic)}
                      alt={`preview-${index}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className=" flex flex-row gap-2">
            <div className="w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition *
                </label>
                <input
                  type="text"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Black Hawk"
                />
              </div>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Status *
              </label>
              <select
                name="assetStatus"
                value={formData.assetStatus}
                onChange={handleTypeChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select asset type</option>
                {assetStatusOptions?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className=" flex flex-row gap-2">
            <div className="w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="text"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Black Hawk"
                />
              </div>
            </div>

            <div className="w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost *
                </label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Black Hawk"
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier *
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Black Hawk"
              />
            </div>
          </div>



          {renderTypeSpecificFields()}




          <div className={formData.type ? "border-t pt-4" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={getPlaceholderText()}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleMetenance}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Maintenance History
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                  ? "Update Asset"
                  : "Add Asset"}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default AssetModal;