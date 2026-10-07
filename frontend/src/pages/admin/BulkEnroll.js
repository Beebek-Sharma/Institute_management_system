import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';

const BulkEnroll = () => {
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [batchesRes, studentsRes] = await Promise.all([
                axios.get('/api/batches/'),
                axios.get('/api/users/?role=student')
            ]);
            setBatches(batchesRes.data?.results || batchesRes.data || []);
            setStudents(studentsRes.data?.results || studentsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkEnroll = async () => {
        if (!selectedBatch || selectedStudents.length === 0) {
            alert('Please select a batch and at least one student');
            return;
        }

        setProcessing(true);
        setResults(null);

        try {
            const response = await axios.post('/api/enrollments/bulk_enroll/', {
                batch_id: selectedBatch,
                student_ids: selectedStudents
            });
            setResults(response.data);
        } catch (error) {
            console.error('Error during bulk enrollment:', error);
            alert(error.response?.data?.error || 'Error during bulk enrollment');
        } finally {
            setProcessing(false);
        }
    };

    const toggleStudent = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const filteredStudents = students.filter(student => {
        const full = `${student.first_name || ''} ${student.last_name || ''} ${student.username || ''} ${student.email || ''}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    const selectAll = () => {
        setSelectedStudents(filteredStudents.map(s => s.id));
    };

    const deselectAll = () => {
        setSelectedStudents([]);
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-teal-400" />
                        Bulk Student Enrollment
                    </h1>
                    <p className="text-sm text-gray-400">
                        Select an active course batch and assign multiple students in a single batch operation.
                    </p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading batches and student list...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Step 1: Batch Selection */}
                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg">
                                <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-3">
                                    Step 1: Target Batch
                                </h2>
                                <label className="block text-xs text-gray-400 mb-2">Choose Course & Section</label>
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className="w-full p-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                >
                                    <option value="">-- Select a Batch --</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.course_name || batch.course?.name || `Course #${batch.course}`} - Batch {batch.batch_number} ({batch.enrolled_count || 0}/{batch.capacity})
                                        </option>
                                    ))}
                                </select>

                                {selectedBatch && (
                                    <div className="mt-4 p-3 bg-slate-900/60 rounded-lg border border-slate-700 text-xs text-gray-300 space-y-1">
                                        <p className="font-semibold text-white">Batch Details:</p>
                                        {(() => {
                                            const b = batches.find(x => String(x.id) === String(selectedBatch));
                                            return b ? (
                                                <>
                                                    <p>Course: <span className="text-teal-300">{b.course_name || b.course?.name}</span></p>
                                                    <p>Capacity: {b.capacity} (Seats Left: {Math.max(0, b.capacity - (b.enrolled_count || 0))})</p>
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Student Selection */}
                            <div className="md:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                                    <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">
                                        Step 2: Select Students ({selectedStudents.length} selected)
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={selectAll}
                                            className="px-2.5 py-1 text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded hover:bg-teal-500/30 transition-colors"
                                        >
                                            Select Shown
                                        </button>
                                        <button
                                            type="button"
                                            onClick={deselectAll}
                                            className="px-2.5 py-1 text-xs bg-slate-700 text-gray-300 rounded hover:bg-slate-600 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Filter by name, username or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full mb-3 p-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                />

                                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 border border-slate-700/60 rounded-lg p-2 bg-slate-900/40 flex-1">
                                    {filteredStudents.length === 0 ? (
                                        <p className="text-center py-6 text-xs text-gray-500">No students match filter.</p>
                                    ) : (
                                        filteredStudents.map(student => {
                                            const isSelected = selectedStudents.includes(student.id);
                                            return (
                                                <div
                                                    key={student.id}
                                                    onClick={() => toggleStudent(student.id)}
                                                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                                                        isSelected
                                                            ? 'bg-teal-500/20 border-teal-500/50 text-white'
                                                            : 'bg-slate-800/60 border-slate-700/60 text-gray-300 hover:bg-slate-700/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-600"
                                                        />
                                                        <div>
                                                            <p className="text-xs font-semibold">
                                                                {student.first_name || student.last_name
                                                                    ? `${student.first_name || ''} ${student.last_name || ''}`
                                                                    : student.username}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400">
                                                                @{student.username} • {student.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <button
                                    onClick={handleBulkEnroll}
                                    disabled={processing || !selectedBatch || selectedStudents.length === 0}
                                    className="mt-4 w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transition-all"
                                >
                                    <Users className="w-4 h-4" />
                                    {processing ? 'Processing Bulk Enrollment...' : `Enroll ${selectedStudents.length} Selected Student(s)`}
                                </button>
                            </div>
                        </div>

                        {/* Results Panel */}
                        {results && (
                            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-teal-400" />
                                    Enrollment Results
                                </h2>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-center">
                                        <p className="text-xs text-emerald-400 uppercase font-semibold">Success</p>
                                        <p className="text-2xl font-bold text-emerald-300">{results.success_count || 0}</p>
                                    </div>
                                    <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-center">
                                        <p className="text-xs text-rose-400 uppercase font-semibold">Errors</p>
                                        <p className="text-2xl font-bold text-rose-300">{results.error_count || 0}</p>
                                    </div>
                                    <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-center">
                                        <p className="text-xs text-amber-400 uppercase font-semibold">Warnings</p>
                                        <p className="text-2xl font-bold text-amber-300">{results.warning_count || 0}</p>
                                    </div>
                                </div>

                                {results.results?.success?.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                                            Successfully Enrolled ({results.results.success.length})
                                        </h3>
                                        <div className="max-h-48 overflow-y-auto space-y-1">
                                            {results.results.success.map((item, idx) => (
                                                <div key={idx} className="p-2 bg-emerald-900/20 border border-emerald-800/40 rounded text-xs text-emerald-200 flex justify-between">
                                                    <span>{item.student_name || item.username}</span>
                                                    <span className="text-emerald-400">Enrolled ✓</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.results?.errors?.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                                            Failed Enrollments ({results.results.errors.length})
                                        </h3>
                                        <div className="max-h-48 overflow-y-auto space-y-1">
                                            {results.results.errors.map((item, idx) => (
                                                <div key={idx} className="p-2 bg-rose-900/20 border border-rose-800/40 rounded text-xs text-rose-200">
                                                    <p className="font-semibold">{item.student_name || `Student #${item.student_id}`}</p>
                                                    <p className="text-rose-400">{Array.isArray(item.errors) ? item.errors.join(', ') : item.errors}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BulkEnroll;
