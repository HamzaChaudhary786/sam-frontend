import React, { useState, useEffect } from "react";
import { getDesignationsWithEnum } from "./AddEmployee/Designation.js";
import { getGradesWithEnum } from "./AddEmployee/Grades.js";
import { getCastsWithEnum } from "./AddEmployee/Cast.js";
import { getRanksWithEnum } from "./AddEmployee/Rank.js";
import { getAllStationsWithoutPage, getStations } from "../Station/StationApi.js";
import { getStationDistrictWithEnum } from "../Station/District.js";
import { getStationLocationsWithEnum } from "../Station/lookUp.js";
import { useLookupOptions } from "../../services/LookUp.js"; // 🆕 Add this import
import { STATUS_ENUM } from "./AddEmployee/EmployeeConstants";

// Add this after your imports
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

  // 🆕 Get asset type options using the lookup hook
  const { options: assetTypeOptions } = useLookupOptions("assetTypes");

  // Loading states for debugging
  const [loading, setLoading] = useState({
    stations: false,
    districts: false,
    tehsils: false,
  });

  // Filter state
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    address: filters.address || "",
    cast: filters.cast || "",
    rank: filters.rank || "",
    station: filters.station || "",
    district: filters.district || "",
    tehsil: filters.tehsil || "",
    status: filters.status || "",
    designation: filters.designation || "",
    grade: filters.grade || "",
    personalNumber: filters.personalNumber || "",
    cnic: filters.cnic || "",
    assetType: filters.assetType || "", // 🆕 Asset type filter
    serviceType: filters.serviceType || "", // 🆕 Add this line
  });

  // Separate function to fetch stations
  const fetchStations = async () => {
    setLoading((prev) => ({ ...prev, stations: true }));
    try {
      console.log("🚀 Fetching all stations...");

      let allStations = [];
      let currentPage = 1;
      let totalPages = 1;

      // Keep fetching until we get all pages
      do {
        console.log(`📄 Fetching page ${currentPage}...`);

        // Modify your getStations call to include page parameter
        // You might need to update the API call depending on how your backend handles pagination
        const stationRes = await getStations({ page: currentPage });
        console.log(`📊 Station response for page ${currentPage}:`, stationRes);

        if (stationRes && stationRes.success && stationRes.data) {
          // Extract stations from current page
          if (
            stationRes.data.stations &&
            Array.isArray(stationRes.data.stations)
          ) {
            allStations = [...allStations, ...stationRes.data.stations];
            totalPages = stationRes.data.totalPages || 1;
            currentPage++;
          } else {
            break; // No more data
          }
        } else {
          console.error(
            `❌ Invalid station response for page ${currentPage}:`,
            stationRes
          );
          break;
        }
      } while (currentPage <= totalPages);

      // Now map all stations to the format needed for dropdown
      const stationArray = allStations.map((station) => ({
        _id: station._id,
        name: station.name,
      }));

      setStationEnum(stationArray);
      console.log(
        `✅ Fetched all ${allStations.length} stations:`,
        stationArray
      );
    } catch (error) {
      console.error("💥 Error fetching stations:", error);
      setStationEnum([]);
    }
    setLoading((prev) => ({ ...prev, stations: false }));
  };

  // Separate function to fetch stations
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
        name: `${station.name} ${station.tehsil}`, // Include address for better clarity
      }));

      setStationEnum(stationArray);

    } catch (error) {
      console.error("💥 Error fetching stations:", error);
      setStationEnum([]);
    }
    setLoading((prev) => ({ ...prev, stations: false }));
  };

  // Separate function to fetch districts
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
        console.error("❌ Invalid district response:", districtRes);
        setDistrictEnum([]);
      }
    } catch (error) {
      console.error("💥 Error fetching districts:", error);
      setDistrictEnum([]);
    }
    setLoading((prev) => ({ ...prev, districts: false }));
  };

  // Separate function to fetch tehsils
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
        console.error("❌ Invalid tehsil response:", tehsilRes);
        setTehsilEnum([]);
      }
    } catch (error) {
      console.error("💥 Error fetching tehsils:", error);
      setTehsilEnum([]);
    }
    setLoading((prev) => ({ ...prev, tehsils: false }));
  };

  // Fetch dropdown options for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log("🔄 Starting to fetch all filter options...");

        // Fetch existing options (these should work)
        const [desigRes, gradeRes, castRes, rankRes] = await Promise.all([
          getDesignationsWithEnum(),
          getGradesWithEnum(),
          getCastsWithEnum(),
          getRanksWithEnum(),
        ]);

        // Process existing responses
        if (desigRes.success && desigRes.data) {
          const designationArray = Object.entries(desigRes.data).map(
            ([_id, name]) => ({ _id, name })
          );
          setDesignationEnum(designationArray);
        }

        if (gradeRes.success && gradeRes.data) {
          const gradeArray = Object.entries(gradeRes.data).map(
            ([_id, name]) => ({ _id, name })
          );
          setGradeEnum(gradeArray);
        }

        if (castRes.success && castRes.data) {
          const castArray = Object.entries(castRes.data).map(([_id, name]) => ({
            _id,
            name,
          }));
          setCastEnum(castArray);
        }

        if (rankRes.success && rankRes.data) {
          const rankArray = Object.entries(rankRes.data).map(([_id, name]) => ({
            _id,
            name,
          }));
          setRankEnum(rankArray);
        }

        // Fetch stations
        await fetchStationsWithoutPage();

        // Fetch districts
        await fetchDistricts();

        // Fetch tehsils
        await fetchTehsils();
      } catch (error) {
        console.error("💥 Error in main fetchFilterOptions:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update filterForm when filters prop changes
  useEffect(() => {
    setFilterForm({
      name: filters.name || "",
      address: filters.address || "",
      cast: filters.cast || "",
      rank: filters.rank || "",
      station: filters.station || "",
      district: filters.district || "",
      tehsil: filters.tehsil || "",
      status: filters.status || "",
      designation: filters.designation || "",
      grade: filters.grade || "",
      personalNumber: filters.personalNumber || "",
      cnic: filters.cnic || "",
      assetType: filters.assetType || "", // 🆕 Asset type
      serviceType: filters.serviceType || "", // 🆕 Add this line
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
    if (filterForm.name.trim()) activeFilters.name = filterForm.name.trim();
    if (filterForm.address.trim())
      activeFilters.address = filterForm.address.trim();
    if (filterForm.cast) activeFilters.cast = filterForm.cast;
    if (filterForm.rank) activeFilters.rank = filterForm.rank;
    if (filterForm.station) activeFilters.station = filterForm.station;
    if (filterForm.district) activeFilters.district = filterForm.district;
    if (filterForm.tehsil) activeFilters.tehsil = filterForm.tehsil;
    if (filterForm.status) activeFilters.status = filterForm.status;
    if (filterForm.designation)
      activeFilters.designation = filterForm.designation;
    if (filterForm.grade) activeFilters.grade = filterForm.grade;
    if (filterForm.personalNumber.trim())
      activeFilters.personalNumber = filterForm.personalNumber.trim();
    if (filterForm.cnic.trim()) activeFilters.cnic = filterForm.cnic.trim();
    if (filterForm.assetType) activeFilters.assetType = filterForm.assetType; // 🆕 Asset type
    if (filterForm.serviceType)
      activeFilters.serviceType = filterForm.serviceType; // 🆕 Add this line

    updateFilters(activeFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterForm({
      name: "",
      address: "",
      cast: "",
      rank: "",
      station: "",
      district: "",
      tehsil: "",
      status: "",
      designation: "",
      grade: "",
      personalNumber: "",
      cnic: "",
      assetType: "", // 🆕 Asset type
      serviceType: "", // 🆕 Add this line
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
          {/* Active filter count */}
          {Object.keys(filters).length > 0 && (
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {Object.keys(filters).length} active filter
              {Object.keys(filters).length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., Hamza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={filterForm.address}
              onChange={handleFilterChange}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., Street, Muhala, City"
            />
          </div>
          {/* Tehsil Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tehsil
            </label>
            <select
              name="tehsil"
              value={filterForm.tehsil}
              onChange={handleFilterChange}
              disabled={loading.tehsils}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
            >
              <option value="">
                {loading.tehsils ? "Loading..." : `All Tehsils`}
              </option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {tehsilEnum.map((tehsil) => (
                <option key={tehsil._id} value={tehsil._id}>
                  {tehsil.name}
                </option>
              ))}
            </select>
          </div>
          {/* District Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <select
              name="district"
              value={filterForm.district}
              onChange={handleFilterChange}
              disabled={loading.districts}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
            >
              <option value="">
                {loading.districts ? "Loading..." : `All Districts`}
              </option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {districtEnum.map((district) => (
                <option key={district._id} value={district._id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Number
            </label>
            <input
              type="text"
              name="personalNumber"
              value={filterForm.personalNumber}
              onChange={handleFilterChange}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., Emp-234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNIC
            </label>
            <input
              type="text"
              name="cnic"
              value={filterForm.cnic}
              onChange={handleFilterChange}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., 1234567891010"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filterForm.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Status</option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {Object.values(STATUS_ENUM).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <select
              name="designation"
              value={filterForm.designation}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Designations</option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {designationEnum.map((designation) => (
                <option key={designation._id} value={designation._id}>
                  {designation.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              name="grade"
              value={filterForm.grade}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Grades</option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {gradeEnum.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cast
            </label>
            <select
              name="cast"
              value={filterForm.cast}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Casts</option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {castEnum.map((cast) => (
                <option key={cast._id} value={cast._id}>
                  {cast.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rank
            </label>
            <select
              name="rank"
              value={filterForm.rank}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Ranks</option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {rankEnum.map((rank) => (
                <option key={rank._id} value={rank._id}>
                  {rank.name}
                </option>
              ))}
            </select>
          </div>
          {/* 🆕 Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              name="serviceType"
              value={filterForm.serviceType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Service Types</option>
              <option value={SERVICE_TYPE_ENUM.NA}>N/A</option>

              <option value={SERVICE_TYPE_ENUM.FEDERAL}>Federal</option>
              <option value={SERVICE_TYPE_ENUM.PROVINCIAL}>Provincial</option>
            </select>
          </div>

          {/* Station Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posting Station
            </label>
            <select
              name="station"
              value={filterForm.station}
              onChange={handleFilterChange}
              disabled={loading.stations}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
            >
              <option value="">
                {loading.stations ? "Loading..." : `All Stations`}
              </option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {stationEnum.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🆕 Asset Type Filter using useLookupOptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              name="assetType"
              value={filterForm.assetType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Asset Types</option>
              <option value="NA">N/A</option> {/* 🆕 Add this line */}
              {assetTypeOptions.map((option, idx) => (
                <option key={`${option.value}-${idx}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeFilters;
