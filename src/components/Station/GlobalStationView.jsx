import React, { createContext, useContext, useState } from 'react';
import StationViewModal from './ViewStation/ViewStation.jsx';

const GlobalStationViewContext = createContext();

export const useGlobalStationView = () => {
  const context = useContext(GlobalStationViewContext);
  if (!context) {
    throw new Error('useGlobalStationView must be used within a GlobalStationViewProvider');
  }
  return context;
};

export const GlobalStationViewProvider = ({ children }) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  const openStationView = (station) => {
    setSelectedStation(station);
    setIsViewModalOpen(true);
  };

  const closeStationView = () => {
    setIsViewModalOpen(false);
    setSelectedStation(null);
  };

  const value = {
    openStationView,
    closeStationView,
    isViewModalOpen,
    selectedStation
  };

  return (
    <GlobalStationViewContext.Provider value={value}>
      {children}
      <StationViewModal
        isOpen={isViewModalOpen}
        onClose={closeStationView}
        station={selectedStation}
      />
    </GlobalStationViewContext.Provider>
  );
};