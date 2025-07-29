import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { locationAPI, externalAPI } from '../../../services/locationApi';

// Fix for default markers in React-Leaflet and create proper location marker icons
delete L.Icon.Default.prototype._getIconUrl;

// Create custom location marker icons
const createLocationIcon = (color = '#3b82f6') => {
    return new L.DivIcon({
        className: 'custom-location-icon',
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
    CLICKED: '#ef4444',    // Red for clicked location
    SAVED: '#22c55e',      // Green for saved locations
    SEARCH: '#3b82f6',     // Blue for search results
};

// Component to handle map clicks and auto-move
function LocationMarker({ onLocationSelect, clickedPosition, showMarker = true }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng });
        },
    });

    // Only render marker if showMarker is true and position exists
    return (clickedPosition && showMarker) ? (
        <Marker
            position={[clickedPosition.lat, clickedPosition.lng]}
            icon={createLocationIcon(MARKER_COLORS.CLICKED)}
        >
            <Popup>
                <div className="text-sm">
                    <strong>Selected Location</strong><br />
                    Lat: {clickedPosition.lat.toFixed(6)}<br />
                    Lng: {clickedPosition.lng.toFixed(6)}
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
                duration: 1.5
            });
        }
    }, [center, zoom, map]);

    return null;
}

const MapLocation = ({ onPositionChange, hidePanels = false }) => {
    // State management - Updated default coordinates for Balochistan, Pakistan
    const [savedLocations, setSavedLocations] = useState([]);
    const [clickedPosition, setClickedPosition] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);
    
    // Default map settings for Balochistan, Pakistan
    const [mapCenter, setMapCenter] = useState([28.3, 66.6]); // Balochistan coordinates
    const [mapZoom, setMapZoom] = useState(7); // Adjusted zoom level to show the province
    
    const searchTimeoutRef = useRef(null);
    const [newLocation, setNewLocation] = useState({
        title: '',
        description: '',
        category: 'other',
        rating: 5
    });

    // Load saved locations on component mount (only if panels are not hidden)
    useEffect(() => {
        if (!hidePanels) {
            loadSavedLocations();
        }
    }, [hidePanels]);

    // Notify parent component when position changes
    useEffect(() => {
        if (clickedPosition?.lat && clickedPosition?.lng) {
            onPositionChange(clickedPosition);
        }
    }, [clickedPosition, onPositionChange]);

    /**
     * Load saved locations from API
     */
    const loadSavedLocations = async () => {
        try {
            setLoading(true);
            const response = await locationAPI.getAll();
            setSavedLocations(response.data || []);
        } catch (error) {
            setError('Failed to load saved locations');
            console.error('Load locations error:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle map click event
     * @param {Object} coordinates - {lat, lng}
     */
    const handleLocationSelect = useCallback(async (coordinates) => {
        setClickedPosition(coordinates);
        setError('');

        // Move map to clicked location with higher zoom
        setMapCenter([coordinates.lat, coordinates.lng]);
        setMapZoom(15);

        // Get address for clicked location (only if panels are visible for saving)
        if (!hidePanels) {
            try {
                const addressData = await externalAPI.reverseGeocode(coordinates.lat, coordinates.lng);
                setNewLocation(prev => ({
                    ...prev,
                    title: addressData.display_name?.split(',')[0] || 'Unknown Location'
                }));
            } catch (error) {
                console.error('Reverse geocoding failed:', error);
            }
        }
    }, [hidePanels]);

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
                    console.error('Search suggestions error:', error);
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
            setError('');
            setShowSuggestions(false);
            const results = await externalAPI.searchLocation(searchQuery);
            setSearchResults(results);

            // If results found, move to first result
            if (results.length > 0) {
                const firstResult = results[0];
                const coordinates = {
                    lat: parseFloat(firstResult.lat),
                    lng: parseFloat(firstResult.lon)
                };
                setMapCenter([coordinates.lat, coordinates.lng]);
                setMapZoom(12);
            }
        } catch (error) {
            setError('Search failed. Please try again.');
            console.error('Search error:', error);
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
            lng: parseFloat(suggestion.lon)
        };

        // Set search query and hide suggestions
        setSearchQuery(suggestion.display_name.split(',')[0]);
        setShowSuggestions(false);
        setSearchSuggestions([]);

        // Move map and select location
        setMapCenter([coordinates.lat, coordinates.lng]);
        setMapZoom(15);
        handleLocationSelect(coordinates);

        // Set location title (only if panels are visible)
        if (!hidePanels) {
            setNewLocation(prev => ({
                ...prev,
                title: suggestion.display_name.split(',')[0]
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
            lng: parseFloat(result.lon)
        };

        // Move map to selected result
        setMapCenter([coordinates.lat, coordinates.lng]);
        setMapZoom(15);

        handleLocationSelect(coordinates);
        
        // Set location title and clear search (only if panels are visible)
        if (!hidePanels) {
            setNewLocation(prev => ({
                ...prev,
                title: result.display_name.split(',')[0]
            }));
        }
        
        setSearchResults([]);
        setSearchQuery('');
    };

    /**
     * Save location to database
     */
    const saveLocation = async () => {
        if (!clickedPosition || !newLocation.title.trim()) {
            setError('Please select a location and provide a title');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const locationData = {
                ...newLocation,
                coordinates: clickedPosition
            };

            await locationAPI.create(locationData);
            await loadSavedLocations(); // Reload locations

            // Reset form
            setShowSaveForm(false);
            setClickedPosition(null);
            setNewLocation({
                title: '',
                description: '',
                category: 'other',
                rating: 5
            });

            alert('Location saved successfully!');
        } catch (error) {
            setError('Failed to save location');
            console.error('Save location error:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Delete location from database
     * @param {string} id - Location ID to delete
     */
    const deleteLocation = async (id) => {
        if (!window.confirm('Are you sure you want to delete this location?')) {
            return;
        }

        try {
            await locationAPI.delete(id);
            await loadSavedLocations();
            alert('Location deleted successfully!');
        } catch (error) {
            setError('Failed to delete location');
            console.error('Delete location error:', error);
        }
    };

    /**
     * Handle clicking saved location to move map (without affecting clicked position)
     * @param {Object} location - Saved location object
     */
    const viewSavedLocation = (location) => {
        const coordinates = {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng
        };
        // Only move the map, don't change the clicked position
        setMapCenter([coordinates.lat, coordinates.lng]);
        setMapZoom(9);
        // Don't call setClickedPosition here to preserve the original clicked location
    };

    // Hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSuggestions(false);
        };

        if (showSuggestions) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showSuggestions]);

    return (
        <div className="w-full h-screen relative bg-gray-100">
            {/* Search Panel - Always visible */}
            <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-lg mb-3 text-gray-800">Location Search</h3>

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
                                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
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
                                                {suggestion.display_name?.split(',')[0]}
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
                            {loading ? '...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

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

            {/* Coordinates & Save Panel - Only show if hidePanels is false */}
            {!hidePanels && clickedPosition && (
                <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80">
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Selected Location</h3>

                    <div className="mb-3 text-sm">
                        <p><strong>Latitude:</strong> {clickedPosition.lat.toFixed(6)}</p>
                        <p><strong>Longitude:</strong> {clickedPosition.lng.toFixed(6)}</p>
                    </div>

                    <button
                        onClick={() => setShowSaveForm(!showSaveForm)}
                        className="w-full mb-3 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                        {showSaveForm ? 'Cancel' : 'Save This Location'}
                    </button>

                    {/* Save Form */}
                    {showSaveForm && (
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Location title"
                                value={newLocation.title}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />

                            <textarea
                                placeholder="Description (optional)"
                                value={newLocation.description}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-20 resize-none"
                            />

                            <select
                                value={newLocation.category}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="restaurant">Restaurant</option>
                                <option value="hotel">Hotel</option>
                                <option value="attraction">Attraction</option>
                                <option value="business">Business</option>
                                <option value="other">Other</option>
                            </select>

                            <div className="flex gap-2">
                                <button
                                    onClick={saveLocation}
                                    disabled={loading || !newLocation.title.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setShowSaveForm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Saved Locations Panel - Only show if hidePanels is false */}
            {!hidePanels && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80 max-h-80 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-3 text-gray-800">
                        Saved Locations ({savedLocations.length})
                    </h3>

                    {savedLocations.length === 0 ? (
                        <p className="text-gray-500 text-sm">No saved locations yet</p>
                    ) : (
                        <div className="space-y-2">
                            {savedLocations.map((location) => (
                                <div key={location._id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 cursor-pointer" onClick={() => viewSavedLocation(location)}>
                                            <h4 className="font-semibold text-sm text-blue-600 hover:text-blue-800">
                                                {location.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                📍 {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize mt-1">
                                                🏷️ {location.category}
                                            </p>
                                            {location.description && (
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {location.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-blue-500 mt-1">
                                                👆 Click to view on map
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteLocation(location._id);
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs ml-2 px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Map Container */}
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Map Controller for auto-movement */}
                <MapController center={mapCenter} zoom={mapZoom} />

                {/* Click handler for coordinates */}
                <LocationMarker
                    onLocationSelect={handleLocationSelect}
                    clickedPosition={clickedPosition}
                    showMarker={!hidePanels} // Only show clicked marker if panels are visible
                />

                {/* Display saved locations - Only if panels are not hidden */}
                {!hidePanels && savedLocations.map((location) => (
                    <Marker
                        key={location._id}
                        position={[location.coordinates.lat, location.coordinates.lng]}
                        icon={createLocationIcon(MARKER_COLORS.SAVED)}
                    >
                        <Popup>
                            <div className="text-sm">
                                <h4 className="font-semibold">{location.title}</h4>
                                {location.description && <p className="text-gray-600 mt-1">{location.description}</p>}
                                <p className="text-xs text-gray-500 mt-2">
                                    Category: {location.category}<br />
                                    Coordinates: {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapLocation;