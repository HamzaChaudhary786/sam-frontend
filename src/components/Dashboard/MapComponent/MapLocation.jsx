

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  LayersControl,
  LayerGroup,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import { locationAPI, externalAPI } from "../../../services/locationApi";
import { getFixLocationData } from "./mapStationApi.js";
// push & commit & type first
// Fix for default markers in React-Leaflet and create proper location marker icons
delete L.Icon.Default.prototype._getIconUrl;

// Create custom location marker icons
const createLocationIcon = (color = "#3b82f6") => {
  return new L.DivIcon({
    className: "custom-location-icon",
    html: `
            <div style="position: relative;">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="${color}"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                </svg>
            </div>
        `,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });
};

// Predefined marker colors for different purposes
const MARKER_COLORS = {
  CLICKED: "#ef4444", // Red for clicked location
  SAVED: "#3b82f6", // Blue for saved locations
  SEARCH: "#8b5cf6", // Purple for search results
  REQUIREMENTS_NOT_MET: "#dc2626", // Red for stations not meeting requirements
  REQUIREMENTS_MET: "#16a34a", // Green for stations meeting requirements
  NO_REQUIREMENTS: "#6b7280", // Gray for stations with no requirements data
};

// Component to handle map clicks and auto-move
function LocationMarker({
  onLocationSelect,
  clickedPosition,
  showMarker = true,
  disabled = false,
}) {
  useMapEvents({
    click(e) {
      if (disabled) {
        return;
      }
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });

  // Only render marker if showMarker is true and position exists
  return clickedPosition && showMarker ? (
    <Marker
      position={[clickedPosition.lat, clickedPosition.lng]}
      icon={createLocationIcon(MARKER_COLORS.CLICKED)}
    >
      <Popup>
        <div className="text-sm">
          <strong>Selected Location</strong>
          <br />
          Lat: {clickedPosition.lat.toFixed(6)}
          <br />
          Lng: {clickedPosition.lng.toFixed(6)}

          {disabled && (
            <>
              <br />
              <span className="text-red-500 font-medium">
                🔒 Location is locked
              </span>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Component to handle map auto-movement
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);

  return null;
}

const MapLocation = ({
  onPositionChange,
  hidePanels = false,
  stationData = [],
  onEditStation = () => { },
  refreshKey = 0,
  disabled = false,
}) => {
  // State management - Updated default coordinates for Balochistan, Pakistan
  const [savedLocations, setSavedLocations] = useState([]);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Default map settings for Balochistan, Pakistan
  const [mapCenter, setMapCenter] = useState([28.3, 66.6]); // Balochistan coordinates
  const [mapZoom, setMapZoom] = useState(7); // Adjusted zoom level to show the province
  const [locationSearchTerm, setLocationSearchTerm] = useState('');


  const searchTimeoutRef = useRef(null);
  const [newLocation, setNewLocation] = useState({
    title: "",
    description: "",
    category: "other",
    rating: 5,
  });

  // Load saved locations on component mount (only if panels are not hidden)
  useEffect(() => {
    if (!hidePanels) {
      loadSavedLocations();
    }
  }, [hidePanels, refreshKey]);

  // Notify parent component when position changes
  useEffect(() => {

    if (disabled) {
      return;
    }
    if (clickedPosition?.lat && clickedPosition?.lng) {
      onPositionChange(clickedPosition);
    }
  }, [clickedPosition, onPositionChange, disabled]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getFixLocationData();
      console.log(data, "refresh location data");

    };

    fetchData();
  }, []);

  /**
   * Check if station meets minimum requirements
   * @param {Object} locationData - Location object with station data and employeeCount
   * @returns {Object} - { meetRequirements: boolean, details: Array }
   */
  const checkStationRequirements = (locationData) => {
    // Priority: Check station.stationMinimumRequirements first, then fallback to root level
    const requirements =
      locationData.station?.stationMinimumRequirements ||
      locationData.stationMinimumRequirements;

    if (!requirements || requirements.length === 0) {
      return {
        meetRequirements: true,
        details: ["No requirements specified"],
        status: "no_requirements",
      };
    }

    let meetRequirements = true;
    const details = [];
    const actualEmployeeCount = locationData.employeeCount || 0;

    requirements.forEach((requirement, reqIndex) => {
      // Check total staff requirement against actual employee count
      const requiredTotalStaff = requirement.numberOfStaff || 0;

      if (actualEmployeeCount < requiredTotalStaff) {
        meetRequirements = false;
        details.push(
          `Staff shortage: Required ${requiredTotalStaff}, Available ${actualEmployeeCount}`
        );
      } else {
        details.push(
          `Staff requirement met: Required ${requiredTotalStaff}, Available ${actualEmployeeCount}`
        );
      }

      // Check individual staff designation requirements (if you want to add this later)
      if (requirement.staffDetail && requirement.staffDetail.length > 0) {
        requirement.staffDetail.forEach((staffReq) => {
          const designation = staffReq.designation;
          const requiredCount = staffReq.numberOfPersonal || 0;

          // For now, we assume all employees can fulfill any designation requirement
          // You can modify this logic based on actual staff designation data if available
          if (actualEmployeeCount < requiredCount) {
            meetRequirements = false;
            details.push(
              `${designation} personnel shortage: Required ${requiredCount}, Available ${actualEmployeeCount}`
            );
          } else {
            details.push(
              `${designation} requirement met: Required ${requiredCount}`
            );
          }

          // Asset requirements (keeping this for future use)
          if (
            requirement.assetRequirement &&
            requirement.assetRequirement.length > 0
          ) {
            requirement.assetRequirement.forEach((assetReq) => {
              const asset = assetReq.assets; // This is the full asset object
              const requiredQuantity = assetReq.quantity || 0;

              if (asset && typeof asset === 'object') {
                // Asset data is available as a full object
                const assetName = asset.name || 'Unknown Asset';
                const assetType = asset.type || 'Unknown Type';

                let assetDetails = `${assetName} (${assetType}): Required ${requiredQuantity}`;

                details.push(assetDetails);
              } else {
                // Fallback for when asset is just an ID (shouldn't happen based on your data)
                const assetId = assetReq.assets;
                details.push(
                  `Asset ${assetId}: Required ${requiredQuantity} (Asset data not available)`
                );
              }
            });
          }
        });
      }
    });

    return {
      meetRequirements,
      details,
      status: meetRequirements ? "requirements_met" : "requirements_not_met",
      source: locationData.station?.stationMinimumRequirements
        ? "station"
        : "root",
    };
  };

  /**
   * Get marker color based on station requirements status
   * @param {Object} locationData - Location object with station data and employeeCount
   * @returns {string} - Color hex code
   */
  const getStationMarkerColor = (locationData) => {
    const requirementCheck = checkStationRequirements(locationData);

    switch (requirementCheck.status) {
      case "requirements_met":
        return MARKER_COLORS.REQUIREMENTS_MET;
      case "requirements_not_met":
        return MARKER_COLORS.REQUIREMENTS_NOT_MET;
      case "no_requirements":
        return MARKER_COLORS.NO_REQUIREMENTS;
      default:
        return MARKER_COLORS.SAVED;
    }
  };
  const filteredSavedLocations = savedLocations.filter(location => {
    if (!locationSearchTerm.trim()) return true;

    const searchTerm = locationSearchTerm.toLowerCase();

    // Search in title
    if (location?.title?.toLowerCase().includes(searchTerm)) return true;

    // Search in coordinates
    const coordsString = `${location?.coordinates?.lat.toFixed(4)}, ${location?.coordinates?.lng.toFixed(4)}`;
    if (coordsString.includes(searchTerm)) return true;

    // Search in tehsil/district
    if (location?.station?.tehsil?.toLowerCase().includes(searchTerm)) return true;
    if (location?.station?.district?.toLowerCase().includes(searchTerm)) return true;

    // Search in facilities
    if (location?.station?.facilities?.some(facility =>
      facility.toLowerCase().includes(searchTerm)
    )) return true;

    // Search in staff designations
    if (location?.station?.stationMinimumRequirements?.some(req =>
      req?.staffDetail?.some(staff =>
        staff?.designation?.toLowerCase().includes(searchTerm)
      )
    )) return true;

    // Search in asset names
    if (location?.station?.stationMinimumRequirements?.some(req =>
      req?.assetRequirement?.some(asset =>
        asset?.assets?.name?.toLowerCase().includes(searchTerm)
      ) ||
      req?.staffDetail?.some(staff =>
        staff?.assetRequirement?.some(staffAsset =>
          staffAsset?.assets?.name?.toLowerCase().includes(searchTerm)
        )
      )
    )) return true;

    return false;
  });
  /**
   * Get status icon based on requirements
   * @param {string} status - Status string
   * @returns {string} - Emoji icon
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case "requirements_met":
        return "✅";
      case "requirements_not_met":
        return "⚠️";
      case "no_requirements":
        return "ℹ️";
      default:
        return "📍";
    }
  };

  /**
   * Load saved locations from API
   */
  const loadSavedLocations = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getAll();
      setSavedLocations(response.data || []);
    } catch (error) {
      setError("Failed to load saved locations");
      console.error("Load locations error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle map click event
   * @param {Object} coordinates - {lat, lng}
   */
  const handleLocationSelect = useCallback(
    async (coordinates) => {

      if (disabled) {
        return;
      }
      setClickedPosition(coordinates);
      setError("");

      // Move map to clicked location with higher zoom
      setMapCenter([coordinates.lat, coordinates.lng]);
      setMapZoom(15);

      // Get address for clicked location (only if panels are visible for saving)
      if (!hidePanels) {
        try {
          const addressData = await externalAPI.reverseGeocode(
            coordinates.lat,
            coordinates.lng
          );
          setNewLocation((prev) => ({
            ...prev,
            title:
              addressData.display_name?.split(",")[0] || "Unknown Location",
          }));
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }
      }
    },
    [hidePanels, disabled]
  );

  /**
   * Handle search input change with debouncing
   * @param {Event} e - Input change event
   */
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Show suggestions only if query length > 2
    if (value.trim().length > 2) {
      setShowSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await externalAPI.searchLocation(value);
          setSearchSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
        } catch (error) {
          console.error("Search suggestions error:", error);
          setSearchSuggestions([]);
        }
      }, 500); // Wait 500ms after user stops typing
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  /**
   * Search for locations
   */
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError("");
      setShowSuggestions(false);
      const results = await externalAPI.searchLocation(searchQuery);
      setSearchResults(results);

      // If results found, move to first result
      if (results.length > 0) {
        const firstResult = results[0];
        const coordinates = {
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon),
        };
        setMapCenter([coordinates.lat, coordinates.lng]);
        setMapZoom(12);
      }
    } catch (error) {
      setError("Search failed. Please try again.");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle suggestion selection
   * @param {Object} suggestion - Selected suggestion object
   */
  const selectSuggestion = (suggestion) => {
    const coordinates = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    };

    // Set search query and hide suggestions
    setSearchQuery(suggestion.display_name.split(",")[0]);
    setShowSuggestions(false);
    setSearchSuggestions([]);

    // Move map and select location
    setMapCenter([coordinates.lat, coordinates.lng]);
    setMapZoom(15);
    handleLocationSelect(coordinates);

    // Set location title (only if panels are visible)
    if (!hidePanels) {
      setNewLocation((prev) => ({
        ...prev,
        title: suggestion.display_name.split(",")[0],
      }));
    }
  };

  /**
   * Handle search result selection
   * @param {Object} result - Selected search result object
   */
  const selectSearchResult = (result) => {
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    // Move map to selected result
    setMapCenter([coordinates.lat, coordinates.lng]);
    setMapZoom(15);

    handleLocationSelect(coordinates);

    // Set location title and clear search (only if panels are visible)
    if (!hidePanels) {
      setNewLocation((prev) => ({
        ...prev,
        title: result.display_name.split(",")[0],
      }));
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  /**
   * Save location to database
   */
  const saveLocation = async () => {
    if (!clickedPosition || !newLocation.title.trim()) {
      setError("Please select a location and provide a title");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const locationData = {
        ...newLocation,
        coordinates: clickedPosition,
      };

      await locationAPI.create(locationData);
      await loadSavedLocations(); // Reload locations

      // Reset form
      setShowSaveForm(false);
      setClickedPosition(null);
      setNewLocation({
        title: "",
        description: "",
        category: "other",
        rating: 5,
      });

      alert("Location saved successfully!");
    } catch (error) {
      setError("Failed to save location");
      console.error("Save location error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete location from database
   * @param {string} id - Location ID to delete
   */
  const deleteLocation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      await locationAPI.delete(id);
      await loadSavedLocations();
      alert("Location deleted successfully!");
    } catch (error) {
      setError("Failed to delete location");
      console.error("Delete location error:", error);
    }
  };

  /**
   * Handle clicking saved location to move map (without affecting clicked position)
   * @param {Object} location - Saved location object
   */
  const viewSavedLocation = (location) => {
    const coordinates = {
      lat: location.coordinates.lat,
      lng: location.coordinates.lng,
    };
    // Only move the map, don't change the clicked position
    setMapCenter([coordinates.lat, coordinates.lng]);
    setMapZoom(15);
    setClickedPosition(coordinates);
    // Don't call setClickedPosition here to preserve the original clicked location
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    if (showSuggestions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSuggestions]);

  return (
    <div className="w-full h-screen relative bg-gray-100 z-0">
      {/* Search Panel - Always visible */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto">
        <h3 className="font-bold text-lg mb-3 text-gray-800">
          Location Search
        </h3>

        {/* Search Input with Suggestions */}
        <div className="relative mb-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search for a location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyPress={(e) => e.key === "Enter" && searchLocation()}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectSuggestion(suggestion);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.display_name?.split(",")[0]}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {suggestion.display_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={searchLocation}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Legend */}
        <div className="mb-3 text-xs">
          <h4 className="font-semibold mb-1">Station Status Legend:</h4>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: MARKER_COLORS.REQUIREMENTS_MET }}
              ></div>
              <span>Requirements Met</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: MARKER_COLORS.REQUIREMENTS_NOT_MET }}
              ></div>
              <span>Requirements Not Met</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: MARKER_COLORS.NO_REQUIREMENTS }}
              ></div>
              <span>No Requirements</span>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-2">Search Results:</h4>
            <div className="max-h-32 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => selectSearchResult(result)}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 text-xs"
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-600 mb-2">
          💡 Type to get suggestions • Click on map for coordinates
        </div>
      </div>

      {/* Saved Locations Panel - Only show if hidePanels is false */}
      {!hidePanels && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80 max-h-80 overflow-hidden flex flex-col">
          {/* Header with search */}
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-2 text-gray-800">
              Saved Locations ({filteredSavedLocations.length})
            </h3>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search locations..."
                value={locationSearchTerm}
                onChange={(e) => setLocationSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-8"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {locationSearchTerm && (
                <button
                  onClick={() => setLocationSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {filteredSavedLocations.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {locationSearchTerm ?
                  `No locations found matching "${locationSearchTerm}"` :
                  "No saved locations yet"
                }
              </p>
            ) : (
              <div className="space-y-2">
                {filteredSavedLocations.map((location) => {
                  // Check requirements using the location data directly
                  const requirementCheck = checkStationRequirements(location);
                  const statusIcon = getStatusIcon(requirementCheck.status);

                  return (
                    <div
                      key={location._id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => viewSavedLocation(location)}
                        >
                          {/* Title and Status */}
                          <h4 className="font-semibold text-sm text-blue-600 hover:text-blue-800 flex items-center">
                            <span className="mr-1">{statusIcon}</span>
                            {location?.title}
                          </h4>

                          {/* Location Info */}
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-600">
                              📍 {location?.coordinates?.lat.toFixed(4)},{" "}
                              {location?.coordinates?.lng.toFixed(4)}
                            </p>

                            {/* Tehsil/District Info */}
                            {location.station?.tehsil && (
                              <p className="text-xs text-gray-600">
                                🏛️ {location?.station?.tehsil},{" "}
                                {location?.station?.district}
                              </p>
                            )}

                            {/* Employee Count */}
                            <p className="text-xs text-gray-600">
                              👥 Employees: {location?.employeeCount || 0}
                            </p>
                          </div>

                          {/* Facilities */}
                          {location?.station?.facilities &&
                            location?.station?.facilities.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  🔧 Facilities:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {location?.station?.facilities?.map(
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

                          {/* Minimum Requirements */}
                          {location?.station?.stationMinimumRequirements &&
                            location?.station?.stationMinimumRequirements.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  📋 Minimum Requirements:
                                </p>
                                {location?.station?.stationMinimumRequirements?.map(
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
                                                      {assetReq?.assets?.name || "Unknown Asset"}
                                                    </span>
                                                    {" × "}
                                                    <span className="text-blue-600 font-medium">
                                                      {assetReq?.quantity}
                                                    </span>
                                                  </p>
                                                  <p className="text-xs text-gray-500 capitalize">
                                                    Type: {assetReq?.assets?.type || "N/A"}
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
                                                <div key={staffIndex} className="ml-2 mb-2 p-1 bg-gray-50 rounded">
                                                  <p className="mb-1">
                                                    - {staff?.designation || "Staff"}
                                                    : {staff?.numberOfPersonal} personnel
                                                  </p>

                                                  {/* Staff Asset Requirements */}
                                                  {staff?.assetRequirement &&
                                                    staff?.assetRequirement.length > 0 && (
                                                      <div className="ml-2">
                                                        <p className="text-xs font-medium text-gray-600 mb-1">
                                                          🚗 Assigned Assets:
                                                        </p>
                                                        {staff?.assetRequirement?.map(
                                                          (staffAsset, staffAssetIndex) => (
                                                            <div
                                                              key={staffAssetIndex}
                                                              className="ml-2 mb-1 p-1 bg-yellow-50 rounded"
                                                            >
                                                              <p>
                                                                <span className="font-medium">
                                                                  {staffAsset?.assets?.name || "Unknown Asset"}
                                                                </span>
                                                                {" × "}
                                                                <span className="text-orange-600 font-medium">
                                                                  {staffAsset?.quantity}
                                                                </span>
                                                              </p>
                                                              <p className="text-xs text-gray-500 capitalize">
                                                                Type: {staffAsset?.assets?.type || "N/A"}
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

                          <p className="text-xs text-blue-500 mt-2">
                            👆 Click to view on map
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditStation(location);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs ml-2 px-2 py-1 rounded hover:bg-blue-50 flex-shrink-0"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Container with LayersControl for switching between map types */}
      <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full">
        <LayersControl position="topright">
          {/* Base Maps - Only one can be active at a time */}
          <LayersControl.BaseLayer checked name="🗺️ Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🛰️ Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌍 Satellite + Streets">
            <LayerGroup>
              <TileLayer
                attribution='Imagery &copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                attribution='Labels &copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                opacity={0.9}
              />
              <TileLayer
                attribution='Roads &copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                opacity={0.9}
              />
            </LayerGroup>
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🗺️ Topographic">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌓 Dark Mode">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          {/* Overlay Layers - Can be toggled on/off */}
          <LayersControl.Overlay name="🛣️ Streets Overlay">
            <LayerGroup>
              <TileLayer
                attribution='Labels &copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                opacity={0.9}
              />
              <TileLayer
                attribution='Roads &copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                opacity={0.9}
              />
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="🚗 Traffic (when available)">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0}
            />
          </LayersControl.Overlay>
        </LayersControl>

        {/* Map Controller for auto-movement */}
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Click handler for coordinates */}
        <LocationMarker
          onLocationSelect={handleLocationSelect}
          clickedPosition={clickedPosition}
          showMarker={!hidePanels} // Only show clicked marker if panels are visible
          disabled={disabled}
        />

        {/* Display saved locations - Only if panels are not hidden */}
        {!hidePanels &&
          savedLocations.map((location) => {
            // Check requirements using the location data directly
            const requirementCheck = checkStationRequirements(location);
            const markerColor = getStationMarkerColor(location);

            return (
              <Marker
                key={location._id}
                position={[location.coordinates.lat, location.coordinates.lng]}
                icon={createLocationIcon(markerColor)}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                  <div className="flex items-center gap-2">
                    <span
                      className={`${requirementCheck.status === "requirements_met"
                        ? "bg-green-500"
                        : requirementCheck.status === "requirements_not_met"
                          ? "bg-red-500"
                          : "bg-gray-400"
                        } inline-block w-2.5 h-2.5 rounded-full`}
                    />
                    <span className="text-xs font-semibold text-gray-900">
                      {location?.title}
                    </span>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="text-sm">
                    <h4 className="font-semibold flex items-center">
                      {getStatusIcon(requirementCheck.status)} {location.title}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${requirementCheck.status === "requirements_met"
                        ? "bg-green-100 text-green-700"
                        : requirementCheck.status === "requirements_not_met"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                        }`}>
                        {requirementCheck.status === "requirements_met"
                          ? "Requirements Met"
                          : requirementCheck.status === "requirements_not_met"
                            ? "Requirements Not Met"
                            : "No Requirements"}
                      </span>
                    </h4>
                    {location.description && (
                      <p className="text-gray-600 mt-1">
                        {location?.description}
                      </p>
                    )}

                    {/* Employee Information */}
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <h5 className="font-semibold text-xs mb-1">
                        Staff Information:
                      </h5>
                      <p className="text-xs text-gray-600">
                        Current Employees:{" "}
                        <span className="font-medium">
                          {location?.employeeCount || 0}
                        </span>
                      </p>
                      {/* Show requirements from the correct source */}
                      {(() => {
                        const requirements =
                          location?.station?.stationMinimumRequirements ||
                          location?.stationMinimumRequirements;
                        const source = location.station
                          ?.stationMinimumRequirements
                          ? "Station"
                          : "Root";
                        return (
                          requirements &&
                          requirements.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-600">
                                Required Staff:{" "}
                                <span className="font-medium">
                                  {requirements[0].numberOfStaff || 0}
                                </span>
                              </p>
                              <p className="text-xs text-gray-400">
                                Source: {source} level requirements
                              </p>
                            </div>
                          )
                        );
                      })()}
                    </div>

                    {/* Station Requirements Status */}
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <h5 className="font-semibold text-xs mb-1">
                        Requirements Status:
                        <span
                          className={`ml-1 ${requirementCheck.meetRequirements
                            ? "text-green-600"
                            : "text-orange-600"
                            }`}
                        >
                          {requirementCheck.meetRequirements
                            ? "Met"
                            : "Not Met"}
                        </span>
                      </h5>
                      <ul className="text-xs space-y-1">
                        {requirementCheck.details
                          .slice(0, 3)
                          .map((detail, idx) => (
                            <li key={idx} className="text-gray-600">
                              • {detail}
                            </li>
                          ))}
                        {requirementCheck.details.length > 3 && (
                          <li className="text-gray-500">
                            ... and {requirementCheck.details.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Category: {location?.category}
                      <br />
                      Coordinates: {location?.coordinates.lat.toFixed(6)},{" "}
                      {location?.coordinates?.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MapLocation;
