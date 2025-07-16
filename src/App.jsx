import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeePage from './pages/EmployeeList';
import AddEmployeeForm from './pages/AddEmployee';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/employee" element={<AddEmployeeForm />} />



        </Routes>
      </div>
    </Router>
  );
}

export default App;