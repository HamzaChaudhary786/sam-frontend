import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BulkAssetHeader from "../Header/Header.jsx";
import BulkAssetFilters from "../Filter/Filter.jsx";
import BulkAssetRows from "../BulkRows/BulkRows.jsx";
import { createAssetBatch } from "../BulkAssetApi.js";

const BulkAssetCreation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Header state
  const [headerData, setHeaderData] = useState({
    receiveDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    letterInfo: '',
    description: '',
    mallkhana: null, // { _id: '', name: '' }
  });

  // Filters state
  const [filters, setFilters] = useState({
    assetType: '',
    category: '',
  });

  // Asset rows state - Initialize with 3 empty rows
  const [assetRows, setAssetRows] = useState(() => {
    return Array.from({ length: 3 }, (_, index) => ({
      id: (Date.now() + index).toString(),
      name: '',
      type: '',
      category: '',
      quantity: 1,
      assetStatus: '',
      // Category-specific fields
      weaponNumber: '',    
      registerNumber: '',
      chassiNumber: '',
      engineNumber: '',
      model: '',
      make: '',
      color: '',
      availableQuantity: '',
      // Common fields
      purchaseDate: '',
      cost: '',
      supplier: '',
      additionalInfo: '',
      pictures: [],
    }));
  });

  // Apply filters to new rows
  useEffect(() => {
    if (filters.assetType || filters.category) {
      setAssetRows(prev => prev.map(row => {
        // Only apply filters to empty rows
        if (!row.type && !row.category) {
          return {
            ...row,
            type: filters.assetType || row.type,
            category: filters.category || row.category,
          };
        }
        return row;
      }));
    }
  }, [filters]);

  // Header handlers
  const handleHeaderChange = (name, value) => {
    setHeaderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Asset row handlers
  const handleAssetChange = (rowId, field, value) => {
    setAssetRows(prev => prev.map(row =>
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now().toString(),
      name: '',
      type: filters.assetType || '',
      category: filters.category || '',
      quantity: 1,
      assetStatus: '',
      // Category-specific fields
      weaponNumber: '',
      registerNumber: '',
      chassiNumber: '',
      engineNumber: '',
      model: '',
      make: '',
      color: '',
      availableQuantity: '',
      // Common fields
      purchaseDate: '',
      cost: '',
      supplier: '',
      additionalInfo: '',
      pictures: [],
    };

    setAssetRows(prev => [...prev, newRow]);
  };

  const handleRemoveRow = (rowId) => {
    if (assetRows.length === 1) {
      toast.warning("At least one asset row is required");
      return;
    }
    setAssetRows(prev => prev.filter(row => row.id !== rowId));
  };

  // Validation
  const validateForm = () => {
    const errors = [];

    // Validate header
    if (!headerData.receiveDate) {
      errors.push("Batch date is required");
    }

    // Validate asset rows
    assetRows.forEach((row, index) => {
      if (!row.type) {
        errors.push(`Asset ${index + 1}: Asset type is required`);
      }
      // if (!row.category) {
      //   errors.push(`Asset ${index + 1}: Category is required`);
      // }
      if (!row.quantity || row.quantity < 1) {
        errors.push(`Asset ${index + 1}: Valid quantity is required`);
      }
      
    });

    return errors;
  };

  // Handle image upload to Cloudinary
  const uploadImages = async (images) => {
    const uploadedUrls = [];

    for (const image of images) {
      if (typeof image === "string") {
        uploadedUrls.push(image);
      } else {
        try {
          const formData = new FormData();
          formData.append("file", image);
          formData.append("upload_preset", "Assets"); // Replace with your preset

          const response = await fetch(
            "https://api.cloudinary.com/v1_1/dxisw0kcc/image/upload",
            { method: "POST", body: formData }
          );

          const result = await response.json();
          if (result.secure_url) {
            uploadedUrls.push(result.secure_url);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    }

    return uploadedUrls;
  };

  // Save all data
  const handleSaveAll = async () => {
    console.log("=== STARTING BULK ASSET CREATION ===");

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(`Please fix the following errors:\n${validationErrors.join('\n')}`);
      return;
    }

    setLoading(true);

    try {
      // Prepare asset list with image uploads
      const processedAssetList = await Promise.all(
        assetRows.map(async (row) => {
          // Upload images if any
          let uploadedUrls = [];
          if (row.pictures && row.pictures.length > 0) {
            uploadedUrls = await uploadImages(row.pictures);
          }

          // Create multiple assets based on quantity
          const assets = [];
          for (let i = 0; i < parseInt(row.quantity); i++) {
            const asset = {
              name: row.name,
              type: row.type,
              category: row.category,
              assetStatus: row.assetStatus,
              purchaseDate: row.purchaseDate,
              cost: parseFloat(row.cost),
              supplier: row.supplier,
              additionalInfo: row.additionalInfo,
              assetImageUrl: uploadedUrls,
            };

            // Add category-specific fields
            switch (row.category) {
              
              case "pistol": // support old data
              case "weapons":
                asset.weaponNumber = `${row.weaponNumber}${i > 0 ? `-${i + 1}` : ''}`;
                asset.availableQuantity = row.availableQuantity;
                break;
              case "motorcycle":
              case "vehicle":
                asset.registerNumber = `${row.registerNumber}${i > 0 ? `-${i + 1}` : ''}`;
                asset.chassiNumber = row.chassiNumber;
                asset.engineNumber = row.engineNumber;
                asset.model = row.model;
                asset.make = row.make;
                asset.color = row.color;
                break;
              case "weaponRound":
              case "pistolRound":
              case "other":
              case "equipment":
                asset.availableQuantity = row.availableQuantity;
                break;
            }

            assets.push(asset);
          }

          return assets;
        })
      );

      // Flatten the array
      const flatAssetList = processedAssetList.flat();

      // Prepare batch data
      const batchData = {
        batchInfo: {
          receiveDate: headerData.receiveDate,
          referenceNumber: headerData.referenceNumber,
          letterInfo: headerData.letterInfo,
          description: headerData.description,
        },
        assetList: flatAssetList,
        mallkhana: headerData.mallkhana,
      };

      console.log("Submitting batch data:", batchData);

      const result = await createAssetBatch(batchData);

      if (result.success) {
        toast.success(`Successfully created ${flatAssetList.length} assets in batch!`);

        // Reset form or navigate
        setTimeout(() => {
          if (window.confirm("Assets created successfully! Would you like to create another batch?")) {
            // Reset form
            setHeaderData({
              receiveDate: new Date().toISOString().split('T')[0],
              referenceNumber: '',
              letterInfo: '',
              description: '',
              mallkhana: null,
            });
            setAssetRows([{
              id: Date.now().toString(),
              name: '',
              type: '',
              category: '',
              quantity: 1,
              assetStatus: '',
              weaponNumber: '',
              registerNumber: '',
              chassiNumber: '',
              engineNumber: '',
              model: '',
              make: '',
              color: '',
              availableQuantity: '',
              purchaseDate: '',
              cost: '',
              supplier: '',
              additionalInfo: '',
              pictures: [],
            }]);
          } else {
            navigate("/assets");
          }
        }, 2000);
      } else {
        toast.error(`Failed to create asset batch: ${result.error}`);
      }
    } catch (error) {
      console.error("Bulk asset creation error:", error);
      toast.error("Failed to create asset batch");
    } finally {
      setLoading(false);
    }
  };

  // Cancel all changes
  const handleCancelAll = () => {
    if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
      navigate("/assets");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Asset Creation</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create multiple assets in batches with automatic batch tracking.
          </p>
        </div>

      </div>

      {/* Header Component */}
      <BulkAssetHeader
        headerData={headerData}
        onHeaderChange={handleHeaderChange}
        loading={loading}
      />

      {/* Filters Component */}
      {/* <BulkAssetFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
      /> */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md p-4 flex gap-3 justify-end z-50">
        <button
          onClick={handleCancelAll}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Cancel All
        </button>
        <button
          onClick={handleSaveAll}
          disabled={loading || assetRows.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Save All ({assetRows.reduce((sum, row) => sum + parseInt(row.quantity || 0), 0)} assets)
            </>
          )}
        </button>
      </div>

      {/* Asset Rows Component */}
      <BulkAssetRows
        assetRows={assetRows}
        onAssetChange={handleAssetChange}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        loading={loading}
        filters={filters}
      />
    </div>
  );
};

export default BulkAssetCreation;