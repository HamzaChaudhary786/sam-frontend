import React, { useState, useEffect } from "react";
import { useStations } from "../StationHook";

const StationModal = ({ isOpen, onClose, isEdit = false, editData = null }) => {
  const { createStation, modifyStation } = useStations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    tehsil: "",
    address: {
      line1: "",
      line2: "",
      city: "",
    },
  });

  // Initialize form data for editing
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        tehsil: editData.tehsil || "",
        address: {
          line1: editData.address?.line1 || "",
          line2: editData.address?.line2 || "",
          city: editData.address?.city || "",
        },
      });
    } else {
      // Reset form for new station
      setFormData({
        name: "",
        tehsil: "",
        address: {
          line1: "",
          line2: "",
          city: "",
        },
      });
    }
    setError("");
  }, [isEdit, editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (isEdit) {
        result = await modifyStation(editData._id, formData);
      } else {
        result = await createStation(formData);
      }

      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          name: "",
          tehsil: "",
          address: {
            line1: "",
            line2: "",
            city: "",
          },
        });
      } else {
        setError(result.error || "An error occurred while saving the station");
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Station" : "Add New Station"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Station Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Iqbal Town Station"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tehsil *
              </label>
              <select
                name="tehsil"
                value={formData.tehsil}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select Tehsil
                </option>
                <option value="Dera Bugti">Dera Bugti</option>
                <option value="Sui">Sui</option>
                <option value="Pehlawagh">Pehlawagh</option>
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Address Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Block C, College Road"
                />
              </div>

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
                  placeholder="e.g., Adjacent to Central Plaza"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lahore"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update Station"
                : "Add Station"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationModal;
