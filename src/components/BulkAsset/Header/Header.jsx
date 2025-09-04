import React, { useState, useEffect } from "react";
import { getMaalkhanaOptions } from "../BulkAssetApi.js";
import { EnumSelect } from "../../SearchableDropdown.jsx";

const BulkAssetHeader = ({ headerData, onHeaderChange, loading }) => {
  const [maalkhanaOptions, setMaalkhanaOptions] = useState([]);
  const [loadingMaalkhana, setLoadingMaalkhana] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    fetchMaalkhanaOptions();
  }, []);

  const fetchMaalkhanaOptions = async () => {
    setLoadingMaalkhana(true);
    setApiError(null);

    try {
      console.log("Fetching maalkhana options...");
      const result = await getMaalkhanaOptions();

      console.log("API Result:", result);

      if (result.success) {
        let stations = [];

        // Handle different response structures
        if (Array.isArray(result.data)) {
          stations = result.data;
        } else if (result.data && Array.isArray(result.data.stations)) {
          stations = result.data.stations;
        } else if (result.data && result.data.data && Array.isArray(result.data.data.stations)) {
          // Sometimes APIs nest data deeper
          stations = result.data.data.stations;
        } else {
          console.warn("Unexpected data structure:", result.data);
          setApiError("Unexpected data structure from API");
        }

        console.log("Extracted stations:", stations);

        if (stations.length === 0) {
          console.warn("No stations found in API response");
          setApiError("No stations available");
        }

        // Transform data to match EnumSelect format
        const options = stations.map(item => ({
          value: item._id,
          label: item.name
        }));

        console.log("Final options:", options);
        setMaalkhanaOptions(options);
      } else {
        console.error("API returned success: false", result.error);
        setApiError(result.error || "Failed to fetch maalkhana options");
      }
    } catch (error) {
      console.error("Error fetching maalkhana options:", error);
      setApiError(error.message || "Network error occurred");
    } finally {
      setLoadingMaalkhana(false);
    }
  };

  const maalkhanaEnum = React.useMemo(() => {
    const enumObj = {};
    maalkhanaOptions.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  }, [maalkhanaOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onHeaderChange(name, value);
  };

  const handleMaalkhanaChange = (e) => {
    const selectedOption = maalkhanaOptions.find(option => option.value === e.target.value);
    onHeaderChange('mallkhana', {
      _id: e.target.value,
      name: selectedOption?.label || ''
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Batch Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


        {/* Maalkhana Dropdown */}
        <div>
          <EnumSelect
            label="Maalkhana"
            name="mallkhana"
            value={headerData.mallkhana?._id || ''}
            onChange={handleMaalkhanaChange}
            enumObject={maalkhanaEnum}
            required={true}
            disabled={loading || loadingMaalkhana}
            placeholder={
              loadingMaalkhana
                ? "Loading..."
                : apiError
                  ? "Error loading options"
                  : maalkhanaOptions.length === 0
                    ? "No options available"
                    : "Select Maalkhana..."
            }
          />
        </div>

        {/* Batch Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch Date 
          </label>
          <input
            type="date"
            name="receiveDate"
            value={headerData.receiveDate}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            name="referenceNumber"
            value={headerData.referenceNumber}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter reference number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>



        {/* Letter Info */}
        {/* <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Letter Info
          </label>
          <input
            type="text"
            name="letterInfo"
            value={headerData.letterInfo}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter letter information"
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div> */}

        {/* Description */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Letter Info
          </label>
          <textarea
            name="description"
            value={headerData.description}
            onChange={handleChange}
            disabled={loading}
            rows={2}
            placeholder="Enter batch description Letter Info"
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default BulkAssetHeader;