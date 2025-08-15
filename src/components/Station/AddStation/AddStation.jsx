import { useStations } from "../StationHook";
import { getStationLocationsWithEnum } from "../lookUp.js";
import { getStationDistrictWithEnum } from "../District.js";
import { EnumSelect } from "../../SearchableDropdown.jsx";
import { getStationFacilitiesWithEnum } from "../statusfacilities.js";
import { getStationStatusWithEnum } from "../stationstatus.js";
import { MultiEnumSelect } from "../../Multiselect.jsx";
import MapLocation from "../../Dashboard/MapComponent/MapLocation.jsx";
import { useRef, useState, useEffect } from "react";
import { getAllAssets } from "../../AssetAssignment/AssetApi.js";
import { employeeApi } from "../../Admin/EmployeeApi.js";
import { getDesignationsWithEnum } from "../../Employee/AddEmployee/Designation.js";

// Searchable Select Component for employees and assets
const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      (option.subtitle && option.subtitle.toLowerCase().includes(searchLower))
    );
  });

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div
          className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center">
            <span
              className={selectedOption ? "text-gray-900" : "text-gray-500"}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b">
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      value === option.value
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-900"
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-sm text-gray-500">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StationModal = ({
  isOpen,
  onClose,
  isEdit = false,
  editData = null,
  createStation,
  modifyStation,
}) => {
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
  const [designationOptions, setDesignationOptions] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [position, setPosition] = useState({ lat: null, lng: null });
  const [hideLocationPanels, setHideLocationPanels] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tehsil: "",
    district: "",
    status: "", // Changed from stationStatus to status to match schema
    facilities: [], // Changed from stationFacilities to facilities to match schema
    description: "", // Added description field
    address: {
      line1: "",
      line2: "",
      city: "",
    },
    latitude: "", // Changed from coordinates.lat to latitude (string type)
    longitude: "", // Changed from coordinates.lng to longitude (string type)
    stationImageUrl: [], // Changed from pictures to stationImageUrl to match schema
    excludeStatistics: false, // Add this line
    stationIncharge: [
      {
        employee: "",
        type: "",
      },
    ],
    stationMinimumRequirements: [
      {
        numberOfStaff: 0,
        assetRequirement: [
          {
            assets: "",
          },
        ],
        staffDetail: [
          {
            designation: "",
            numberOfPersonal: 0,
            assetRequirement: [
              {
                assets: "",
              },
            ],
          },
        ],
      },
    ],
  });

  const [stationStatusOptions, setStationStatusOptions] = useState({});
  const [stationFacilitiesOptions, setStationFacilitiesOptions] = useState({});
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Add helper functions for dynamic form handling
  const addStationIncharge = () => {
    // Only allow maximum 2 incharges
    if (formData.stationIncharge.length < 2) {
      setFormData((prev) => ({
        ...prev,
        stationIncharge: [...prev.stationIncharge, { employee: "", type: "" }],
      }));
    }
  };

  const removeStationIncharge = (index) => {
    setFormData((prev) => ({
      ...prev,
      stationIncharge: prev.stationIncharge.filter((_, i) => i !== index),
    }));
  };

  const updateStationIncharge = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      stationIncharge: prev.stationIncharge.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addMinimumRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: [
        ...prev.stationMinimumRequirements,
        {
          numberOfStaff: 0,
          assetRequirement: [{ assets: "", quantity: 1 }],
          staffDetail: [
            {
              designation: "",
              numberOfPersonal: 0,
              assetRequirement: [{ assets: "", quantity: 1 }],
            },
          ],
        },
      ],
    }));
  };

  const removeMinimumRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateMinimumRequirement = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) => (i === index ? { ...item, [field]: value } : item)
      ),
    }));
  };

  const addAssetRequirement = (reqIndex) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                assetRequirement: [
                  ...item.assetRequirement,
                  { assets: "", quantity: 1 },
                ],
              }
            : item
      ),
    }));
  };

  const removeAssetRequirement = (reqIndex, assetIndex) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                assetRequirement: item.assetRequirement.filter(
                  (_, ai) => ai !== assetIndex
                ),
              }
            : item
      ),
    }));
  };

  const updateAssetRequirement = (reqIndex, assetIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                assetRequirement: item.assetRequirement.map((asset, ai) =>
                  ai === assetIndex ? { ...asset, [field]: value } : asset
                ),
              }
            : item
      ),
    }));
  };

  const addStaffDetail = (reqIndex) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                staffDetail: [
                  ...item.staffDetail,
                  {
                    designation: "",
                    numberOfPersonal: 0,
                    assetRequirement: [{ assets: "", quantity: 1 }],
                  },
                ],
              }
            : item
      ),
    }));
  };

  const removeStaffDetail = (reqIndex, staffIndex) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                staffDetail: item.staffDetail.filter(
                  (_, si) => si !== staffIndex
                ),
              }
            : item
      ),
    }));
  };

  const updateStaffDetail = (reqIndex, staffIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                staffDetail: item.staffDetail.map((staff, si) =>
                  si === staffIndex ? { ...staff, [field]: value } : staff
                ),
              }
            : item
      ),
    }));
  };

  const addStaffAssetRequirement = (reqIndex, staffIndex) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                staffDetail: item.staffDetail.map((staff, si) =>
                  si === staffIndex
                    ? {
                        ...staff,
                        assetRequirement: [
                          ...staff.assetRequirement,
                          { assets: "", quantity: 1 },
                        ],
                      }
                    : staff
                ),
              }
            : item
      ),
    }));
  };

  const removeStaffAssetRequirement = (reqIndex, staffIndex, assetIndex) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                staffDetail: item.staffDetail.map((staff, si) =>
                  si === staffIndex
                    ? {
                        ...staff,
                        assetRequirement: staff.assetRequirement.filter(
                          (_, ai) => ai !== assetIndex
                        ),
                      }
                    : staff
                ),
              }
            : item
      ),
    }));
  };

  const updateStaffAssetRequirement = (
    reqIndex,
    staffIndex,
    assetIndex,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      stationMinimumRequirements: prev.stationMinimumRequirements.map(
        (item, i) =>
          i === reqIndex
            ? {
                ...item,
                staffDetail: item.staffDetail.map((staff, si) =>
                  si === staffIndex
                    ? {
                        ...staff,
                        assetRequirement: staff.assetRequirement.map(
                          (asset, ai) =>
                            ai === assetIndex
                              ? { ...asset, [field]: value }
                              : asset
                        ),
                      }
                    : staff
                ),
              }
            : item
      ),
    }));
  };
  // Fetch designations function
  const fetchDesignations = async () => {
    setLoadingDesignations(true);
    try {
      const response = await getDesignationsWithEnum();

      console.log("Full designation response:", response); // Debug log

      if (response.success && response.data) {
        // Check if response.data has any entries
        const dataEntries = Object.entries(response.data);
        console.log("Data entries:", dataEntries); // Debug log

        if (dataEntries.length > 0) {
          const designationOptions = [
            { value: "", label: "Select Designation" },
            ...dataEntries.map(([key, value]) => ({
              value: key,
              label: value,
            })),
          ];
          console.log("Final designation options:", designationOptions); // Debug log
          setDesignationOptions(designationOptions);
        } else {
          console.error("No designation data found");
          setDesignationOptions([{ value: "", label: "Select Designation" }]);
        }
      } else {
        console.error("Error fetching designations:", response.error);
        setDesignationOptions([{ value: "", label: "Select Designation" }]);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      setDesignationOptions([{ value: "", label: "Select Designation" }]);
    } finally {
      setLoadingDesignations(false);
    }
  };

  // Load Google Maps API
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Fetch all enum data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllEnumData();
      fetchEmployees();
      fetchAssets();
      fetchDesignations(); // Add this line
    }
  }, [isOpen]);

  // Fetch employees function
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await employeeApi.getAll();

      if (response.success) {
        const employeeOptions = [
          { value: "", label: "Select Employee" },
          ...response.data.map((employee) => ({
            value: employee._id,
            label: `${employee.firstName} ${employee.lastName || ""}`,
            // subtitle: employee.personalNumber || employee.pnumber,
            subtitle: `${employee.cnic} | ${employee.personalNumber} | ${employee.rank}`,
          })),
        ];
        setEmployeeOptions(employeeOptions);
      } else {
        console.error("Error fetching employees:", response.error);
        setEmployeeOptions([{ value: "", label: "Select Employee" }]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployeeOptions([{ value: "", label: "Select Employee" }]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch assets function
  // Fetch assets function
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const response = await getAllAssets();

      // Check if response has the expected structure
      const assetsData = response.success ? response.data : response;

      if (assetsData && Array.isArray(assetsData)) {
        const assetOptions = [
          { value: "", label: "Select Asset" },
          ...assetsData.map((asset) => ({
            value: asset._id,
            label: asset.name,
            subtitle: `${asset.type}${
              asset.weaponNumber ? ` - ${asset.weaponNumber}` : ""
            }${asset.vehicleNumber ? ` - ${asset.vehicleNumber}` : ""}`,
          })),
        ];
        setAssetOptions(assetOptions);
      } else {
        console.error("Error: Invalid assets data structure");
        setAssetOptions([{ value: "", label: "Select Asset" }]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssetOptions([{ value: "", label: "Select Asset" }]);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Replace the existing fetchStationLocations function with this:
  const fetchAllEnumData = async () => {
    setLoadingLocations(true);
    try {
      // Fetch all enum data in parallel
      const [
        stationLocationsResult,
        districtLocationsResult,
        stationStatusResult,
        stationFacilitiesResult,
      ] = await Promise.all([
        getStationLocationsWithEnum(),
        getStationDistrictWithEnum(),
        getStationStatusWithEnum(),
        getStationFacilitiesWithEnum(),
      ]);

      // Handle station locations
      if (stationLocationsResult.success) {
        setStationLocations(stationLocationsResult.data);
      } else {
        console.error(
          "Error fetching station locations:",
          stationLocationsResult.error
        );
      }

      // Handle district locations
      if (districtLocationsResult.success) {
        setDistrictLocations(districtLocationsResult.data);
      } else {
        console.error(
          "Error fetching district locations:",
          districtLocationsResult.error
        );
      }

      // Handle station status
      if (stationStatusResult.success) {
        setStationStatusOptions(stationStatusResult.data);
      } else {
        console.error(
          "Error fetching station status:",
          stationStatusResult.error
        );
        // Fallback to hardcoded options if API fails
        setStationStatusOptions({
          active: "Active",
          inactive: "Inactive",
          under_construction: "Under Construction",
          maintenance: "Under Maintenance",
          planned: "Planned",
        });
      }

      // Handle station facilities
      if (stationFacilitiesResult.success) {
        setStationFacilitiesOptions(stationFacilitiesResult.data);
      } else {
        console.error(
          "Error fetching station facilities:",
          stationFacilitiesResult.error
        );
        // Fallback to hardcoded options if API fails
        setStationFacilitiesOptions({
          parking: "Parking",
          restroom: "Restroom",
          waiting_area: "Waiting Area",
          ticket_counter: "Ticket Counter",
          food_court: "Food Court",
          atm: "ATM",
          wifi: "Free WiFi",
          security: "Security",
          cctv: "CCTV Surveillance",
          wheelchair_access: "Wheelchair Access",
          elevator: "Elevator",
          escalator: "Escalator",
          shops: "Shops",
          pharmacy: "Pharmacy",
          first_aid: "First Aid",
          lost_found: "Lost & Found",
          information_desk: "Information Desk",
        });
      }
    } catch (error) {
      console.error("Error fetching enum data:", error);
      setError("Failed to load some options. Please try again.");
    } finally {
      setLoadingLocations(false);
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
        district: editData.district || "",
        status: editData.status || "",
        facilities: editData.facilities || [],
        description: editData.description || "",
        address: {
          line1: editData.address?.line1 || "",
          line2: editData.address?.line2 || "",
          city: editData.address?.city || "",
        },
        latitude: editData.latitude || "",
        longitude: editData.longitude || "",
        stationImageUrl: editData.stationImageUrl || [],
        excludeStatistics: false, // Add this line
        stationIncharge: editData.stationIncharge || [
          {
            employee: "",
            type: "",
          },
        ],
        stationMinimumRequirements: editData.stationMinimumRequirements || [
          {
            numberOfStaff: 0,
            assetRequirement: [
              {
                assets: "",
                quantity: 1,
              },
            ],
            staffDetail: [
              {
                designation: "",
                numberOfPersonal: 0,
                assetRequirement: [
                  {
                    assets: "",
                    quantity: 1,
                  },
                ],
              },
            ],
          },
        ],
      });

      // Set selected location if coordinates exist
      if (editData.latitude && editData.longitude) {
        setSelectedLocation({
          lat: parseFloat(editData.latitude),
          lng: parseFloat(editData.longitude),
        });
      }
    } else {
      // Reset form for new station
      setFormData({
        name: "",
        tehsil: "",
        district: "",
        status: "",
        facilities: [],
        description: "",
        address: {
          line1: "",
          line2: "",
          city: "",
        },
        latitude: "",
        longitude: "",
        stationImageUrl: [],
        excludeStatistics: false, // Add this line
        stationIncharge: [
          {
            employee: "",
            type: "",
          },
        ],
        stationMinimumRequirements: [
          {
            numberOfStaff: 0,
            assetRequirement: [
              {
                assets: "",
                quantity: 1,
              },
            ],
            staffDetail: [
              {
                designation: "",
                numberOfPersonal: 0,
                assetRequirement: [
                  {
                    assets: "",
                    quantity: 1,
                  },
                ],
              },
            ],
          },
        ],
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

    // Update coordinates in form data as strings
    setFormData((prev) => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
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
      setFormData((prev) => ({
        ...prev,
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
      }));

      reverseGeocode(location);
    });
  };

  const reverseGeocode = (location) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: location }, (results, status) => {
      if (status === "OK" && results[0]) {
        fillAddressFields(results[0]);
      }
    });
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
      } else if (
        types.includes("sublocality_level_1") ||
        types.includes("neighborhood")
      ) {
        if (!line1) line1 = component.long_name;
      } else if (
        types.includes("locality") ||
        types.includes("administrative_area_level_2")
      ) {
        city = component.long_name;
      }
    }

    // Update form data with extracted address
    setFormData((prev) => ({
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update map if both coordinates are valid
    const lat =
      name === "latitude" ? parseFloat(value) : parseFloat(formData.latitude);
    const lng =
      name === "longitude" ? parseFloat(value) : parseFloat(formData.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      const newLocation = { lat, lng };
      setSelectedLocation(newLocation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(newLocation);
        addMarker(newLocation);
      }
    }
  };

  const handleFacilitiesEnumChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      facilities: value,
    }));
  };

  // Handle picture upload
  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      stationImageUrl: [...prev.stationImageUrl, ...files],
    }));
  };

  // Remove a specific picture
  const removePicture = (index) => {
    setFormData((prev) => ({
      ...prev,
      stationImageUrl: prev.stationImageUrl.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let uploadedUrls = [];

      // Upload pictures to Cloudinary if any
      if (formData.stationImageUrl.length > 0) {
        for (const pic of formData.stationImageUrl) {
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

      // Prepare submission data - structure matches your schema exactly
      const submitData = {
        name: formData.name,
        tehsil: formData.tehsil,
        district: formData.district,
        latitude: formData.latitude,
        longitude: formData.longitude,
        stationImageUrl: uploadedUrls,
        excludeStatistics: formData.excludeStatistics, // Add this line
        address: {
          line1: formData.address.line1,
          line2: formData.address.line2,
          city: formData.address.city,
        },
        description: formData.description,
        facilities: formData.facilities,
        status: formData.status,
        stationIncharge: formData.stationIncharge,
        stationMinimumRequirements: formData.stationMinimumRequirements,
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
          district: "",
          status: "",
          facilities: [],
          description: "",
          excludeStatistics: false, // Add this line
          address: {
            line1: "",
            line2: "",
            city: "",
          },
          latitude: "",
          longitude: "",
          stationImageUrl: [],
          stationIncharge: [
            {
              employee: "",
              type: "",
            },
          ],
          stationMinimumRequirements: [
            {
              numberOfStaff: 0,
              assetRequirement: [
                {
                  assets: "",
                  quantity: 1,
                },
              ],
              staffDetail: [
                {
                  designation: "",
                  numberOfPersonal: 0,
                  assetRequirement: [
                    {
                      assets: "",
                      quantity: 1,
                    },
                  ],
                },
              ],
            },
          ],
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

  useEffect(() => {
    if (position.lat && position.lng) {
      setFormData((prev) => ({
        ...prev,
        latitude: position.lat.toString(),
        longitude: position.lng.toString(),
      }));
    }
  }, [position]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
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

        {/* Form with scrollable body and sticky footer */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable Form Content */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
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

              <EnumSelect
                label="Tehsil"
                name="tehsil"
                value={formData.tehsil}
                onChange={handleChange}
                enumObject={stationLocations}
                required={true}
                placeholder={
                  loadingLocations
                    ? "Loading locations..."
                    : "Search and select tehsil..."
                }
                readOnly={loadingLocations}
              />

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

            {/* Status, Facilities, and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnumSelect
                label="Station Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                enumObject={stationStatusOptions}
                required={true}
                placeholder={
                  loadingLocations
                    ? "Loading status options..."
                    : "Search and select status..."
                }
                readOnly={loadingLocations}
              />

              <MultiEnumSelect
                label="Station Facilities"
                name="facilities"
                value={formData.facilities}
                onChange={handleFacilitiesEnumChange}
                enumObject={stationFacilitiesOptions}
                placeholder={
                  loadingLocations
                    ? "Loading facilities..."
                    : "Search and select facilities..."
                }
                readOnly={loadingLocations}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description about the station..."
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="excludeStatistics"
                name="excludeStatistics"
                checked={formData.excludeStatistics}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    excludeStatistics: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="excludeStatistics"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Exclude Statistics
              </label>
            </div>

            {/* Station Incharge */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Station Incharge
                </h3>
                {formData.stationIncharge.length < 2 && (
                  <button
                    type="button"
                    onClick={addStationIncharge}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Add Incharge
                  </button>
                )}
              </div>

              {formData.stationIncharge.map((incharge, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4 mb-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-800">
                      Incharge {index + 1}
                    </h4>
                    {formData.stationIncharge.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStationIncharge(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchableSelect
                      label="Employee"
                      name={`stationIncharge-${index}-employee`}
                      value={incharge.employee}
                      onChange={(e) =>
                        updateStationIncharge(index, "employee", e.target.value)
                      }
                      options={employeeOptions}
                      placeholder={
                        loadingEmployees
                          ? "Loading employees..."
                          : "Search and select employee"
                      }
                      disabled={loadingEmployees}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Incharge Type
                      </label>
                      <select
                        value={incharge.type}
                        onChange={(e) =>
                          updateStationIncharge(index, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="firstIncharge">First Incharge</option>
                        <option value="secondIncharge">Second Incharge</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {formData.stationIncharge.length === 2 && (
                <p className="text-sm text-gray-500 italic">
                  Maximum 2 incharges allowed per station
                </p>
              )}
            </div>

            {/* Station Minimum Requirements */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Station Minimum Requirements
                </h3>
                <button
                  type="button"
                  onClick={addMinimumRequirement}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Add Requirement
                </button>
              </div>

              {formData.stationMinimumRequirements.map(
                (requirement, reqIndex) => (
                  <div
                    key={reqIndex}
                    className="border border-gray-200 rounded-md p-4 mb-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-800">
                        Requirement {reqIndex + 1}
                      </h4>
                      {formData.stationMinimumRequirements.length >= 1 && (
                        <button
                          type="button"
                          onClick={() => removeMinimumRequirement(reqIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Number of Staff */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Staff
                      </label>
                      <input
                        type="number"
                        value={requirement.numberOfStaff}
                        onChange={(e) =>
                          updateMinimumRequirement(
                            reqIndex,
                            "numberOfStaff",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Total number of staff required"
                      />
                    </div>

                    {/* Asset Requirements */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Asset Requirements
                        </label>
                        <button
                          type="button"
                          onClick={() => addAssetRequirement(reqIndex)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                        >
                          Add Asset
                        </button>
                      </div>

                      {requirement.assetRequirement.map((asset, assetIndex) => (
                        <div
                          key={assetIndex}
                          className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-3 border border-gray-200 rounded-md"
                        >
                          <div className="md:col-span-2">
                            <SearchableSelect
                              label="Asset"
                              name={`asset-${reqIndex}-${assetIndex}`}
                              value={asset.assets}
                              onChange={(e) =>
                                updateAssetRequirement(
                                  reqIndex,
                                  assetIndex,
                                  "assets",
                                  e.target.value
                                )
                              }
                              options={assetOptions}
                              placeholder={
                                loadingAssets
                                  ? "Loading assets..."
                                  : "Search and select asset"
                              }
                              disabled={loadingAssets}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={asset.quantity}
                                onChange={(e) =>
                                  updateAssetRequirement(
                                    reqIndex,
                                    assetIndex,
                                    "quantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                min="1"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Qty"
                                required
                              />
                              {requirement.assetRequirement.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeAssetRequirement(reqIndex, assetIndex)
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Staff Details */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Staff Details
                        </label>
                        <button
                          type="button"
                          onClick={() => addStaffDetail(reqIndex)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                        >
                          Add Staff Detail
                        </button>
                      </div>

                      {requirement.staffDetail.map((staff, staffIndex) => (
                        <div
                          key={staffIndex}
                          className="border border-gray-100 rounded-md p-3 mb-3 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-700">
                              Staff Detail {staffIndex + 1}
                            </h5>
                            {requirement.staffDetail.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeStaffDetail(reqIndex, staffIndex)
                                }
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <SearchableSelect
                                label="Designation"
                                name={`staff-designation-${reqIndex}-${staffIndex}`}
                                value={staff.designation}
                                onChange={(e) =>
                                  updateStaffDetail(
                                    reqIndex,
                                    staffIndex,
                                    "designation",
                                    e.target.value
                                  )
                                }
                                options={designationOptions}
                                placeholder={
                                  loadingDesignations
                                    ? "Loading designations..."
                                    : "Search and select designation"
                                }
                                disabled={loadingDesignations}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Number of Personnel
                              </label>
                              <input
                                type="number"
                                value={staff.numberOfPersonal}
                                onChange={(e) =>
                                  updateStaffDetail(
                                    reqIndex,
                                    staffIndex,
                                    "numberOfPersonal",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border h-[44px] border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Number required"
                              />
                            </div>
                          </div>

                          {/* Staff Asset Requirements */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-gray-600">
                                Asset Requirements for this Staff
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  addStaffAssetRequirement(reqIndex, staffIndex)
                                }
                                className="px-1 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                              >
                                Add Asset
                              </button>
                            </div>

                            {staff.assetRequirement.map((asset, assetIndex) => (
                              <div
                                key={assetIndex}
                                className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-2 border border-gray-100 rounded-md bg-white"
                              >
                                <div className="md:col-span-2">
                                  <SearchableSelect
                                    label="Asset"
                                    name={`staff-asset-${reqIndex}-${staffIndex}-${assetIndex}`}
                                    value={asset.assets}
                                    onChange={(e) =>
                                      updateStaffAssetRequirement(
                                        reqIndex,
                                        staffIndex,
                                        assetIndex,
                                        "assets",
                                        e.target.value
                                      )
                                    }
                                    options={assetOptions}
                                    placeholder={
                                      loadingAssets
                                        ? "Loading..."
                                        : "Select asset"
                                    }
                                    disabled={loadingAssets}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Quantity
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={asset.quantity}
                                      onChange={(e) =>
                                        updateStaffAssetRequirement(
                                          reqIndex,
                                          staffIndex,
                                          assetIndex,
                                          "quantity",
                                          parseInt(e.target.value)
                                        )
                                      }
                                      min="1"
                                      className="flex-1 px-2 py-1 text-sm border h-[44px] border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Qty"
                                    />
                                    {staff.assetRequirement.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeStaffAssetRequirement(
                                            reqIndex,
                                            staffIndex,
                                            assetIndex
                                          )
                                        }
                                        className="text-red-600 hover:text-red-800 text-xs px-1"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Pictures */}
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
                  You can select multiple images. Supported formats: JPG, PNG,
                  WEBP
                </p>
              </div>

              {formData.stationImageUrl.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Selected Pictures ({formData.stationImageUrl.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.stationImageUrl.map((pic, index) => (
                      <div
                        key={index}
                        className="relative w-full h-24 overflow-hidden rounded-md border border-gray-200 group"
                      >
                        <img
                          src={
                            typeof pic === "string"
                              ? pic
                              : URL.createObjectURL(pic)
                          }
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

            {/* Address */}
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

            {/* Coordinates */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Location Selection
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleCoordinateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 31.5204"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleCoordinateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 74.3587"
                  />
                </div>
              </div>

              <div className="pt-10">
                <MapLocation
                  onPositionChange={setPosition}
                  hidePanels={hideLocationPanels}
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer Buttons */}
          <div className="flex justify-end space-x-3 p-4 border-t bg-white">
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
