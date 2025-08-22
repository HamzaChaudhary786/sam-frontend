import React from "react";
import {
  useLookupOptions,
  useLookupAssetStatusOption
} from "../../../services/LookUp.js";

const BulkAssetRows = ({
  assetRows,
  onAssetChange,
  onAddRow,
  onRemoveRow,
  loading,
  filters
}) => {
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");
  const { options: assetStatusOptions } = useLookupAssetStatusOption("assetStatus");

  // Create enums for dropdowns
  const assetTypeEnum = React.useMemo(() => {
    const enumObj = {};
    assetTypeOptions?.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  }, [assetTypeOptions]);

  const assetStatusEnum = React.useMemo(() => {
    const enumObj = {};
    assetStatusOptions?.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  }, [assetStatusOptions]);

  // Category detection function
  const getCategoryOptions = (assetType) => {
    if (!assetType) return [];

    const type = assetType.toLowerCase();
    let detectedCategory = "";

    if (/round|bore|bor|mm|magazine/.test(type)) {
      detectedCategory = "weaponRound";
    } else if (/cabin|truck|motorcycle|bowser/.test(type)) {
      detectedCategory = "vehicle";
    } else if (/gun|rifle|ak|g3|lmg|mp5|rpd|rpg|draganov|sniper/.test(type)) {
      detectedCategory = "weapons";
    } else if (/pistol|tt/.test(type)) {
      detectedCategory = "pistol";
    } else {
      detectedCategory = "weapons";
    }

    const allCategories = [
      { value: "weapons", label: "Weapons" },
      { value: "pistol", label: "Pistol" },
      { value: "vehicle", label: "Vehicle" },
      { value: "weaponRound", label: "Weapon Round" },
      { value: "pistolRound", label: "Pistol Round" },
      { value: "other", label: "Other" },
    ];

    return allCategories.sort((a, b) => {
      if (a.value === detectedCategory) return -1;
      if (b.value === detectedCategory) return 1;
      return 0;
    });
  };

  // Define which fields to show for each category
  const getCategoryFields = (category) => {
    const commonFields = ['type', 'category', 'quantity', 'condition', 'purchaseDate', 'cost', 'supplier', 'assetStatus', 'pictures', 'additionalInfo'];

    switch (category) {
      case 'weapons':
        return [...commonFields, 'weaponNumber', 'availableQuantity'];
      case 'pistol':
        return [...commonFields, 'pistolNumber', 'availableQuantity'];
      case 'vehicle':
        return [...commonFields, 'vehicleNumber', 'registerNumber', 'chassiNumber', 'engineNumber', 'model', 'make', 'color'];
      case 'weaponRound':
      case 'pistolRound':
        return [...commonFields, 'numberOfRounds', 'weaponName', 'availableQuantity'];
      case 'other':
      default:
        return commonFields;
    }
  };

  // Get dynamic table headers based on what fields are visible across all rows
  const getVisibleHeaders = () => {
    const allVisibleFields = new Set();

    assetRows.forEach(row => {
      const categoryFields = getCategoryFields(row.category);
      categoryFields.forEach(field => allVisibleFields.add(field));
    });

    // Always include basic fields even if no rows exist
    if (allVisibleFields.size === 0) {
      return ['type', 'category', 'quantity', 'condition', 'purchaseDate', 'cost', 'supplier', 'assetStatus', 'pictures', 'additionalInfo'];
    }

    // Return fields in a logical order
    const fieldOrder = ['type', 'category', 'quantity', 'weaponNumber', 'pistolNumber', 'vehicleNumber', 'registerNumber', 'chassiNumber', 'engineNumber', 'model', 'make', 'color', 'numberOfRounds', 'weaponName', 'availableQuantity', 'condition', 'purchaseDate', 'cost', 'supplier', 'assetStatus', 'pictures', 'additionalInfo'];

    return fieldOrder.filter(field => allVisibleFields.has(field));
  };

  const visibleHeaders = getVisibleHeaders();

  const handleAssetChange = (rowId, field, value) => {
    onAssetChange(rowId, field, value);
  };

  const handleTypeChange = (rowId, e) => {
    const newType = e.target.value;
    const selectedTypeLabel = assetTypeOptions?.find((option) => option.value === newType)?.label || newType;

    // Get the auto-detected category
    const categoryOptions = getCategoryOptions(newType);
    const autoSelectedCategory = categoryOptions.length > 0 ? categoryOptions[0].value : "";

    // Reset row with new type and auto-selected category
    const currentRow = assetRows.find(row => row.id === rowId);
    const resetRow = {
      ...currentRow,
      name: selectedTypeLabel,
      type: newType,
      category: autoSelectedCategory,
      // Reset category-specific fields
      weaponNumber: "",
      pistolNumber: "",
      vehicleNumber: "",
      registerNumber: "",
      chassiNumber: "",
      engineNumber: "",
      model: "",
      make: "",
      color: "",
      numberOfRounds: "",
      weaponName: "",
    };

    // Update the entire row
    Object.keys(resetRow).forEach(key => {
      if (key !== 'id') {
        onAssetChange(rowId, key, resetRow[key]);
      }
    });
  };

  const handlePicturesChange = (rowId, e) => {
    const files = Array.from(e.target.files);
    onAssetChange(rowId, 'pictures', files);
  };

  // Create category enum for each row
  const getCategoryEnum = (assetType) => {
    const categoryOptions = getCategoryOptions(assetType);
    const enumObj = {};
    categoryOptions.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  };

  // Field configuration with labels and components
  const fieldConfig = {
    type: {
      label: "Asset Type",
      render: (row) => (
        <select
          value={row.type || ''}
          onChange={(e) => handleTypeChange(row.id, e)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[200px]"
        >
          <option value="">Select Type...</option>
          {Object.entries(assetTypeEnum).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )
    },
    category: {
      label: "Category",
      render: (row) => {
        const categoryEnum = getCategoryEnum(row.type);
        return (
          <select
            value={row.category || ''}
            onChange={(e) => handleAssetChange(row.id, 'category', e.target.value)}
            disabled={loading || !row.type}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          >
            <option value="">{row.type ? "Select Category..." : "Select Type First..."}</option>
            {Object.entries(categoryEnum).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        );
      }
    },
    quantity: {
      label: "Quantity",
      render: (row) => (
        <input
          type="number"
          value={row.quantity || ''}
          onChange={(e) => handleAssetChange(row.id, 'quantity', e.target.value)}
          disabled={loading}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[80px]"
          placeholder="1"
        />
      )
    },
    weaponNumber: {
      label: "Weapon Number",
      render: (row) => (
        <input
          type="text"
          value={row.weaponNumber || ''}
          onChange={(e) => handleAssetChange(row.id, 'weaponNumber', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter weapon number"
        />
      )
    },
    pistolNumber: {
      label: "Pistol Number",
      render: (row) => (
        <input
          type="text"
          value={row.pistolNumber || ''}
          onChange={(e) => handleAssetChange(row.id, 'pistolNumber', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter pistol number"
        />
      )
    },
    vehicleNumber: {
      label: "Vehicle Number",
      render: (row) => (
        <input
          type="text"
          value={row.vehicleNumber || ''}
          onChange={(e) => handleAssetChange(row.id, 'vehicleNumber', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter vehicle number"
        />
      )
    },
    registerNumber: {
      label: "Register Number",
      render: (row) => (
        <input
          type="text"
          value={row.registerNumber || ''}
          onChange={(e) => handleAssetChange(row.id, 'registerNumber', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter register number"
        />
      )
    },
    chassiNumber: {
      label: "Chassis Number",
      render: (row) => (
        <input
          type="text"
          value={row.chassiNumber || ''}
          onChange={(e) => handleAssetChange(row.id, 'chassiNumber', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter chassis number"
        />
      )
    },
    engineNumber: {
      label: "Engine Number",
      render: (row) => (
        <input
          type="text"
          value={row.engineNumber || ''}
          onChange={(e) => handleAssetChange(row.id, 'engineNumber', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter engine number"
        />
      )
    },
    model: {
      label: "Model",
      render: (row) => (
        <input
          type="text"
          value={row.model || ''}
          onChange={(e) => handleAssetChange(row.id, 'model', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Model year"
        />
      )
    },
    make: {
      label: "Make",
      render: (row) => (
        <input
          type="text"
          value={row.make || ''}
          onChange={(e) => handleAssetChange(row.id, 'make', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Make"
        />
      )
    },
    color: {
      label: "Color",
      render: (row) => (
        <input
          type="text"
          value={row.color || ''}
          onChange={(e) => handleAssetChange(row.id, 'color', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[100px]"
          placeholder="Color"
        />
      )
    },
    numberOfRounds: {
      label: "Number of Rounds",
      render: (row) => (
        <input
          type="number"
          value={row.numberOfRounds || ''}
          onChange={(e) => handleAssetChange(row.id, 'numberOfRounds', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Rounds count"
        />
      )
    },
    weaponName: {
      label: "Weapon Name",
      render: (row) => (
        <input
          type="text"
          value={row.weaponName || ''}
          onChange={(e) => handleAssetChange(row.id, 'weaponName', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Weapon name"
        />
      )
    },
    availableQuantity: {
      label: "Available Quantity",
      render: (row) => (
        <input
          type="number"
          value={row.availableQuantity || ''}
          onChange={(e) => handleAssetChange(row.id, 'availableQuantity', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Stock qty"
        />
      )
    },
    condition: {
      label: "Condition",
      render: (row) => (
        <input
          type="text"
          value={row.condition || ''}
          onChange={(e) => handleAssetChange(row.id, 'condition', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Good, Fair, etc."
        />
      )
    },
    purchaseDate: {
      label: "Purchase Date",
      render: (row) => (
        <input
          type="date"
          value={row.purchaseDate || ''}
          onChange={(e) => handleAssetChange(row.id, 'purchaseDate', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
        />
      )
    },
    cost: {
      label: "Cost",
      render: (row) => (
        <input
          type="number"
          value={row.cost || ''}
          onChange={(e) => handleAssetChange(row.id, 'cost', e.target.value)}
          disabled={loading}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="0.00"
        />
      )
    },
    supplier: {
      label: "Supplier",
      render: (row) => (
        <input
          type="text"
          value={row.supplier || ''}
          onChange={(e) => handleAssetChange(row.id, 'supplier', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Supplier name"
        />
      )
    },
    assetStatus: {
      label: "Asset Status",
      render: (row) => (
        <select
          value={row.assetStatus || ''}
          onChange={(e) => handleAssetChange(row.id, 'assetStatus', e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[140px]"
        >
          <option value="">Select Status...</option>
          {Object.entries(assetStatusEnum).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )
    },
    pictures: {
      label: "Pictures",
      render: (row) => (
        <div className="min-w-[150px]">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handlePicturesChange(row.id, e)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
          />
          {row.pictures && row.pictures.length > 0 && (
            <div className="mt-1 text-xs text-green-600">
              {row.pictures.length} file(s) selected
            </div>
          )}
        </div>
      )
    },
    additionalInfo: {
      label: "Additional Info",
      render: (row) => (
        <textarea
          value={row.additionalInfo || ''}
          onChange={(e) => handleAssetChange(row.id, 'additionalInfo', e.target.value)}
          disabled={loading}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[200px]"
          placeholder="Additional information..."
        />
      )
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-visible mb-10 relative">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Asset Details</h3>
        <button
          onClick={onAddRow}
          disabled={loading}
          className="fixed top-24 right-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors shadow-lg z-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {visibleHeaders.map(field => (
                <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {fieldConfig[field]?.label || field}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assetRows.map((row, index) => {
              const rowFields = getCategoryFields(row.category);

              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  {visibleHeaders.map(field => {
                    const shouldShowField = rowFields.includes(field);

                    return (
                      <td key={field} className="px-6 py-4">
                        {shouldShowField ? (
                          fieldConfig[field]?.render(row) || <span className="text-gray-400">-</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onRemoveRow(row.id)}
                      disabled={assetRows.length === 1 || loading}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Remove this asset"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Category Legend */}
      {/* <div className="p-4 bg-gray-50 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Category Field Guide:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600">
          <div><strong>Weapons:</strong> Weapon Number, Available Quantity</div>
          <div><strong>Pistol:</strong> Pistol Number, Available Quantity</div>
          <div><strong>Vehicle:</strong> Vehicle Number, Register Number, Chassis, Engine, Model, Make, Color</div>
          <div><strong>Weapon/Pistol Round:</strong> Number of Rounds, Weapon Name, Available Quantity</div>
          <div><strong>Other:</strong> Basic fields only</div>
        </div>
      </div> */}
    </div>
  );
};

export default BulkAssetRows;