import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Calendar, TrendingUp, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const StaffAttendance = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState({
        total_classes: 0,
        average_attendance: 0,
        total_students: 0
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'staff') {
                navigate('/unauthorized');
            } else {
                fetchAttendance();
                fetchCourses();
                fetchStudents();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterRecords();
        calculateStats();
    }, [attendanceRecords, searchTerm, courseFilter, dateFrom, dateTo]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/attendance/');
            setAttendanceRecords(response.data || []);
        } catch (err) {
            setError('Failed to fetch attendance records');
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

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/admin/users/');
            const studentList = response.data.users?.filter(u => u.role === 'student') || [];
            setStudents(studentList);
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    const filterRecords = () => {
        let filtered = attendanceRecords;

        if (courseFilter) {
            filtered = filtered.filter(r => r.course_id === parseInt(courseFilter));
        }

        if (dateFrom) {
            filtered = filtered.filter(r => new Date(r.date) >= new Date(dateFrom));
        }

        if (dateTo) {
            filtered = filtered.filter(r => new Date(r.date) <= new Date(dateTo));
        }

        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRecords(filtered);
    };

    const calculateStats = () => {
        const totalClasses = new Set(attendanceRecords.map(r => `${r.course_id}-${r.date}`)).size;
        const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
        const avgAttendance = attendanceRecords.length > 0
            ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
            : 0;

        setStats({
            total_classes: totalClasses,
            average_attendance: avgAttendance,
            total_students: students.length
        });
    };

    const exportAttendance = () => {
        const csvContent = [
            ['Date', 'Course', 'Student', 'Status'],
            ...filteredRecords.map(r => [
                r.date ? new Date(r.date).toLocaleDateString() : 'N/A',
                r.course_title || 'Unknown',
                r.student_name || 'Unknown',
                r.status || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Attendance exported successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const getStatusColor = (status) => {
        const colors = {
            present: 'bg-green-500/20 text-green-300 border-green-500/30',
            absent: 'bg-red-500/20 text-red-300 border-red-500/30',
            late: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            excused: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">Attendance Reports</h1>
                    <p className="text-gray-200">View and export attendance records (View Only)</p>
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-blue-300 text-sm font-semibold">Total Classes</div>
                            <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.total_classes}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">Avg. Attendance</div>
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.average_attendance}%</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Total Students</div>
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.total_students}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
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
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            placeholder="From Date"
                            className="px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            placeholder="To Date"
                            className="px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                            onClick={exportAttendance}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
                        >
                            <Download className="w-5 h-5" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Attendance Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading attendance records...</div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/20 bg-white/5">
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Date</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Course</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Student</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Marked By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="border-b border-white/10 hover:bg-white/5 transition">
                                            <td className="px-6 py-4 text-gray-300">
                                                {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                {record.course_title || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {record.student_name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(record.status)}`}>
                                                    {record.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {record.marked_by || 'System'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredRecords.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-300">
                                No attendance records found
                            </div>
                        )}
                    </div>
                )}

                {/* Info Note */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                        <strong>Note:</strong> Staff can only view attendance reports. To mark attendance, please contact the course instructor.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StaffAttendance;
