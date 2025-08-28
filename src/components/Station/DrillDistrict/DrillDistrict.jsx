
// import {
//   ArrowLeft,
//   Building,
//   Users,
//   MapPin,
//   Award,
//   Calendar,
//   Phone,
//   UserCheck,
//   PieChart,
//   BarChart3,
//   TrendingUp,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   Clock,
//   UserX,
//   Map,
//   Shield,
//   Activity,
//   Database,
//   Layers,
//   Navigation,
//   Home,
//   ChevronRight,
//   Wifi,
//   Zap,
//   Lock,
//   ArrowDown,
//   ArrowUp,
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import { BACKEND_URL } from "../../../constants/api";
// import TopLevelDrillPage from "../TopLevelDrillUp/TopLevelDrillUp";

// const DrillDistrictPage = ({
//   district: initialDistrict, // Renamed to avoid confusion
//   tehsil = null,
//   onBack,
//   onDrillTehsil,
//   fromTopLevel = false
// }) => {
//   const [data, setData] = useState(null);
//   const [tehsilData, setTehsilData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedTehsil, setSelectedTehsil] = useState(null);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [currentView, setCurrentView] = useState('main');
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [currentDistrict, setCurrentDistrict] = useState(initialDistrict);





//   useEffect(() => {
//     if (currentDistrict) {
//       fetchDistrictData();
//     }
//   }, [currentDistrict, tehsil]);

//   // Function to handle district change from TopLevel
//   const handleDistrictChange = (newDistrict) => {
//     setCurrentDistrict(newDistrict);
//     setSelectedTehsil(null);
//     setTehsilData(null);
//     setActiveTab("overview");
//     setCurrentView('main');
//   };



//   const fetchDistrictData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       console.log('Fetching data for district:', currentDistrict, 'from tehsil:', tehsil);

//       // If coming from a specific tehsil, use tehsil-to-district API
//       if (tehsil) {
//         const tehsilURL = `${BACKEND_URL}/employee/tehsil-to-district?tehsil=${tehsil}&district=${currentDistrict}&page=1&limit=10`;
//         console.log('Calling tehsil-to-district API:', tehsilURL);

//         const tehsilResponse = await fetch(
//           tehsilURL,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (tehsilResponse.ok) {
//           const tehsilResult = await tehsilResponse.json();
//           console.log('Tehsil-to-district response:', tehsilResult);
//           setData(tehsilResult);
//         } else {
//           console.error('Tehsil-to-district API failed:', tehsilResponse.status, tehsilResponse.statusText);
//           throw new Error("Failed to fetch tehsil to district data");
//         }
//       } else {
//         // Use district-to-tehsil API for district data
//         const districtURL = `${BACKEND_URL}/employee/district-to-tehsil?district=${currentDistrict}&page=1&limit=10`;
//         console.log('Calling district API:', districtURL);

//         const districtResponse = await fetch(
//           districtURL,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (districtResponse.ok) {
//           const allDistrictsResult = await districtResponse.json();
//           console.log('District-to-all response:', allDistrictsResult);

//           // Handle different response structures
//           if (allDistrictsResult.districts) {
//             // If response has districts array, filter for specific district
//             const specificDistrict = allDistrictsResult.districts.find(d => d.district === currentDistrict);
//             if (specificDistrict) {
//               const filteredResult = {
//                 ...allDistrictsResult,
//                 districts: [specificDistrict]
//               };
//               setData(filteredResult);
//             } else {
//               throw new Error(`District ${currentDistrict} not found`);
//             }
//           } else if (allDistrictsResult.level === "district") {
//             // If response is already filtered for the district
//             setData(allDistrictsResult);
//           } else {
//             // Default case
//             setData(allDistrictsResult);
//           }
//         } else {
//           console.error('District-to-all API failed:', districtResponse.status, districtResponse.statusText);
//           throw new Error("Failed to fetch district data");
//         }
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("API Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const fetchTehsilData = async (tehsilName) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const tehsilURL = `${BACKEND_URL}/employee/district-to-tehsil?district=${currentDistrict}&tehsil=${tehsilName}&page=1&limit=10`;
//       console.log('Calling district-to-tehsil API:', tehsilURL);

//       const tehsilResponse = await fetch(
//         tehsilURL,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (tehsilResponse.ok) {
//         const tehsilResult = await tehsilResponse.json();
//         console.log('District-to-tehsil response:', tehsilResult);
//         setTehsilData(tehsilResult);
//         setSelectedTehsil(tehsilName);
//       } else {
//         console.error('District-to-tehsil API failed:', tehsilResponse.status, tehsilResponse.statusText);
//         throw new Error("Failed to fetch tehsil data");
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("API Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const getTehsilData = () => {
//     console.log('Getting tehsil data from:', data);

//     if (data?.level === "district" && data?.tehsils) {
//       console.log('Using district level data:', data.tehsils);
//       return data.tehsils;
//     } else if (data?.districts) {
//       const districtData = data.districts.find(d => d.district === district);
//       console.log('Using districts data for district:', district, districtData);

//       if (districtData?.stations) {
//         const tehsilGroups = {};
//         districtData.stations.forEach(station => {
//           if (!tehsilGroups[station.tehsil]) {
//             tehsilGroups[station.tehsil] = {
//               tehsil: station.tehsil,
//               totalStations: 0,
//               totalEmployees: 0,
//               totalAssets: 0,
//               stationsNotMeetingRequirements: 0
//             };
//           }
//           tehsilGroups[station.tehsil].totalStations++;
//         });
//         return Object.values(tehsilGroups);
//       }
//     }

//     console.log('No tehsil data found, returning empty array');
//     return [];
//   };

//   const getSummaryData = () => {
//     console.log('Getting summary data from:', data);

//     if (data?.level === "district" && data?.districtInfo) {
//       console.log('Using districtInfo:', data.districtInfo);
//       return {
//         totalStations: data.districtInfo.totalStations,
//         totalEmployees: data.districtInfo.totalEmployees,
//         totalTehsils: data.districtInfo.totalTehsils,
//         totalAssets: data.districtInfo.totalAssets,
//         activeStations: data.districtInfo.totalStations - (data.districtInfo.totalStationsNotMeetingReq || 0)
//       };
//     } else if (data?.districts) {
//       const districtData = data.districts.find(d => d.district === district);
//       if (districtData) {
//         return {
//           totalStations: districtData.totalStations,
//           totalEmployees: districtData.totalEmployees,
//           totalTehsils: districtData.totalTehsils,
//           totalAssets: districtData.totalAssets,
//           activeStations: districtData.totalStations
//         };
//       }
//     }

//     console.log('No summary data found, returning defaults');
//     return {
//       totalStations: 0,
//       totalEmployees: 0,
//       totalTehsils: 0,
//       totalAssets: 0,
//       activeStations: 0
//     };
//   };

//   const getEmployeeStats = () => {
//     if (data?.level === "district" && data?.summaries?.employees) {
//       return data.statistics;
//     } else if (data?.districts) {
//       const districtData = data.districts.find(d => d.district === district);
//       return districtData?.summaries?.employees || {};
//     }
//     return {};
//   };

//   const getFacilitiesData = () => {
//     if (data?.level === "district" && data?.summaries?.facilities) {
//       return data.summaries.facilities;
//     }
//     return [];
//   };


//   const summary = getSummaryData();
//   const statistics = getEmployeeStats();
//   const tehsilDataList = getTehsilData();


//   const handleTehsilSelect = (tehsilName) => {
//     if (selectedTehsil === tehsilName) {
//       setSelectedTehsil(null);
//       setTehsilData(null);
//     } else {
//       fetchTehsilData(tehsilName);
//     }
//   };

//   const renderOverviewTab = () => {
//     const summary = getSummaryData();
//     const tehsilData = getTehsilData();
//     const facilities = getFacilitiesData();

//     return (
//       <div className="space-y-6">
//         <div className="bg-white rounded-lg shadow-sm p-4">
//           <div className="flex items-center space-x-2 text-sm text-gray-600">
//             <Home className="h-4 w-4" />
//             <span className="font-medium text-gray-900">District: {initialDistrict}</span>
//             {tehsil && (
//               <>
//                 <ChevronRight className="h-3 w-3" />
//                 <span>From Tehsil: {tehsil}</span>
//               </>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <div className="bg-white p-4 rounded-lg shadow-md border">
//             <div className="flex items-center">
//               <Building className="h-8 w-8 text-blue-600 mr-3" />
//               <div>
//                 <p className="text-sm text-gray-600">Total Stations</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {summary.totalStations}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-md border">
//             <div className="flex items-center">
//               <Users className="h-8 w-8 text-green-600 mr-3" />
//               <div>
//                 <p className="text-sm text-gray-600">Total Employees</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {summary.totalEmployees}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-md border">
//             <div className="flex items-center">
//               <MapPin className="h-8 w-8 text-purple-600 mr-3" />
//               <div>
//                 <p className="text-sm text-gray-600">Total Tehsils</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {summary.totalTehsils}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-md border">
//             <div className="flex items-center">
//               <Database className="h-8 w-8 text-indigo-600 mr-3" />
//               <div>
//                 <p className="text-sm text-gray-600">Total Assets</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {summary.totalAssets}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-md border">
//             <div className="flex items-center">
//               <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
//               <div>
//                 <p className="text-sm text-gray-600">Active Stations</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {summary.activeStations}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {facilities.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <Shield className="h-5 w-5 mr-2" />
//               Facility Distribution
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {facilities.map((facility) => (
//                 <div
//                   key={facility._id}
//                   className="p-4 bg-gray-50 rounded-lg"
//                 >
//                   <h4 className="font-semibold text-gray-900 mb-2">{facility._id}</h4>
//                   <div className="space-y-1 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Count:</span>
//                       <span className="font-medium">{`${facility.count} / ${data?.districtInfo?.totalFacilities}`}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {console.log(data, "district level data ")}

//         {tehsilData.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <MapPin className="h-5 w-5 mr-2" />
//               Tehsil Distribution
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {tehsilData.map((tehsilItem) => (
//                 <div
//                   key={tehsilItem.tehsil}
//                   className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
//                   onClick={() => handleTehsilSelect(tehsilItem.tehsil)}
//                 >
//                   <h4 className="font-semibold text-gray-900 mb-2">{tehsilItem.tehsil}</h4>
//                   <div className="space-y-1 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Stations:</span>
//                       <span className="font-medium">{`${tehsilItem.totalStations || 0} / ${data?.districtInfo?.totalStations}`}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Employees:</span>
//                       <span className="font-medium">{`${tehsilItem.totalEmployees || 0} / ${data?.districtInfo?.totalEmployees}`}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Assets:</span>
//                       <span className="font-medium">{`${tehsilItem.totalAssets || 0} / ${data?.districtInfo?.totalAssets}`}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Non-compliant Stations:</span>
//                       <span className="font-medium">{`${tehsilItem.stationsNotMeetingRequirements || 0} / ${data?.districtInfo?.totalStations}`}</span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDrillTehsil && onDrillTehsil(tehsilItem.tehsil);
//                     }}
//                     className="mt-2 text-xs text-blue-600 hover:text-blue-800"
//                   >
//                     Drill Down →
//                   </button>
//                 </div>
//               ))}
//             </div>
//             {selectedTehsil && tehsilData && (
//               <div className="mt-6 border-t pt-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Details for Tehsil: {selectedTehsil}
//                 </h3>
//                 {tehsilData.find(t => t.tehsil === selectedTehsil)?.stationsNotMeetingReqDetails?.length > 0 && (
//                   <div className="bg-white rounded-lg shadow-md p-4">
//                     <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
//                       <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
//                       Stations Not Meeting Requirements
//                     </h4>
//                     <div className="space-y-4">
//                       {tehsilData.find(t => t.tehsil === selectedTehsil).stationsNotMeetingReqDetails.map((station) => (
//                         <div key={station.stationId} className="p-4 bg-gray-50 rounded-lg">
//                           <h5 className="font-semibold text-gray-900">{station.stationName}</h5>
//                           <div className="mt-2 space-y-2">
//                             {station.missingRequirements.map((req, index) => (
//                               <div key={index} className="text-sm">
//                                 <p className="text-gray-600">
//                                   {req.type === 'staff' ? 'Staff Shortage' : 'Asset Shortage'}:
//                                   <span className="ml-1 font-medium">
//                                     Required: {req.required}, Available: {req.available}
//                                   </span>
//                                 </p>
//                                 {req.type === 'asset' && req.assetId && (
//                                   <div className="ml-4 text-xs text-gray-500">
//                                     <p>Asset: {req.assetId.name} ({req.assetId.type})</p>
//                                     <p>Model: {req.assetId.model}, Make: {req.assetId.make}</p>
//                                     <p>Condition: {req.assetId.condition}</p>
//                                   </div>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderStatisticsTab = () => {
//     return (
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {statistics.employeeStats && (
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <Award className="h-5 w-5 mr-2" />
//               Employee by Designation
//             </h3>
//             <div className="space-y-3">
//               {Object.entries(statistics.employeeStats.byDesignation || {}).map(([designation, count]) => (
//                 <div key={designation} className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600 capitalize">{designation || 'Unknown'}</span>
//                   <div className="flex items-center">
//                     <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
//                       <div
//                         className="bg-blue-600 h-2 rounded-full"
//                         style={{
//                           width: `${(count / Math.max(...Object.values(statistics.employeeStats.byDesignation), 1)) * 100}%`,
//                         }}
//                       ></div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-900">{`${count} / ${data?.districtInfo?.totalDesignations}`}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {statistics.employeeStats?.byGrade && (
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <BarChart3 className="h-5 w-5 mr-2" />
//               Employee by Grade
//             </h3>
//             <div className="space-y-3">
//               {Object.entries(statistics.employeeStats.byGrade).map(([grade, count]) => (
//                 <div key={grade} className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">{grade || 'Unknown'}</span>
//                   <div className="flex items-center">
//                     <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
//                       <div
//                         className="bg-purple-600 h-2 rounded-full"
//                         style={{
//                           width: `${(count / Math.max(...Object.values(statistics.employeeStats.byGrade), 1)) * 100}%`,
//                         }}
//                       ></div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-900">{`${count} / ${data?.districtInfo?.totalGrades}`}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {statistics.assetStats && (
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <Database className="h-5 w-5 mr-2" />
//               Asset Distribution
//             </h3>
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-3 bg-blue-50 rounded-lg">
//                   <p className="text-2xl font-bold text-blue-600">{statistics.assetStats.stationAssets}</p>
//                   <p className="text-sm text-gray-600">Station Assets</p>
//                 </div>
//                 <div className="text-center p-3 bg-green-50 rounded-lg">
//                   <p className="text-2xl font-bold text-green-600">{statistics.assetStats.employeeAssets}</p>
//                   <p className="text-sm text-gray-600">Employee Assets</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//             <TrendingUp className="h-5 w-5 mr-2" />
//             Performance Metrics
//           </h3>
//           <div className="space-y-4">
//             <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//               <span className="text-sm text-gray-600">Stations Not Meeting Requirements</span>
//               <span className="font-semibold text-gray-900">{statistics.summary.stationsNotMeetingRequirements}</span>
//             </div>
//             <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//               <span className="text-sm text-gray-600">Avg Employees per Station</span>
//               <span className="font-semibold text-gray-900">
//                 {statistics.summary.totalStations > 0
//                   ? (statistics.summary.totalEmployees / statistics.summary.totalStations).toFixed(1)
//                   : 0}
//               </span>
//             </div>
//             <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//               <span className="text-sm text-gray-600">Assets per Employee</span>
//               <span className="font-semibold text-gray-900">
//                 {statistics.summary.totalEmployees > 0
//                   ? (statistics.summary.totalAssets / statistics.summary.totalEmployees).toFixed(1)
//                   : 0}
//               </span>
//             </div>
//           </div>
//         </div>

//         {statistics.facilities && (
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <Database className="h-5 w-5 mr-2" />
//               Facility Distribution
//             </h3>
//             <div className="space-y-3">
//               {Object.entries(statistics.facilities).map(([facility, count]) => (
//                 <div key={facility} className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600 capitalize">{facility || 'Unknown'}</span>
//                   <div className="flex items-center">
//                     <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
//                       <div
//                         className="bg-green-600 h-2 rounded-full"
//                         style={{
//                           width: `${(count / Math.max(...Object.values(statistics.facilities), 1)) * 100}%`,
//                         }}
//                       ></div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-900">{`${count} / ${data?.districtInfo?.totalFacilities}`}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderTehsilsTab = () => (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//           <MapPin className="h-5 w-5 mr-2" />
//           Tehsil Details ({tehsilDataList.length} tehsils)
//         </h3>
//       </div>
//       <div className="divide-y divide-gray-200">
//         {tehsilDataList.map((tehsilData) => (
//           <div key={tehsilData.tehsil} className="p-6">
//             <div
//               className="cursor-pointer"
//               onClick={() => handleTehsilSelect(tehsilData.tehsil)}
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex items-start space-x-4">
//                   <div className="flex-shrink-0">
//                     <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
//                       <MapPin className="h-8 w-8 text-gray-400" />
//                     </div>
//                   </div>

//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <h4 className="text-lg font-semibold text-gray-900">
//                         Tehsil {tehsilData.tehsil}
//                       </h4>
//                       <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
//                         {tehsilData.totalStations} stations
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-4 text-sm text-gray-500">
//                       <span className="flex items-center">
//                         <Building className="h-3 w-3 mr-1" />
//                         {tehsilData.totalStations} Stations
//                       </span>
//                       <span className="flex items-center">
//                         <Users className="h-3 w-3 mr-1" />
//                         {tehsilData.totalEmployees} Employees
//                       </span>
//                       <span className="flex items-center">
//                         <Database className="h-3 w-3 mr-1" />
//                         {tehsilData.totalAssets} Assets
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-6">
//                   {onDrillTehsil && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onDrillTehsil(tehsilData.tehsil);
//                       }}
//                       className="flex items-center text-blue-600 hover:text-blue-800"
//                     >
//                       <ArrowDown className="h-5 w-5 mr-1" />
//                       Drill Down
//                     </button>
//                   )}
//                   <div className="text-center">
//                     <p className="text-lg font-bold text-blue-600">
//                       {tehsilData.totalEmployees}
//                     </p>
//                     <p className="text-xs text-gray-500">Staff</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-lg font-bold text-green-600">
//                       {tehsilData.totalAssets}
//                     </p>
//                     <p className="text-xs text-gray-500">Assets</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {selectedTehsil === tehsilData.tehsil && (
//               <div className="mt-6 border-t pt-6">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center p-3 bg-gray-50 rounded-lg">
//                     <p className="text-lg font-bold text-gray-900">
//                       {tehsilData.totalStations}
//                     </p>
//                     <p className="text-sm text-gray-600">Total Stations</p>
//                   </div>
//                   <div className="text-center p-3 bg-gray-50 rounded-lg">
//                     <p className="text-lg font-bold text-gray-900">
//                       {tehsilData.totalEmployees}
//                     </p>
//                     <p className="text-sm text-gray-600">Total Employees</p>
//                   </div>
//                   <div className="text-center p-3 bg-gray-50 rounded-lg">
//                     <p className="text-lg font-bold text-gray-900">
//                       {tehsilData.totalAssets}
//                     </p>
//                     <p className="text-sm text-gray-600">Total Assets</p>
//                   </div>
//                   <div className="text-center p-3 bg-gray-50 rounded-lg">
//                     <p className="text-lg font-bold text-gray-900">
//                       {tehsilData.stationsNotMeetingRequirements}
//                     </p>
//                     <p className="text-sm text-gray-600">Stations Not Meeting Requirements</p>
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <h5 className="text-md font-semibold text-gray-900 mb-2">Facilities</h5>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                     {tehsilData.summaries.facilities.map((facility) => (
//                       <div key={facility._id} className="p-2 bg-gray-50 rounded-lg">
//                         <p className="text-sm text-gray-600">{facility._id}: {facility.count}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex items-center mb-6">
//           <button
//             onClick={onBack}
//             className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
//           >
//             <ArrowLeft className="h-5 w-5 mr-1" />
//             Back
//           </button>
//         </div>
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="flex items-center mb-6">
//           <button
//             onClick={onBack}
//             className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
//           >
//             <ArrowLeft className="h-5 w-5 mr-1" />
//             Back
//           </button>
//         </div>
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <p className="text-red-800">Error: {error}</p>
//           <button
//             onClick={fetchDistrictData}
//             className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!data) return null;



//   const handleBackFromTopLevel = () => {
//     setCurrentView('main');
//   };

//   const handleDrillToDistrict = (districtName) => {
//     console.log('Drilling to district from TopLevel:', districtName);
//     handleDistrictChange(districtName);
//   };

//   // In your render method
//   if (currentView === 'toplevel') {
//     return (
//       <TopLevelDrillPage
//         onBack={handleBackFromTopLevel}
//         onDrillDistrict={(districtName) => {
//           // Handle district drill down if needed
//           console.log('Drilling to district:', districtName);
//         }}
//       />
//     );
//   }





//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <button
//             onClick={onBack}
//             className="flex items-center text-blue-600 hover:text-blue-800 mr-4 transition-colors"
//           >
//             <ArrowLeft className="h-5 w-5 mr-1" />
//             Back
//           </button>
//           <div className="flex items-center">
//             <Building className="h-8 w-8 text-blue-600 mr-3" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 District {initialDistrict} Comprehensive View
//               </h1>
//               <p className="text-sm text-gray-600">
//                 {summary.totalTehsils} tehsils • {summary.totalStations} stations • {summary.totalEmployees} personnel
//                 {tehsil && (
//                   <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                     Drilled up from {tehsil}
//                   </span>
//                 )}
//               </p>
//             </div>
//             <div className="">
//               <button
//                 onClick={() => setCurrentView('toplevel')}
//                 className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//               >
//                 <ArrowUp className="h-4 w-4 mr-2" />
//                 Top Level
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2 text-sm text-gray-500">
//           <Clock className="h-4 w-4" />
//           <span>Last updated: {new Date().toLocaleString()}</span>
//         </div>
//       </div>
//       <div className="bg-white rounded-lg shadow-sm mb-6">
//         <div className="border-b border-gray-200">
//           <nav className="-mb-px flex space-x-8 px-6">
//             {[
//               { id: "overview", label: "Overview", icon: Activity },
//               { id: "statistics", label: "Statistics", icon: PieChart },
//               { id: "tehsils", label: "Tehsil Details", icon: MapPin },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                   }`}
//               >
//                 <tab.icon className="h-4 w-4 mr-2" />
//                 {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       <div className="mb-6">
//         {activeTab === "overview" && renderOverviewTab()}
//         {activeTab === "statistics" && renderStatisticsTab()}
//         {activeTab === "tehsils" && renderTehsilsTab()}
//       </div>

//       <div className="bg-white rounded-lg shadow-sm p-6">
//         <div className="flex items-center justify-between text-sm text-gray-600">
//           <div className="flex items-center space-x-6">
//             <span className="flex items-center">
//               <MapPin className="h-4 w-4 mr-1" />
//               District: <strong className="ml-1">{initialDistrict}</strong>
//             </span>
//             <span className="flex items-center">
//               <Building className="h-4 w-4 mr-1" />
//               Total stations: <strong className="ml-1">{summary.totalStations}</strong>
//             </span>
//             <span className="flex items-center">
//               <Users className="h-4 w-4 mr-1" />
//               Total employees: <strong className="ml-1">{summary.totalEmployees}</strong>
//             </span>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="flex items-center text-green-600">
//               <CheckCircle className="h-4 w-4 mr-1" />
//               Active stations: {summary.activeStations}
//             </span>
//             <span className="flex items-center text-blue-600">
//               <MapPin className="h-4 w-4 mr-1" />
//               Tehsils: {summary.totalTehsils}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DrillDistrictPage;





import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building,
  Users,
  MapPin,
  Award,
  Calendar,
  Phone,
  UserCheck,
  PieChart,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  UserX,
  Map,
  Shield,
  Activity,
  Database,
  Layers,
  Navigation,
  Home,
  ChevronRight,
  Wifi,
  Zap,
  Lock,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { BACKEND_URL } from "../../../constants/api";
import TopLevelDrillPage from "../TopLevelDrillUp/TopLevelDrillUp";

const DrillDistrictPage = ({
  district: initialDistrict,
  tehsil = null,
  onBack,
  onDrillTehsil,
  fromTopLevel = false,
}) => {
  const [data, setData] = useState(null);
  const [tehsilData, setTehsilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTehsil, setSelectedTehsil] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentView, setCurrentView] = useState("main");
  const [currentDistrict, setCurrentDistrict] = useState(initialDistrict);

  useEffect(() => {
    if (currentDistrict) {
      console.log("useEffect triggered for district:", currentDistrict);
      fetchDistrictData();
    }
  }, [currentDistrict, tehsil]);

  const handleDistrictChange = (newDistrict) => {
    console.log("Changing district from:", currentDistrict, "to:", newDistrict);
    setCurrentDistrict(newDistrict);
    setSelectedTehsil(null);
    setTehsilData(null);
    setActiveTab("overview");
    setCurrentView("main");
  };

  const fetchDistrictData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching data for district:", currentDistrict, "from tehsil:", tehsil);

      if (tehsil) {
        const tehsilURL = `${BACKEND_URL}/employee/tehsil-to-district?tehsil=${tehsil}&district=${currentDistrict}&page=1&limit=10`;
        console.log("Calling tehsil-to-district API:", tehsilURL);

        const tehsilResponse = await fetch(tehsilURL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (tehsilResponse.ok) {
          const tehsilResult = await tehsilResponse.json();
          console.log("Tehsil-to-district response:", tehsilResult);
          setData(tehsilResult);
        } else {
          console.error("Tehsil-to-district API failed:", tehsilResponse.status, tehsilResponse.statusText);
          throw new Error("Failed to fetch tehsil to district data");
        }
      } else {
        const districtURL = `${BACKEND_URL}/employee/district-to-tehsil?district=${currentDistrict}&page=1&limit=10`;
        console.log("Calling district API:", districtURL);

        const districtResponse = await fetch(districtURL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (districtResponse.ok) {
          const allDistrictsResult = await districtResponse.json();
          console.log("District-to-all response:", allDistrictsResult);

          if (allDistrictsResult.districts) {
            const specificDistrict = allDistrictsResult.districts.find((d) => d.district === currentDistrict);
            if (specificDistrict) {
              const filteredResult = {
                ...allDistrictsResult,
                districts: [specificDistrict],
              };
              console.log("Filtered district data:", filteredResult);
              setData(filteredResult);
            } else {
              throw new Error(`District ${currentDistrict} not found`);
            }
          } else if (allDistrictsResult.level === "district") {
            console.log("Using direct district data:", allDistrictsResult);
            setData(allDistrictsResult);
          } else {
            console.log("Using default district data:", allDistrictsResult);
            setData(allDistrictsResult);
          }
        } else {
          console.error("District-to-all API failed:", districtResponse.status, districtResponse.statusText);
          throw new Error("Failed to fetch district data");
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTehsilData = async (tehsilName) => {
    setLoading(true);
    setError(null);

    try {
      const tehsilURL = `${BACKEND_URL}/employee/district-to-tehsil?district=${currentDistrict}&tehsil=${tehsilName}&page=1&limit=10`;
      console.log("Calling district-to-tehsil API:", tehsilURL);

      const tehsilResponse = await fetch(tehsilURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (tehsilResponse.ok) {
        const tehsilResult = await tehsilResponse.json();
        console.log("District-to-tehsil response:", tehsilResult);
        setTehsilData(tehsilResult);
        setSelectedTehsil(tehsilName);
      } else {
        console.error("District-to-tehsil API failed:", tehsilResponse.status, tehsilResponse.statusText);
        throw new Error("Failed to fetch tehsil data");
      }
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTehsilData = () => {
    console.log("Getting tehsil data from:", data);

    if (data?.level === "district" && data?.tehsils) {
      console.log("Using district level data:", data.tehsils);
      return data.tehsils;
    } else if (data?.districts) {
      const districtData = data.districts.find((d) => d.district === currentDistrict);
      console.log("Using districts data for district:", currentDistrict, districtData);

      if (districtData?.stations) {
        const tehsilGroups = {};
        districtData.stations.forEach((station) => {
          if (!tehsilGroups[station.tehsil]) {
            tehsilGroups[station.tehsil] = {
              tehsil: station.tehsil,
              totalStations: 0,
              totalEmployees: 0,
              totalAssets: 0,
              stationsNotMeetingRequirements: 0,
            };
          }
          tehsilGroups[station.tehsil].totalStations++;
        });
        return Object.values(tehsilGroups);
      }
    }

    console.log("No tehsil data found, returning empty array");
    return [];
  };

  const getSummaryData = () => {
    console.log("Getting summary data from:", data);

    if (data?.level === "district" && data?.districtInfo) {
      console.log("Using districtInfo:", data.districtInfo);
      return {
        totalStations: data.districtInfo.totalStations,
        totalEmployees: data.districtInfo.totalEmployees,
        totalTehsils: data.districtInfo.totalTehsils,
        totalAssets: data.districtInfo.totalAssets,
        activeStations: data.districtInfo.totalStations - (data.districtInfo.totalStationsNotMeetingReq || 0),
      };
    } else if (data?.districts) {
      const districtData = data.districts.find((d) => d.district === currentDistrict);
      if (districtData) {
        return {
          totalStations: districtData.totalStations,
          totalEmployees: districtData.totalEmployees,
          totalTehsils: districtData.totalTehsils,
          totalAssets: districtData.totalAssets,
          activeStations: districtData.totalStations,
        };
      }
    }

    console.log("No summary data found, returning defaults");
    return {
      totalStations: 0,
      totalEmployees: 0,
      totalTehsils: 0,
      totalAssets: 0,
      activeStations: 0,
    };
  };

  const getEmployeeStats = () => {
    if (data?.level === "district" && data?.summaries?.employees) {
      return data.statistics;
    } else if (data?.districts) {
      const districtData = data.districts.find(d => d.district === district);
      return districtData?.summaries?.employees || {};
    }
    return {};
  };

  const getFacilitiesData = () => {
    if (data?.level === "district" && data?.summaries?.facilities) {
      return data.summaries.facilities;
    }
    return [];
  };

  const summary = getSummaryData();
  const statistics = getEmployeeStats();
  const tehsilDataList = getTehsilData();

  const handleTehsilSelect = (tehsilName) => {
    if (selectedTehsil === tehsilName) {
      setSelectedTehsil(null);
      setTehsilData(null);
    } else {
      fetchTehsilData(tehsilName);
    }
  };

  const renderOverviewTab = () => {
    const summary = getSummaryData();
    const tehsilData = getTehsilData();
    const facilities = getFacilitiesData();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="h-4 w-4" />
            <span className="font-medium text-gray-900">District: {currentDistrict}</span>
            {tehsil && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>From Tehsil: {tehsil}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Stations</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalStations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Tehsils</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalTehsils}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalAssets}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Stations</p>
                <p className="text-2xl font-bold text-gray-900">{summary.activeStations}</p>
              </div>
            </div>
          </div>
        </div>

        {facilities.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Facility Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {facilities.map((facility) => (
                <div key={facility._id} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{facility._id}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Count:</span>
                      <span className="font-medium">{`${facility.count} / ${data?.districtInfo?.totalFacilities}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tehsilDataList.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Tehsil Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tehsilDataList.map((tehsilItem) => (
                <div
                  key={tehsilItem.tehsil}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleTehsilSelect(tehsilItem.tehsil)}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{tehsilItem.tehsil}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stations:</span>
                      <span className="font-medium">{`${tehsilItem.totalStations || 0} / ${data?.districtInfo?.totalStations}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employees:</span>
                      <span className="font-medium">{`${tehsilItem.totalEmployees || 0} / ${data?.districtInfo?.totalEmployees}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assets:</span>
                      <span className="font-medium">{`${tehsilItem.totalAssets || 0} / ${data?.districtInfo?.totalAssets}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Non-compliant Stations:</span>
                      <span className="font-medium">{`${tehsilItem.stationsNotMeetingRequirements || 0} / ${data?.districtInfo?.totalStations}`}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillTehsil && onDrillTehsil(tehsilItem.tehsil);
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Drill Down →
                  </button>
                </div>
              ))}
            </div>
            {selectedTehsil && tehsilData && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Details for Tehsil: {selectedTehsil}
                </h3>
                {tehsilData.find((t) => t.tehsil === selectedTehsil)?.stationsNotMeetingReqDetails?.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                      Stations Not Meeting Requirements
                    </h4>
                    <div className="space-y-4">
                      {tehsilData.find((t) => t.tehsil === selectedTehsil).stationsNotMeetingReqDetails.map((station) => (
                        <div key={station.stationId} className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-semibold text-gray-900">{station.stationName}</h5>
                          <div className="mt-2 space-y-2">
                            {station.missingRequirements.map((req, index) => (
                              <div key={index} className="text-sm">
                                <p className="text-gray-600">
                                  {req.type === "staff" ? "Staff Shortage" : "Asset Shortage"}:
                                  <span className="ml-1 font-medium">
                                    Required: {req.required}, Available: {req.available}
                                  </span>
                                </p>
                                {req.type === "asset" && req.assetId && (
                                  <div className="ml-4 text-xs text-gray-500">
                                    <p>Asset: {req.assetId.name} ({req.assetId.type})</p>
                                    <p>Model: {req.assetId.model}, Make: {req.assetId.make}</p>
                                    <p>Condition: {req.assetId.condition}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  console.log(statistics, "my staticts");


  const renderStatisticsTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statistics?.employeeStats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Employee by Designation
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.employeeStats.byDesignation || {}).map(([designation, count]) => (
                <div key={designation} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{designation || "Unknown"}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(statistics.employeeStats.byDesignation), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{`${count} / ${data?.districtInfo?.totalDesignations}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {statistics?.employeeStats?.byGrade && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Employee by Grade
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.employeeStats.byGrade).map(([grade, count]) => (
                <div key={grade} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{grade || "Unknown"}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(statistics.employeeStats.byGrade), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{`${count} / ${data?.districtInfo?.totalGrades}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {statistics?.assetStats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Asset Distribution
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{statistics.assetStats.stationAssets}</p>
                  <p className="text-sm text-gray-600">Station Assets</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{statistics.assetStats.employeeAssets}</p>
                  <p className="text-sm text-gray-600">Employee Assets</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Stations Not Meeting Requirements</span>
              <span className="font-semibold text-gray-900">{statistics?.summary?.stationsNotMeetingRequirements}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg Employees per Station</span>
              <span className="font-semibold text-gray-900">
                {statistics?.summary?.totalStations > 0
                  ? (statistics.summary.totalEmployees / statistics.summary.totalStations).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Assets per Employee</span>
              <span className="font-semibold text-gray-900">
                {statistics?.summary?.totalEmployees > 0
                  ? (statistics.summary.totalAssets / statistics.summary.totalEmployees).toFixed(1)
                  : 0}
              </span>
            </div>
          </div>
        </div>

        {statistics.facilities && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Facility Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.facilities).map(([facility, count]) => (
                <div key={facility} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{facility || "Unknown"}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(statistics.facilities), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{`${count} / ${data?.districtInfo?.totalFacilities}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTehsilsTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Tehsil Details ({tehsilDataList.length} tehsils)
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {tehsilDataList.map((tehsilData) => (
          <div key={tehsilData.tehsil} className="p-6">
            <div className="cursor-pointer" onClick={() => handleTehsilSelect(tehsilData.tehsil)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">Tehsil {tehsilData.tehsil}</h4>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {tehsilData.totalStations} stations
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {tehsilData.totalStations} Stations
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {tehsilData.totalEmployees} Employees
                      </span>
                      <span className="flex items-center">
                        <Database className="h-3 w-3 mr-1" />
                        {tehsilData.totalAssets} Assets
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  {onDrillTehsil && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDrillTehsil(tehsilData.tehsil);
                      }}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ArrowDown className="h-5 w-5 mr-1" />
                      Drill Down
                    </button>
                  )}
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{tehsilData.totalEmployees}</p>
                    <p className="text-xs text-gray-500">Staff</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{tehsilData.totalAssets}</p>
                    <p className="text-xs text-gray-500">Assets</p>
                  </div>
                </div>
              </div>
            </div>
            {selectedTehsil === tehsilData.tehsil && (
              <div className="mt-6 border-t pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{tehsilData.totalStations}</p>
                    <p className="text-sm text-gray-600">Total Stations</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{tehsilData.totalEmployees}</p>
                    <p className="text-sm text-gray-600">Total Employees</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{tehsilData.totalAssets}</p>
                    <p className="text-sm text-gray-600">Total Assets</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{tehsilData.stationsNotMeetingRequirements}</p>
                    <p className="text-sm text-gray-600">Stations Not Meeting Requirements</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="text-md font-semibold text-gray-900 mb-2">Facilities</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {tehsilData.summaries.facilities.map((facility) => (
                      <div key={facility._id} className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{facility._id}: {facility.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const handleBackFromTopLevel = () => {
    setCurrentView("main");
  };

  const handleDrillToDistrict = (districtName) => {
    console.log("Drilling to district from TopLevel:", districtName);
    console.log("Current state before change:", { currentDistrict, currentView });
    handleDistrictChange(districtName);
    console.log("State after change:", { currentDistrict: districtName, currentView: "main" });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={fetchDistrictData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">No data available for district {currentDistrict}</p>
          <button
            onClick={fetchDistrictData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (currentView === "toplevel") {
    return (
      <TopLevelDrillPage
        onBack={handleBackFromTopLevel}
        onDrillDistrict={handleDrillToDistrict}
      />
    );
  }

  console.log("Rendering DrillDistrictPage with:", { currentDistrict, data });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                District {currentDistrict} Comprehensive View
              </h1>
              <p className="text-sm text-gray-600">
                {summary.totalTehsils} tehsils • {summary.totalStations} stations • {summary.totalEmployees} personnel
                {tehsil && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Drilled up from {tehsil}
                  </span>
                )}
              </p>
            </div>
            <div>
              <button
                onClick={() => setCurrentView("toplevel")}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Top Level
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "statistics", label: "Statistics", icon: PieChart },
              { id: "tehsils", label: "Tehsil Details", icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="mb-6">
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "statistics" && renderStatisticsTab()}
        {activeTab === "tehsils" && renderTehsilsTab()}
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              District: <strong className="ml-1">{currentDistrict}</strong>
            </span>
            <span className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              Total stations: <strong className="ml-1">{summary.totalStations}</strong>
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Total employees: <strong className="ml-1">{summary.totalEmployees}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Active stations: {summary.activeStations}
            </span>
            <span className="flex items-center text-blue-600">
              <MapPin className="h-4 w-4 mr-1" />
              Tehsils: {summary.totalTehsils}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDistrictPage;