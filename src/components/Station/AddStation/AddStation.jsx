import React, { useState, useEffect, useRef } from "react";
import { useStations } from "../StationHook";
import { getStationLocationsWithEnum } from "../lookUp.js"; // Import both services
import { getStationDistrictWithEnum } from "../District.js";
import { EnumSelect } from "../../SearchableDropdown.jsx"; 
import { getStationFacilitiesWithEnum } from "../statusfacilities.js";
import { getStationStatusWithEnum } from "../stationstatus.js";

const StationModal = ({ isOpen, onClose, isEdit = false, editData = null, createStation, modifyStation  }) => {
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [stationLocations, setStationLocations] = useState({}); // State for station locations
  const [districtLocations, setDistrictLocations] = useState({}); // State for district locations
  const [loadingLocations, setLoadingLocations] = useState(false); // Loading state for locations
  const [formData, setFormData] = useState({
    name: "",
    tehsil: "",
    district: "", // Added district field
    stationStatus: "", // Added station status field
    stationFacilities: [], // Added station facilities field (multi-select)
    address: {
      line1: "",
      line2: "",
      city: "",
    },
    coordinates: {
      lat: null,
      lng: null,
    },
    pictures: [], // Added pictures field
  });

  // Station status options
  const stationStatusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "under_construction", label: "Under Construction" },
    { value: "maintenance", label: "Under Maintenance" },
    { value: "planned", label: "Planned" },
  ];

  // Station facilities options
  const stationFacilitiesOptions = [
    { value: "parking", label: "Parking" },
    { value: "restroom", label: "Restroom" },
    { value: "waiting_area", label: "Waiting Area" },
    { value: "ticket_counter", label: "Ticket Counter" },
    { value: "food_court", label: "Food Court" },
    { value: "atm", label: "ATM" },
    { value: "wifi", label: "Free WiFi" },
    { value: "security", label: "Security" },
    { value: "cctv", label: "CCTV Surveillance" },
    { value: "wheelchair_access", label: "Wheelchair Access" },
    { value: "elevator", label: "Elevator" },
    { value: "escalator", label: "Escalator" },
    { value: "shops", label: "Shops" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "first_aid", label: "First Aid" },
    { value: "lost_found", label: "Lost & Found" },
    { value: "information_desk", label: "Information Desk" },
  ];

  // Load Google Maps API
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Fetch station and district locations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStationLocations();
      fetchDistrictLocations();
    }
  }, [isOpen]);

  // Fetch station locations from API
  const fetchStationLocations = async () => {
    setLoadingLocations(true);
    try {
      const result = await getStationLocationsWithEnum();
      if (result.success) {
        setStationLocations(result.data);
      } else {
        setError("Failed to load station locations");
        console.error("Error fetching station locations:", result.error);
      }
    } catch (error) {
      setError("Failed to load station locations");
      console.error("Error fetching station locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch district locations from API
  const fetchDistrictLocations = async () => {
    try {
      const result = await getStationDistrictWithEnum();
      if (result.success) {
        setDistrictLocations(result.data);
      } else {
        console.error("Error fetching district locations:", result.error);
        // Don't set error here as it's not critical - user can still proceed
      }
    } catch (error) {
      console.error("Error fetching district locations:", error);
      // Don't set error here as it's not critical - user can still proceed
    }
  };

  // Initialize map and autocomplete
  useEffect(() => {
    if (mapLoaded && isOpen && mapRef.current) {
      initializeMap();
    }
  }, [mapLoaded, isOpen]);

  // Initialize form data for editing
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        tehsil: editData.tehsil || "",
        district: editData.district || "", // Added district for edit mode
        stationStatus: editData.status || "", // Added station status for edit mode
        stationFacilities: editData.facilities || [], // Added station facilities for edit mode
        address: {
          line1: editData.address?.line1 || "",
          line2: editData.address?.line2 || "",
          city: editData.address?.city || "",
        },
        coordinates: {
          lat: editData.latitude || null,
          lng: editData.longitude || null,
        },
        pictures: editData.pictures || editData.stationImageUrl || [], // Support both field names
      });
      
      // Set selected location if coordinates exist
      if (editData.coordinates?.lat && editData.coordinates?.lng) {
        setSelectedLocation({
          lat: editData.coordinates.lat,
          lng: editData.coordinates.lng,
        });
      }
    } else {
      // Reset form for new station
      setFormData({
        name: "",
        tehsil: "",
        district: "", // Reset district field
        stationStatus: "", // Reset station status field
        stationFacilities: [], // Reset station facilities field
        address: {
          line1: "",
          line2: "",
          city: "",
        },
        coordinates: {
          lat: null,
          lng: null,
        },
        pictures: [],
      });
      setSelectedLocation(null);
    }
    setError("");
  }, [isEdit, editData, isOpen]);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    // Default location (Pakistan center)
    const defaultLocation = { lat: 30.3753, lng: 69.3451 };
    const initialLocation = selectedLocation || defaultLocation;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: selectedLocation ? 15 : 6,
      center: initialLocation,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    // Initialize autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        componentRestrictions: { country: "pk" }, // Restrict to Pakistan
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["establishment", "geocode"],
      }
    );

    // Handle autocomplete place selection
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        updateLocationOnMap(location, place);
        fillAddressFields(place);
      }
    });

    // Handle map click
    map.addListener("click", (event) => {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      
      updateLocationOnMap(location);
      reverseGeocode(location);
    });

    // Add existing marker if editing
    if (selectedLocation) {
      addMarker(selectedLocation);
    }
  };

  const updateLocationOnMap = (location, place = null) => {
    if (!mapInstanceRef.current) return;

    setSelectedLocation(location);
    
    // Update coordinates in form data
    setFormData(prev => ({
      ...prev,
      coordinates: location,
    }));

    // Center map on location
    mapInstanceRef.current.setCenter(location);
    mapInstanceRef.current.setZoom(15);

    // Add/update marker
    addMarker(location);
  };

  const addMarker = (location) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      draggable: true,
      title: "Station Location",
    });

    // Handle marker drag
    markerRef.current.addListener("dragend", (event) => {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      
      setSelectedLocation(location);
      setFormData(prev => ({
        ...prev,
        coordinates: location,
      }));
      
      reverseGeocode(location);
    });
  };

  const reverseGeocode = (location) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: location },
      (results, status) => {
        if (status === "OK" && results[0]) {
          fillAddressFields(results[0]);
        }
      }
    );
  };

  const fillAddressFields = (place) => {
    const addressComponents = place.address_components || [];
    let line1 = "";
    let city = "";

    // Extract address components
    for (const component of addressComponents) {
      const types = component.types;
      
      if (types.includes("street_number")) {
        line1 = component.long_name + " ";
      } else if (types.includes("route")) {
        line1 += component.long_name;
      } else if (types.includes("sublocality_level_1") || types.includes("neighborhood")) {
        if (!line1) line1 = component.long_name;
      } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        city = component.long_name;
      }
    }

    // Update form data with extracted address
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        line1: line1 || place.formatted_address?.split(",")[0] || "",
        city: city || "",
      },
    }));

    // Update autocomplete input
    if (autocompleteRef.current) {
      autocompleteRef.current.value = place.formatted_address || "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle manual coordinate input
  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) && value !== "") return; // Only allow numbers

    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: value === "" ? null : numValue,
      }
    }));

    // Update map if both coordinates are valid
    if (name === "lat" && formData.coordinates.lng !== null && !isNaN(numValue)) {
      const newLocation = { lat: numValue, lng: formData.coordinates.lng };
      setSelectedLocation(newLocation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(newLocation);
        addMarker(newLocation);
      }
    } else if (name === "lng" && formData.coordinates.lat !== null && !isNaN(numValue)) {
      const newLocation = { lat: formData.coordinates.lat, lng: numValue };
      setSelectedLocation(newLocation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(newLocation);
        addMarker(newLocation);
      }
    }
  };

  // Handle facilities multi-select
  const handleFacilitiesChange = (facilityValue) => {
    setFormData(prev => {
      const currentFacilities = prev.stationFacilities || [];
      const isSelected = currentFacilities.includes(facilityValue);
      
      if (isSelected) {
        // Remove facility
        return {
          ...prev,
          stationFacilities: currentFacilities.filter(f => f !== facilityValue)
        };
      } else {
        // Add facility
        return {
          ...prev,
          stationFacilities: [...currentFacilities, facilityValue]
        };
      }
    });
  };

  // Handle picture upload
  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      pictures: files,
    }));
  };

  // Remove a specific picture
  const removePicture = (index) => {
    setFormData((prev) => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let uploadedUrls = [];

      // Upload pictures to Cloudinary if any
      if (formData.pictures.length > 0) {
        for (const pic of formData.pictures) {
          if (typeof pic === "string") {
            // Existing URL (for edit mode)
            uploadedUrls.push(pic);
          } else {
            // New file to upload
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", "Stations"); // Replace with your actual preset name
            
            const res = await fetch(
              "https://api.cloudinary.com/v1_1/dxisw0kcc/image/upload", // Replace with your actual cloud name
              { method: "POST", body: data }
            );
            
            const result = await res.json();
            if (result.secure_url) {
              uploadedUrls.push(result.secure_url);
            } else if (result.error) {
              throw new Error(`Upload failed: ${result.error.message}`);
            }
          }
        }
      }

      // Prepare submission data
      const submitData = {
        ...formData,
        stationImageUrl: uploadedUrls, // Use stationImageUrl to match your backend
        pictures: undefined, // Remove the pictures field
      };

      let result;

      if (isEdit) {
        result = await modifyStation(editData._id, submitData);
      } else {
        result = await createStation(submitData);
      }

      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          name: "",
          tehsil: "",
          district: "", // Reset district field
          stationStatus: "", // Reset station status field
          stationFacilities: [], // Reset station facilities field
          address: {
            line1: "",
            line2: "",
            city: "",
          },
          coordinates: {
            lat: null,
            lng: null,
          },
          pictures: [],
        });
        setSelectedLocation(null);
        if (autocompleteRef.current) {
          autocompleteRef.current.value = "";
        }
      } else {
        setError(result.error || "An error occurred while saving the station");
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          updateLocationOnMap(location);
          reverseGeocode(location);
        },
        (error) => {
          console.error("Error getting current location:", error);
          setError("Unable to get current location. Please select manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Station" : "Add New Station"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Station Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Iqbal Town Station"
              />
            </div>

            {/* Replace regular select with EnumSelect for Tehsil */}
            <EnumSelect
              label="Tehsil"
              name="tehsil"
              value={formData.tehsil}
              onChange={handleChange}
              enumObject={stationLocations}
              required={true}
              placeholder={loadingLocations ? "Loading locations..." : "Search and select tehsil..."}
              readOnly={loadingLocations}
            />

            {/* Replace regular select with EnumSelect for District */}
            <EnumSelect
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              enumObject={districtLocations}
              required={true}
              placeholder="Search and select district..."
            />
          </div>

          {/* Station Status and Facilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Station Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Status *
              </label>
              <select
                name="stationStatus"
                value={formData.stationStatus}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select station status...</option>
                {stationStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Station Facilities Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Facilities
              </label>
              <div className="relative">
                <div className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                  {/* Selected Facilities Display */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formData.stationFacilities.map((facilityValue) => {
                      const facility = stationFacilitiesOptions.find(f => f.value === facilityValue);
                      return (
                        <span
                          key={facilityValue}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {facility?.label}
                          <button
                            type="button"
                            onClick={() => handleFacilitiesChange(facilityValue)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  
                  {/* Dropdown for selecting facilities */}
                  <details className="relative">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 list-none">
                      {formData.stationFacilities.length === 0 
                        ? "Select facilities..." 
                        : `Add more facilities... (${formData.stationFacilities.length} selected)`}
                      <span className="float-right">▼</span>
                    </summary>
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      {stationFacilitiesOptions.map((facility) => {
                        const isSelected = formData.stationFacilities.includes(facility.value);
                        return (
                          <label
                            key={facility.value}
                            className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                              isSelected ? 'bg-blue-50 text-blue-800' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleFacilitiesChange(facility.value)}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{facility.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </details>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select multiple facilities available at this station
              </p>
            </div>
          </div>

          {/* Station Pictures Upload */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Station Pictures
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Station Pictures
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePicturesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple images. Supported formats: JPG, PNG, WEBP
              </p>
            </div>

            {/* Picture Preview */}
            {formData.pictures.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Pictures ({formData.pictures.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.pictures.map((pic, index) => (
                    <div
                      key={index}
                      className="relative w-full h-24 overflow-hidden rounded-md border border-gray-200 group"
                    >
                      <img
                        src={typeof pic === "string" ? pic : URL.createObjectURL(pic)}
                        alt={`Station preview ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => removePicture(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Address Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Block C, College Road"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mohalla
                </label>
                <input
                  type="text"
                  name="address.line2"
                  value={formData.address.line2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Adjacent to Central Plaza"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lahore"
                />
              </div>
            </div>
          </div>

          {/* Location Selection */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Location Selection
              </h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Use Current Location
              </button>
            </div>

            {/* Manual Coordinate Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  name="lat"
                  value={formData.coordinates.lat || ""}
                  onChange={handleCoordinateChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 31.5204"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  name="lng"
                  value={formData.coordinates.lng || ""}
                  onChange={handleCoordinateChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 74.3587"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Location
              </label>
              <input
                ref={autocompleteRef}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for a location..."
              />
            </div>

            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div
                ref={mapRef}
                style={{ height: "300px", width: "100%" }}
                className="bg-gray-200"
              >
                {!mapLoaded && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                )}
              </div>
            </div>

            {selectedLocation && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Selected Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingLocations}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update Station"
                : "Add Station"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationModal;