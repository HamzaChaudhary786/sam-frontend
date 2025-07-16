import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../EmployeeHook";

const EmployeeList = () => {
  const { employees, loading, error, removeEmployee } = useEmployees();
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});

  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await removeEmployee(id);
    }
  };

  const handleAddEmployee = () => {
    navigate("/employee");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleEdit = async (data) => {
    setEditData(data);
    navigate("/employee", {
      state: {
        isEdit: true,
        editData: data,
      },
    });
  };

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
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {employee.firstName?.charAt(0)}
                          {employee.lastName?.charAt(0)}
                        </span>
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
                    {employee.address?.line1}, {employee.address?.city}
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
                    onClick={() => handleDelete(employee._id)}
                    className="text-red-600 hover:text-red-900 ml-2"
                  >
                    Delete
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() =>{
                       handleEdit(employee)}}
                    className="text-red-600 hover:text-red-900 ml-2"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
