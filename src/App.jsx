import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeePage from './pages/EmployeeList';
import AddEmployeeForm from './pages/AddEmployee';
import StationsPage from './pages/StationList.jsx';
import AssetsPage from './pages/AssetList.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import HistoryPage from './pages/HistoryList.jsx';
import LookupForm from './pages/LookUpForm.jsx';
import Deductions from './pages/SalaryDeduction.jsx';
import Achievements from './pages/Achievements.jsx'
import Assetassignment from './pages/AssetAssignment.jsx'
import Stationassignment from './pages/StationAssignment.jsx';
import StatusAssignment from './pages/StatusAssignment.jsx';
import BulkStationAssignment from './components/BulkStation/BulkStation.jsx';
import EmployeeImport from './pages/EmployeeImport.jsx'
import StationMap from './pages/StationMap.jsx';
import AdminManagementPage from './pages/Admin.jsx'
import EmployeeGridContainer from './pages/EmployeeGridContainer.jsx'
import AuditTrailPage from './pages/Audit.jsx';
import StationImport from './pages/StationImport.jsx';
import MaalKhana from './pages/MaalKhana.jsx'
import PendingStationApprovals from './components/PendingStationPosting/PendingStations.jsx';
import StationAssetAssignment from './pages/StationAssetAssignment.jsx';
import { GlobalStationViewProvider } from './components/Station/GlobalStationView.jsx'; // Adjust path as needed



// Authentication utility functions
const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    // Check if both token and user data exist
    if (!token || !userData) {
      console.log('🔐 Authentication check failed: Missing token or user data');
      return false;
    }

    // Optionally validate token expiration
    try {
      // Basic JWT payload check (without verification)
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        console.log('🔐 Authentication check failed: Token expired');
        // Clear expired data
        clearAuthData();
        return false;
      }
    } catch (tokenError) {
      console.log('🔐 Token validation error:', tokenError);
      // If token is malformed, clear auth data
      clearAuthData();
      return false;
    }

    console.log('✅ Authentication check passed');
    return true;
  } catch (error) {
    console.error('🔐 Authentication check error:', error);
    return false;
  }
};

const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userType');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('loginResponse');
  console.log('🧹 Cleared authentication data');
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    console.log('🚫 Access denied: Redirecting to login');
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (for login page)
const PublicRoute = ({ children }) => {
  const authenticated = isAuthenticated();

  if (authenticated) {
    console.log('✅ Already authenticated: Redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Component to conditionally render navbar
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar if not on login page and user is authenticated */}
      {!isLoginPage && authenticated && <Navbar />}

      <Routes>
        {/* Public Route - Login */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/station-map"
          element={
            <ProtectedRoute>
              <StationMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees-import"
          element={
            <ProtectedRoute>
              <EmployeeImport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <AddEmployeeForm />
            </ProtectedRoute>
          }
        />
         <Route
          path="/pendingapprovals"
          element={
            <ProtectedRoute>
              <PendingStationApprovals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stations"
          element={
            <ProtectedRoute>
              <StationsPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/maalkhana"
          element={
            <ProtectedRoute>
              <MaalKhana />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <AssetsPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/stationassets"
          element={
            <ProtectedRoute>
              <StationAssetAssignment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lookup"
          element={
            <ProtectedRoute>
              <LookupForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deductions"
          element={
            <ProtectedRoute>
              <Deductions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assetassignment"
          element={
            <ProtectedRoute>
              <Assetassignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stationassignment"
          element={
            <ProtectedRoute>
              <Stationassignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statusassignment"
          element={
            <ProtectedRoute>
              <StatusAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-station-assignment"
          element={
            <ProtectedRoute>
              <BulkStationAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editgrid"
          element={
            <ProtectedRoute>
              <EmployeeGridContainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminManagementPage />
            </ProtectedRoute>
          }
        />

        {/* NEW: Audit Trail Routes */}
        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <AuditTrailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-trail"
          element={
            <ProtectedRoute>
              <AuditTrailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-audit"
          element={
            <ProtectedRoute>
              <AuditTrailPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/stationimport"
          element={
            <ProtectedRoute>
              <StationImport />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route - redirect to login if not authenticated, dashboard if authenticated */}
        <Route
          path="*"
          element={
            authenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
          }
        />
      </Routes>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

function App() {
  return (
        <GlobalStationViewProvider>
      <Router>
        <AppContent />
      </Router>
    </GlobalStationViewProvider>
  );
}

export default App;