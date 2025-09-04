import React from "react";
import {
  useLookupOptions,
  useLookupAssetStatusOption,
} from "../../../services/LookUp.js";
import SerialNumberModal from "../BulkSerialNumber/SerialNumberModal.jsx";

const BulkAssetRows = ({
  assetRows,
  onAssetChange,
  onAddRow,
  onRemoveRow,
  loading,
  filters,
}) => {
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");
  const { options: assetStatusOptions } =
    useLookupAssetStatusOption("assetStatus");
  const [openLookupModal, setOpenLookupModal] = React.useState({
    isOpen: false,
    rowId: null,
  });
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
      detectedCategory = "round";
    } else if (/cabin|truck|car/.test(type)) {
      detectedCategory = "vehicle";
    } else if (/motorcycle|motorbike/.test(type)) {
      detectedCategory = "motorcycle";
    } else if (
      /pistol|tt|gun|rifle|ak|g3|lmg|mp5|rpd|rpg|draganov|sniper/.test(type)
    ) {
      detectedCategory = "weapons";
    } else if (/set/.test(type)) {
      detectedCategory = "equipment";
    } else {
      detectedCategory = "other";
    }

    const allCategories = [
      { value: "weapons", label: "Weapons" },
      { value: "round", label: "Round" },
      { value: "equipment", label: "Equipment" },
      { value: "motorcycle", label: "Motorcycle" },
      { value: "vehicle", label: "Vehicle" },
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
    const commonFields = [
      "type",
      "category",
      "availableQuantity",
      "purchaseDate",
      "cost",
      "supplier",
      "assetStatus",
      "pictures",
      "additionalInfo",
    ];

    switch (category) {
      case "pistol":
      case "weapons":
        return [...commonFields, "weaponNumber"];
      case "vehicle":
      case "motorcycle":
        return [
          ...commonFields,
          "registerNumber",
          "chassiNumber",
          "engineNumber",
          "model",
          "make",
          "color",
        ];
      default:
        return commonFields;
    }
  };

  // Get dynamic table headers based on what fields are visible across all rows
  const getVisibleHeaders = () => {
    const allVisibleFields = new Set();

    assetRows.forEach((row) => {
      const categoryFields = getCategoryFields(row.category);
      categoryFields.forEach((field) => allVisibleFields.add(field));
    });

    // Always include basic fields even if no rows exist
    if (allVisibleFields.size === 0) {
      return [
        "type",
        "availableQuantity",
        "category",
        "purchaseDate",
        "cost",
        "supplier",
        "assetStatus",
        "pictures",
        "additionalInfo",
      ];
    }

    // Return fields in a logical order
    const fieldOrder = [
      "type",
      "availableQuantity",
      "category",
      "weaponNumber",
      "registerNumber",
      "chassiNumber",
      "engineNumber",
      "model",
      "make",
      "color",
      "purchaseDate",
      "cost",
      "supplier",
      "assetStatus",
      "pictures",
      "additionalInfo",
    ];

    return fieldOrder.filter((field) => allVisibleFields.has(field));
  };

  const visibleHeaders = getVisibleHeaders();

  const handleAssetChange = (rowId, field, value) => {
    onAssetChange(rowId, field, value);
  };

  const handleTypeChange = (rowId, e) => {
    const newType = e.target.value;
    const selectedTypeLabel =
      assetTypeOptions?.find((option) => option.value === newType)?.label ||
      newType;

    // Get the auto-detected category
    const categoryOptions = getCategoryOptions(newType);
    const autoSelectedCategory =
      categoryOptions.length > 0 ? categoryOptions[0].value : "";

    // Reset row with new type and auto-selected category
    const currentRow = assetRows.find((row) => row.id === rowId);
    const resetRow = {
      ...currentRow,
      name: selectedTypeLabel,
      type: newType,
      category: autoSelectedCategory,
      // Reset category-specific fields
      weaponNumber: "",
      registerNumber: "",
      chassiNumber: "",
      engineNumber: "",
      model: "",
      make: "",
      color: "",
    };

    // Update the entire row
    Object.keys(resetRow).forEach((key) => {
      if (key !== "id") {
        onAssetChange(rowId, key, resetRow[key]);
      }
    });
  };

  const handlePicturesChange = (rowId, e) => {
    const files = Array.from(e.target.files);
    onAssetChange(rowId, "pictures", files);
  };

  const handleOpenLookupModal = (rowId) => {
    setOpenLookupModal({ isOpen: true, rowId });
  };

  const handleCloseLookupModal = () => {
    setOpenLookupModal({ isOpen: false, rowId: null });
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
        <>
          <section>
            <select
              value={row.type || ""}
              onChange={(e) => handleTypeChange(row.id, e)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[200px]"
            >
              <option value="">Select Type...</option>
              {Object.entries(assetTypeEnum).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>
        </>
      ),
    },
    availableQuantity: {
      label: "Quantity",
      render: (row) => (
        <input
          type="number"
          value={row.availableQuantity || ""}
          onChange={(e) =>
            handleAssetChange(row.id, "availableQuantity", e.target.value)
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Incoming "
        />
      ),
    },
    category: {
      label: "Category",
      render: (row) => {
        const categoryEnum = getCategoryEnum(row.type);
        return (
          <select
            value={row.category || ""}
            onChange={(e) =>
              handleAssetChange(row.id, "category", e.target.value)
            }
            disabled={loading || !row.type}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          >
            <option value="">
              {row.type ? "Select Category..." : "Select Type First..."}
            </option>
            {Object.entries(categoryEnum).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        );
      },
    },

    weaponNumber: {
      label: "Weapon Number",
      render: (row) => (
        <>
          <button
            onClick={() =>
              setOpenLookupModal({
                isOpen: true,
                rowId: row.id,
                serialNumbers: row.serialNumbers,
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Manage Serial Number
          </button>

          {row.serialNumbers && row.serialNumbers.length > 0 && (
            <div className="mt-1 text-xs text-gray-600">
              {row.serialNumbers.length} records
            </div>
          )}
        </>
      ),
    },

    registerNumber: {
      label: "Register Number",
      render: (row) => (
        <>
          <button
            onClick={() =>
              setOpenLookupModal({
                isOpen: true,
                rowId: row.id,
                serialNumbers: row.serialNumbers,
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Manage Serial Number
          </button>

          {row.serialNumbers && row.serialNumbers.length > 0 && (
            <div className="mt-1 text-sm text-blue-500 font-semibold">
              {row.serialNumbers.length} records
            </div>
          )}
        </>
      ),
    },
    chassiNumber: {
      label: "Chassis Number",
      render: (row) => (
        <input
          type="text"
          value={row.chassiNumber || ""}
          onChange={(e) =>
            handleAssetChange(row.id, "chassiNumber", e.target.value)
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter chassis number"
        />
      ),
    },
    engineNumber: {
      label: "Engine Number",
      render: (row) => (
        <input
          type="text"
          value={row.engineNumber || ""}
          onChange={(e) =>
            handleAssetChange(row.id, "engineNumber", e.target.value)
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Enter engine number"
        />
      ),
    },
    model: {
      label: "Model",
      render: (row) => (
        <input
          type="text"
          value={row.model || ""}
          onChange={(e) => handleAssetChange(row.id, "model", e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Model year"
        />
      ),
    },
    make: {
      label: "Make",
      render: (row) => (
        <input
          type="text"
          value={row.make || ""}
          onChange={(e) => handleAssetChange(row.id, "make", e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="Make"
        />
      ),
    },
    color: {
      label: "Color",
      render: (row) => (
        <input
          type="text"
          value={row.color || ""}
          onChange={(e) => handleAssetChange(row.id, "color", e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[100px]"
          placeholder="Color"
        />
      ),
    },

    purchaseDate: {
      label: "Purchase Date",
      render: (row) => (
        <input
          type="date"
          value={row.purchaseDate || ""}
          onChange={(e) =>
            handleAssetChange(row.id, "purchaseDate", e.target.value)
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
        />
      ),
    },
    cost: {
      label: "Cost",
      render: (row) => (
        <input
          type="number"
          value={row.cost || ""}
          onChange={(e) => handleAssetChange(row.id, "cost", e.target.value)}
          disabled={loading}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[120px]"
          placeholder="0.00"
        />
      ),
    },
    supplier: {
      label: "Supplier",
      render: (row) => (
        <input
          type="text"
          value={row.supplier || ""}
          onChange={(e) =>
            handleAssetChange(row.id, "supplier", e.target.value)
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[150px]"
          placeholder="Supplier name"
        />
      ),
    },
    assetStatus: {
      label: "Asset Status",
      render: (row) => (
        <select
          value={row.assetStatus || ""}
          onChange={(e) =>
            handleAssetChange(row.id, "assetStatus", e.target.value)
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[140px]"
        >
          <option value="">Select Status...</option>
          {Object.entries(assetStatusEnum).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ),
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
      ),
    },
    additionalInfo: {
      label: "Additional Info",
      render: (row) => (
        <textarea
          value={row.additionalInfo || ""}
          onChange={(e) =>
            handleAssetChange(row.id, "additionalInfo", e.target.value)
          }
          disabled={loading}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 min-w-[200px]"
          placeholder="Additional information..."
        />
      ),
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-visible mb-10 relative">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Asset Details</h3>
        <button
          onClick={onAddRow}
          disabled={loading}
          className="fixed top-24 right-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors shadow-lg z-50"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {visibleHeaders.map((field) => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
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
                  {visibleHeaders.map((field) => {
                    const shouldShowField = rowFields.includes(field);

                    return (
                      <td key={field} className="px-6 py-4">
                        {shouldShowField ? (
                          fieldConfig[field]?.render(row) || (
                            <span className="text-gray-400">-</span>
                          )
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
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div>
        {openLookupModal.isOpen && (
          <SerialNumberModal
            isOpen={openLookupModal.isOpen}
            serialNumbers={openLookupModal.serialNumbers}
            onClose={handleCloseLookupModal}
            onSuccess={(response) => {
              const savedWeapons =
                response.data?.map((item) => item.name) || [];
              onAssetChange(
                openLookupModal.rowId,
                "serialNumbers",
                savedWeapons
              );

              handleCloseLookupModal();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BulkAssetRows;
