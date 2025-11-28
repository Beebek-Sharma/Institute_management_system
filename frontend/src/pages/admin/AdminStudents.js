import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Eye, Download, Trash2, CheckSquare } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const AdminStudents = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'admin') {
                navigate('/unauthorized');
            } else {
                fetchStudents();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterStudents();
    }, [students, searchTerm]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/users/');
            const studentUsers = response.data.users?.filter(u => u.role === 'student') || [];
            setStudents(studentUsers);
        } catch (err) {
            setError('Failed to fetch students');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let filtered = students;

        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredStudents(filtered);
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedStudents.length === 0) {
            setError('No students selected');
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)?`)) {
            try {
                await Promise.all(
                    selectedStudents.map(id => axios.delete(`/api/admin/users/${id}/delete/`))
                );
                setSuccess(`${selectedStudents.length} student(s) deleted successfully!`);
                setSelectedStudents([]);
                fetchStudents();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete some students');
            }
        }
    };

    const handleExport = () => {
        const studentsToExport = selectedStudents.length > 0
            ? students.filter(s => selectedStudents.includes(s.id))
            : filteredStudents;

        const csvContent = [
            ['Username', 'Email', 'First Name', 'Last Name', 'Enrollments'],
            ...studentsToExport.map(s => [
                s.username,
                s.email,
                s.first_name || '',
                s.last_name || '',
                s.enrollment_count || 0
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Students exported successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const viewStudentDetails = async (student) => {
        setSelectedStudent(student);
        setShowDetailsModal(true);
        // TODO: Fetch detailed enrollment and payment history
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">Student Management</h1>
                    <p className="text-gray-200">View and manage all students</p>
                </div>

                {/* Alert */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                {/* Search & Actions */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Student
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedStudents.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <span className="text-blue-300 font-semibold">{selectedStudents.length} selected</span>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Students Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading students...</div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/20 bg-white/5">
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Username</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Name</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Email</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Enrollments</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="border-b border-white/10 hover:bg-white/5 transition">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => handleSelectStudent(student.id)}
                                                    className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">{student.username}</td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {student.first_name} {student.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{student.email}</td>
                                            <td className="px-6 py-4 text-gray-300">
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                                    {student.enrollment_count || 0} courses
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => viewStudentDetails(student)}
                                                    className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredStudents.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-300">
                                No students found
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Total Students</div>
                        <div className="text-4xl font-bold text-white">{students.length}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Active Enrollments</div>
                        <div className="text-4xl font-bold text-green-400">
                            {students.reduce((sum, s) => sum + (s.enrollment_count || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Selected</div>
                        <div className="text-4xl font-bold text-blue-400">{selectedStudents.length}</div>
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            {showDetailsModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/40 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Details</h2>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                                    <p className="text-gray-900 font-medium">{selectedStudent.username}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                                    <p className="text-gray-900 font-medium">{selectedStudent.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
                                    <p className="text-gray-900 font-medium">{selectedStudent.first_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                                    <p className="text-gray-900 font-medium">{selectedStudent.last_name || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Enrollment History */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Enrollment History</h3>
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm">
                                        Total Enrollments: <span className="font-semibold text-gray-900">{selectedStudent.enrollment_count || 0}</span>
                                    </p>
                                    <p className="text-gray-500 text-xs mt-2">
                                        Detailed enrollment history will be loaded from the backend.
                                    </p>
                                </div>
                            </div>

                            {/* Payment History */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Payment History</h3>
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-gray-500 text-sm">
                                        Payment records will be displayed here.
                                    </p>
                                </div>
                            </div>

                            {/* Attendance Records */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Attendance Records</h3>
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-gray-500 text-sm">
                                        Attendance data will be shown here once the attendance system is implemented.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedStudent(null);
                                }}
                                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminStudents;
