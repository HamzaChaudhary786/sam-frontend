import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/employees");
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      ></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome
          </h1>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Balochistan Levies
          </h1>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="block text-yellow-300 mt-2">
              Staff & Asset Management
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Your comprehensive solution for managing projects, teams, and
            operations with efficiency and precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-white text-blue-600 cursor-pointer font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
            <button
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight * 0.9, // Scroll to 50% of the viewport height
                  behavior: "smooth", // Smooth scrolling
                });
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
