import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, MapPin, User, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const AdminSchedules = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        course_id: '',
        instructor_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        room: '',
        batch: ''
    });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'admin') {
                navigate('/unauthorized');
            } else {
                fetchSchedules();
                fetchCourses();
                fetchInstructors();
            }
        }
    }, [authLoading, user, navigate]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/schedules/');
            setSchedules(response.data || []);
        } catch (err) {
            setError('Failed to fetch schedules');
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

    const fetchInstructors = async () => {
        try {
            const response = await axios.get('/api/admin/users/');
            const instructorList = response.data.users?.filter(u => u.role === 'instructor') || [];
            setInstructors(instructorList);
        } catch (err) {
            console.error('Failed to fetch instructors', err);
        }
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/schedules/', formData);
            setSuccess('Schedule created successfully!');
            setFormData({
                course_id: '',
                instructor_id: '',
                day_of_week: '',
                start_time: '',
                end_time: '',
                room: '',
                batch: ''
            });
            setShowCreateModal(false);
            fetchSchedules();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create schedule');
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                await axios.delete(`/api/schedules/${scheduleId}/`);
                setSuccess('Schedule deleted successfully!');
                fetchSchedules();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete schedule');
            }
        }
    };

    const groupByDay = () => {
        const grouped = {};
        daysOfWeek.forEach(day => {
            grouped[day] = schedules.filter(s => s.day_of_week === day);
        });
        return grouped;
    };

    const scheduledByDay = groupByDay();

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">Class Schedule Management</h1>
                    <p className="text-gray-200">Manage physical class schedules and timings</p>
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

                {/* Actions */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Schedule
                    </button>
                </div>

                {/* Weekly Schedule View */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading schedules...</div>
                ) : (
                    <div className="space-y-6">
                        {daysOfWeek.map(day => (
                            <div key={day} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {day}
                                </h3>
                                {scheduledByDay[day]?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {scheduledByDay[day].map(schedule => (
                                            <div key={schedule.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white mb-1">{schedule.course_title || 'Unknown Course'}</h4>
                                                        <p className="text-sm text-gray-400">{schedule.batch || 'No batch'}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                                            className="p-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded transition"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{schedule.start_time} - {schedule.end_time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{schedule.room || 'TBA'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <User className="w-4 h-4" />
                                                        <span>{schedule.instructor_name || 'No instructor'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">No classes scheduled for this day</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Schedule Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/40 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Class Schedule</h2>

                        <form onSubmit={handleCreateSchedule} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Course *</label>
                                    <select
                                        value={formData.course_id}
                                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Instructor *</label>
                                    <select
                                        value={formData.instructor_id}
                                        onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="">Select Instructor</option>
                                        {instructors.map(instructor => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.first_name} {instructor.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Day *</label>
                                    <select
                                        value={formData.day_of_week}
                                        onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="">Select Day</option>
                                        {daysOfWeek.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Start Time *</label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">End Time *</label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Room</label>
                                    <input
                                        type="text"
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                        placeholder="e.g., Room 101"
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Batch</label>
                                    <input
                                        type="text"
                                        value={formData.batch}
                                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                        placeholder="e.g., Batch A"
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition"
                                >
                                    Create Schedule
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
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

export default AdminSchedules;
