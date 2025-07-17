// Asset Type Enum
export const ASSET_TYPE_ENUM = {
  VEHICLES: 'vehicles',
  WEAPONS: 'weapons'
};

// Asset Type Display Names
export const ASSET_TYPE_DISPLAY = {
  [ASSET_TYPE_ENUM.VEHICLES]: 'Vehicles',
  [ASSET_TYPE_ENUM.WEAPONS]: 'Weapons'
};

// Asset Type Options for Dropdown
export const ASSET_TYPE_OPTIONS = [
  { value: ASSET_TYPE_ENUM.VEHICLES, label: 'Vehicles' },
  { value: ASSET_TYPE_ENUM.WEAPONS, label: 'Weapons' }
];