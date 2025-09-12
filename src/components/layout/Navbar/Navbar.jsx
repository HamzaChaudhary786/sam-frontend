import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../../../assets/logobig.jpg";
import { IoMdNotifications } from "react-icons/io";
import { getPendingApprovals } from "../../StationAssignment/StationAssignmentApi";
import { RESOURCE_ACCESS } from "../../../constants/Enum";
import { usePermissions } from "../../../hook/usePermission";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userType, setUserType] = useState("");
  const [lastLogin, setLastLogin] = useState("");
  const dropdownRef = useRef(null);
  const [pendingApproval, setPendingApproval] = useState([]);
  const navigate = useNavigate();
  const permissions = usePermissions();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.clear(); // Clear all localStorage data

    // Navigate to login
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownOpen(false); // Close dropdown after navigation
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 5) {
        return "Just now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {
      return "Unknown";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userData = localStorage.getItem("userData");
  const parsed = JSON.parse(userData);
  const userTypeData = parsed?.userType;
  const userName = `${parsed?.firstName} ${parsed?.lastName}`;

  const userDistrictTehsil = () => {
    let myType = `${userName} as ${userType === "admin"
      ? "Admin"
      : userType === "data_entry"
        ? "User"
        : "View Only"
      }`;

    if (parsed?.userType === "data_entry") {
      if (parsed?.roles[0]?.tehsil) {
        let myTehsil = parsed?.roles[0]?.tehsil;
        let myDistrict = parsed?.roles[0]?.district;
        return `${myType} for tehsil: ${myTehsil}-${myDistrict}`;
      }
    }
    return `${myType}`;
  };

  // Single boolean: true if userType matches ANY resource
  const hasEmployeeAccess = Object.values(RESOURCE_ACCESS).some((list) =>
    list.includes(userTypeData)
  );

  console.log("hasEmployeeAccess:", hasEmployeeAccess);

  useEffect(() => {
    if (userData) {
      try {
        setUserType(parsed.userType || "Unknown");
        setLastLogin(formatLastLogin(parsed.lastLogin));
      } catch (e) {
        setUserType("Unknown");
        setLastLogin("Unknown");
      }
    } else {
      setUserType("Unknown");
      setLastLogin("Unknown");
    }
  }, []);

  useEffect(() => {
    const fetchPendingApproval = async () => {
      let response = await getPendingApprovals();

      console.log(response.data, "my peding data is ");
      setPendingApproval(response?.data);
    };

    fetchPendingApproval();
  }, []);

  const handleNavigate = () => {
    console.log("navigate");
    navigate("/pendingapprovals");
  };
  console.log(pendingApproval, "pending approval data");

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => {
            navigate("/");
          }}>
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                {/* <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg> */}
                <img src={logoImage} alt="Balochistan Levies logo image" />
              </div>
            </div>

            {/* Brand Name */}
            <div className="flex flex-col">
              <span className="text-lg text-gray-500 hidden sm:block">
                Balochistan Levies Staff & Asset Management
              </span>
            </div>
          </div>

          {/* User Info Section - Hidden on mobile (320px), visible on larger screens */}
          <div className="hidden sm:flex flex-col items-center justify-center text-sm text-gray-600 mr-2">
            <div className="flex items-center space-x-1">
              <span>Logged in:</span>
              <span className="font-semibold capitalize text-blue-600 flex">
                {userDistrictTehsil()}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Last login: {lastLogin}</span>
            </div>
          </div>

          {/* Navigation and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className=" relative cursor-pointer" onClick={handleNavigate}>
              <IoMdNotifications className="text-blue-600 h-6 w-6 " />
              <span className="absolute -top-3 -right-1 text-red-600 text-lg font-semibold">
                {pendingApproval?.length}
              </span>
            </div>

            {/* Navigation Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="hidden xs:inline">Menu</span>
                <svg
                  className={`h-4 w-4 transform transition-transform duration-300 ease-in-out ${isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu with Animation */}
              <div
                className={`absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform transition-all duration-300 ease-in-out origin-top-right ${isDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
              >
                {/* Dropdown Header with Close Button */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="h-4 w-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {userName}
                        {` as ${userType === "admin"
                          ? "Admin"
                          : userType === "data_entry"
                            ? "User"
                            : "View Only"
                          }`}
                      </p>
                      <p className="text-xs text-gray-500 sm:hidden">
                        Last login: {lastLogin}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDropdown}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                    aria-label="Close menu"
                  >
                    <svg
                      className="h-5 w-5 text-gray-500"
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
                </div>

                {/* Menu Items */}
                <div className="py-2 max-h-96 overflow-y-auto">
                  <div className="flex gap-0 px-0 py-0">
                    <button
                      onClick={() => handleNavigation("/dashboard")}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5 mr-3 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span className="font-medium">Home</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>

                  {/* <div className="my-2 border-t border-gray-100"></div> */}

                  {permissions.hasAssetAccess && (
                    <div className="flex gap-0 px-0 py-0">
                      <button
                        onClick={() => handleNavigation("/bulk-asset")}
                        className="flex justify-between items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <div className="flex flex-row ">
                          <svg
                            className="h-5 w-5 mr-3 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          <span>Insert Assets</span>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          handleNavigation("/bulk-asset-assignment")
                        }
                        className="flex justify-between items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <div className="flex flex-row ">
                          <svg
                            className="h-5 w-5 mr-3 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          <span>Assets Assignment</span>
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="flex gap-0 px-0 py-0">
                    {permissions.hasEmployeeAccess && (
                      <button
                        onClick={() => handleNavigation("/editgrid")}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <svg
                          className="h-5 w-5 mr-3 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 10h18M3 14h18m-9-4v8m-7 0V7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                          />
                        </svg>
                        <span>Employees</span>
                      </button>
                    )}

                    {permissions.hasAssetAccess && (
                      <button
                        onClick={() => handleNavigation("/assets")}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <svg
                          className="h-5 w-5 mr-3 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <span>Assets</span>
                      </button>
                    )}
                  </div>

                  {permissions.hasStationAccess && (
                    <div className="flex gap-0 px-0 py-0">
                      <button
                        onClick={() => handleNavigation("/stations")}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <svg
                          className="h-5 w-5 mr-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>Stations</span>
                      </button>

                      <button
                        onClick={() => handleNavigation("/maalkhana")}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <svg
                          className="h-5 w-5 mr-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>Maal Khana</span>
                      </button>
                    </div>
                  )}

                  {permissions.hasEmployeeAccess && (
                    <button
                      onClick={() => handleNavigation("/pendingapprovals")}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5 mr-3 text-cyan-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      <span>Transfer Posting</span>
                    </button>
                  )}

                  <div className="flex gap-0 px-0 py-0">
                    {permissions.hasLookupAccess && (
                      <button
                        onClick={() => handleNavigation("/lookup")}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <svg
                          className="h-5 w-5 mr-3 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Lookups</span>
                      </button>
                    )}

                    {permissions.hasUserAccess && (
                      <button
                        onClick={() => handleNavigation("/admin")}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        <svg
                          className="h-5 w-5 mr-3 text-teal-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>User Role</span>
                      </button>
                    )}
                  </div>

                  {permissions.hasAuditAccess && (
                    <button
                      onClick={() => handleNavigation("/audit")}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5 mr-3 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Audit Trail</span>
                    </button>
                  )}

                  {/* <div className="my-2 border-t border-gray-100"></div> */}
                </div>
              </div>
            </div>

            {/* User Profile Button */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile backdrop with animation */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${isDropdownOpen ? "opacity-25" : "opacity-0 pointer-events-none"
          }`}
        onClick={closeDropdown}
      />
    </nav>
  );
};

export default Navbar;
