import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BulkImport = () => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
            } else {
                alert('Please upload a CSV file');
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        setImporting(true);
        setResults(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/users/bulk_import/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResults(response.data);
        } catch (error) {
            console.error('Import error:', error);
            alert('Error during import: ' + (error.response?.data?.error || error.message));
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await axios.get('/api/users/csv_template/', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading template:', error);
            alert('Error downloading template');
        }
    };

    const exportStudents = async () => {
        try {
            const response = await axios.get('/api/users/export_csv/', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'students_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting students:', error);
            alert('Error exporting students');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Student Import</h1>
                <p className="text-gray-600">Import multiple students from a CSV file</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                    <Download className="w-4 h-4" />
                    Download Template
                </button>
                <button
                    onClick={exportStudents}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                    <Download className="w-4 h-4" />
                    Export Current Students
                </button>
            </div>

            {/* File Upload Area */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

                    {file ? (
                        <div className="mb-4">
                            <div className="flex items-center justify-center gap-2 text-green-700">
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">{file.name}</span>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-sm text-red-600 hover:underline mt-2"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-700 mb-2">
                                Drag and drop your CSV file here, or
                            </p>
                            <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                                Browse Files
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </>
                    )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    <p className="font-semibold mb-2">CSV Format Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Required columns: username, email, first_name, last_name</li>
                        <li>Optional columns: phone, date_of_birth, address, citizenship_number</li>
                        <li>First row must be column headers</li>
                        <li>UTF-8 encoding recommended</li>
                    </ul>
                </div>

                <button
                    onClick={handleImport}
                    disabled={!file || importing}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Upload className="w-5 h-5" />
                    {importing ? 'Importing...' : 'Import Students'}
                </button>
            </div>

            {/* Results */}
            {results && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Import Results</h2>

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className={`p-4 rounded-lg ${results.success ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className={`flex items-center gap-2 mb-1 ${results.success ? 'text-green-700' : 'text-red-700'}`}>
                                {results.success ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <XCircle className="w-5 h-5" />
                                )}
                                <span className="font-semibold">
                                    {results.success ? 'Import Successful' : 'Import Failed'}
                                </span>
                            </div>
                            <p className={`text-2xl font-bold ${results.success ? 'text-green-900' : 'text-red-900'}`}>
                                {results.success_count} students created
                            </p>
                        </div>

                        {results.error_count > 0 && (
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700 mb-1">
                                    <XCircle className="w-5 h-5" />
                                    <span className="font-semibold">Errors</span>
                                </div>
                                <p className="text-2xl font-bold text-red-900">{results.error_count}</p>
                            </div>
                        )}
                    </div>

                    {/* Created Students */}
                    {results.created_students && results.created_students.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-green-900 mb-2">✓ Successfully Created Students</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {results.created_students.map((student, index) => (
                                    <div key={index} className="bg-green-50 p-3 rounded border border-green-200">
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-gray-600">{student.username} • {student.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Errors */}
                    {results.errors && results.errors.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-red-900 mb-2">✗ Errors</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {results.errors.map((error, index) => (
                                    <div key={index} className="bg-red-50 p-3 rounded border border-red-200">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
                    {results.warnings && results.warnings.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Warnings
                            </h3>
                            <div className="space-y-2">
                                {results.warnings.map((warning, index) => (
                                    <div key={index} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <p className="text-sm text-yellow-700">{warning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkImport;
