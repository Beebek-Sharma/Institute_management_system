import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const InstructorCourses = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'instructor') {
                navigate('/unauthorized');
            } else {
                fetchMyCourses();
            }
        }
    }, [authLoading, user, navigate]);

    const fetchMyCourses = async () => {
        setLoading(true);
        try {
            // Fetch courses assigned to this instructor using the new endpoint
            const response = await axios.get('/api/courses/my_courses/');
            setCourses(response.data || []);
        } catch (err) {
            setError('Failed to fetch your courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
                    <p className="text-gray-200">View your assigned courses and student enrollment</p>
                </div>

                {/* Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-blue-300 text-sm font-semibold">Total Courses</div>
                            <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{courses.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">Total Students</div>
                            <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Avg. Enrollment</div>
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {courses.length > 0
                                ? Math.round(courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0) / courses.length)
                                : 0}
                        </div>
                    </div>
                </div>



                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading your courses...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                                            {course.code || 'N/A'}
                                        </span>
                                        {course.category && (
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                                                {course.category}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{course.description || 'No description'}</p>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Enrolled Students:</span>
                                        <span className="text-white font-semibold">{course.enrolled_students || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Max Students:</span>
                                        <span className="text-white font-semibold">{course.max_students || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="text-white font-semibold">{course.duration || 'N/A'}</span>
                                    </div>
                                    {course.fee && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Fee:</span>
                                            <span className="text-white font-semibold">NPR {course.fee}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => navigate(`/instructor/students?course=${course.id}`)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition"
                                    >
                                        <Users className="w-4 h-4" />
                                        View Students
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {courses.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 text-lg">No courses assigned yet</p>
                        <p className="text-gray-400 text-sm mt-2">Contact admin to get courses assigned to you</p>
                    </div>
                )}

                {/* Info Note */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                        <strong>Note:</strong> You can only view courses assigned to you. To request new course assignments, please contact the administrator.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorCourses;
