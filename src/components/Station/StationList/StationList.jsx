import React, { useState, useEffect } from "react";
import { useStations } from "../StationHook.js";
import StationModal from "../AddStation/AddStation.jsx";
import StationViewModal from "../ViewStation/ViewStation.jsx";
import DrillUpPage from "../DrillUp/DrillUp.jsx";
import DrillDownPage from "../DrillDown/DrillDown.jsx";
import Pagination from "../Pagination/Pagination.jsx";
import StationFilters from "../Filter.jsx";
import StationEmployeeWrapper from "../Employeelist.jsx"; // 🆕 Add this
import MobileStationEmployeeSimple from "../MobileEmployeeList.jsx"; // 🆕 Add this
import { getStationLocationsWithEnum } from "../lookUp.js";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getEmployees } from "../../Employee/EmployeeApi.js";
import { getAllAssetAssignments } from "../../AssetAssignment/AssetApi.js";

const StationList = () => {
  const {
    stations,
    loading,
    error,
    removeStation,
    updateFilters,
    clearFilters,
    filters,
    createStation,
    modifyStation,
    // Add these if available from your hook
    currentPage,
    totalPages,
    totalStations,
    itemsPerPage,
    setPage,
    setItemsPerPage,
  } = useStations();

  const [imageIndexes, setImageIndexes] = useState({});
  const [imageModal, setImageModal] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Station locations state
  const [stationLocations, setStationLocations] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);
  const navigate = useNavigate();

  // Mobile view state
  const [showFilters, setShowFilters] = useState(false);

  // Multiple selection state
  const [selectedStations, setSelectedStations] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Export modal state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeStationDetails: true,
    includeEmployees: false,
    includeAssets: false,
  });

  // Drill pages state
  const [currentView, setCurrentView] = useState("list"); // 'list', 'drillUp', 'drillDown'
  const [drillUpData, setDrillUpData] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillStation, setDrillStation] = useState(null);

  // 🆕 Employee listing state - track which stations have expanded employee view
  const [expandedStations, setExpandedStations] = useState(new Set());

  // Fetch station locations on component mount
  useEffect(() => {
    fetchStationLocations();
  }, []);

  // Reset selection when stations change
  useEffect(() => {
    setSelectedStations(new Set());
    setSelectAll(false);
  }, [stations]);

  // Fetch station locations from API
  const fetchStationLocations = async () => {
    setLoadingLocations(true);
    try {
      const result = await getStationLocationsWithEnum();
      if (result.success) {
        setStationLocations(result.data);
      } else {
        console.error("Error fetching station locations:", result.error);
      }
    } catch (error) {
      console.error("Error fetching station locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Multiple selection handlers
  const handleSelectStation = (stationId) => {
    setSelectedStations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) {
        newSet.delete(stationId);
      } else {
        newSet.add(stationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStations(new Set());
    } else {
      setSelectedStations(new Set(safeStations.map((station) => station._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedStations.size === 0) {
      toast.error("Please select stations to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedStations.size} station(s)?`
      )
    ) {
      try {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const stationId of selectedStations) {
          try {
            // Validate ID format
            if (
              !stationId ||
              typeof stationId !== "string" ||
              stationId.trim() === ""
            ) {
              throw new Error("Invalid station ID format");
            }

            console.log("Attempting to delete station with ID:", stationId);

            const result = await removeStation(stationId.trim());

            if (result && result.success) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`${stationId}: ${result?.error || "Unknown error"}`);
            }
          } catch (error) {
            console.error(`Failed to delete station ${stationId}:`, error);
            errorCount++;
            errors.push(`${stationId}: ${error?.message || "Unknown error"}`);
          }
        }

        setSelectedStations(new Set());
        setSelectAll(false);

        if (successCount > 0 && errorCount === 0) {
          toast.success(`Successfully deleted ${successCount} station(s)`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.warning(
            `Deleted ${successCount} station(s), failed to delete ${errorCount}`
          );
          console.log("Errors:", errors);
        } else {
          toast.error("Failed to delete selected stations");
          console.log("All errors:", errors);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Error deleting stations");
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedStations(new Set());
    setSelectAll(false);
  };

  const handleDelete = async (id) => {
    // Validate ID format
    if (!id || typeof id !== "string" || id.trim() === "") {
      toast.error("Invalid station ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this station?")) {
      try {
        console.log("Attempting to delete station with ID:", id);

        const result = await removeStation(id.trim());

        if (result && result.success) {
          console.log("Station deleted successfully");
        } else {
          console.error("Failed to delete station:", result?.error);
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleAddStation = () => {
    setIsEditMode(false);
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleImportStation = () => {
    navigate("/stationimport");
  };

  const handleOpenExport = () => {
    setIsExportOpen(true);
  };

  const handleCloseExport = () => {
    setIsExportOpen(false);
  };

  const handleToggleOption = (key) => {
    setExportOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const escapeHtml = (str) => {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const getEmployeeAssetsString = async (employeeId) => {
    try {
      const result = await getAllAssetAssignments({ employee: employeeId });
      if (result.success && result.data) {
        const activeAssignments = result.data.filter(
          (assignment) =>
            assignment.isApproved &&
            assignment.status === "Active" &&
            !assignment.consumedDate &&
            !assignment.returnedDate
        );
        const assetNames = [];
        activeAssignments.forEach((assignment) => {
          if (assignment.asset && Array.isArray(assignment.asset)) {
            assignment.asset.forEach((asset) => {
              if (asset && asset.name) assetNames.push(asset.name);
            });
          }
        });
        return assetNames.join(", ");
      }
    } catch (e) {
      // ignore
    }
    return "";
  };

  const buildExportData = async () => {
    const stationsOnPage = safeStations;
    const includeEmployees =
      exportOptions.includeEmployees || exportOptions.includeAssets;

    const stationData = [];
    for (const station of stationsOnPage) {
      const entry = { station, employees: [] };
      if (includeEmployees) {
        try {
          const empRes = await getEmployees({
            station: station._id,
            limit: 1000,
          });
          const employees = empRes?.data?.employees || empRes?.data || [];
          entry.employees = Array.isArray(employees) ? employees : [];
        } catch (e) {
          entry.employees = [];
        }
      }
      // If including assets, enrich employees with assets string (batched)
      if (exportOptions.includeAssets && entry.employees.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < entry.employees.length; i += batchSize) {
          const batch = entry.employees.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (emp) => {
              emp.__assets = await getEmployeeAssetsString(emp._id);
            })
          );
        }
      }
      stationData.push(entry);
    }
    return stationData;
  };

  const generateHtmlForExport = (data) => {
    const style = `
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { font-size: 20px; margin: 0 0 12px; }
        h2 { font-size: 16px; margin: 16px 0 8px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
        .section { page-break-inside: avoid; margin-bottom: 24px; }
      </style>
    `;

    const sections = data
      .map(({ station, employees }) => {
        const parts = [];
        // Station details
        if (exportOptions.includeStationDetails) {
          parts.push(`
            <h2>Station: ${escapeHtml(station.name)}</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tehsil</th>
                  <th>Address</th>
                  <th>District</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${escapeHtml(station.name)}</td>
                  <td>${escapeHtml(getStationLocationName(station.tehsil))}</td>
                  <td>${escapeHtml(station.address?.line1 || "")}${
            station.address?.line2
              ? ", " + escapeHtml(station.address.line2)
              : ""
          }${
            station.address?.city ? ", " + escapeHtml(station.address.city) : ""
          }</td>
                  <td>${escapeHtml(station.district || "")}</td>
                  <td>${escapeHtml(station.status || "")}</td>
                </tr>
              </tbody>
            </table>
          `);
        }

        if (exportOptions.includeEmployees && employees.length > 0) {
          parts.push(`
            <h3>Employees</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Personal #</th>
                  <th>Designation</th>
                  <th>Grade</th>
                  <th>Service Type</th>
                  ${exportOptions.includeAssets ? "<th>Assets</th>" : ""}
                </tr>
              </thead>
              <tbody>
                ${employees
                  .map((e) => {
                    const fullName = `${escapeHtml(
                      e.firstName || ""
                    )} ${escapeHtml(e.lastName || "")}`.trim();
                    const designation =
                      e.designation?.title || e.designation || "";
                    const grade = e.grade?.name || e.grade || "";
                    const serviceType = e.serviceType || "";
                    const assets = exportOptions.includeAssets
                      ? `<td>${escapeHtml(e.__assets || "")}</td>`
                      : "";
                    return `<tr>
                      <td>${fullName}</td>
                      <td>${escapeHtml(e.personalNumber || "")}</td>
                      <td>${escapeHtml(designation)}</td>
                      <td>${escapeHtml(grade)}</td>
                      <td>${escapeHtml(serviceType)}</td>
                      ${assets}
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>
          `);
        }

        return `<div class="section">${parts.join("")}</div>`;
      })
      .join("");

    return `<!doctype html><html><head><meta charset="utf-8" />${style}<title>Stations Export</title></head><body><h1>Stations Export</h1>${sections}</body></html>`;
  };

  const handleExport = async (format) => {
    if (
      !exportOptions.includeStationDetails &&
      !exportOptions.includeEmployees &&
      !exportOptions.includeAssets
    ) {
      toast.error("Select at least one export option");
      return;
    }

    try {
      const data = await buildExportData();

      if (format === "pdf") {
        const html = generateHtmlForExport(data);
        const win = window.open("", "_blank");
        if (!win) {
          toast.error("Popup blocked. Please allow popups to export PDF.");
          return;
        }
        win.document.open();
        win.document.write(
          html +
            "<script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 500);}</script>"
        );
        win.document.close();
      } else if (format === "xls") {
        const XLSX = await import("xlsx");

        const wb = XLSX.utils.book_new();

        // Stations sheet
        const stationHeaders = [
          "Name",
          "Tehsil",
          "Address",
          "District",
          "Status",
        ];
        const stationRows = data.map(({ station }) => [
          station?.name || "",
          getStationLocationName(station?.tehsil),
          [
            station?.address?.line1,
            station?.address?.line2,
            station?.address?.city,
          ]
            .filter(Boolean)
            .join(", "),
          station?.district || "",
          station?.status || "",
        ]);
        const stationSheet = XLSX.utils.aoa_to_sheet([
          stationHeaders,
          ...stationRows,
        ]);
        XLSX.utils.book_append_sheet(wb, stationSheet, "Stations");

        // Employees sheet (optional)
        if (exportOptions.includeEmployees) {
          const empHeaders = [
            "Station",
            "Employee Name",
            "Personal #",
            "Designation",
            "Grade",
            "Service Type",
          ];
          if (exportOptions.includeAssets) empHeaders.push("Assets");

          const empRows = [];
          data.forEach(({ station, employees }) => {
            employees.forEach((e) => {
              const fullName = `${e?.firstName || ""} ${
                e?.lastName || ""
              }`.trim();
              const row = [
                station?.name || "",
                fullName,
                e?.personalNumber || "",
                e?.designation?.title || e?.designation || "",
                e?.grade?.name || e?.grade || "",
                e?.serviceType || "",
              ];
              if (exportOptions.includeAssets) row.push(e?.__assets || "");
              empRows.push(row);
            });
          });

          const empSheet = XLSX.utils.aoa_to_sheet([empHeaders, ...empRows]);
          XLSX.utils.book_append_sheet(wb, empSheet, "Employees");
        }

        XLSX.writeFile(wb, "stations_export.xlsx");
      }

      setIsExportOpen(false);
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Failed to export");
    }
  };

  const handleEdit = (station) => {
    setIsEditMode(true);
    setEditData(station);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditData(null);
  };

  // Handle view station details
  const handleView = (station) => {
    setSelectedStation(station);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedStation(null);
  };

  // Drill Up - Show employees by station ID
  const handleDrillUp = (station) => {
    setDrillStation(station);
    setDrillUpData({
      stationId: station._id,
      stationName: station.name,
    });
    setCurrentView("drillUp");
  };

  const handleDrillDownTravel = () => {
    setDrillDownData({
      tehsil: drillStation.tehsil,
    });
    setCurrentView("drillDown");
  };

  const handleDrillUpTravel = () => {
    setDrillUpData({
      stationId: drillStation._id,
      stationName: drillStation.name,
    });
    setCurrentView("drillUp");
  };

  // Drill Down - Show stations by tehsil
  const handleDrillDown = (station) => {
    setDrillStation(station);
    setDrillDownData({
      tehsil: station.tehsil,
    });
    setCurrentView("drillDown");
  };

  // Back to main list
  const handleBackToList = () => {
    setCurrentView("list");
    setDrillUpData(null);
    setDrillDownData(null);
  };

  // 🆕 Toggle employee listing for a station
  const handleToggleEmployeeView = (stationId, show) => {
    setExpandedStations((prev) => {
      const newSet = new Set(prev);
      if (show) {
        newSet.add(stationId);
      } else {
        newSet.delete(stationId);
      }
      return newSet;
    });
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (setPage) {
      setPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (setItemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      // Reset to first page when changing items per page
      if (setPage) setPage(1);
    }
  };

  const handlePrevImage = (stationId, imagesLength) => {
    setImageIndexes((prev) => ({
      ...prev,
      [stationId]:
        (prev[stationId] ?? 0) === 0
          ? imagesLength - 1
          : (prev[stationId] ?? 0) - 1,
    }));
  };

  const handleNextImage = (stationId, imagesLength) => {
    setImageIndexes((prev) => ({
      ...prev,
      [stationId]:
        (prev[stationId] ?? 0) === imagesLength - 1
          ? 0
          : (prev[stationId] ?? 0) + 1,
    }));
  };

  // Helper function to get station location name by ID
  const getStationLocationName = (locationId) => {
    return stationLocations[locationId] || locationId;
  };

  // Safety check for stations
  const safeStations = Array.isArray(stations) ? stations : [];

  // Render drill up page
  if (currentView === "drillUp" && drillUpData) {
    return (
      <DrillUpPage
        stationId={drillUpData.stationId}
        stationName={drillUpData.stationName}
        onBack={handleBackToList}
        onDrill={handleDrillDownTravel}
      />
    );
  }

  // Render drill down page
  if (currentView === "drillDown" && drillDownData) {
    return (
      <DrillDownPage tehsil={drillDownData.tehsil} onBack={handleBackToList} onDrill={handleDrillUpTravel} />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Station Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={handleAddStation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
          >
            Add Station
          </button>
          <button
            onClick={handleImportStation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
          >
            Import Station File
          </button>
          <button
            onClick={handleOpenExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm"
          >
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Station Filters Component */}
      <StationFilters
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Bulk Actions Bar */}
      {selectedStations.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <span className="text-sm text-blue-800 font-medium">
            {selectedStations.size} station(s) selected
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
            >
              Delete Selected
            </button>
            <button
              onClick={handleClearSelection}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Station Table/Cards - Responsive */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Desktop Table View - Only for screens 1200px+ */}
        <div className="hidden xl:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facilities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minimum Requirements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeStations.map((station) => (
                  <React.Fragment key={station._id}>
                    {/* 🆕 Station Row - Your existing station row */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStations.has(station._id)}
                          onChange={() => handleSelectStation(station._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {/* Show main image if available */}
                        {station.stationImageUrl &&
                        station.stationImageUrl.length > 0 ? (
                          <div className="relative">
                            <img
                              src={
                                station.stationImageUrl[
                                  imageIndexes[station._id] ?? 0
                                ]
                              }
                              alt="Station"
                              onClick={() =>
                                setImageModal(
                                  station.stationImageUrl[
                                    imageIndexes[station._id] ?? 0
                                  ]
                                )
                              }
                              className="h-16 w-16 rounded border object-cover cursor-pointer hover:scale-105 transition"
                            />
                            {station.stationImageUrl.length > 1 && (
                              <>
                                <button
                                  onClick={() =>
                                    handlePrevImage(
                                      station._id,
                                      station.stationImageUrl.length
                                    )
                                  }
                                  className="absolute top-1/2 -left-5 transform -translate-y-1/2 text-gray-600 hover:text-black"
                                >
                                  ‹
                                </button>
                                <button
                                  onClick={() =>
                                    handleNextImage(
                                      station._id,
                                      station.stationImageUrl.length
                                    )
                                  }
                                  className="absolute top-1/2 -right-5 transform -translate-y-1/2 text-gray-600 hover:text-black"
                                >
                                  ›
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              className="h-5 w-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start space-y-2">
                          <div className="pt-2">
                            <div className="text-sm font-medium text-gray-900">
                              {station.name}
                            </div>
                            <div className="text-sm text-gray-900">
                              {/* Facilities */}
                              {station?.stationIncharge &&
                                station?.stationIncharge.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {station?.stationIncharge?.map(
                                        (itm, index) => (
                                          <span
                                            key={index}
                                            // className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                                          >
                                            {/* {itm.employee} {itm.type} */}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {/* Facilities */}
                          {station?.facilities &&
                            station?.facilities.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {station?.facilities?.map(
                                    (facility, index) => (
                                      <span
                                        key={index}
                                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                                      >
                                        {facility}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                         <span> Tehsil: {getStationLocationName(station.tehsil)}</span>
                          <span className="ml-2">District: {getStationLocationName(station.district)}</span>
                        </div>
                        <div className="text-sm text-gray-900">
                          {station.address?.line1}
                        </div>
                        <div className="text-sm text-gray-500">
                          {station.address?.line2 &&
                            `${station.address.line2}, `}
                          {station.address?.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {/* Minimum Requirements */}
                          {station?.stationMinimumRequirements &&
                            station?.stationMinimumRequirements.length > 0 && (
                              <div className="mt-2">
                                {station?.stationMinimumRequirements?.map(
                                  (req, index) => (
                                    <div
                                      key={index}
                                      className="text-xs text-gray-600 ml-2 mb-2"
                                    >
                                      {req.numberOfStaff && (
                                        <p className="mb-1">
                                          • Staff Required: {req?.numberOfStaff}
                                        </p>
                                      )}

                                      {/* General Asset Requirements */}
                                      {req?.assetRequirement &&
                                        req?.assetRequirement.length > 0 && (
                                          <div className="ml-2 mb-1">
                                            <p className="font-medium text-gray-700 mb-1">
                                              🛠️ General Assets:
                                            </p>
                                            {req?.assetRequirement?.map(
                                              (assetReq, assetIndex) => (
                                                <div
                                                  key={assetIndex}
                                                  className="ml-2 mb-1 p-1 bg-blue-50 rounded"
                                                >
                                                  <p>
                                                    <span className="font-medium">
                                                      {assetReq?.assets?.name ||
                                                        "Unknown Asset"}
                                                    </span>
                                                    {" × "}
                                                    <span className="text-blue-600 font-medium">
                                                      {assetReq?.quantity}
                                                    </span>
                                                  </p>
                                                  <p className="text-xs text-gray-500 capitalize">
                                                    Type:{" "}
                                                    {assetReq?.assets?.type ||
                                                      "N/A"}
                                                  </p>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}

                                      {/* Staff Details with their Asset Requirements */}
                                      {req.staffDetail &&
                                        req.staffDetail.length > 0 && (
                                          <div className="ml-2">
                                            <p className="font-medium text-gray-700 mb-1">
                                              👤 Staff Details:
                                            </p>
                                            {req?.staffDetail?.map(
                                              (staff, staffIndex) => (
                                                <div
                                                  key={staffIndex}
                                                  className="ml-2 mb-2 p-1 bg-gray-50 rounded"
                                                >
                                                  <p className="mb-1">
                                                    -{" "}
                                                    {staff?.designation ||
                                                      "Staff"}
                                                    : {staff?.numberOfPersonal}{" "}
                                                    personnel
                                                  </p>

                                                  {/* Staff Asset Requirements */}
                                                  {staff?.assetRequirement &&
                                                    staff?.assetRequirement
                                                      .length > 0 && (
                                                      <div className="ml-2">
                                                        <p className="text-xs font-medium text-gray-600 mb-1">
                                                          🚗 Assigned Assets:
                                                        </p>
                                                        {staff?.assetRequirement?.map(
                                                          (
                                                            staffAsset,
                                                            staffAssetIndex
                                                          ) => (
                                                            <div
                                                              key={
                                                                staffAssetIndex
                                                              }
                                                              className="ml-2 mb-1 p-1 bg-yellow-50 rounded"
                                                            >
                                                              <p>
                                                                <span className="font-medium">
                                                                  {staffAsset
                                                                    ?.assets
                                                                    ?.name ||
                                                                    "Unknown Asset"}
                                                                </span>
                                                                {" × "}
                                                                <span className="text-orange-600 font-medium">
                                                                  {
                                                                    staffAsset?.quantity
                                                                  }
                                                                </span>
                                                              </p>
                                                              <p className="text-xs text-gray-500 capitalize">
                                                                Type:{" "}
                                                                {staffAsset
                                                                  ?.assets
                                                                  ?.type ||
                                                                  "N/A"}
                                                              </p>
                                                            </div>
                                                          )
                                                        )}
                                                      </div>
                                                    )}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap text-sm font-medium">
                        <div className="grid  gap-1">
                          <div className=" flex flex-row flex-wrap gap-1">
                            {" "}
                            <button
                              onClick={() => handleDrillUp(station)}
                              className="flex items-center justify-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                              title="View employees at this station"
                            >
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Drill Down
                            </button>
                            <button
                              onClick={() => handleDrillDown(station)}
                              className="flex items-center justify-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                              title="View all stations in this tehsil"
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Drill Up
                            </button>
                          
                            <button
                              onClick={() => handleView(station)}
                              className="px-3 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(station)}
                              className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            >
                              Edit
                            </button>
                            {/* <button
                              onClick={() => handleDelete(station._id)}
                              className="px-3 py-1 text-xs rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                            >
                              Delete
                            </button> */}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* 🆕 Employee Listing Rows - Using existing EmployeeList component */}
                    <StationEmployeeWrapper
                      stationId={station._id}
                      stationName={station.name}
                      showAll={expandedStations.has(station._id)}
                      onToggleView={(show) =>
                        handleToggleEmployeeView(station._id, show)
                      }
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View - For screens under 1200px */}
        <div className="xl:hidden">
          {safeStations.map((station) => (
            <div key={station._id} className="border-b border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedStations.has(station._id)}
                  onChange={() => handleSelectStation(station._id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-shrink-0 relative">
                  {/* Station Image */}
                  {station.stationImageUrl &&
                  station.stationImageUrl.length > 0 ? (
                    <div className="relative">
                      <img
                        src={
                          station.stationImageUrl[
                            imageIndexes[station._id] ?? 0
                          ]
                        }
                        alt="Station"
                        onClick={() =>
                          setImageModal(
                            station.stationImageUrl[
                              imageIndexes[station._id] ?? 0
                            ]
                          )
                        }
                        className="h-12 w-12 rounded border object-cover cursor-pointer hover:scale-105 transition"
                      />
                      {station.stationImageUrl.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              handlePrevImage(
                                station._id,
                                station.stationImageUrl.length
                              )
                            }
                            className="absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                            style={{ fontSize: "10px" }}
                          >
                            ‹
                          </button>
                          <button
                            onClick={() =>
                              handleNextImage(
                                station._id,
                                station.stationImageUrl.length
                              )
                            }
                            className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                            style={{ fontSize: "10px" }}
                          >
                            ›
                          </button>
                          <div
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 rounded-full"
                            style={{ fontSize: "8px" }}
                          >
                            {(imageIndexes[station._id] ?? 0) + 1}/
                            {station.stationImageUrl.length}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {station.name}
                    </h3>
                  </div>

                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-gray-500">
                      Tehsil: {getStationLocationName(station.tehsil)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {station.address?.line1 || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {station.address?.line2 && `${station.address.line2}, `}
                      {station.address?.city || "N/A"}
                    </p>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="mt-3">
                    {/* Primary Actions Row */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleView(station)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-center"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(station)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-center"
                      >
                        Edit
                      </button>
                    </div>

                    {/* 🆕 Employee Toggle Button */}
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      <button
                        onClick={() =>
                          handleToggleEmployeeView(
                            station._id,
                            !expandedStations.has(station._id)
                          )
                        }
                        className={`px-3 py-1 text-xs rounded-md text-center transition ${
                          expandedStations.has(station._id)
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        }`}
                      >
                        {expandedStations.has(station._id)
                          ? "Hide Employees"
                          : "Show Employees"}
                      </button>
                    </div>

                    {/* Drill Actions Row */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleDrillUp(station)}
                        className="flex items-center justify-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Drill Down
                      </button>
                      <button
                        onClick={() => handleDrillDown(station)}
                        className="flex items-center justify-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Drill Up
                      </button>
                    </div>

                    {/* Delete Action Row */}
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleDelete(station._id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* 🆕 Mobile Employee Listing - Simple redirect to main employee list */}
                  <MobileStationEmployeeSimple
                    stationId={station._id}
                    stationName={station.name}
                    isExpanded={expandedStations.has(station._id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {safeStations.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No stations found</p>
          </div>
        )}

        {/* Pagination Component */}
        {(totalPages > 1 || safeStations.length > 0) && (
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={currentPage || 1}
              totalPages={totalPages || 1}
              totalItems={totalStations || safeStations.length}
              itemsPerPage={itemsPerPage || 50}
              onPageChange={handlePageChange}
              onItemsPerPageChange={
                setItemsPerPage ? handleItemsPerPageChange : undefined
              }
              showItemsPerPage={!!setItemsPerPage}
              itemsPerPageOptions={[10, 20, 50, 100, 200, 500]}
              showPageInfo={true}
              showFirstLast={true}
              maxVisiblePages={5}
              disabled={loading}
              className="px-6"
            />
          </div>
        )}
      </div>

      {/* Add/Edit Station Modal */}
      <StationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEdit={isEditMode}
        editData={editData}
        createStation={createStation}
        modifyStation={modifyStation}
      />

      {/* View Station Modal */}
      <StationViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        station={selectedStation}
      />

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={imageModal}
              alt="Full View"
              className="max-w-full max-h-screen rounded shadow-lg"
            />
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-60 px-3 py-1 rounded hover:bg-opacity-90"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Export Options</h2>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStationDetails}
                  onChange={() => handleToggleOption("includeStationDetails")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Export current Station Details</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeEmployees}
                  onChange={() => handleToggleOption("includeEmployees")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Export Station Employees details</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAssets}
                  onChange={() => handleToggleOption("includeAssets")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Station Assets</span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport("pdf")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport("xls")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Export XLS
                </button>
              </div>
              <button
                onClick={handleCloseExport}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Note: Only stations currently visible in the table (after filters
              and current page) will be exported.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationList;
