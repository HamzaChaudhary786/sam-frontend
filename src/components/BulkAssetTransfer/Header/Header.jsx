import React, { useState, useEffect } from "react";
import { getMaalkhanaOptions } from "../../BulkAsset/BulkAssetApi.js";
import { EnumSelect } from "../../SearchableDropdown.jsx";
import { getAllStationsWithoutPage } from "../../Station/StationApi.js";
import { getEmployeesWithoutPagination } from "../../Employee/EmployeeApi.js";

const BulkAssetHeader = ({ headerData, onHeaderChange, loading }) => {
  const [maalkhanaOptions, setMaalkhanaOptions] = useState([]);
  const [loadingMaalkhana, setLoadingMaalkhana] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Target radio selection: mallkhana | station | employee
  const [target, setTarget] = useState("mallkhana");

  // Search states and results for station/employee
  const [stationSearch, setStationSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [isSearching, setIsSearching] = useState({});
  const [searchResults, setSearchResults] = useState({ stations: [], employees: [] });

  useEffect(() => {
    fetchMaalkhanaOptions();
  }, []);

  const fetchMaalkhanaOptions = async () => {
    setLoadingMaalkhana(true);
    setApiError(null);

    try {
      const result = await getMaalkhanaOptions();

      if (result.success) {
        let stations = [];

        if (Array.isArray(result.data)) {
          stations = result.data;
        } else if (result.data && Array.isArray(result.data.stations)) {
          stations = result.data.stations;
        } else if (
          result.data &&
          result.data.data &&
          Array.isArray(result.data.data.stations)
        ) {
          stations = result.data.data.stations;
        } else {
          setApiError("Unexpected data structure from API");
        }

        if (stations.length === 0) {
          setApiError("No stations available");
        }

        const options = stations.map((item) => ({
          value: item._id,
          label: item.name,
        }));

        setMaalkhanaOptions(options);
      } else {
        setApiError(result.error || "Failed to fetch maalkhana options");
      }
    } catch (error) {
      setApiError(error.message || "Network error occurred");
    } finally {
      setLoadingMaalkhana(false);
    }
  };

  const maalkhanaEnum = React.useMemo(() => {
    const enumObj = {};
    maalkhanaOptions.forEach((option) => {
      enumObj[option.value] = option.label;
    });
    return enumObj;
  }, [maalkhanaOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onHeaderChange(name, value);
  };

  const handleMaalkhanaChange = (e) => {
    const selectedOption = maalkhanaOptions.find(
      (option) => option.value === e.target.value
    );
    // Disallow same target vs current when applicable (no current mallkhana object besides id in header)
    if (
      (headerData.station && headerData.station._id === e.target.value) ||
      (headerData.employee && headerData.employee._id === e.target.value)
    ) {
      alert("Target Mallkhana cannot be the same as current Station/Employee");
      return;
    }
    // Set mallkhana and clear station/employee for exclusivity
    onHeaderChange("mallkhana", {
      _id: e.target.value,
      name: selectedOption?.label || "",
    });
    onHeaderChange("station", null);
    onHeaderChange("employee", null);
  };

  const selectStation = (station) => {
    // Disallow same target station as current mallkhana id or current employee id
    if (
      (headerData.mallkhana && headerData.mallkhana._id === station._id) ||
      (headerData.employee && headerData.employee._id === station._id)
    ) {
      alert("Target Station cannot be the same as current Mallkhana/Employee");
      return;
    }
    // Set station and clear mallkhana/employee for exclusivity
    onHeaderChange("station", station);
    onHeaderChange("mallkhana", null);
    onHeaderChange("employee", null);
    setStationSearch("");
    setSearchResults((prev) => ({ ...prev, stations: [] }));
  };

  const selectEmployee = (employee) => {
    // Disallow same target employee as current mallkhana id or current station id
    if (
      (headerData.mallkhana && headerData.mallkhana._id === employee._id) ||
      (headerData.station && headerData.station._id === employee._id)
    ) {
      alert("Target Employee cannot be the same as current Mallkhana/Station");
      return;
    }
    // Set employee and clear mallkhana/station for exclusivity
    onHeaderChange("employee", employee);
    onHeaderChange("mallkhana", null);
    onHeaderChange("station", null);
    setEmployeeSearch("");
    setSearchResults((prev) => ({ ...prev, employees: [] }));
  };

  const searchStations = async (query) => {
    if (!query.trim()) {
      setSearchResults((prev) => ({ ...prev, stations: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, station: true }));

    try {
      const result = await getAllStationsWithoutPage({ name: query, limit: 25 });

      if (result.success) {
        const stations = result?.data?.result || result.data || [];
        const filteredStations = stations.filter(
          (station) => station.name && station.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults((prev) => ({ ...prev, stations: filteredStations }));
      }
    } catch (error) {
      // silently ignore in header
    } finally {
      setIsSearching((prev) => ({ ...prev, station: false }));
    }
  };

  const searchEmployees = async (query) => {
    if (!query.trim()) {
      setSearchResults((prev) => ({ ...prev, employees: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, employee: true }));

    try {
      const result = await getEmployeesWithoutPagination({ name: query, limit: 25 });
      if (result.success) {
        const employees = result.data.employees || result.data || [];
        setSearchResults((prev) => ({ ...prev, employees }));
      }
    } catch (error) {
      // silently ignore in header
    } finally {
      setIsSearching((prev) => ({ ...prev, employee: false }));
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Batch Information</h2>

      {/* Target selection */}
      <div className="flex items-center gap-6 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="target"
            value="mallkhana"
            checked={target === "mallkhana"}
            onChange={(e) => setTarget(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Mallkhana</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="target"
            value="station"
            checked={target === "station"}
            onChange={(e) => setTarget(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Station</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="target"
            value="employee"
            checked={target === "employee"}
            onChange={(e) => setTarget(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Employee</span>
        </label>
      </div>

      {/* Conditional selectors based on target */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {target === "mallkhana" && (
          <div>
            <EnumSelect
              label="Maalkhana"
              name="mallkhana"
              value={headerData.mallkhana?._id || ""}
              onChange={handleMaalkhanaChange}
              enumObject={maalkhanaEnum}
              required={true}
              disabled={loading || loadingMaalkhana}
              placeholder={
                loadingMaalkhana
                  ? "Loading..."
                  : apiError
                  ? "Error loading options"
                  : maalkhanaOptions.length === 0
                  ? "No options available"
                  : "Select Maalkhana..."
              }
            />
          </div>
        )}

        {target === "station" && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
            {headerData.station ? (
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {headerData.station.name}
                  </div>
                  {headerData.station.district && (
                    <div className="text-xs text-gray-500 truncate">
                      {headerData.station.district}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onHeaderChange("station", null)}
                  disabled={loading}
                  className="text-xs text-red-600 hover:text-red-800 ml-2 flex-shrink-0 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search station..."
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                  value={stationSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStationSearch(value);
                    searchStations(value);
                  }}
                />
                {isSearching.station && (
                  <div className="absolute right-3 top-10">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {searchResults.stations?.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.stations.map((station) => (
                      <button
                        key={station._id}
                        onClick={() => selectStation(station)}
                        disabled={loading}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 truncate">
                          {station.name}
                        </div>
                        {station.district && (
                          <div className="text-xs text-gray-500 truncate">
                            {station.district}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {target === "employee" && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            {headerData.employee ? (
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {headerData.employee.firstName} {headerData.employee.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {headerData.employee.personalNumber || headerData.employee.rank || headerData.employee.pnumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onHeaderChange("employee", null)}
                  disabled={loading}
                  className="text-xs text-red-600 hover:text-red-800 ml-2 flex-shrink-0 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search employee..."
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                  value={employeeSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmployeeSearch(value);
                    searchEmployees(value);
                  }}
                />
                {isSearching.employee && (
                  <div className="absolute right-3 top-10">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {searchResults.employees?.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.employees.map((employee) => (
                      <button
                        key={employee._id}
                        onClick={() => selectEmployee(employee)}
                        disabled={loading}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm disabled:opacity-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 truncate">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {employee.personalNumber || employee.rank || employee.pnumber} | {employee.cnic}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Batch Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch Date
          </label>
          <input
            type="date"
            name="receiveDate"
            value={headerData.receiveDate}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            name="referenceNumber"
            value={headerData.referenceNumber}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter reference number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Letter Info
          </label>
          <textarea
            name="description"
            value={headerData.description}
            onChange={handleChange}
            disabled={loading}
            rows={2}
            placeholder="Enter batch description Letter Info"
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default BulkAssetHeader;
