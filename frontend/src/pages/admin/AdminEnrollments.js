import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const AdminEnrollments = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [batches, setBatches] = useState([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [formData, setFormData] = useState({
        student_id: '',
        course_id: '',
        batch_id: '',
        status: 'active'
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'admin') {
                navigate('/unauthorized');
            } else {
                fetchEnrollments();
                fetchStudents();
                fetchCourses();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterEnrollments();
    }, [enrollments, searchTerm, statusFilter]);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/enrollments/');
            setEnrollments(response.data || []);
        } catch (err) {
            setError('Failed to fetch enrollments');
            console.error(err);
        } finally {
            setLoading(false);
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

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/courses/');
            setCourses(response.data || []);
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    const fetchBatches = async (courseId) => {
        try {
            setLoadingBatches(true);
            const response = await axios.get(`/api/batches/?course=${courseId}`);
            const batchList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setBatches(batchList);
            setFormData(prev => ({ ...prev, batch_id: '' }));
        } catch (err) {
            console.error('Failed to fetch batches', err);
            setBatches([]);
        } finally {
            setLoadingBatches(false);
        }
    };

    const filterEnrollments = () => {
        let filtered = enrollments;

        if (statusFilter) {
            filtered = filtered.filter(e => e.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEnrollments(filtered);
    };

    const handleManualEnroll = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.student_id || !formData.batch_id) {
            setError('Please select both a student and a batch');
            return;
        }

        try {
            await axios.post('/api/enrollments/', {
                student: formData.student_id,
                batch: formData.batch_id,
                status: formData.status
            });
            setSuccess('Student enrolled successfully!');
            setFormData({
                student_id: '',
                course_id: '',
                batch_id: '',
                status: 'active'
            });
            setShowEnrollModal(false);
            fetchEnrollments();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to enroll student');
        }
    };

    const handleStatusChange = async (enrollmentId, newStatus) => {
        try {
            await axios.patch(`/api/enrollments/${enrollmentId}/`, { status: newStatus });
            setSuccess(`Enrollment ${newStatus} successfully!`);
            fetchEnrollments();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update enrollment status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-500/20 text-green-300 border-green-500/30',
            completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            dropped: 'bg-red-500/20 text-red-300 border-red-500/30',
            pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'dropped':
                return <XCircle className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">Enrollment Management</h1>
                    <p className="text-gray-200">Manage student enrollments and approvals</p>
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

                {/* Search & Filter */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search enrollments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="dropped">Dropped</option>
                        </select>
                        <button
                            onClick={() => setShowEnrollModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
                        >
                            <UserPlus className="w-5 h-5" />
                            Manual Enroll
                        </button>
                    </div>
                </div>

                {/* Enrollments Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading enrollments...</div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/20 bg-white/5">
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Student</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Course</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Enrolled Date</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Progress</th>
                                        <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEnrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="border-b border-white/10 hover:bg-white/5 transition">
                                            <td className="px-6 py-4 text-white font-medium">
                                                {enrollment.student_name || 'Unknown Student'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {enrollment.course_title || 'Unknown Course'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(enrollment.status)}`}>
                                                    {getStatusIcon(enrollment.status)}
                                                    {enrollment.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-white/10 rounded-full h-2 max-w-[100px]">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${enrollment.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-300">{enrollment.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {enrollment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(enrollment.id, 'active')}
                                                                className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(enrollment.id, 'dropped')}
                                                                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {enrollment.status === 'active' && (
                                                        <button
                                                            onClick={() => handleStatusChange(enrollment.id, 'completed')}
                                                            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition text-xs"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredEnrollments.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-300">
                                No enrollments found
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Total Enrollments</div>
                        <div className="text-4xl font-bold text-white">{enrollments.length}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Active</div>
                        <div className="text-4xl font-bold text-green-400">
                            {enrollments.filter(e => e.status === 'active').length}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Pending Approval</div>
                        <div className="text-4xl font-bold text-yellow-400">
                            {enrollments.filter(e => e.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                        <div className="text-gray-300 text-sm font-semibold mb-2">Completed</div>
                        <div className="text-4xl font-bold text-blue-400">
                            {enrollments.filter(e => e.status === 'completed').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Enrollment Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full border border-white/40 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manual Enrollment</h2>

                        <form onSubmit={handleManualEnroll} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Select Student *</label>
                                <select
                                    value={formData.student_id}
                                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="">Choose a student</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.first_name} {student.last_name} ({student.username})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Select Course *</label>
                                <select
                                    value={formData.course_id}
                                    onChange={(e) => {
                                        setFormData({ ...formData, course_id: e.target.value });
                                        if (e.target.value) {
                                            fetchBatches(e.target.value);
                                        } else {
                                            setBatches([]);
                                        }
                                    }}
                                    required
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="">Choose a course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.name || course.title} ({course.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Select Batch *</label>
                                <select
                                    value={formData.batch_id}
                                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                                    required
                                    disabled={!formData.course_id || loadingBatches}
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                                >
                                    <option value="">{loadingBatches ? 'Loading batches...' : 'Choose a batch'}</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.batch_number} - {batch.instructor_name} ({batch.available_seats}/{batch.capacity} seats)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Status *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition"
                                >
                                    Enroll Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEnrollModal(false)}
                                    className="flex-1 bg-gray-300/30 hover:bg-gray-400/30 text-gray-800 font-semibold py-3 rounded-lg transition"
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

export default AdminEnrollments;
