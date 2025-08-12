// useEmployeeAssets.js - Corrected Hook to match your API response
import { useState, useEffect } from "react";
import { getAllAssetAssignments } from "../AssetAssignment/AssetApi.js";

export const useEmployeeAssets = (employees) => {
  const [employeeAssets, setEmployeeAssets] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAssetsForEmployee = async (employeeId) => {
    try {
      const result = await getAllAssetAssignments({ employee: employeeId });
      
      if (result.success && result.data) {
        // Filter only active (approved, non-consumed, non-returned) assets
        const activeAssignments = result.data.filter(assignment => 
          assignment.isApproved && 
          assignment.status === "Active" &&
          !assignment.consumedDate && 
          !assignment.returnedDate
        );

        // Extract asset names from the corrected structure
        const assetNames = [];
        activeAssignments.forEach(assignment => {
          // Your API returns 'asset' array, not 'assets'
          if (assignment.asset && Array.isArray(assignment.asset)) {
            assignment.asset.forEach(asset => {
              if (asset && asset.name) {
                assetNames.push(asset.name);
              }
            });
          }
        });

        return assetNames;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching assets for employee ${employeeId}:`, error);
      return [];
    }
  };

  const fetchAllEmployeeAssets = async () => {
    if (!employees || employees.length === 0) return;

    setLoading(true);
    const assetsMap = {};

    try {
      // Fetch assets for all employees in parallel (but limit concurrent requests)
      const batchSize = 10; // Process 10 employees at a time to avoid overwhelming the API
      
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        const promises = batch.map(async (employee) => {
          const assets = await fetchAssetsForEmployee(employee._id);
          assetsMap[employee._id] = assets;
        });

        await Promise.all(promises);
      }

      setEmployeeAssets(assetsMap);
    } catch (error) {
      console.error("Error fetching employee assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employees && employees.length > 0) {
      fetchAllEmployeeAssets();
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
    return assets.join(", ");
  };

  const getEmployeeAssetCount = (employeeId) => {
    return getEmployeeAssets(employeeId).length;
  };

  return {
    employeeAssets,
    loading,
    getEmployeeAssets,
    getEmployeeAssetsString,
    getEmployeeAssetCount,
    refreshEmployeeAssets: fetchAllEmployeeAssets
  };
};