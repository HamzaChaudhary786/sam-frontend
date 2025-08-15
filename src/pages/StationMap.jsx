import React from 'react'
import { useNavigate } from 'react-router-dom'
import MapLocation from '../components/Dashboard/MapComponent/MapLocation'

const StationMap = () => {
    const navigate = useNavigate()

    const handleBackToDashboard = () => {
        navigate('/dashboard') // Adjust the path as needed for your dashboard route
    }

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
                />
            </div>
        </div>
    )
}

export default StationMap