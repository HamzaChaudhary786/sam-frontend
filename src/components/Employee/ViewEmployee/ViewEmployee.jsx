import React, { useState, useEffect } from "react";
import { getDesignationsWithEnum } from "../AddEmployee/Designation.js";
import { getGradesWithEnum } from "../AddEmployee/Grades.js";

const EmployeeViewModal = ({ isOpen, onClose, employee, onEdit }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [designationEnum, setDesignationEnum] = useState([]);
  const [gradeEnum, setGradeEnum] = useState([]);

  // Fetch dropdown options for designations and grades
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [desigRes, gradeRes] = await Promise.all([
          getDesignationsWithEnum(),
          getGradesWithEnum(),
        ]);

        console.log("Modal - Designation response:", desigRes);
        console.log("Modal - Grade response:", gradeRes);

        if (desigRes.success && desigRes.data) {
          // Convert object to array format
          const designationArray = Object.entries(desigRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setDesignationEnum(designationArray);
          console.log("Modal - Set designations array:", designationArray);
        }

        if (gradeRes.success && gradeRes.data) {
          // Convert object to array format
          const gradeArray = Object.entries(gradeRes.data).map(
            ([_id, name]) => ({
              _id,
              name,
            })
          );
          setGradeEnum(gradeArray);
          console.log("Modal - Set grades array:", gradeArray);
        }
      } catch (error) {
        console.error("Modal - Error fetching options:", error);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  // Helper function to get designation name by ID
  const getDesignationName = (designationId) => {
    if (typeof designationId === "object" && designationId?.name) {
      return designationId.name;
    }

    // If it's an ID, find the name from designationEnum
    if (designationEnum && Array.isArray(designationEnum)) {
      const designation = designationEnum.find((d) => d._id === designationId);
      return designation?.name || designationId || "N/A";
    }

    return designationId || "N/A";
  };

  // Helper function to get grade name by ID
  const getGradeName = (gradeId) => {
    if (typeof gradeId === "object" && gradeId?.name) {
      return gradeId.name;
    }

    // If it's an ID, find the name from gradeEnum
    if (gradeEnum && Array.isArray(gradeEnum)) {
      const grade = gradeEnum.find((g) => g._id === gradeId);
      return grade?.name || gradeId || "N/A";
    }

    return gradeId || "N/A";
  };

  if (!isOpen || !employee) return null;

  // Get profile images array or fallback to empty array
  const profileImages = Array.isArray(employee.profileUrl)
    ? employee.profileUrl
    : employee.profileUrl
    ? [employee.profileUrl]
    : [];

  const currentImage =
    profileImages[currentImageIndex] || "/default-avatar.png";

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? profileImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === profileImages.length - 1 ? 0 : prev + 1
    );
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(employee);
      onClose(); // Close the view modal when edit is clicked
    }
  };
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Employee Details - {employee.firstName} {employee.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Employee Photo and Basic Info */}
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 relative">
                <img
                  src={currentImage}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="h-32 w-32 rounded-full object-cover border-4 border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={openImageModal}
                />

                {/* Navigation arrows - show only if multiple images */}
                {profileImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image counter */}
                {profileImages.length > 1 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} of {profileImages.length}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-lg text-gray-600 mt-1">
                  {getDesignationName(employee.designation)}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      employee.status === "active"
                        ? "bg-green-100 text-green-800"
                        : employee.status === "retired"
                        ? "bg-blue-100 text-blue-800"
                        : employee.status === "terminated"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {employee.status?.charAt(0).toUpperCase() +
                      employee.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Personal Number
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.personalNumber || employee.pnumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CNIC
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.cnic || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.mobileNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.age || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cast
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.cast?.name || employee.cast || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Father's Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.fatherFirstName && employee.fatherLastName
                      ? `${employee.fatherFirstName} ${employee.fatherLastName}`
                      : employee.fatherFirstName ||
                        employee.fatherLastName ||
                        "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Professional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <p className="text-sm text-gray-900">
                    {getDesignationName(employee.designation)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grade
                  </label>
                  <p className="text-sm text-gray-900">
                    {getGradeName(employee.grade)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {employee.serviceType || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.status?.charAt(0).toUpperCase() +
                      employee.status?.slice(1) || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Station Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Station Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.stations?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address Line 1
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.stations?.address?.line1 || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.stations?.address?.line2 || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.stations?.address?.city || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Address Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address Line 1
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.address?.line1 || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.address?.line2 || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Muhala
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.address?.muhala || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tehsil
                  </label>
                  <p className="text-sm text-gray-900">
                    {employee.address?.tehsil || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rest of your existing sections remain the same */}
            {/* Weapons/Assets Information */}
            {employee.assets && employee.assets.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Assigned Assets
                </h4>
                <div className="space-y-4">
                  {employee.assets.map((asset, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-4 ${
                        asset.asset?.type === "weapons"
                          ? "bg-red-50 border border-red-200"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      {/* Asset content remains the same as in your original code */}
                      <div className="flex items-center mb-3">
                        {asset.asset?.type === "weapons" ? (
                          <svg
                            className="h-5 w-5 text-red-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-blue-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        )}
                        <h5
                          className={`font-semibold ${
                            asset.asset?.type === "weapons"
                              ? "text-red-800"
                              : "text-blue-800"
                          }`}
                        >
                          {asset.asset?.name || "Unknown Asset"} (
                          {asset.asset?.type || "Unknown Type"})
                        </h5>
                      </div>
                      {/* Rest of asset content... */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-blue-600 text-white ml-2 rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={`${employee.firstName} ${employee.lastName} - Full Size`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation arrows for full-size modal */}
            {profileImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image counter for full-size modal */}
            {profileImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} of {profileImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeViewModal;
