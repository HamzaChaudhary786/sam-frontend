// ====================================
// 📁 src/hooks/usePermissions.js  
// ====================================
// Create this new file in your src/hooks folder

import {
  getUserData,
  getUserAccessibleResources,
  hasResourceAccess,
  hasPermission,
  RESOURCES
} from '../constants/permission';

/**
 * Custom hook for user permissions
 */
export function usePermissions() {
  console.log('🚀 usePermissions hook called');

  const userData = getUserData();
  console.log('👤 User data:', userData);

  if (!userData) {
    console.log('❌ No user data found');
    return {
      hasEmployeeAccess: false,
      hasStationAccess: false,
      hasAssetAccess: false,
      hasAuditAccess: false,
      hasLookupAccess: false,
      hasUserAccess: false,
      hasInsertAccess: false,
      hasAssignAsset: false,
      hasAccess: () => false,
      canDo: () => false,
      allResources: [],
      userData: null,
      isAdmin: false
    };
  }

  const accessibleResources = getUserAccessibleResources(userData);
  const permissions = {
    // Resource access checks
    hasEmployeeAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.EMPLOYEE),
    hasStationAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.STATION),
    hasAssetAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.ASSET),
    hasAuditAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.AUDIT),
    hasLookupAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.LOOKUP),
    hasUserAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.USER),
    hasInsertAssetAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.INSERT_ASSET),
    hasAssignAssetAccess: userData?.userType === 'admin' ? true : accessibleResources.has(RESOURCES.ASSIGN_ASSET),


    // Generic functions
    hasAccess: (resource) => hasResourceAccess(userData, resource),
    canDo: (resource, permission) => hasPermission(userData, resource, permission),

    // Utility
    allResources: Array.from(accessibleResources),
    userData,
    isAdmin: userData?.userType === 'admin'
  };

  return permissions;
}
