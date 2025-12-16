import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import CourseCard from '../../components/CourseCard';
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
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
                    <p className="text-gray-900">View your assigned courses and student enrollment</p>
                </div>

                {/* Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
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
                        <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">Total Students</div>
                            <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Avg. Enrollment</div>
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {courses.length > 0
                                ? Math.round(courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0) / courses.length)
                                : 0}
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading your courses...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                actionSlot={
                                    <div className="w-full space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-gray-100 pt-2">
                                            <div className="flex justify-between">
                                                <span>Enrolled:</span>
                                                <span className="font-semibold">{course.enrolled_students || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Max:</span>
                                                <span className="font-semibold">{course.max_students || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Fee:</span>
                                                <span className="font-semibold">{course.fee ? `NPR ${course.fee}` : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/instructor/students?course=${course.id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
                                        >
                                            <Users className="w-4 h-4" />
                                            View Students
                                        </button>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}

                {courses.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white backdrop-blur-md border border-gray-200 rounded-lg">
                        <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-700 text-lg">No courses assigned yet</p>
                        <p className="text-gray-700 text-sm mt-2">Contact admin to get courses assigned to you</p>
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
