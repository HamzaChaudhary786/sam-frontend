import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Database, X, Download } from 'lucide-react';
import { BACKEND_URL } from '../constants/api';
const StationImport = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [stations, setStations] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Handle file upload
  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${BACKEND_URL}/stations/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setFile(selectedFile);
        setStations(result.data.stations);
        setCurrentStep(2);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Validate stations
  const validateStations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/stations/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stations }),
      });

      const result = await response.json();
      
      if (result.success) {
        setValidationResults(result.data);
        setCurrentStep(3);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error validating data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Import stations
  const importStations = async (deleteExisting = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/stations/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          stations, 
          isDelete: deleteExisting,
          userId: 'current-user-id' // Replace with actual user ID
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setImportResults(result.data);
        setCurrentStep(4);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error importing stations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setFile(null);
    setStations([]);
    setValidationResults(null);
    setImportResults(null);
  };

  // Download sample template
  const downloadTemplate = () => {
    const headers = [
      'Station Name',
      'Tehsil',
      'District', 
      'Address Line 1',
      'Address Line 2',
      'City',
      'Longitude',
      'Latitude',
      'Description',
      'Facilities (comma-separated)',
      'Status'
    ];
    
    const sampleData = [
      'Central Station',
      'City Tehsil',
      'Main District',
      '123 Main Street',
      'Near City Center',
      'Main City',
      '74.3587',
      '31.5204',
      'Main railway station',
      'Parking, WiFi, Restaurant',
      'Active'
    ];

    const csvContent = [headers, sampleData].map(row => row.join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'station_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Station Import System</h1>
          <p className="text-gray-600 text-center">Upload and import station data from Excel files</p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step <= currentStep 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 ${
                      step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center mt-4 space-x-8 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Upload</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Preview</span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Validate</span>
            <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : ''}>Complete</span>
          </div>
        </div>

        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Upload className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Step 1: Upload Excel File</h2>
            </div>
            
            {/* <div className="mb-6">
              <button
                onClick={downloadTemplate}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
            </div> */}

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop your Excel file here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-500 hover:text-blue-700 font-medium">
                  browse to upload
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Supports .xlsx and .xls files
              </p>
            </div>

            {loading && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Processing file...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview Data */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Step 2: Preview Data</h2>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {stations.length} records found
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-2">File: {file?.name}</h3>
              <p className="text-sm text-gray-600">Total stations to import: {stations.length}</p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tehsil</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stations.slice(0, 10).map((station, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{station.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{station.tehsil}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{station.district}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{station.address?.city}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          station.status === 'Active' ? 'bg-green-100 text-green-800' :
                          station.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {station.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stations.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Showing first 10 records. Total: {stations.length} stations
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={validateStations}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validating...' : 'Validate Data'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Validation Results */}
        {currentStep === 3 && validationResults && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Step 3: Validation Results</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-green-800">Valid Records</h3>
                    <p className="text-2xl font-bold text-green-900">{validationResults.valid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-red-800">Invalid Records</h3>
                    <p className="text-2xl font-bold text-red-900">{validationResults.invalid}</p>
                  </div>
                </div>
              </div>
            </div>

            {validationResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-red-800 mb-3">Validation Errors:</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {validationResults.errors.map((error, index) => (
                    <div key={index} className="bg-white border border-red-200 rounded p-3">
                      <p className="font-medium text-red-800">
                        Row {error.row}: {error.stationName}
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                        {error.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Preview
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => importStations(false)}
                  disabled={loading || validationResults.valid === 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Importing...' : 'Import Stations'}
                </button>
                <button
                  onClick={() => importStations(true)}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Importing...' : 'Replace All Stations'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Import Results */}
        {currentStep === 4 && importResults && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Database className="w-6 h-6 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Step 4: Import Complete</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-green-800">Successfully Imported</h3>
                    <p className="text-2xl font-bold text-green-900">{importResults.successful}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-red-800">Failed to Import</h3>
                    <p className="text-2xl font-bold text-red-900">{importResults.failed}</p>
                  </div>
                </div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-red-800 mb-3">Import Errors:</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="bg-white border border-red-200 rounded p-3">
                      <p className="font-medium text-red-800">{error.stationName}</p>
                      <p className="text-sm text-red-700">{error.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium text-green-800">Import Completed Successfully!</h3>
                  <p className="text-green-700">
                    {importResults.successful} stations have been imported to the database.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Import More Stations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationImport;