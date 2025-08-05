import React, { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, Users, FileSpreadsheet, Database, X } from 'lucide-react';
import { BACKEND_URL } from '../constants/api';

const EmployeeImport = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [file, setFile] = useState(null);
    const [uploadedData, setUploadedData] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [importResults, setImportResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false)
    const [isDelete, setIsDelet] = useState(false)

    const getCurrentUserId = () => localStorage.getItem("userId");

    // Handle file selection
    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            setUploadedData(null);
            setValidationResults(null);
            setImportResults(null);
        }
    };

    // Upload and process file
    const handleFileUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${BACKEND_URL}/employee/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth system
                }
            });

            const result = await response.json();

            if (result.success) {
                setUploadedData(result.data);
                setCurrentStep(2);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error uploading file: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Validate data
    const handleValidation = async () => {
        if (!uploadedData?.employees) {
            setError('No data to validate');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${BACKEND_URL}/employee/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ employees: uploadedData.employees })
            });

            const result = await response.json();

            if (result.success) {
                setValidationResults(result.data);
                setCurrentStep(3);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error validating data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Import data to database
    const handleImport = async () => {
        if (!uploadedData?.employees) {
            setError('No data to import');
            return;
        }

        setLoading(true);
        setError('');

        const myEmployeedata = {
            employees: uploadedData.employees,
            isDelete: isDelete,
            userId: getCurrentUserId()
        }

        try {
            const response = await fetch(`${BACKEND_URL}/employee/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(myEmployeedata)
            });

            const result = await response.json();

            if (result.success) {
                setImportResults(result.data);
                setCurrentStep(4);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error importing data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = [
            'Personal Number',
            'First Name',
            'Last Name',
            'Father First Name',
            'Father Last Name',
            'Cast',
            'Rank',
            'CNIC',
            'Status',
            'Designation',
            'Mobile Number',
            'Grade',
            'Service Type (federal/provincial)',
            'Address Line 1',
            'Address Line 2',
            'Muhala',
            'Tehsil',
            'Date of Birth (YYYY-MM-DD)'
        ];

        const sampleData = [
            'EMP001',
            'Ali',
            'Khan',
            'Ahmed',
            'Khan',
            'Rajput',
            'Senior',
            '35202-1234567-1',
            'active',
            'Inspector',
            '03001234567',
            'BPS-17',
            'federal',
            'Street 123',
            'House 5',
            'Gulshan-e-Iqbal',
            'Lahore Tehsil',
            '1990-01-15'
        ];

        const csvContent = [headers, sampleData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_import_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };



    // Reset process
    const handleReset = () => {
        setCurrentStep(1);
        setFile(null);
        setUploadedData(null);
        setValidationResults(null);
        setImportResults(null);
        setError('');
    };

    const StepIndicator = ({ step, currentStep, title }) => (
        <div className={`flex items-center ${step <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step < currentStep ? 'bg-blue-600 border-blue-600 text-white' :
                step === currentStep ? 'border-blue-600 text-blue-600' : 'border-gray-300'
                }`}>
                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            <span className="ml-2 font-medium">{title}</span>
        </div>
    );




    const handleConfirm = () => {

        setConfirmPopup(true)

    }

    const handleYes = () => {
        // Add your delete logic here
        console.log("Deleting all employee data...");
        setIsDelet(true)
        setConfirmPopup(false);
    };

    const handleNo = () => {
        setConfirmPopup(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            <div className='flex flex-row justify-between px-4 items-center'>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Data Import</h1>
                    <p className="text-gray-600">Import employee data from Excel files</p>
                </div>
                <div className='flex flex-row gap-3 border-2 border-red-500 p-2 rounded-2xl'>
                    <input type="checkbox" className='w-4 h-4' onClick={() => {
                        handleConfirm()
                    }} />
                    <p>Delete previous data</p>
                </div>
            </div>

            <div>
                {confirmPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
                                </div>
                                <button
                                    onClick={handleNo}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-gray-700 text-base leading-relaxed mb-2">
                                    Are you sure you want to delete all employee data?
                                </p>
                                <p className="text-sm text-red-600 font-medium">
                                    This action cannot be undone.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 p-6 bg-gray-50 justify-end">
                                <button
                                    onClick={handleNo}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleYes}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                                >
                                    Delete All Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <StepIndicator step={1} currentStep={currentStep} title="Upload File" />
                    <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                    <StepIndicator step={2} currentStep={currentStep} title="Review Data" />
                    <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                    <StepIndicator step={3} currentStep={currentStep} title="Validate" />
                    <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                    <StepIndicator step={4} currentStep={currentStep} title="Import" />
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {/* Step 1: File Upload */}
            {currentStep === 1 && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center mb-6">
                        <FileSpreadsheet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Upload Employee Data</h2>
                        <p className="text-gray-600">Select an Excel file containing employee information</p>
                    </div>

                    <div className="mb-4">
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                {file ? file.name : 'Choose Excel file or drag and drop'}
                            </p>
                            <p className="text-sm text-gray-500">Support for .xlsx and .xls files</p>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleFileUpload}
                            disabled={!file || loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        >
                            {loading ? 'Processing...' : 'Upload & Process'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Review Data */}
            {currentStep === 2 && uploadedData && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Review Uploaded Data</h2>
                        <p className="text-gray-600">
                            Found {uploadedData.totalRecords} employee records. Review the data before validation.
                        </p>
                    </div>

                    {uploadedData.errors && uploadedData.errors.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center mb-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                                <span className="font-medium text-yellow-800">Processing Warnings</span>
                            </div>
                            <ul className="text-sm text-yellow-700">
                                {uploadedData.errors.map((error, index) => (
                                    <li key={index}>Row {error.row}: {error.error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="overflow-x-auto mb-6">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Personal No.</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Father Name</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CNIC</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Grade</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Service Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadedData.employees.slice(0, 10).map((employee, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="px-4 py-2 text-sm">{employee.personalNumber}</td>
                                        <td className="px-4 py-2 text-sm">{employee.firstName} {employee.lastName}</td>
                                        <td className="px-4 py-2 text-sm">{employee.fatherFirstName} {employee.fatherLastName}</td>
                                        <td className="px-4 py-2 text-sm">{employee.cnic}</td>
                                        <td className="px-4 py-2 text-sm">{employee.grade}</td>
                                        <td className="px-4 py-2 text-sm">{employee.serviceType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {uploadedData.employees.length > 10 && (
                            <p className="text-sm text-gray-500 mt-2">
                                Showing first 10 records. Total: {uploadedData.employees.length}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={handleReset}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Start Over
                        </button>
                        <button
                            onClick={handleValidation}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        >
                            {loading ? 'Validating...' : 'Validate Data'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Validation Results */}
            {currentStep === 3 && validationResults && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Validation Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                                    <div>
                                        <p className="font-medium text-green-800">Valid Records</p>
                                        <p className="text-2xl font-bold text-green-600">{validationResults.valid}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-center">
                                    <XCircle className="w-6 h-6 text-red-500 mr-2" />
                                    <div>
                                        <p className="font-medium text-red-800">Invalid Records</p>
                                        <p className="text-2xl font-bold text-red-600">{validationResults.invalid}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {validationResults.errors && validationResults.errors.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-red-800 mb-3">Validation Errors</h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                {validationResults.errors.map((error, index) => (
                                    <div key={index} className="mb-2 last:mb-0">
                                        <p className="font-medium text-red-700">
                                            Row {error.row} - Personal No: {error.personalNumber}
                                        </p>
                                        <ul className="text-sm text-red-600 ml-4">
                                            {error.errors.map((err, errIndex) => (
                                                <li key={errIndex}>• {err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {validationResults.warnings && validationResults.warnings.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-yellow-800 mb-3">Warnings</h3>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                {validationResults.warnings.map((warning, index) => (
                                    <div key={index} className="mb-2 last:mb-0">
                                        <p className="font-medium text-yellow-700">
                                            Row {warning.row} - Personal No: {warning.personalNumber}
                                        </p>
                                        <ul className="text-sm text-yellow-600 ml-4">
                                            {warning.warnings.map((warn, warnIndex) => (
                                                <li key={warnIndex}>• {warn}</li>
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
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Back to Review
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={loading || validationResults.valid === 0}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                        >
                            {loading ? 'Importing...' : `Import ${validationResults.valid} Valid Records`}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Import Results */}
            {currentStep === 4 && importResults && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center mb-6">
                        <Database className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Import Complete</h2>
                        <p className="text-gray-600">Employee data has been imported successfully</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center">
                                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                                <div>
                                    <p className="font-medium text-green-800">Successfully Imported</p>
                                    <p className="text-2xl font-bold text-green-600">{importResults.successful}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center">
                                <XCircle className="w-6 h-6 text-red-500 mr-2" />
                                <div>
                                    <p className="font-medium text-red-800">Failed to Import</p>
                                    <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {importResults.errors && importResults.errors.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-red-800 mb-3">Import Errors</h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                {importResults.errors.map((error, index) => (
                                    <div key={index} className="mb-2 last:mb-0">
                                        <p className="font-medium text-red-700">
                                            Personal No: {error.personalNumber}
                                        </p>
                                        <p className="text-sm text-red-600 ml-4">• {error.error}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button
                            onClick={handleReset}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Import More Data
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeImport;