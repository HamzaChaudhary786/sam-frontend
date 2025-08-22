// useEmployeeAssets.js - Corrected Hook based on your EmployeeAsset schema
import { useState, useEffect } from "react";
import { getAllAssetAssignments } from "../AssetAssignment/AssetApi.js";

export const useEmployeeAssets = (employees) => {
  const [employeeAssets, setEmployeeAssets] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAssetsForEmployee = async (employeeId) => {
    try {
      const result = await getAllAssetAssignments({ employee: employeeId });
      
      console.log("🔎 Raw assets API response for employee:", employeeId, result);
      
      if (result.success && result.data) {
        // Filter only active assets based on your schema
        const activeAssignments = result.data.filter(assignment => {
          // Based on your schema, check for active status
          const isActive = assignment.status === "Active" || 
                          assignment.status === "issued" ||
                          (!assignment.returnedDate && !assignment.consumedDate);
          
          // If onlyApproved is needed, check isApproved
          const isApproved = assignment.isApproved === true;
          
          return isActive && isApproved;
        });

        console.log("📋 Active assignments after filter:", activeAssignments);

        // Extract asset information
        const assetDescriptions = [];
        
        for (const assignment of activeAssignments) {
          if (assignment.asset && Array.isArray(assignment.asset)) {
            // Since asset is an array of ObjectIds that should be populated
            assignment.asset.forEach(asset => {
              if (asset) {
                let assetInfo = '';
                
                if (typeof asset === 'object' && asset.name) {
                  // If asset is populated with full object
                  assetInfo = asset.name;
                  
                  // Add asset type if available
                  if (asset.type || asset.assetType) {
                    assetInfo += ` (${asset.type || asset.assetType})`;
                  }
                  
                  // Add serial number if available
                  if (asset.serialNumber) {
                    assetInfo += ` - ${asset.serialNumber}`;
                  }
                } else if (typeof asset === 'string') {
                  // If asset is just an ID string, use assignment info
                  assetInfo = `Asset: ${asset}`;
                } else if (asset._id) {
                  // If asset has _id but no name, use ID
                  assetInfo = `Asset: ${asset._id}`;
                }
                
                // Add assignment date if available
                if (assignment.assignedDate) {
                  const date = new Date(assignment.assignedDate).toLocaleDateString();
                  assetInfo += ` (Assigned: ${date})`;
                }
                
                // Add condition if available
                if (assignment.condition) {
                  assetInfo += ` - ${assignment.condition}`;
                }
                
                if (assetInfo.trim()) {
                  assetDescriptions.push(assetInfo.trim());
                }
              }
            });
          }
        }

        console.log("🏗️ Final asset descriptions:", assetDescriptions);
        return assetDescriptions;
      }
      return [];
    } catch (error) {
      console.error(`❌ Error fetching assets for employee ${employeeId}:`, error);
      return [];
    }
  };

  const fetchAllEmployeeAssets = async () => {
    if (!employees || employees.length === 0) return;

    setLoading(true);
    const assetsMap = {};

    try {
      // Process employees in smaller batches
      const batchSize = 3; // Small batch size
      
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        const promises = batch.map(async (employee) => {
          if (employee && employee._id) {
            const assets = await fetchAssetsForEmployee(employee._id);
            return { employeeId: employee._id, assets };
          }
          return { employeeId: null, assets: [] };
        });

        const results = await Promise.all(promises);
        
        // Process results
        results.forEach(({ employeeId, assets }) => {
          if (employeeId) {
            assetsMap[employeeId] = assets;
          }
        });

        // Add delay between batches
        if (i + batchSize < employees.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log("📦 Final assets map:", assetsMap);
      setEmployeeAssets(assetsMap);
    } catch (error) {
      console.error("❌ Error fetching employee assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employees && employees.length > 0) {
      console.log("🚀 Starting to fetch assets for employees:", employees.length);
      fetchAllEmployeeAssets();
    } else {
      console.log("📭 No employees provided, clearing assets");
      setEmployeeAssets({});
    }
  }, [employees]);

  const getEmployeeAssets = (employeeId) => {
    return employeeAssets[employeeId] || [];
  };

  const getEmployeeAssetsString = (employeeId) => {
    const assets = getEmployeeAssets(employeeId);
    if (assets.length === 0) {
      return "No assets assigned";
    }
    // Limit the display to avoid very long strings
    if (assets.length > 3) {
      return `${assets.slice(0, 3).join(", ")} (+${assets.length - 3} more)`;
    }
    return assets.join(", ");
  };

  const getEmployeeAssetCount = (employeeId) => {
    return getEmployeeAssets(employeeId).length;
  };

  const getEmployeeAssetsShort = (employeeId) => {
    const assets = getEmployeeAssets(employeeId);
    if (assets.length === 0) {
      return "None";
    }
    return `${assets.length} asset${assets.length > 1 ? 's' : ''}`;
  };

  return {
    employeeAssets,
    loading,
    getEmployeeAssets,
    getEmployeeAssetsString,
    getEmployeeAssetCount,
    getEmployeeAssetsShort,
    refreshEmployeeAssets: fetchAllEmployeeAssets
  };
};