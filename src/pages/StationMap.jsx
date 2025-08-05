import React from 'react'
import MapLocation from '../components/Dashboard/MapComponent/MapLocation'

const StationMap = () => {
    return (
        <div >
            <header className="bg-blue-600 text-white p-4 absolute top-0 left-0 right-0 z-[999]">
                <h1 className="text-xl font-bold">Interactive Earth Map</h1>
                <p className="text-sm opacity-90">Click anywhere on the map to get coordinates • Search for locations • Save your favorite places</p>
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