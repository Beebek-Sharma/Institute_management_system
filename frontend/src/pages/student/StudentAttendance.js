import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const StudentAttendance = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [courseFilter, setCourseFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total_classes: 0,
        present: 0,
        absent: 0,
        attendance_rate: 0
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'student') {
                navigate('/unauthorized');
            } else {
                fetchMyAttendance();
                fetchMyCourses();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterRecords();
        calculateStats();
    }, [attendanceRecords, courseFilter]);

    const fetchMyAttendance = async () => {
        setLoading(true);
        try {
            // Backend filters attendance by logged-in student automatically
            const response = await axios.get('/api/attendance/');
            console.log('Attendance response:', response.data);
            setAttendanceRecords(response.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching attendance:', err);
            console.error('Response:', err.response?.data);
            setError('Failed to fetch attendance records');
            setAttendanceRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyCourses = async () => {
        try {
            // Get all courses by fetching enrollments
            const response = await axios.get('/api/enrollments/');
            const uniqueCourses = new Map();
            
            (response.data || []).forEach(enrollment => {
                if (!uniqueCourses.has(enrollment.course)) {
                    uniqueCourses.set(enrollment.course, {
                        id: enrollment.course,
                        title: enrollment.course_name
                    });
                }
            });
            
            setCourses(Array.from(uniqueCourses.values()));
        } catch (err) {
            console.error('Failed to fetch courses', err);
            setCourses([]);
        }
    };

    const filterRecords = () => {
        let filtered = attendanceRecords;

        if (courseFilter) {
            filtered = filtered.filter(r => r.course_id === parseInt(courseFilter));
        }

        setFilteredRecords(filtered);
    };

    const calculateStats = () => {
        const total = attendanceRecords.length;
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const absent = attendanceRecords.filter(r => r.status === 'absent').length;
        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        setStats({
            total_classes: total,
            present,
            absent,
            attendance_rate: rate
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            present: 'bg-green-50 text-green-300 border-green-500/30',
            absent: 'bg-red-50 text-red-600 border-red-500/30',
            late: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            excused: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-4 h-4" />;
            case 'absent':
                return <XCircle className="w-4 h-4" />;
            case 'late':
                return <Clock className="w-4 h-4" />;
            case 'excused':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Attendance</h1>
                    <p className="text-gray-900">Track your class attendance</p>
                </div>

                {/* Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-blue-300 text-sm font-semibold">Total Classes</div>
                            <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total_classes}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">Present</div>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.present}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md border border-red-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-red-600 text-sm font-semibold">Absent</div>
                            <XCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.absent}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Attendance Rate</div>
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.attendance_rate}%</div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <label className="text-gray-900 font-semibold">Filter by Course:</label>
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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

                {/* Attendance Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading attendance...</div>
                ) : (
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-white">
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Date</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Course</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Marked By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="border-b border-gray-200 hover:bg-white transition">
                                            <td className="px-6 py-4 text-gray-700">
                                                {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                {record.course_name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status_display || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {record.instructor_name || 'Instructor'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredRecords.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-700">
                                No attendance records found
                            </div>
                        )}
                    </div>
                )}

                {/* Attendance Tips */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-blue-300 font-semibold mb-2">Attendance Tips</h3>
                    <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
                        <li>Maintain at least 75% attendance to be eligible for exams</li>
                        <li>Contact your instructor if you have concerns about your attendance</li>
                        <li>Excused absences require proper documentation</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentAttendance;
