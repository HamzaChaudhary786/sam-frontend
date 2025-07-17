import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeePage from './pages/EmployeeList';
import AddEmployeeForm from './pages/AddEmployee';
import StationsPage from './pages/StationList.jsx';
import AssetsPage from './pages/AssetList.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx'; 

// Component to conditionally render navbar
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar if not on login page */}
      {!isLoginPage && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/employee" element={<AddEmployeeForm />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;