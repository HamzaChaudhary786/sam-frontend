// import React, { useState, useEffect } from "react";
// import { getDesignationsWithEnum } from "./AddEmployee/Designation.js";
// import { getGradesWithEnum } from "./AddEmployee/Grades.js";
// import { getCastsWithEnum } from "./AddEmployee/Cast.js";
// import { getRanksWithEnum } from "./AddEmployee/Rank.js";
// import {
//   getAllStationsWithoutPage,
//   getStations,
// } from "../Station/StationApi.js";
// import { getStationDistrictWithEnum } from "../Station/District.js";
// import { getStationLocationsWithEnum } from "../Station/lookUp.js";
// import { useLookupOptions } from "../../services/LookUp.js";
// import { STATUS_ENUM } from "./AddEmployee/EmployeeConstants";
// import { getStatusWithEnum } from "../Employee/AddEmployee/Status.js"; // ✅ import API function

// import { SearchableMultiSelect } from "./searchableMultiselect.jsx"; // 🆕 Import the new component
// import { MultiTextInput } from "./MultiTextInput"; // 🆕 Import the multi-text input component
// import { getEmployees, getEmployeesWithoutPagination } from "./EmployeeApi.js";

// // Add this after your imports
// const SERVICE_TYPE_ENUM = {
//   FEDERAL: "federal",
//   PROVINCIAL: "provincial",
//   NA: "NA",
// };

// const EmployeeFilters = ({
//   filters,
//   updateFilters,
//   clearFilters,
//   showFilters,
//   setShowFilters,
// }) => {
//   // Filter dropdown options
//   const [designationEnum, setDesignationEnum] = useState([]);
//   const [gradeEnum, setGradeEnum] = useState([]);
//   const [castEnum, setCastEnum] = useState([]);
//   const [rankEnum, setRankEnum] = useState([]);
//   const [stationEnum, setStationEnum] = useState([]);
//   const [districtEnum, setDistrictEnum] = useState([]);
//   const [tehsilEnum, setTehsilEnum] = useState([]);
//   const [statusEnum, setStatusEnum] = useState([]);

//   // 🆕 Get asset type options using the lookup hook
//   const { options: assetTypeOptions } = useLookupOptions("assetTypes");

//   // 🆕 Convert asset type options to the format expected by SearchableMultiSelect
//   const assetTypeEnumOptions = assetTypeOptions.map((option) => ({
//     _id: option.value,
//     name: option.label,
//   }));

//   // 🆕 Convert SERVICE_TYPE_ENUM to options array
//   const serviceTypeOptions = Object.entries(SERVICE_TYPE_ENUM).map(
//     ([key, value]) => ({
//       _id: value,
//       name: key === "NA" ? "N/A" : key.charAt(0) + key.slice(1).toLowerCase(),
//     })
//   );

//   // 🆕 Convert STATUS_ENUM to options array
//   const statusOptions = Object.values(STATUS_ENUM).map((status) => ({
//     _id: status,
//     name: status.charAt(0).toUpperCase() + status.slice(1),
//   }));

//   // Loading states for debugging
//   const [loading, setLoading] = useState({
//     stations: false,
//     districts: false,
//     tehsils: false,
//   });
//   const [suggestions, setSuggestions] = useState({
//     name: [],
//     fatherName: [],
//     personalNumber: [],
//     cnic: [],
//   });

//   const [isSearching, setIsSearching] = useState({
//     name: false,
//     personalNumber: false,
//     cnic: false,
//   });

//   // ✅ COMPLETE FRONTEND FIX
//   // Replace your existing searchPersonalNumbers and searchCNICs functions with these:

//   const searchPersonalNumbers = async (query) => {
//     if (!query.trim() || query.length < 2) {
//       setSuggestions((prev) => ({ ...prev, personalNumber: [] }));
//       return;
//     }

//     setIsSearching((prev) => ({ ...prev, personalNumber: true }));

//     try {
//       // ✅ FIX: Use 'name' parameter instead of 'personalNumber'
//       // The backend's name search includes personalNumber in the $or query
//       const result = await getEmployeesWithoutPagination({
//         name: query, // This searches firstName, lastName, personalNumber, and cnic
//         limit: 10,
//       });

//       if (result.success) {
//         const employees = result.data.employees || result.data || [];

//         // ✅ Extract only personal numbers and filter them client-side
//         const personalNumbers = employees
//           .map((emp) => emp.personalNumber)
//           .filter(Boolean) // Remove null/undefined values
//           .filter((pNum) => pNum.toLowerCase().includes(query.toLowerCase())) // Only personal numbers that match our query
//           .slice(0, 10); // Limit suggestions

//         setSuggestions((prev) => ({
//           ...prev,
//           personalNumber: [...new Set(personalNumbers)], // Remove duplicates
//         }));
//       }
//     } catch (error) {
//       console.error("Error searching personal numbers:", error);
//     } finally {
//       setIsSearching((prev) => ({ ...prev, personalNumber: false }));
//     }
//   };

//   const searchCNICs = async (query) => {
//     if (!query.trim() || query.length < 3) {
//       setSuggestions((prev) => ({ ...prev, cnic: [] }));
//       return;
//     }

//     setIsSearching((prev) => ({ ...prev, cnic: true }));

//     try {
//       // ✅ FIX: Use 'name' parameter instead of 'cnic'
//       // The backend's name search includes cnic in the $or query
//       const result = await getEmployeesWithoutPagination({
//         name: query, // This searches firstName, lastName, personalNumber, and cnic
//         limit: 10,
//       });

//       if (result.success) {
//         const employees = result.data.employees || result.data || [];

//         // ✅ Extract only CNICs and filter them client-side
//         const cnics = employees
//           .map((emp) => emp.cnic)
//           .filter(Boolean) // Remove null/undefined values
//           .filter((cnic) => cnic.toLowerCase().includes(query.toLowerCase())) // Only CNICs that match our query
//           .slice(0, 10); // Limit suggestions

//         setSuggestions((prev) => ({
//           ...prev,
//           cnic: [...new Set(cnics)], // Remove duplicates
//         }));
//       }
//     } catch (error) {
//       console.error("Error searching CNICs:", error);
//     } finally {
//       setIsSearching((prev) => ({ ...prev, cnic: false }));
//     }
//   };

//   // ✅ Keep your name search as is (it's already working)
//   // ✅ Updated searchEmployeeNames function to include firstName, fatherFirstName, rank, and grade
//   const searchEmployeeNames = async (query) => {
//     if (!query.trim() || query.length < 2) {
//       setSuggestions((prev) => ({ ...prev, name: [] }));
//       return;
//     }

//     setIsSearching((prev) => ({ ...prev, name: true }));

//     try {
//       const result = await getEmployeesWithoutPagination({
//         name: query,
//         limit: 10,
//       });

//       if (result.success) {
//         const employees = result.data.employees || result.data || [];

//         // Create comprehensive name suggestions including firstName, fatherFirstName, rank, and grade
//         const names = employees
//           .map((emp) => {
//             const parts = [];

//             // Add firstName and lastName
//             if (emp.firstName) parts.push(emp.firstName.trim());
//             if (emp.lastName && emp.lastName.trim())
//               parts.push(emp.lastName.trim());

//             // Add fatherFirstName if available
//             if (emp.fatherFirstName && emp.fatherFirstName.trim()) {
//               parts.push(`(Father: ${emp.fatherFirstName.trim()})`);
//             }

//             // Add rank if available
//             if (emp.rank && emp.rank.trim()) {
//               parts.push(`[${emp.rank.trim()}]`);
//             }

//             // Add grade if available
//             if (emp.grade && emp.grade.trim()) {
//               parts.push(`Grade: ${emp.grade.trim()}`);
//             }

//             return parts.length > 0 ? parts.join(" ") : null;
//           })
//           .filter(Boolean); // Remove null/empty entries

//         setSuggestions((prev) => ({
//           ...prev,
//           name: [...new Set(names)], // Remove duplicates
//         }));
//       }
//     } catch (error) {
//       console.error("Error searching employee names:", error);
//     } finally {
//       setIsSearching((prev) => ({ ...prev, name: false }));
//     }
//   };

//   // 🆕 Updated filter state to handle arrays for multi-select and multi-text inputs
//   const [filterForm, setFilterForm] = useState({
//     name: Array.isArray(filters.name)
//       ? filters.name
//       : filters.name
//       ? [filters.name]
//       : [],
//     address: Array.isArray(filters.address)
//       ? filters.address
//       : filters.address
//       ? [filters.address]
//       : [],
//     cast: Array.isArray(filters.cast)
//       ? filters.cast
//       : filters.cast
//       ? [filters.cast]
//       : [],
//     rank: Array.isArray(filters.rank)
//       ? filters.rank
//       : filters.rank
//       ? [filters.rank]
//       : [],
//     station: Array.isArray(filters.station)
//       ? filters.station
//       : filters.station
//       ? [filters.station]
//       : [],
//     district: Array.isArray(filters.district)
//       ? filters.district
//       : filters.district
//       ? [filters.district]
//       : [],
//     tehsil: Array.isArray(filters.tehsil)
//       ? filters.tehsil
//       : filters.tehsil
//       ? [filters.tehsil]
//       : [],
//     status: Array.isArray(filters.status)
//       ? filters.status
//       : filters.status
//       ? [filters.status]
//       : [],
//     designation: Array.isArray(filters.designation)
//       ? filters.designation
//       : filters.designation
//       ? [filters.designation]
//       : [],
//     grade: Array.isArray(filters.grade)
//       ? filters.grade
//       : filters.grade
//       ? [filters.grade]
//       : [],
//     personalNumber: Array.isArray(filters.personalNumber)
//       ? filters.personalNumber
//       : filters.personalNumber
//       ? [filters.personalNumber]
//       : [],
//     cnic: Array.isArray(filters.cnic)
//       ? filters.cnic
//       : filters.cnic
//       ? [filters.cnic]
//       : [],
//     assetType: Array.isArray(filters.assetType)
//       ? filters.assetType
//       : filters.assetType
//       ? [filters.assetType]
//       : [],
//     serviceType: Array.isArray(filters.serviceType)
//       ? filters.serviceType
//       : filters.serviceType
//       ? [filters.serviceType]
//       : [],
//     serialNumber: Array.isArray(filters.serialNumber)
//       ? filters.serialNumber
//       : filters.serialNumber
//       ? [filters.serialNumber]
//       : [],
//     fromDOB: filters.fromDOB || "",
//     toDOB: filters.toDOB || "",
//   });

//   // Separate function to fetch stations
//   const fetchStationsWithoutPage = async () => {
//     setLoading((prev) => ({ ...prev, stations: true }));
//     try {
//       const response = await getAllStationsWithoutPage();
//       let allStations = [];

//       if (response && response.success && response.data) {
//         allStations = response.data.result || [];
//       }

//       const stationArray = allStations.map((station) => ({
//         _id: station._id,
//         name: `${station.name} ${station.tehsil}`, // Include address for better clarity
//       }));

//       setStationEnum(stationArray);
//     } catch (error) {
//       console.error("💥 Error fetching stations:", error);
//       setStationEnum([]);
//     }
//     setLoading((prev) => ({ ...prev, stations: false }));
//   };

//   // Separate function to fetch districts
//   const fetchDistricts = async () => {
//     setLoading((prev) => ({ ...prev, districts: true }));
//     try {
//       const districtRes = await getStationDistrictWithEnum();
//       if (districtRes && districtRes.success && districtRes.data) {
//         const districtArray = Object.entries(districtRes.data).map(
//           ([_id, name]) => ({ _id, name })
//         );
//         setDistrictEnum(districtArray);
//       } else {
//         console.error("❌ Invalid district response:", districtRes);
//         setDistrictEnum([]);
//       }
//     } catch (error) {
//       console.error("💥 Error fetching districts:", error);
//       setDistrictEnum([]);
//     }
//     setLoading((prev) => ({ ...prev, districts: false }));
//   };

//   // Separate function to fetch tehsils
//   const fetchTehsils = async () => {
//     setLoading((prev) => ({ ...prev, tehsils: true }));
//     try {
//       const tehsilRes = await getStationLocationsWithEnum();

//       if (tehsilRes && tehsilRes.success && tehsilRes.data) {
//         const tehsilArray = Object.entries(tehsilRes.data).map(
//           ([_id, name]) => ({ _id, name })
//         );
//         setTehsilEnum(tehsilArray);
//       } else {
//         console.error("❌ Invalid tehsil response:", tehsilRes);
//         setTehsilEnum([]);
//       }
//     } catch (error) {
//       console.error("💥 Error fetching tehsils:", error);
//       setTehsilEnum([]);
//     }
//     setLoading((prev) => ({ ...prev, tehsils: false }));
//   };

//   // Fetch dropdown options for filters
//   useEffect(() => {
//     const fetchFilterOptions = async () => {
//       try {
//         console.log("🔄 Starting to fetch all filter options...");

//         // Fetch existing options (these should work)

//         const [desigRes, gradeRes, castRes, rankRes, statusRes] =
//           await Promise.all([
//             getDesignationsWithEnum(),
//             getGradesWithEnum(),
//             getCastsWithEnum(),
//             getRanksWithEnum(),
//             getStatusWithEnum(),
//           ]);

//         // Process existing responses
//         if (desigRes.success && desigRes.data) {
//           const designationArray = Object.entries(desigRes.data).map(
//             ([_id, name]) => ({ _id, name })
//           );
//           setDesignationEnum(designationArray);
//         }

//         if (gradeRes.success && gradeRes.data) {
//           const gradeArray = Object.entries(gradeRes.data).map(
//             ([_id, name]) => ({ _id, name })
//           );
//           setGradeEnum(gradeArray);
//         }

//         if (castRes.success && castRes.data) {
//           const castArray = Object.entries(castRes.data).map(([_id, name]) => ({
//             _id,
//             name,
//           }));
//           setCastEnum(castArray);
//         }

//         if (rankRes.success && rankRes.data) {
//           const rankArray = Object.entries(rankRes.data).map(([_id, name]) => ({
//             _id,
//             name,
//           }));
//           setRankEnum(rankArray);
//         }
//         if (statusRes.success && statusRes.data) {
//           const statusArray = Object.entries(statusRes.data).map(
//             ([_id, name]) => ({
//               _id,
//               name,
//             })
//           );
//           setStatusEnum(statusArray);
//         }

//         // Fetch stations
//         await fetchStationsWithoutPage();

//         // Fetch districts
//         await fetchDistricts();

//         // Fetch tehsils
//         await fetchTehsils();
//       } catch (error) {
//         console.error("💥 Error in main fetchFilterOptions:", error);
//       }
//     };

//     fetchFilterOptions();
//   }, []);

//   // Update filterForm when filters prop changes
//   useEffect(() => {
//     setFilterForm({
//       name: Array.isArray(filters.name)
//         ? filters.name
//         : filters.name
//         ? [filters.name]
//         : [],
//       address: Array.isArray(filters.address)
//         ? filters.address
//         : filters.address
//         ? [filters.address]
//         : [],
//       cast: Array.isArray(filters.cast)
//         ? filters.cast
//         : filters.cast
//         ? [filters.cast]
//         : [],
//       rank: Array.isArray(filters.rank)
//         ? filters.rank
//         : filters.rank
//         ? [filters.rank]
//         : [],
//       station: Array.isArray(filters.station)
//         ? filters.station
//         : filters.station
//         ? [filters.station]
//         : [],
//       district: Array.isArray(filters.district)
//         ? filters.district
//         : filters.district
//         ? [filters.district]
//         : [],
//       tehsil: Array.isArray(filters.tehsil)
//         ? filters.tehsil
//         : filters.tehsil
//         ? [filters.tehsil]
//         : [],
//       status: Array.isArray(filters.status)
//         ? filters.status
//         : filters.status
//         ? [filters.status]
//         : [],
//       designation: Array.isArray(filters.designation)
//         ? filters.designation
//         : filters.designation
//         ? [filters.designation]
//         : [],
//       grade: Array.isArray(filters.grade)
//         ? filters.grade
//         : filters.grade
//         ? [filters.grade]
//         : [],
//       personalNumber: Array.isArray(filters.personalNumber)
//         ? filters.personalNumber
//         : filters.personalNumber
//         ? [filters.personalNumber]
//         : [],
//       cnic: Array.isArray(filters.cnic)
//         ? filters.cnic
//         : filters.cnic
//         ? [filters.cnic]
//         : [],
//       assetType: Array.isArray(filters.assetType)
//         ? filters.assetType
//         : filters.assetType
//         ? [filters.assetType]
//         : [],
//       serviceType: Array.isArray(filters.serviceType)
//         ? filters.serviceType
//         : filters.serviceType
//         ? [filters.serviceType]
//         : [],
//       serialNumber: Array.isArray(filters.serialNumber)
//         ? filters.serialNumber
//         : filters.serialNumber
//         ? [filters.serialNumber]
//         : [],
//       fromDOB: filters.fromDOB || "",
//       toDOB: filters.toDOB || "",
//     });
//   }, [filters]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilterForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // 🆕 Updated handleApplyFilters to handle arrays for all text inputs
//   const handleApplyFilters = () => {
//     const activeFilters = {};
//     if (filterForm.name.length > 0) activeFilters.name = filterForm.name;
//     if (filterForm.address.length > 0)
//       activeFilters.address = filterForm.address;
//     if (filterForm.cast.length > 0) activeFilters.cast = filterForm.cast;
//     if (filterForm.rank.length > 0) activeFilters.rank = filterForm.rank;
//     if (filterForm.station.length > 0)
//       activeFilters.station = filterForm.station;
//     if (filterForm.district.length > 0)
//       activeFilters.district = filterForm.district;
//     if (filterForm.tehsil.length > 0) activeFilters.tehsil = filterForm.tehsil;
//     if (filterForm.status.length > 0) activeFilters.status = filterForm.status;
//     if (filterForm.designation.length > 0)
//       activeFilters.designation = filterForm.designation;
//     if (filterForm.grade.length > 0) activeFilters.grade = filterForm.grade;
//     if (filterForm.personalNumber.length > 0)
//       activeFilters.personalNumber = filterForm.personalNumber;
//     if (filterForm.cnic.length > 0) activeFilters.cnic = filterForm.cnic;
//     if (filterForm.assetType.length > 0)
//       activeFilters.assetType = filterForm.assetType;
//     if (filterForm.serviceType.length > 0)
//       activeFilters.serviceType = filterForm.serviceType;
//     if (filterForm.fromDOB && filterForm.fromDOB.trim() !== "")
//       activeFilters.fromDOB = filterForm.fromDOB;
//     if (filterForm.toDOB && filterForm.toDOB.trim() !== "")
//       activeFilters.toDOB = filterForm.toDOB;
//     if (filterForm.serialNumber.length > 0)
//       activeFilters.serialNumber = filterForm.serialNumber;
//     updateFilters(activeFilters);
//     setShowFilters(false);
//   };

//   // 🆕 Updated handleClearFilters to reset arrays for all text inputs
//   const handleClearFilters = () => {
//     setFilterForm({
//       name: [],
//       address: [],
//       cast: [],
//       rank: [],
//       station: [],
//       district: [],
//       tehsil: [],
//       status: [],
//       designation: [],
//       grade: [],
//       personalNumber: [],
//       cnic: [],
//       assetType: [],
//       serviceType: [],
//       serialNumber: [],
//       fromDOB: null,
//       toDOB: null,
//     });
//     clearFilters();
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleApplyFilters();
//     }
//   };

//   return (
//     <>
//       {/* Mobile Filter Toggle Button */}
//       <div className="xl:hidden mb-4">
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
//         >
//           <span className="text-sm font-medium text-gray-700">
//             Filter Employees
//             {Object.keys(filters).length > 0 && (
//               <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
//                 {Object.keys(filters).length}
//               </span>
//             )}
//           </span>
//           <svg
//             className={`w-5 h-5 text-gray-500 transition-transform ${
//               showFilters ? "rotate-180" : ""
//             }`}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M19 9l-7 7-7-7"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Filter Section - Responsive */}
//       <div
//         className={`bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ${
//           showFilters || window.innerWidth >= 1280 ? "block" : "hidden xl:block"
//         }`}
//       >
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-base sm:text-lg font-medium text-gray-900">
//             Filter Employees
//           </h3>
//           {/* Active filter count */}
//           {Object.keys(filters).length > 0 && (
//             <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
//               {Object.keys(filters).length} active filter
//               {Object.keys(filters).length !== 1 ? "s" : ""}
//             </span>
//           )}
//         </div>

//         {/* Filter Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//           {/* 🆕 Name Filter - Now MultiTextInput */}
//           <MultiTextInput
//             label="Name"
//             name="name"
//             value={filterForm.name}
//             onChange={handleFilterChange}
//             placeholder="Type employee name..."
//             minLength={2}
//             maxLength={50}
//             enableSuggestions={true}
//             onSearch={searchEmployeeNames}
//             suggestions={suggestions.name}
//             isSearching={isSearching.name}
//             searchPlaceholder="Type to search employee names..."
//             emptyMessage="No employee names found"
//             minSearchLength={2}
//             onSuggestionSelect={(suggestion) => suggestion}
//           />

//           {/* 🆕 Address Filter - Now MultiTextInput */}
//           <MultiTextInput
//             label="Address"
//             name="address"
//             value={filterForm.address}
//             onChange={handleFilterChange}
//             placeholder="Type address and press Enter..."
//             minLength={3}
//             maxLength={100}
//           />

//           {/* 🆕 Tehsil Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Tehsil"
//             name="tehsil"
//             value={filterForm.tehsil}
//             onChange={handleFilterChange}
//             options={tehsilEnum}
//             placeholder="Select tehsils..."
//             loading={loading.tehsils}
//             searchPlaceholder="Search tehsils..."
//             emptyMessage="No tehsils found"
//             allowNA={true}
//           />

//           {/* 🆕 District Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="District"
//             name="district"
//             value={filterForm.district}
//             onChange={handleFilterChange}
//             options={districtEnum}
//             placeholder="Select districts..."
//             loading={loading.districts}
//             searchPlaceholder="Search districts..."
//             emptyMessage="No districts found"
//             allowNA={true}
//           />

//           {/* 🆕 Personal Number Filter - Now MultiTextInput */}
//           <MultiTextInput
//             label="Personal Number"
//             name="personalNumber"
//             value={filterForm.personalNumber}
//             onChange={handleFilterChange}
//             placeholder="Type personal number..."
//             minLength={3}
//             maxLength={20}
//             pattern={/^[A-Za-z0-9\-_]+$/}
//             patternMessage="Only letters, numbers, hyphens and underscores allowed"
//             enableSuggestions={true}
//             onSearch={searchPersonalNumbers}
//             suggestions={suggestions.personalNumber}
//             isSearching={isSearching.personalNumber}
//             searchPlaceholder="Type to search personal numbers..."
//             emptyMessage="No personal numbers found"
//             minSearchLength={2}
//             onSuggestionSelect={(suggestion) => suggestion}
//           />
//           <MultiTextInput
//             label="Serial Number"
//             name="serialNumber"
//             value={filterForm.serialNumber}
//             onChange={handleFilterChange}
//             placeholder="Weapon/Registration Number"
//             minLength={3}
//             maxLength={20}
//             enableSuggestions={false}
//           />

//           {/* 🆕 CNIC Filter - Now MultiTextInput */}
//           <MultiTextInput
//             label="CNIC"
//             name="cnic"
//             value={filterForm.cnic}
//             onChange={handleFilterChange}
//             placeholder="Type CNIC..."
//             minLength={13}
//             maxLength={15}
//             pattern={/^[0-9\-]+$/}
//             patternMessage="Only numbers and hyphens allowed"
//             enableSuggestions={true}
//             onSearch={searchCNICs}
//             suggestions={suggestions.cnic}
//             isSearching={isSearching.cnic}
//             searchPlaceholder="Type to search CNICs..."
//             emptyMessage="No CNICs found"
//             minSearchLength={3}
//             onSuggestionSelect={(suggestion) => suggestion}
//           />

//           {/* 🆕 Status Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Status"
//             name="status"
//             value={filterForm.status}
//             onChange={handleFilterChange}
//             options={statusEnum}
//             placeholder="Select status..."
//             loading={false}
//             searchPlaceholder="Search status..."
//             emptyMessage="No status found"
//             allowNA={true}
//           />

//           {/* 🆕 Designation Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Designation"
//             name="designation"
//             value={filterForm.designation}
//             onChange={handleFilterChange}
//             options={designationEnum}
//             placeholder="Select designations..."
//             loading={false}
//             searchPlaceholder="Search designations..."
//             emptyMessage="No designations found"
//             allowNA={true}
//           />

//           {/* 🆕 Grade Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Grade"
//             name="grade"
//             value={filterForm.grade}
//             onChange={handleFilterChange}
//             options={gradeEnum}
//             placeholder="Select grades..."
//             loading={false}
//             searchPlaceholder="Search grades..."
//             emptyMessage="No grades found"
//             allowNA={true}
//           />

//           {/* 🆕 Cast Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Cast"
//             name="cast"
//             value={filterForm.cast}
//             onChange={handleFilterChange}
//             options={castEnum}
//             placeholder="Select casts..."
//             loading={false}
//             searchPlaceholder="Search casts..."
//             emptyMessage="No casts found"
//             allowNA={true}
//           />

//           {/* 🆕 Rank Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Rank"
//             name="rank"
//             value={filterForm.rank}
//             onChange={handleFilterChange}
//             options={rankEnum}
//             placeholder="Select ranks..."
//             loading={false}
//             searchPlaceholder="Search ranks..."
//             emptyMessage="No ranks found"
//             allowNA={true}
//           />

//           {/* 🆕 Service Type Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Service Type"
//             name="serviceType"
//             value={filterForm.serviceType}
//             onChange={handleFilterChange}
//             options={serviceTypeOptions}
//             placeholder="Select service types..."
//             loading={false}
//             searchPlaceholder="Search service types..."
//             emptyMessage="No service types found"
//             allowNA={false} // NA is already included in the options
//           />

//           {/* Date of Birth Range Filter - Single Input */}
//           {/* From Date of Birth Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               From Date of Birth
//             </label>
//             <div className="relative">
//               <input
//                 type="text"
//                 name="fromDOB"
//                 value={filterForm.fromDOB || ""}
//                 onClick={() =>
//                   document.getElementById("fromDOBHelper").showPicker?.()
//                 }
//                 readOnly
//                 placeholder="Select from date..."
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer bg-white"
//               />
//               <input
//                 id="fromDOBHelper"
//                 type="date"
//                 className="absolute opacity-0 pointer-events-none"
//                 onChange={(e) => {
//                   setFilterForm((prev) => ({
//                     ...prev,
//                     fromDOB: e.target.value,
//                   }));
//                 }}
//               />
//               {filterForm.fromDOB && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setFilterForm((prev) => ({
//                       ...prev,
//                       fromDOB: "",
//                     }))
//                   }
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   ×
//                 </button>
//               )}
//             </div>
//             <div className="text-xs text-gray-500 mt-1">
//               Click to select start date
//             </div>
//           </div>

//           {/* To Date of Birth Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               To Date of Birth
//             </label>
//             <div className="relative">
//               <input
//                 type="text"
//                 name="toDOB"
//                 value={filterForm.toDOB || ""}
//                 onClick={() =>
//                   document.getElementById("toDOBHelper").showPicker?.()
//                 }
//                 readOnly
//                 placeholder="Select to date..."
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer bg-white"
//               />
//               <input
//                 id="toDOBHelper"
//                 type="date"
//                 className="absolute opacity-0 pointer-events-none"
//                 onChange={(e) => {
//                   setFilterForm((prev) => ({
//                     ...prev,
//                     toDOB: e.target.value,
//                   }));
//                 }}
//               />
//               {filterForm.toDOB && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setFilterForm((prev) => ({
//                       ...prev,
//                       toDOB: "",
//                     }))
//                   }
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   ×
//                 </button>
//               )}
//             </div>
//             <div className="text-xs text-gray-500 mt-1">
//               Click to select end date
//             </div>
//           </div>

//           {/* 🆕 Station Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Posting Station"
//             name="station"
//             value={filterForm.station}
//             onChange={handleFilterChange}
//             options={stationEnum}
//             placeholder="Select stations..."
//             loading={loading.stations}
//             searchPlaceholder="Search stations..."
//             emptyMessage="No stations found"
//             allowNA={true}
//           />

//           {/* 🆕 Asset Type Filter - Now SearchableMultiSelect */}
//           <SearchableMultiSelect
//             label="Asset Type"
//             name="assetType"
//             value={filterForm.assetType}
//             onChange={handleFilterChange}
//             options={assetTypeEnumOptions}
//             placeholder="Select asset types..."
//             loading={false}
//             searchPlaceholder="Search asset types..."
//             emptyMessage="No asset types found"
//             allowNA={true}
//           />
//         </div>

//         {/* Filter Action Buttons */}
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
//           <button
//             onClick={handleApplyFilters}
//             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
//           >
//             Apply Filters
//           </button>
//           <button
//             onClick={handleClearFilters}
//             className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
//           >
//             Clear Filters
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default EmployeeFilters;
import React, { useState, useEffect } from "react";
import { getDesignationsWithEnum } from "./AddEmployee/Designation.js";
import { getGradesWithEnum } from "./AddEmployee/Grades.js";
import { getCastsWithEnum } from "./AddEmployee/Cast.js";
import { getRanksWithEnum } from "./AddEmployee/Rank.js";
import {
  getAllStationsWithoutPage,
  getStations,
} from "../Station/StationApi.js";
import { getStationDistrictWithEnum } from "../Station/District.js";
import { getStationLocationsWithEnum } from "../Station/lookUp.js";
import { useLookupOptions } from "../../services/LookUp.js";
import { STATUS_ENUM } from "./AddEmployee/EmployeeConstants";
import { getStatusWithEnum } from "../Employee/AddEmployee/Status.js";
import { SearchableMultiSelect } from "./searchableMultiselect.jsx";
import { MultiTextInput } from "./MultiTextInput";
import { getEmployees, getEmployeesWithoutPagination } from "./EmployeeApi.js";
import { MultiTextInputField } from "../../commonComponents/MultiInputTextField.jsx";

// Service Type Enum
const SERVICE_TYPE_ENUM = {
  FEDERAL: "federal",
  PROVINCIAL: "provincial",
  NA: "NA",
};

const EmployeeFilters = ({
  filters,
  updateFilters,
  clearFilters,
  showFilters,
  setShowFilters,
}) => {
  // Filter dropdown options
  const [designationEnum, setDesignationEnum] = useState([]);
  const [gradeEnum, setGradeEnum] = useState([]);
  const [castEnum, setCastEnum] = useState([]);
  const [rankEnum, setRankEnum] = useState([]);
  const [stationEnum, setStationEnum] = useState([]);
  const [districtEnum, setDistrictEnum] = useState([]);
  const [tehsilEnum, setTehsilEnum] = useState([]);
  const [statusEnum, setStatusEnum] = useState([]);

  // Individual loading states for each filter field
  const [loading, setLoading] = useState({
    designations: false,
    grades: false,
    casts: false,
    ranks: false,
    stations: false,
    districts: false,
    tehsils: false,
    status: false,
    name: false,
    personalNumber: false,
    cnic: false,
    serialNumber: false,
  });

  // Suggestions for searchable text inputs
  const [suggestions, setSuggestions] = useState({
    name: [],
    personalNumber: [],
    cnic: [],
    serialNumber: [],
  });

  // Searching states for text inputs
  const [isSearching, setIsSearching] = useState({
    name: false,
    personalNumber: false,
    cnic: false,
    serialNumber: false,

  });

  // Asset type options using the lookup hook
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");

  // Convert asset type options to SearchableMultiSelect format
  const assetTypeEnumOptions = assetTypeOptions.map((option) => ({
    _id: option.value,
    name: option.label,
  }));

  // Convert SERVICE_TYPE_ENUM to options array
  const serviceTypeOptions = Object.entries(SERVICE_TYPE_ENUM).map(
    ([key, value]) => ({
      _id: value,
      name: key === "NA" ? "N/A" : key.charAt(0) + key.slice(1).toLowerCase(),
    })
  );

  // Convert STATUS_ENUM to options array
  const statusOptions = Object.values(STATUS_ENUM).map((status) => ({
    _id: status,
    name: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  // Filter form state
  const [filterForm, setFilterForm] = useState({
    name: Array.isArray(filters.name)
      ? filters.name
      : filters.name
        ? [filters.name]
        : [],
    address: Array.isArray(filters.address)
      ? filters.address
      : filters.address
        ? [filters.address]
        : [],
    cast: Array.isArray(filters.cast)
      ? filters.cast
      : filters.cast
        ? [filters.cast]
        : [],
    rank: Array.isArray(filters.rank)
      ? filters.rank
      : filters.rank
        ? [filters.rank]
        : [],
    station: Array.isArray(filters.station)
      ? filters.station
      : filters.station
        ? [filters.station]
        : [],
    district: Array.isArray(filters.district)
      ? filters.district
      : filters.district
        ? [filters.district]
        : [],
    tehsil: Array.isArray(filters.tehsil)
      ? filters.tehsil
      : filters.tehsil
        ? [filters.tehsil]
        : [],
    status: Array.isArray(filters.status)
      ? filters.status
      : filters.status
        ? [filters.status]
        : [],
    designation: Array.isArray(filters.designation)
      ? filters.designation
      : filters.designation
        ? [filters.designation]
        : [],
    grade: Array.isArray(filters.grade)
      ? filters.grade
      : filters.grade
        ? [filters.grade]
        : [],
    personalNumber: Array.isArray(filters.personalNumber)
      ? filters.personalNumber
      : filters.personalNumber
        ? [filters.personalNumber]
        : [],
    cnic: Array.isArray(filters.cnic)
      ? filters.cnic
      : filters.cnic
        ? [filters.cnic]
        : [],
    assetType: Array.isArray(filters.assetType)
      ? filters.assetType
      : filters.assetType
        ? [filters.assetType]
        : [],
    serviceType: Array.isArray(filters.serviceType)
      ? filters.serviceType
      : filters.serviceType
        ? [filters.serviceType]
        : [],
    serialNumber: Array.isArray(filters.serialNumber)
      ? filters.serialNumber
      : filters.serialNumber
        ? [filters.serialNumber]
        : [],
    fromDOB: filters.fromDOB || "",
    toDOB: filters.toDOB || "",
  });

  // Search functions
  const searchEmployeeNames = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions((prev) => ({ ...prev, name: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, name: true }));
    setLoading((prev) => ({ ...prev, name: true }));

    try {
      const result = await getEmployeesWithoutPagination({
        name: query,
        limit: 10,
      });

      if (result.success) {
        const employees = result.data.employees || result.data || [];

        const formatted = employees.map((emp) => ({
          ...emp,
          firstName: emp.firstName?.trim() || "",
          lastName: emp.lastName?.trim() || "",
          fatherFirstName: emp.fatherFirstName?.trim() || "",
          rank: emp.rank?.trim() || "",
          grade: emp.grade?.trim() || "",
          cnic: emp.cnic?.trim() || "",
          personalNumber: emp.personalNumber?.trim() || "",
        }));

        setSuggestions((prev) => ({
          ...prev,
          name: formatted, // store array of employee objects
        }));
      }

      console.log(suggestions, "my suggestions data");

    } catch (error) {
      console.error("Error searching employee names:", error);
    } finally {
      setIsSearching((prev) => ({ ...prev, name: false }));
      setLoading((prev) => ({ ...prev, name: false }));
    }
  };

  const searchPersonalNumbers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions((prev) => ({ ...prev, personalNumber: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, personalNumber: true }));
    setLoading((prev) => ({ ...prev, personalNumber: true }));

    try {
      const result = await getEmployeesWithoutPagination({
        name: query,
        limit: 10,
      });

      if (result.success) {
        const employees = result.data.employees || result.data || [];
        const personalNumbers = employees
          .map((emp) => emp.personalNumber)
          .filter(Boolean)
          .filter((pNum) => pNum.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10);

        setSuggestions((prev) => ({
          ...prev,
          personalNumber: [...new Set(personalNumbers)],
        }));
      }
    } catch (error) {
      console.error("Error searching personal numbers:", error);
    } finally {
      setIsSearching((prev) => ({ ...prev, personalNumber: false }));
      setLoading((prev) => ({ ...prev, personalNumber: false }));
    }
  };

  const searchCNICs = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions((prev) => ({ ...prev, cnic: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, cnic: true }));
    setLoading((prev) => ({ ...prev, cnic: true }));

    try {
      const result = await getEmployeesWithoutPagination({
        name: query,
        limit: 10,
      });

      if (result.success) {
        const employees = result.data.employees || result.data || [];
        const cnics = employees
          .map((emp) => emp.cnic)
          .filter(Boolean)
          .filter((cnic) => cnic.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10);

        setSuggestions((prev) => ({
          ...prev,
          cnic: [...new Set(cnics)],
        }));
      }
    } catch (error) {
      console.error("Error searching CNICs:", error);
    } finally {
      setIsSearching((prev) => ({ ...prev, cnic: false }));
      setLoading((prev) => ({ ...prev, cnic: false }));
    }
  };

  // Add this function after the searchCNICs function (around line 200):

  const searchSerialNumbers = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions((prev) => ({ ...prev, serialNumber: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, serialNumber: true }));
    setLoading((prev) => ({ ...prev, serialNumber: true }));

    try {
      const result = await getEmployeesWithoutPagination({
        serialNumber: query,
        limit: 10,
      });

      const employees = result?.data?.employees || result?.employees || [];

      // Extract serial numbers from nested assignedAssets → asset[]
      const serialNumbers = employees
        .flatMap((emp) =>
          emp.assignedAssets?.flatMap((assetGroup) =>
            assetGroup.asset?.flatMap((a) => [
              a.weaponNumber,
              a.registerNumber,
            ])
          )
        )
        .filter(Boolean) // remove undefined/null
        .map((serial) => serial.trim())
        .filter((serial) =>
          serial.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10); // limit to 10 suggestions

      setSuggestions((prev) => ({
        ...prev,
        serialNumber: [...new Set(serialNumbers)], // remove duplicates
      }));
    } catch (error) {
      console.error("Error searching serial numbers:", error);
    } finally {
      setIsSearching((prev) => ({ ...prev, serialNumber: false }));
      setLoading((prev) => ({ ...prev, serialNumber: false }));
    }

  };

  // Fetch functions for dropdown options
  const fetchDesignations = async () => {
    setLoading((prev) => ({ ...prev, designations: true }));
    try {
      const desigRes = await getDesignationsWithEnum();
      if (desigRes.success && desigRes.data) {
        const designationArray = Object.entries(desigRes.data).map(
          ([_id, name]) => ({ _id, name })
        );
        setDesignationEnum(designationArray);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      setDesignationEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, designations: false }));
    }
  };

  const fetchGrades = async () => {
    setLoading((prev) => ({ ...prev, grades: true }));
    try {
      const gradeRes = await getGradesWithEnum();
      if (gradeRes.success && gradeRes.data) {
        const gradeArray = Object.entries(gradeRes.data).map(([_id, name]) => ({
          _id,
          name,
        }));
        setGradeEnum(gradeArray);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGradeEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, grades: false }));
    }
  };

  const fetchCasts = async () => {
    setLoading((prev) => ({ ...prev, casts: true }));
    try {
      const castRes = await getCastsWithEnum();
      if (castRes.success && castRes.data) {
        const castArray = Object.entries(castRes.data).map(([_id, name]) => ({
          _id,
          name,
        }));
        setCastEnum(castArray);
      }
    } catch (error) {
      console.error("Error fetching casts:", error);
      setCastEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, casts: false }));
    }
  };

  const fetchRanks = async () => {
    setLoading((prev) => ({ ...prev, ranks: true }));
    try {
      const rankRes = await getRanksWithEnum();
      if (rankRes.success && rankRes.data) {
        const rankArray = Object.entries(rankRes.data).map(([_id, name]) => ({
          _id,
          name,
        }));
        setRankEnum(rankArray);
      }
    } catch (error) {
      console.error("Error fetching ranks:", error);
      setRankEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, ranks: false }));
    }
  };

  const fetchStatus = async () => {
    setLoading((prev) => ({ ...prev, status: true }));
    try {
      const statusRes = await getStatusWithEnum();
      if (statusRes.success && statusRes.data) {
        const statusArray = Object.entries(statusRes.data).map(
          ([_id, name]) => ({
            _id,
            name,
          })
        );
        setStatusEnum(statusArray);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
      setStatusEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, status: false }));
    }
  };

  const fetchStationsWithoutPage = async () => {
    setLoading((prev) => ({ ...prev, stations: true }));
    try {
      const response = await getAllStationsWithoutPage();
      let allStations = [];
      if (response && response.success && response.data) {
        allStations = response.data.result || [];
      }
      const stationArray = allStations.map((station) => ({
        _id: station._id,
        name: `${station.name} ${station.tehsil}`,
      }));
      setStationEnum(stationArray);
    } catch (error) {
      console.error("Error fetching stations:", error);
      setStationEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, stations: false }));
    }
  };

  const fetchDistricts = async () => {
    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const districtRes = await getStationDistrictWithEnum();
      if (districtRes && districtRes.success && districtRes.data) {
        const districtArray = Object.entries(districtRes.data).map(
          ([_id, name]) => ({ _id, name })
        );
        setDistrictEnum(districtArray);
      } else {
        console.error("Invalid district response:", districtRes);
        setDistrictEnum([]);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistrictEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const fetchTehsils = async () => {
    setLoading((prev) => ({ ...prev, tehsils: true }));
    try {
      const tehsilRes = await getStationLocationsWithEnum();
      if (tehsilRes && tehsilRes.success && tehsilRes.data) {
        const tehsilArray = Object.entries(tehsilRes.data).map(
          ([_id, name]) => ({ _id, name })
        );
        setTehsilEnum(tehsilArray);
      } else {
        console.error("Invalid tehsil response:", tehsilRes);
        setTehsilEnum([]);
      }
    } catch (error) {
      console.error("Error fetching tehsils:", error);
      setTehsilEnum([]);
    } finally {
      setLoading((prev) => ({ ...prev, tehsils: false }));
    }
  };

  // Fetch all dropdown options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        await Promise.all([
          fetchDesignations(),
          fetchGrades(),
          fetchCasts(),
          fetchRanks(),
          fetchStatus(),
          fetchStationsWithoutPage(),
          fetchDistricts(),
          fetchTehsils(),
        ]);
      } catch (error) {
        console.error("Error in fetchFilterOptions:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  // Update filterForm when filters prop changes
  useEffect(() => {
    setFilterForm({
      name: Array.isArray(filters.name)
        ? filters.name
        : filters.name
          ? [filters.name]
          : [],
      address: Array.isArray(filters.address)
        ? filters.address
        : filters.address
          ? [filters.address]
          : [],
      cast: Array.isArray(filters.cast)
        ? filters.cast
        : filters.cast
          ? [filters.cast]
          : [],
      rank: Array.isArray(filters.rank)
        ? filters.rank
        : filters.rank
          ? [filters.rank]
          : [],
      station: Array.isArray(filters.station)
        ? filters.station
        : filters.station
          ? [filters.station]
          : [],
      district: Array.isArray(filters.district)
        ? filters.district
        : filters.district
          ? [filters.district]
          : [],
      tehsil: Array.isArray(filters.tehsil)
        ? filters.tehsil
        : filters.tehsil
          ? [filters.tehsil]
          : [],
      status: Array.isArray(filters.status)
        ? filters.status
        : filters.status
          ? [filters.status]
          : [],
      designation: Array.isArray(filters.designation)
        ? filters.designation
        : filters.designation
          ? [filters.designation]
          : [],
      grade: Array.isArray(filters.grade)
        ? filters.grade
        : filters.grade
          ? [filters.grade]
          : [],
      personalNumber: Array.isArray(filters.personalNumber)
        ? filters.personalNumber
        : filters.personalNumber
          ? [filters.personalNumber]
          : [],
      cnic: Array.isArray(filters.cnic)
        ? filters.cnic
        : filters.cnic
          ? [filters.cnic]
          : [],
      assetType: Array.isArray(filters.assetType)
        ? filters.assetType
        : filters.assetType
          ? [filters.assetType]
          : [],
      serviceType: Array.isArray(filters.serviceType)
        ? filters.serviceType
        : filters.serviceType
          ? [filters.serviceType]
          : [],
      serialNumber: Array.isArray(filters.serialNumber)
        ? filters.serialNumber
        : filters.serialNumber
          ? [filters.serialNumber]
          : [],
      fromDOB: filters.fromDOB || "",
      toDOB: filters.toDOB || "",
    });
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.length > 0) activeFilters.name = filterForm.name;
    if (filterForm.address.length > 0)
      activeFilters.address = filterForm.address;
    if (filterForm.cast.length > 0) activeFilters.cast = filterForm.cast;
    if (filterForm.rank.length > 0) activeFilters.rank = filterForm.rank;
    if (filterForm.station.length > 0)
      activeFilters.station = filterForm.station;
    if (filterForm.district.length > 0)
      activeFilters.district = filterForm.district;
    if (filterForm.tehsil.length > 0) activeFilters.tehsil = filterForm.tehsil;
    if (filterForm.status.length > 0) activeFilters.status = filterForm.status;
    if (filterForm.designation.length > 0)
      activeFilters.designation = filterForm.designation;
    if (filterForm.grade.length > 0) activeFilters.grade = filterForm.grade;
    if (filterForm.personalNumber.length > 0)
      activeFilters.personalNumber = filterForm.personalNumber;
    if (filterForm.cnic.length > 0) activeFilters.cnic = filterForm.cnic;
    if (filterForm.assetType.length > 0)
      activeFilters.assetType = filterForm.assetType;
    if (filterForm.serviceType.length > 0)
      activeFilters.serviceType = filterForm.serviceType;
    if (filterForm.serialNumber.length > 0)
      activeFilters.serialNumber = filterForm.serialNumber;
    if (filterForm.fromDOB && filterForm.fromDOB.trim() !== "")
      activeFilters.fromDOB = filterForm.fromDOB;
    if (filterForm.toDOB && filterForm.toDOB.trim() !== "")
      activeFilters.toDOB = filterForm.toDOB;
    updateFilters(activeFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterForm({
      name: [],
      address: [],
      cast: [],
      rank: [],
      station: [],
      district: [],
      tehsil: [],
      status: [],
      designation: [],
      grade: [],
      personalNumber: [],
      cnic: [],
      assetType: [],
      serviceType: [],
      serialNumber: [],
      fromDOB: null,
      toDOB: null,
    });
    clearFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="xl:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          disabled={Object.values(loading).some((isLoading) => isLoading)}
        >
          <span className="text-sm font-medium text-gray-700">
            Filter Employees
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${showFilters ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Filter Section - Responsive */}
      <div
        className={`bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ${showFilters || window.innerWidth >= 1280 ? "block" : "hidden xl:block"
          }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Filter Employees
          </h3>
          {Object.keys(filters).length > 0 && (
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {Object.keys(filters).length} active filter
              {Object.keys(filters).length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Name Filter */}
          <div className="relative">
            <MultiTextInputField
              label="Name"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              placeholder="Type employee name..."
              minLength={2}
              maxLength={50}
              enableSuggestions={true}
              onSearch={searchEmployeeNames}
              suggestions={suggestions.name}
              isSearching={isSearching.name}
              searchPlaceholder="Type to search employee names..."
              emptyMessage="No employee names found"
              minSearchLength={2}
              onSuggestionSelect={(suggestion) => suggestion}
              loading={loading.name}
            />
            {loading.name && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Address Filter */}
          <MultiTextInput
            label="Address"
            name="address"
            value={filterForm.address}
            onChange={handleFilterChange}
            placeholder="Type address and press Enter..."
            minLength={3}
            maxLength={100}
          />

          {/* Tehsil Filter */}
          <SearchableMultiSelect
            label="Tehsil"
            name="tehsil"
            value={filterForm.tehsil}
            onChange={handleFilterChange}
            options={tehsilEnum}
            placeholder="Select tehsils..."
            loading={loading.tehsils}
            searchPlaceholder="Search tehsils..."
            emptyMessage="No tehsils found"
            allowNA={true}
          />

          {/* District Filter */}
          <SearchableMultiSelect
            label="District"
            name="district"
            value={filterForm.district}
            onChange={handleFilterChange}
            options={districtEnum}
            placeholder="Select districts..."
            loading={loading.districts}
            searchPlaceholder="Search districts..."
            emptyMessage="No districts found"
            allowNA={true}
          />

          {/* Personal Number Filter */}
          <div className="relative">
            <MultiTextInput
              label="Personal Number"
              name="personalNumber"
              value={filterForm.personalNumber}
              onChange={handleFilterChange}
              placeholder="Type personal number..."
              minLength={3}
              maxLength={20}
              pattern={/^[A-Za-z0-9\-_]+$/}
              patternMessage="Only letters, numbers, hyphens and underscores allowed"
              enableSuggestions={true}
              onSearch={searchPersonalNumbers}
              suggestions={suggestions.personalNumber}
              isSearching={isSearching.personalNumber}
              searchPlaceholder="Type to search personal numbers..."
              emptyMessage="No personal numbers found"
              minSearchLength={2}
              onSuggestionSelect={(suggestion) => suggestion}
              loading={loading.personalNumber}
            />
            {loading.personalNumber && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          <div className="relative">
            <MultiTextInput
              label="Serial Number"
              name="serialNumber"
              value={filterForm.serialNumber}
              onChange={handleFilterChange}
              placeholder="Weapon/Registration Number"
              minLength={3}
              maxLength={20}
              enableSuggestions={true} // Changed from false to true
              onSearch={searchSerialNumbers} // Add this line
              suggestions={suggestions.serialNumber} // Add this line
              isSearching={isSearching.serialNumber} // Add this line
              searchPlaceholder="Type to search serial numbers..." // Add this line
              emptyMessage="No serial numbers found" // Add this line
              minSearchLength={3} // Add this line
              onSuggestionSelect={(suggestion) => suggestion} // Add this line
              loading={loading.serialNumber} // Add this line
            />
            {loading.serialNumber && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          {/* CNIC Filter */}
          <div className="relative">
            <MultiTextInput
              label="CNIC"
              name="cnic"
              value={filterForm.cnic}
              onChange={handleFilterChange}
              placeholder="Type CNIC..."
              minLength={13}
              maxLength={15}
              pattern={/^[0-9\-]+$/}
              patternMessage="Only numbers and hyphens allowed"
              enableSuggestions={true}
              onSearch={searchCNICs}
              suggestions={suggestions.cnic}
              isSearching={isSearching.cnic}
              searchPlaceholder="Type to search CNICs..."
              emptyMessage="No CNICs found"
              minSearchLength={3}
              onSuggestionSelect={(suggestion) => suggestion}
              loading={loading.cnic}
            />
            {loading.cnic && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <SearchableMultiSelect
            label="Status"
            name="status"
            value={filterForm.status}
            onChange={handleFilterChange}
            options={statusEnum}
            placeholder="Select status..."
            loading={loading.status}
            searchPlaceholder="Search status..."
            emptyMessage="No status found"
            allowNA={true}
          />

          {/* Designation Filter */}
          <SearchableMultiSelect
            label="Designation"
            name="designation"
            value={filterForm.designation}
            onChange={handleFilterChange}
            options={designationEnum}
            placeholder="Select designations..."
            loading={loading.designations}
            searchPlaceholder="Search designations..."
            emptyMessage="No designations found"
            allowNA={true}
          />

          {/* Grade Filter */}
          <SearchableMultiSelect
            label="Grade"
            name="grade"
            value={filterForm.grade}
            onChange={handleFilterChange}
            options={gradeEnum}
            placeholder="Select grades..."
            loading={loading.grades}
            searchPlaceholder="Search grades..."
            emptyMessage="No grades found"
            allowNA={true}
          />

          {/* Cast Filter */}
          <SearchableMultiSelect
            label="Cast"
            name="cast"
            value={filterForm.cast}
            onChange={handleFilterChange}
            options={castEnum}
            placeholder="Select casts..."
            loading={loading.casts}
            searchPlaceholder="Search casts..."
            emptyMessage="No casts found"
            allowNA={true}
          />

          {/* Rank Filter */}
          <SearchableMultiSelect
            label="Rank"
            name="rank"
            value={filterForm.rank}
            onChange={handleFilterChange}
            options={rankEnum}
            placeholder="Select ranks..."
            loading={loading.ranks}
            searchPlaceholder="Search ranks..."
            emptyMessage="No ranks found"
            allowNA={true}
          />

          {/* Service Type Filter */}
          <SearchableMultiSelect
            label="Service Type"
            name="serviceType"
            value={filterForm.serviceType}
            onChange={handleFilterChange}
            options={serviceTypeOptions}
            placeholder="Select service types..."
            loading={false}
            searchPlaceholder="Search service types..."
            emptyMessage="No service types found"
            allowNA={false}
          />

          {/* From Date of Birth Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                name="fromDOB"
                value={filterForm.fromDOB || ""}
                onClick={() =>
                  document.getElementById("fromDOBHelper").showPicker?.()
                }
                readOnly
                placeholder="Select from date..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer bg-white"
                disabled={loading.fromDOB}
              />
              <input
                id="fromDOBHelper"
                type="date"
                className="absolute opacity-0 pointer-events-none"
                onChange={(e) => {
                  setFilterForm((prev) => ({
                    ...prev,
                    fromDOB: e.target.value,
                  }));
                }}
              />
              {filterForm.fromDOB && (
                <button
                  type="button"
                  onClick={() =>
                    setFilterForm((prev) => ({
                      ...prev,
                      fromDOB: "",
                    }))
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading.fromDOB}
                >
                  ×
                </button>
              )}
              {loading.fromDOB && (
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Click to select start date
            </div>
          </div>

          {/* To Date of Birth Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                name="toDOB"
                value={filterForm.toDOB || ""}
                onClick={() =>
                  document.getElementById("toDOBHelper").showPicker?.()
                }
                readOnly
                placeholder="Select to date..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer bg-white"
                disabled={loading.toDOB}
              />
              <input
                id="toDOBHelper"
                type="date"
                className="absolute opacity-0 pointer-events-none"
                onChange={(e) => {
                  setFilterForm((prev) => ({
                    ...prev,
                    toDOB: e.target.value,
                  }));
                }}
              />
              {filterForm.toDOB && (
                <button
                  type="button"
                  onClick={() =>
                    setFilterForm((prev) => ({
                      ...prev,
                      toDOB: "",
                    }))
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading.toDOB}
                >
                  ×
                </button>
              )}
              {loading.toDOB && (
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Click to select end date
            </div>
          </div>

          {/* Station Filter */}
          <SearchableMultiSelect
            label="Posting Station"
            name="station"
            value={filterForm.station}
            onChange={handleFilterChange}
            options={stationEnum}
            placeholder="Select stations..."
            loading={loading.stations}
            searchPlaceholder="Search stations..."
            emptyMessage="No stations found"
            allowNA={true}
          />

          {/* Asset Type Filter */}
          <SearchableMultiSelect
            label="Asset Type"
            name="assetType"
            value={filterForm.assetType}
            onChange={handleFilterChange}
            options={assetTypeEnumOptions}
            placeholder="Select asset types..."
            loading={false}
            searchPlaceholder="Search asset types..."
            emptyMessage="No asset types found"
            allowNA={true}
          />
        </div>

        {/* Filter Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            disabled={Object.values(loading).some((isLoading) => isLoading)}
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            disabled={Object.values(loading).some((isLoading) => isLoading)}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeFilters;
