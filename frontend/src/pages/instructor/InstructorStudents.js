import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Users, Mail, Phone, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const InstructorStudents = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState(searchParams.get('course') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'instructor') {
                navigate('/unauthorized');
            } else {
                fetchMyCourses();
                fetchMyStudents();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterStudents();
    }, [students, searchTerm, courseFilter]);

    const fetchMyCourses = async () => {
        try {
            const response = await axios.get(`/api/instructors/${user.id}/courses/`);
            setCourses(response.data || []);
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    const fetchMyStudents = async () => {
        setLoading(true);
        try {
            // Fetch all students enrolled in instructor's courses
            const response = await axios.get(`/api/instructors/${user.id}/students/`);
            setStudents(response.data || []);
        } catch (err) {
            setError('Failed to fetch students');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let filtered = students;

        if (courseFilter) {
            filtered = filtered.filter(s => s.course_id === parseInt(courseFilter));
        }

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.username?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredStudents(filtered);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">My Students</h1>
                    <p className="text-gray-200">View students enrolled in your courses</p>
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
                            <div className="text-blue-300 text-sm font-semibold">Total Students</div>
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{students.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">My Courses</div>
                            <BookOpen className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{courses.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Avg. per Course</div>
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {courses.length > 0 ? Math.round(students.length / courses.length) : 0}
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
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
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
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
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Student</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Username</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Email</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Course</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Enrollment Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={`${student.id}-${student.course_id}`} className="border-b border-white/10 hover:bg-white/5 transition">
                                            <td className="px-6 py-4 text-white font-medium">
                                                {student.student_name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {student.username || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    {student.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                                                    {student.course_title || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : 'N/A'}
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

                {/* Info Note */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                        <strong>Note:</strong> You can only view students enrolled in your assigned courses. To mark attendance, go to the Attendance page.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorStudents;
