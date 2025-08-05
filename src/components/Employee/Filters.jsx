import React, { useState, useEffect } from "react";
import { getDesignationsWithEnum } from "./AddEmployee/Designation.js";
import { getGradesWithEnum } from "./AddEmployee/Grades.js";
import { getCastsWithEnum } from "./AddEmployee/Cast.js"; // ✅ Add this import
import { getRanksWithEnum } from "./AddEmployee/Rank.js"; // ✅ Add rank import
import { STATUS_ENUM } from "./AddEmployee/EmployeeConstants";

const EmployeeFilters = ({ 
  filters, 
  updateFilters, 
  clearFilters, 
  showFilters, 
  setShowFilters 
}) => {
  // Filter dropdown options
  const [designationEnum, setDesignationEnum] = useState([]);
  const [gradeEnum, setGradeEnum] = useState([]);
  const [castEnum, setCastEnum] = useState([]); // ✅ Add cast enum state
  const [rankEnum, setRankEnum] = useState([]); // ✅ Add rank enum state

  // Filter state - Updated to use address and cast instead of city
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    address: filters.address || "", // ✅ Changed from city to address
    cast: filters.cast || "", // ✅ Added cast filter
    rank: filters.rank || "", // ✅ Added rank filter
    status: filters.status || "",
    designation: filters.designation || "",
    grade: filters.grade || "",
    personalNumber: filters.personalNumber || "",
    cnic: filters.cnic || "",
  });

  // Fetch dropdown options for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log("Fetching designations, grades, cast, and rank...");
        const [desigRes, gradeRes, castRes, rankRes] = await Promise.all([
          getDesignationsWithEnum(),
          getGradesWithEnum(),
          getCastsWithEnum(), // ✅ Fetch cast options
          getRanksWithEnum(), // ✅ Fetch rank options
        ]);

        console.log("Designation response:", desigRes);
        console.log("Grade response:", gradeRes);
        console.log("Cast response:", castRes); // ✅ Log cast response
        console.log("Rank response:", rankRes); // ✅ Log rank response

        if (desigRes.success && desigRes.data) {
          // Convert object to array format
          const designationArray = Object.entries(desigRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setDesignationEnum(designationArray);
          console.log("Set designations array:", designationArray);
        } else {
          console.error("Invalid designation response:", desigRes);
        }

        if (gradeRes.success && gradeRes.data) {
          // Convert object to array format
          const gradeArray = Object.entries(gradeRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setGradeEnum(gradeArray);
          console.log("Set grades array:", gradeArray);
        } else {
          console.error("Invalid grade response:", gradeRes);
        }

        // ✅ Handle cast response
        if (castRes.success && castRes.data) {
          // Convert object to array format
          const castArray = Object.entries(castRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setCastEnum(castArray);
          console.log("Set cast array:", castArray);
        } else {
          console.error("Invalid cast response:", castRes);
        }

        // ✅ Handle rank response
        if (rankRes.success && rankRes.data) {
          // Convert object to array format
          const rankArray = Object.entries(rankRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setRankEnum(rankArray);
          console.log("Set rank array:", rankArray);
        } else {
          console.error("Invalid rank response:", rankRes);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update filterForm when filters prop changes
  useEffect(() => {
    setFilterForm({
      name: filters.name || "",
      address: filters.address || "", // ✅ Changed from city to address
      cast: filters.cast || "", // ✅ Added cast
      rank: filters.rank || "", // ✅ Added rank
      status: filters.status || "",
      designation: filters.designation || "",
      grade: filters.grade || "",
      personalNumber: filters.personalNumber || "",
      cnic: filters.cnic || "",
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
    if (filterForm.address.trim()) activeFilters.address = filterForm.address.trim(); // ✅ Changed from city to address
    if (filterForm.cast) activeFilters.cast = filterForm.cast; // ✅ Added cast filter
    if (filterForm.rank) activeFilters.rank = filterForm.rank; // ✅ Added rank filter
    if (filterForm.status) activeFilters.status = filterForm.status;
    if (filterForm.designation)
      activeFilters.designation = filterForm.designation;
    if (filterForm.grade) activeFilters.grade = filterForm.grade;
    if (filterForm.personalNumber.trim())
      activeFilters.personalNumber = filterForm.personalNumber.trim();
    if (filterForm.cnic.trim()) activeFilters.cnic = filterForm.cnic.trim();
    updateFilters(activeFilters);
    setShowFilters(false); // Close filters on mobile after applying
  };

  const handleClearFilters = () => {
    setFilterForm({
      name: "",
      address: "", // ✅ Changed from city to address
      cast: "", // ✅ Added cast
      rank: "", // ✅ Added rank
      status: "",
      designation: "",
      grade: "",
      personalNumber: "",
      cnic: "",
    });
    clearFilters();
  };

  return (
    <>
      {/* Filter Toggle Button - Show on medium and small screens */}
      <div className="xl:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
            />
          </svg>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filter Section - Responsive */}
      <div
        className={`bg-white shadow-md rounded-lg p-4 mb-6 ${
          showFilters ? "block" : "hidden"
        } xl:block`}
      >
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Filter Employees
        </h3>

        {/* Filter Grid - Responsive - Updated to accommodate new field */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="e.g., Street, Muhala, City"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Status</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Designations</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Grades</option>
              {gradeEnum.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ New Cast Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cast
            </label>
            <select
              name="cast"
              value={filterForm.cast}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Casts</option>
              {castEnum.map((cast) => (
                <option key={cast._id} value={cast._id}>
                  {cast.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ New Rank Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rank
            </label>
            <select
              name="rank"
              value={filterForm.rank}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Ranks</option>
              {rankEnum.map((rank) => (
                <option key={rank._id} value={rank._id}>
                  {rank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Buttons - Stack vertically on mobile/tablet */}
          <div className="flex flex-col space-y-2 sm:col-span-2 xl:col-span-4">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeFilters;