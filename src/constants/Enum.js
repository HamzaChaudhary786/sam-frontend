export const lookupEnum = [
  "cast",
  "employeeServicesStatus",
  "grades",
  "rank",
  "designation",
  "stationTehsil",
  "stationDistrict",
  "stationStatus",
  "stationFacilities",
  "deductionType",
  "achievementType",
  "assetStatus",
  "assetTypes",
  "training"

];
// export const employeeUserTypes = ["admin", "employeeAdmin", "employeeIncharge", "employeeClerk", "assetAdmin", "assetIncharge", "assetClerk", "stationAdmin", "stationIncharge", "stationClerk", "auditAdmin", "auditIncharge", "auditClerk", "lookupAdmin", "lookupIncharge", "lookupClerk","userAdmin", "userIncharge", "userClerk"];

export const RESOURCE_ACCESS = {
  employee: ["admin", "employeeAdmin", "employeeIncharge", "employeeClerk"],
  asset: ["admin", "assetAdmin", "assetIncharge", "assetClerk"],
  station: ["admin", "stationAdmin", "stationIncharge", "stationClerk"],
  audit: ["admin", "auditAdmin", "auditIncharge", "auditClerk"],
  lookup: ["admin", "lookupAdmin", "lookupIncharge", "lookupClerk"],
  user: ["admin", "userAdmin", "userIncharge", "userClerk"],
};


// export const stationUserTypes = ["admin", "assetAdmin", "assetIncharge", "assetClerk"];
// export const assetUserTypes = ["admin", "stationAdmin", "stationIncharge", "stationClerk"];
// export const auditUserTypes = ["admin", "auditAdmin", "auditIncharge", "auditClerk"];
// export const lookupUserTypes = ["admin", "lookupAdmin", "lookupIncharge", "lookupClerk"];
// export const userUserTypes = ["admin", "userAdmin", "userIncharge", "userClerk"];

export const userTypes = ['admin','view_only', 'data_entry'];
export const role_data_entery = 'data_entry'
export const role_admin = 'admin'
export const role_view_only = 'view_only'
