import React from 'react';
import HeroSection from '../components/Dashboard/Herosection/Herosection';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">1,234</p>
            <p className="text-sm text-gray-500 mt-1">↑ 12% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700">Active Projects</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">45</p>
            <p className="text-sm text-gray-500 mt-1">↑ 8% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700">Pending Tasks</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">12</p>
            <p className="text-sm text-gray-500 mt-1">↓ 3% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">89%</p>
            <p className="text-sm text-gray-500 mt-1">↑ 5% from last month</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-gray-600">New user registered - John Doe</p>
              <span className="text-sm text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-gray-600">Project "Website Redesign" completed</p>
              <span className="text-sm text-gray-400">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-gray-600">3 new tasks assigned</p>
              <span className="text-sm text-gray-400">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;