import React, { useState, useEffect } from 'react';
import { Upload, Users, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import axios from 'axios';

const BulkEnroll = () => {
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [batchesRes, studentsRes] = await Promise.all([
                axios.get('/api/batches/'),
                axios.get('/api/users/?role=student')
            ]);
            setBatches(batchesRes.data.results || batchesRes.data);
            setStudents(studentsRes.data.results || studentsRes.data);
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
            alert('Error during bulk enrollment');
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

    const selectAll = () => {
        setSelectedStudents(students.map(s => s.id));
    };

    const deselectAll = () => {
        setSelectedStudents([]);
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Enrollment</h1>
                <p className="text-gray-600">Enroll multiple students in a batch at once</p>
            </div>

            {/* Batch Selection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Select Batch</h2>
                <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                >
                    <option value="">-- Select a Batch --</option>
                    {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                            {batch.course_name} - Batch {batch.batch_number} ({batch.enrolled_count}/{batch.capacity})
                        </option>
                    ))}
                </select>
            </div>

            {/* Student Selection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Select Students</h2>
                    <div className="space-x-2">
                        <button
                            onClick={selectAll}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {students.map(student => (
                        <div
                            key={student.id}
                            className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${selectedStudents.includes(student.id) ? 'bg-blue-50' : ''
                                }`}
                            onClick={() => toggleStudent(student.id)}
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => { }}
                                    className="mr-3"
                                />
                                <div>
                                    <p className="font-medium">{student.first_name} {student.last_name}</p>
                                    <p className="text-sm text-gray-600">{student.username} • {student.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-3 text-sm text-gray-600">
                    {selectedStudents.length} student(s) selected
                </p>
            </div>

            {/* Enroll Button */}
            <div className="mb-6">
                <button
                    onClick={handleBulkEnroll}
                    disabled={processing || !selectedBatch || selectedStudents.length === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Users className="w-5 h-5" />
                    {processing ? 'Processing...' : `Enroll ${selectedStudents.length} Student(s)`}
                </button>
            </div>

            {/* Results */}
            {results && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Enrollment Results</h2>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 mb-1">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">Success</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{results.success_count}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700 mb-1">
                                <XCircle className="w-5 h-5" />
                                <span className="font-semibold">Errors</span>
                            </div>
                            <p className="text-2xl font-bold text-red-900">{results.error_count}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-700 mb-1">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-semibold">Warnings</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-900">{results.warning_count}</p>
                        </div>
                    </div>

                    {/* Successful Enrollments */}
                    {results.results.success.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-green-900 mb-2">✓ Successfully Enrolled</h3>
                            <div className="space-y-2">
                                {results.results.success.map((item, index) => (
                                    <div key={index} className="bg-green-50 p-3 rounded border border-green-200">
                                        <p className="font-medium">{item.student_name} ({item.username})</p>
                                        {item.warnings && item.warnings.length > 0 && (
                                            <p className="text-sm text-yellow-700 mt-1">⚠️ {item.warnings.join(', ')}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Errors */}
                    {results.results.errors.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-red-900 mb-2">✗ Failed Enrollments</h3>
                            <div className="space-y-2">
                                {results.results.errors.map((item, index) => (
                                    <div key={index} className="bg-red-50 p-3 rounded border border-red-200">
                                        <p className="font-medium">
                                            {item.student_name || `Student ID: ${item.student_id}`}
                                            {item.username && ` (${item.username})`}
                                        </p>
                                        <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                                            {item.errors.map((error, idx) => (
                                                <li key={idx}>{error}</li>
                                            ))}
                                        </ul>
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

export default BulkEnroll;
