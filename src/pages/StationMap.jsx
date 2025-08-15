import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapLocation from '../components/Dashboard/MapComponent/MapLocation'
import StationModal from '../components/Station/AddStation/AddStation.jsx'
import { useStations } from '../components/Station/StationHook.js'

const StationMap = () => {
    const navigate = useNavigate()

    const handleBackToDashboard = () => {
        navigate('/dashboard') // Adjust the path as needed for your dashboard route
    }

    const {
        createStation,
        modifyStation,
    } = useStations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEditStationFromMap = (location) => {
        // map saved location structure to station structure expected by StationModal
        const mappedStation = {
            _id: location?.station?._id || location?._id,
            name: location?.station?.name || location?.title || '',
            tehsil: location?.station?.tehsil || '',
            district: location?.station?.district || '',
            status: location?.station?.status || location?.status || '',
            facilities: location?.station?.facilities || location?.facilities || [],
            description: location?.station?.description || location?.description || '',
            address: location?.station?.address || location?.address || { line1: '', line2: '', city: '' },
            latitude: (location?.coordinates?.lat ?? location?.latitude ?? '').toString(),
            longitude: (location?.coordinates?.lng ?? location?.longitude ?? '').toString(),
            stationImageUrl: location?.station?.stationImageUrl || location?.stationImageUrl || [],
            stationIncharge: location?.station?.stationIncharge || location?.stationIncharge || [ { employee: '', type: '' } ],
            stationMinimumRequirements: location?.station?.stationMinimumRequirements || location?.stationMinimumRequirements || [
                { numberOfStaff: 0, assetRequirement: [ { assets: '', quantity: 1 } ], staffDetail: [ { designation: '', numberOfPersonal: 0, assetRequirement: [ { assets: '', quantity: 1 } ] } ] }
            ],
        };

        setIsEditMode(true);
        setEditData(mappedStation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditData(null);
    };

    // Wrap modifyStation to trigger refresh of saved locations on success
    const modifyStationAndRefresh = async (id, data) => {
        const result = await modifyStation(id, data);
        if (result?.success) {
            setRefreshKey(prev => prev + 1);
        }
        return result;
    };

    return (
        <div>
            {/* Professional Back Button - Bottom Right Corner */}
            <button
                onClick={handleBackToDashboard}
                className="fixed bottom-4 right-4 z-[1001] bg-white hover:bg-gray-50 border border-gray-200 shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all duration-200 font-medium text-sm"
                title="Back to Dashboard"
            >
                <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        d="M19 12H5m0 0l7 7m-7-7l7-7" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
                <span>Back</span>
            </button>

            <header className="bg-blue-600 text-white p-4 absolute top-0 left-0 right-0 z-[999]">
                <div className="text-center">
                    <h1 className="text-xl font-bold">Interactive Station Map</h1>
                    <p className="text-sm opacity-90">Click anywhere on the map to get coordinates • Search for locations • Save your favorite places</p>
                </div>
            </header>
            
            <div className="pt-20">
                <MapLocation
                    onPositionChange={() => { }}
                    hidePanels={false}
                    onEditStation={handleEditStationFromMap}
                    refreshKey={refreshKey}
                />
            </div>

            <StationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isEdit={isEditMode}
                editData={editData}
                createStation={createStation}
                modifyStation={modifyStationAndRefresh}
            />
        </div>
    )
}

export default StationMap