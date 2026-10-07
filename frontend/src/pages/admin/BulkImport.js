import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';

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
                alert('Please upload a valid CSV file');
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
        <DashboardLayout>
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <FileSpreadsheet className="w-6 h-6 text-teal-400" />
                            Bulk Student CSV Import
                        </h1>
                        <p className="text-sm text-gray-400">
                            Create student records in bulk via standard CSV templates or export existing student directory.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors shadow"
                        >
                            <Download className="w-4 h-4" />
                            CSV Template
                        </button>
                        <button
                            type="button"
                            onClick={exportStudents}
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-600/30 transition-colors shadow"
                        >
                            <Download className="w-4 h-4" />
                            Export Active Students
                        </button>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-xl space-y-5">
                    <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">
                        Upload CSV Data File
                    </h2>

                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                            dragActive
                                ? 'border-teal-400 bg-teal-500/10'
                                : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />

                        {file ? (
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm">
                                    <FileText className="w-4 h-4" />
                                    <span className="font-medium">{file.name}</span>
                                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-xs text-rose-400 hover:underline"
                                    >
                                        Remove selected file
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-300">
                                    Drag and drop your spreadsheet <span className="text-teal-400 font-mono">.csv</span> here, or
                                </p>
                                <label className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg cursor-pointer text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 shadow transition-all">
                                    Browse Local File
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700 text-xs text-gray-400 space-y-1.5">
                        <p className="font-semibold text-gray-300">CSV Column Structure:</p>
                        <p>• <span className="text-white font-mono">Required:</span> username, email, first_name, last_name</p>
                        <p>• <span className="text-gray-300 font-mono">Optional:</span> phone, date_of_birth (YYYY-MM-DD), address, citizenship_number</p>
                        <p>• Note: Default initial password will be assigned automatically and users will be notified.</p>
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={!file || importing}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3 rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        {importing ? 'Processing and Validating CSV...' : 'Process Student Import'}
                    </button>
                </div>

                {/* Results Section */}
                {results && (
                    <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-xl space-y-5">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            {results.success ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                            Import Summary
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border ${results.success ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-rose-950/40 border-rose-800/60'}`}>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Processed Successfully</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {results.success_count || 0} students
                                </p>
                            </div>
                            <div className="p-4 rounded-xl border bg-rose-950/40 border-rose-800/60">
                                <p className="text-xs text-rose-400 uppercase font-semibold">Errors Encountered</p>
                                <p className="text-2xl font-bold text-rose-300 mt-1">
                                    {results.error_count || 0}
                                </p>
                            </div>
                        </div>

                        {results.created_students && results.created_students.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                                    Created Student Accounts ({results.created_students.length})
                                </h3>
                                <div className="max-h-48 overflow-y-auto space-y-1.5">
                                    {results.created_students.map((student, idx) => (
                                        <div key={idx} className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-white">{student.name || student.username}</p>
                                                <p className="text-[11px] text-gray-400">@{student.username} • {student.email}</p>
                                            </div>
                                            <span className="text-emerald-400 font-medium">Created ✓</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.errors && results.errors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                                    Errors ({results.errors.length})
                                </h3>
                                <div className="max-h-48 overflow-y-auto space-y-1 bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg text-xs text-rose-300">
                                    {results.errors.map((err, idx) => (
                                        <p key={idx}>• {err}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BulkImport;
