// Employee Status History Types
export const HISTORY_STATUS_ENUM = {
  ACTIVE: 'active',
  RETIRED: 'retired',
  TERMINATED: 'terminated',
  DISMISSED: 'dismissed',
};

// Status Display Names
export const HISTORY_STATUS_DISPLAY = {
  [HISTORY_STATUS_ENUM.ACTIVE]: 'Active',
  [HISTORY_STATUS_ENUM.RETIRED]: 'Retired',
  [HISTORY_STATUS_ENUM.TERMINATED]: 'Terminated',
  [HISTORY_STATUS_ENUM.DISMISSED]: 'Dismissed'
};

// Status Options for Dropdown
export const HISTORY_STATUS_OPTIONS = [
  { value: HISTORY_STATUS_ENUM.ACTIVE, label: 'Active' },
  { value: HISTORY_STATUS_ENUM.RETIRED, label: 'Retired' },
  { value: HISTORY_STATUS_ENUM.TERMINATED, label: 'Terminated' },
  { value: HISTORY_STATUS_ENUM.DISMISSED, label: 'Dismissed' }
];

// Asset History Action Types
export const ASSET_ACTION_ENUM = {
  ALLOCATED: 'allocated',
  DEALLOCATED: 'deallocated',
  TRANSFERRED: 'transferred',
  RETURNED: 'returned'
};

// Asset Action Display Names
export const ASSET_ACTION_DISPLAY = {
  [ASSET_ACTION_ENUM.ALLOCATED]: 'Allocated',
  [ASSET_ACTION_ENUM.DEALLOCATED]: 'Deallocated',
  [ASSET_ACTION_ENUM.TRANSFERRED]: 'Transferred',
  [ASSET_ACTION_ENUM.RETURNED]: 'Returned'
};

// Asset Action Options for Dropdown
export const ASSET_ACTION_OPTIONS = [
  { value: ASSET_ACTION_ENUM.ALLOCATED, label: 'Allocated' },
  { value: ASSET_ACTION_ENUM.DEALLOCATED, label: 'Deallocated' },
  { value: ASSET_ACTION_ENUM.TRANSFERRED, label: 'Transferred' },
  { value: ASSET_ACTION_ENUM.RETURNED, label: 'Returned' }
];

// Station History Action Types
export const STATION_ACTION_ENUM = {
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  TRANSFERRED: 'transferred',
  RELIEVED: 'relieved'
};

// Station Action Display Names
export const STATION_ACTION_DISPLAY = {
  [STATION_ACTION_ENUM.ASSIGNED]: 'Assigned',
  [STATION_ACTION_ENUM.UNASSIGNED]: 'Unassigned',
  [STATION_ACTION_ENUM.TRANSFERRED]: 'Transferred',
  [STATION_ACTION_ENUM.RELIEVED]: 'Relieved'
};

// Station Action Options for Dropdown
export const STATION_ACTION_OPTIONS = [
  { value: STATION_ACTION_ENUM.ASSIGNED, label: 'Assigned' },
  { value: STATION_ACTION_ENUM.UNASSIGNED, label: 'Unassigned' },
  { value: STATION_ACTION_ENUM.TRANSFERRED, label: 'Transferred' },
  { value: STATION_ACTION_ENUM.RELIEVED, label: 'Relieved' }
];

// History Types
export const HISTORY_TYPES = {
  STATUS: 'status',
  ASSET: 'asset',
  STATION: 'station'
};

// History Type Display Names
export const HISTORY_TYPE_DISPLAY = {
  [HISTORY_TYPES.STATUS]: 'Employee Status History',
  [HISTORY_TYPES.ASSET]: 'Asset History',
  [HISTORY_TYPES.STATION]: 'Station/Posting History'
};

// History Type Options for Tab/Button Navigation
export const HISTORY_TYPE_OPTIONS = [
  { 
    value: HISTORY_TYPES.STATUS, 
    label: 'Status History',
    icon: '👤',
    description: 'Track employee status changes (Active, Retired, etc.)'
  },
  { 
    value: HISTORY_TYPES.ASSET, 
    label: 'Asset History',
    icon: '💻',
    description: 'Track asset allocations and transfers'
  },
  { 
    value: HISTORY_TYPES.STATION, 
    label: 'Station History',
    icon: '📍',
    description: 'Track station/posting assignments'
  }
];