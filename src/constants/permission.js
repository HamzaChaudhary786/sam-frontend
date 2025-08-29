
// ====================================
// 📁 src/utils/permissions.js
// ====================================
// Create this new file in your src/utils folder

/**
 * Extract all resources a user has access to from their roles
 */
export function getUserAccessibleResources(userData) {
  console.log('🔍 DEBUG: Starting getUserAccessibleResources');
  console.log('📝 Input userData:', userData);
  
  if (!userData?.roles) {
    console.log('❌ No roles found');
    return new Set();
  }
  
  const accessibleResources = new Set();
  
  userData.roles.forEach(role => {
    console.log('🏷️ Processing role:', role.name);
    
    if (role.accessRequirement) {
      role.accessRequirement.forEach(access => {
        console.log('📄 Checking access for:', access.resourceName);
        console.log('🔐 Permissions:', {
          canView: access.canView,
          canAdd: access.canAdd,
          canEdit: access.canEdit,
          canDelete: access.canDelete,
          canApprove: access.canApprove,
          canPrint: access.canPrint
        });
        
        // Check if user has any permission
        const hasAnyPermission = Object.entries(access)
          .filter(([key]) => key.startsWith('can'))
          .some(([, value]) => value === true);
          
        console.log('✅ Has any permission:', hasAnyPermission);
        
        if (hasAnyPermission) {
          const resourceName = access.resourceName.toLowerCase();
          console.log('✨ Adding resource:', resourceName);
          accessibleResources.add(resourceName);
        }
      });
    }
  });
  
  console.log('🎉 Final accessible resources:', Array.from(accessibleResources));
  return accessibleResources;
}

/**
 * Check if user has access to a specific resource
 */
export function hasResourceAccess(userData, resourceName) {
  const accessibleResources = getUserAccessibleResources(userData);
  return accessibleResources.has(resourceName.toLowerCase());
}

/**
 * Get specific permission for a resource
 */
export function hasPermission(userData, resourceName, permission) {
  if (!userData?.roles) return false;
  
  for (const role of userData.roles) {
    if (role.accessRequirement) {
      for (const access of role.accessRequirement) {
        if (access.resourceName.toLowerCase() === resourceName.toLowerCase()) {
          if (access[permission] === true) return true;
        }
      }
    }
  }
  return false;
}

/**
 * Get user data from localStorage
 */
export function getUserData() {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
}

// Resource constants
export const RESOURCES = {
  EMPLOYEE: 'employee',
  STATION: 'station', 
  ASSET: 'asset',
  AUDIT: 'audit',
  LOOKUP: 'lookup',
  USER: 'users' // Note: your DB uses 'users'
};

// Permission constants
export const PERMISSIONS = {
  VIEW: 'canView',
  ADD: 'canAdd',
  EDIT: 'canEdit',
  DELETE: 'canDelete',
  APPROVE: 'canApprove',
  PRINT: 'canPrint'
};
