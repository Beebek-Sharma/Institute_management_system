import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Eye, BookOpen, Calendar, Award } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const AdminInstructors = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'admin') {
                navigate('/unauthorized');
            } else {
                fetchInstructors();
                fetchCourses();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterInstructors();
    }, [instructors, searchTerm]);

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/users/');
            const instructorUsers = response.data.users?.filter(u => u.role === 'instructor') || [];
            setInstructors(instructorUsers);
        } catch (err) {
            setError('Failed to fetch instructors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/courses/');
            setCourses(response.data || []);
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    const filterInstructors = () => {
        let filtered = instructors;

        if (searchTerm) {
            filtered = filtered.filter(instructor =>
                instructor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredInstructors(filtered);
    };

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        if (!selectedInstructor || !selectedCourseId) {
            setError('Please select a course');
            return;
        }

        try {
            await axios.post(`/api/courses/${selectedCourseId}/assign-instructor/`, {
                instructor_id: selectedInstructor.id
            });
            setSuccess('Course assigned successfully!');
            setShowAssignModal(false);
            setSelectedInstructor(null);
            setSelectedCourseId('');
            fetchInstructors();
            fetchCourses();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to assign course');
        }
    };

    const viewInstructorDetails = (instructor) => {
        setSelectedInstructor(instructor);
        setShowDetailsModal(true);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">Instructor Management</h1>
                    <p className="text-gray-200">Manage instructors and course assignments</p>
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
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Instructor
                        </button>
                    </div>
                </div>

                {/* Instructors Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading instructors...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {filteredInstructors.map((instructor) => (
                            <div
                                key={instructor.id}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-purple-300">
                                            {instructor.first_name?.[0] || instructor.username?.[0] || 'I'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {instructor.first_name} {instructor.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-400">@{instructor.username}</p>
                                        <p className="text-sm text-gray-400">{instructor.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{instructor.course_count || 0} courses assigned</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Award className="w-4 h-4" />
                                        <span>{instructor.student_count || 0} total students</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            setSelectedInstructor(instructor);
                                            setShowAssignModal(true);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Assign Course
                                    </button>
                                    <button
                                        onClick={() => viewInstructorDetails(instructor)}
                                        className="p-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg transition"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredInstructors.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-300">
                        No instructors found
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Total Instructors</div>
                        <div className="text-4xl font-bold text-white">{instructors.length}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Total Courses Assigned</div>
                        <div className="text-4xl font-bold text-purple-400">
                            {instructors.reduce((sum, i) => sum + (i.course_count || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Total Students Taught</div>
                        <div className="text-4xl font-bold text-blue-400">
                            {instructors.reduce((sum, i) => sum + (i.student_count || 0), 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Course Modal */}
            {showAssignModal && selectedInstructor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full border border-white/40 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Course</h2>
                        <p className="text-gray-700 mb-6">
                            Instructor: <span className="font-semibold">{selectedInstructor.first_name} {selectedInstructor.last_name}</span>
                        </p>

                        <form onSubmit={handleAssignCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Select Course *</label>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="">Choose a course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.title} ({course.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition"
                                >
                                    Assign Course
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedInstructor(null);
                                        setSelectedCourseId('');
                                    }}
                                    className="flex-1 bg-gray-300/30 hover:bg-gray-400/30 text-gray-800 font-semibold py-3 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Instructor Details Modal */}
            {showDetailsModal && selectedInstructor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/40 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor Details</h2>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.username}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.first_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.last_name || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Assigned Courses */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Assigned Courses</h3>
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm">
                                        Total Courses: <span className="font-semibold text-gray-900">{selectedInstructor.course_count || 0}</span>
                                    </p>
                                    <p className="text-gray-500 text-xs mt-2">
                                        Detailed course list will be loaded from the backend.
                                    </p>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Performance Metrics</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{selectedInstructor.student_count || 0}</div>
                                        <div className="text-xs text-gray-600 mt-1">Total Students</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">{selectedInstructor.course_count || 0}</div>
                                        <div className="text-xs text-gray-600 mt-1">Active Courses</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600">N/A</div>
                                        <div className="text-xs text-gray-600 mt-1">Avg. Rating</div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Class Schedule</h3>
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-gray-500 text-sm">
                                        Class schedule will be displayed here once the schedule system is implemented.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedInstructor(null);
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

export default AdminInstructors;
