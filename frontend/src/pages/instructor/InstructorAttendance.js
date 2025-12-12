import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const InstructorAttendance = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [formData, setFormData] = useState({
        course_id: '',
        date: new Date().toISOString().split('T')[0],
        attendance: {} // { student_id: 'present'/'absent'/'late'/'excused' }
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'instructor') {
                navigate('/unauthorized');
            } else {
                fetchMyCourses();
                fetchAttendanceRecords();
            }
        }
    }, [authLoading, user, navigate]);

    const fetchMyCourses = async () => {
        try {
            const response = await axios.get('/api/courses/my_courses/');
            setCourses(response.data || []);
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    const fetchAttendanceRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/attendance/?instructor=true');
            setAttendanceRecords(response.data || []);
        } catch (err) {
            setError('Failed to fetch attendance records');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseStudents = async (courseId) => {
        try {
            // Get enrollments for this course
            const response = await axios.get('/api/enrollments/my_students/');
            const courseEnrollments = response.data.filter(e => e.batch__course === courseId || e.course === courseId);
            const students = courseEnrollments.map(e => ({
                id: e.student,
                name: e.student_name
            }));
            setStudents(students || []);
            // Initialize attendance object
            const initialAttendance = {};
            students.forEach(student => {
                initialAttendance[student.id] = 'present';
            });
            setFormData(prev => ({ ...prev, attendance: initialAttendance }));
        } catch (err) {
            setError('Failed to fetch students');
        }
    };

    const handleCourseChange = (courseId) => {
        setFormData({ ...formData, course_id: courseId });
        if (courseId) {
            fetchCourseStudents(courseId);
        } else {
            setStudents([]);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setFormData(prev => ({
            ...prev,
            attendance: {
                ...prev.attendance,
                [studentId]: status
            }
        }));
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.course_id) {
            setError('Please select a course');
            return;
        }

        try {
            // Submit attendance for all students
            const attendanceData = Object.entries(formData.attendance).map(([student_id, status]) => ({
                course_id: formData.course_id,
                student_id: parseInt(student_id),
                date: formData.date,
                status,
                marked_by: user.id
            }));

            await axios.post('/api/attendance/bulk/', { records: attendanceData });
            setSuccess('Attendance marked successfully!');
            setShowMarkModal(false);
            setFormData({
                course_id: '',
                date: new Date().toISOString().split('T')[0],
                attendance: {}
            });
            setStudents([]);
            fetchAttendanceRecords();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to mark attendance');
        }
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

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
                    <p className="text-gray-900">Mark attendance for your classes</p>
                </div>

                {/* Alert */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {/* Action Button */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setShowMarkModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition"
                    >
                        <Plus className="w-5 h-5" />
                        Mark Attendance
                    </button>
                </div>

                {/* Recent Attendance Records */}
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Recent Attendance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-white">
                                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Date</th>
                                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Course</th>
                                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Student</th>
                                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.slice(0, 20).map((record) => (
                                    <tr key={record.id} className="border-b border-gray-200 hover:bg-white transition">
                                        <td className="px-6 py-4 text-gray-700">
                                            {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            {record.course_title || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {record.student_name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(record.status)}`}>
                                                {record.status || 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {attendanceRecords.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-700">
                            No attendance records yet. Click "Mark Attendance" to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Mark Attendance Modal */}
            {showMarkModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mark Attendance</h2>

                        <form onSubmit={handleMarkAttendance} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Course *</label>
                                    <select
                                        value={formData.course_id}
                                        onChange={(e) => handleCourseChange(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.title} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            {students.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Students ({students.length})</h3>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {students.map(student => (
                                            <div key={student.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                                                <div>
                                                    <div className="font-semibold text-gray-900">{student.student_name || student.username}</div>
                                                    <div className="text-sm text-gray-600">{student.email}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student.id, 'present')}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition ${formData.attendance[student.id] === 'present'
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition ${formData.attendance[student.id] === 'absent'
                                                                ? 'bg-red-600 text-white'
                                                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student.id, 'late')}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition ${formData.attendance[student.id] === 'late'
                                                                ? 'bg-yellow-600 text-white'
                                                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                                            }`}
                                                    >
                                                        Late
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student.id, 'excused')}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition ${formData.attendance[student.id] === 'excused'
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                                            }`}
                                                    >
                                                        Excused
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={students.length === 0}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition"
                                >
                                    Submit Attendance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMarkModal(false);
                                        setFormData({
                                            course_id: '',
                                            date: new Date().toISOString().split('T')[0],
                                            attendance: {}
                                        });
                                        setStudents([]);
                                    }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-400/30 text-gray-800 font-semibold py-3 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default InstructorAttendance;
