import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../EmployeeHook";
import { STATUS_ENUM } from "../AddEmployee/EmployeeConstants";
import { getCastsWithEnum } from "../AddEmployee/Cast.js";
import { getDesignationsWithEnum } from "../AddEmployee/Designation.js";
import { getGradesWithEnum } from "../AddEmployee/Grades.js";
import EmployeeViewModal from "../ViewEmployee/ViewEmployee.jsx";

const EmployeeList = () => {
  const { employees, loading, error, removeEmployee, updateFilters, clearFilters, filters } = useEmployees();
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter dropdown options
  const [designationEnum, setDesignationEnum] = useState({});
  const [gradeEnum, setGradeEnum] = useState({});

  // Filter state
  const [filterForm, setFilterForm] = useState({
    name: filters.name || "",
    city: filters.city || "",
    status: filters.status || "",
    designation: filters.designation || "",
    grade: filters.grade || "",
    pnumber: filters.pnumber || "",
    cnic: filters.cnic || "",
  });

  const navigate = useNavigate();

  // Fetch dropdown options for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const [desigRes, gradeRes] = await Promise.all([
        getDesignationsWithEnum(),
        getGradesWithEnum(),
      ]);

      if (desigRes.success) setDesignationEnum(desigRes.data);
      if (gradeRes.success) setGradeEnum(gradeRes.data);
    };

    fetchFilterOptions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await removeEmployee(id);
    }
  };

  const handleAddEmployee = () => {
    navigate("/employee");
  };

  const handleEdit = async (data) => {
    setEditData(data);
    navigate("/employee", {
      state: {
        isEdit: true,
        editData: data,
      },
    });
  };

  // Handle view employee details
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filterForm.name.trim()) activeFilters.name = filterForm.name.trim();
    if (filterForm.city.trim()) activeFilters.city = filterForm.city.trim();
    if (filterForm.status) activeFilters.status = filterForm.status;
    if (filterForm.designation) activeFilters.designation = filterForm.designation;
    if (filterForm.grade) activeFilters.grade = filterForm.grade;
    if (filterForm.pnumber.trim()) activeFilters.pnumber = filterForm.pnumber.trim();
    if (filterForm.cnic.trim()) activeFilters.cnic = filterForm.cnic.trim();
    updateFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilterForm({ 
      name: "", 
      city: "", 
      status: "", 
      designation: "", 
      grade: "", 
      pnumber: "", 
      cnic: "" 
    });
    clearFilters();
  };

  // Safety check for employees
  const safeEmployees = Array.isArray(employees) ? employees : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Employee Management
        </h1>
        <button
          onClick={handleAddEmployee}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Add Employee
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Employees</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={filterForm.name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Hamza"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={filterForm.city}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Lahore"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filterForm.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_ENUM).map(([key, value]) => (
                <option key={key} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <select
              name="designation"
              value={filterForm.designation}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Designations</option>
              {Object.entries(designationEnum).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              name="grade"
              value={filterForm.grade}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {Object.entries(gradeEnum).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Police Number
            </label>
            <input
              type="text"
              name="pnumber"
              value={filterForm.pnumber}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., P-00123"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNIC
            </label>
            <input
              type="text"
              name="cnic"
              value={filterForm.cnic}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 35201-1234567-8"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeEmployees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <img className="w-10 h-10 rounded-full" src={employee.profileUrl} alt="" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.pnumber} | {employee.srnumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        CNIC: {employee.cnic}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee.mobileNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.stations.address?.line1}, {employee.stations.address?.city}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee.designation?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Grade: {employee.grade?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Cast: {employee.cast?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === "active"
                        ? "bg-green-100 text-green-800"
                        : employee.status === "retired"
                        ? "bg-blue-100 text-blue-800"
                        : employee.status === "terminated"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(employee)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {safeEmployees.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>

      {/* Employee View Modal */}
      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default EmployeeList;