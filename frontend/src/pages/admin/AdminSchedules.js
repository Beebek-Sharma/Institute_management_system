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
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        batch: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        room_number: '',
        building: ''
    });

    const dayMapping = {
        'Monday': 'MON',
        'Tuesday': 'TUE',
        'Wednesday': 'WED',
        'Thursday': 'THU',
        'Friday': 'FRI',
        'Saturday': 'SAT',
        'Sunday': 'SUN'
    };

    const reverseDayMapping = {
        'MON': 'Monday',
        'TUE': 'Tuesday',
        'WED': 'Wednesday',
        'THU': 'Thursday',
        'FRI': 'Friday',
        'SAT': 'Saturday',
        'SUN': 'Sunday'
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'admin') {
                navigate('/unauthorized');
            } else {
                fetchSchedules();
                fetchBatches();
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

    const fetchBatches = async () => {
        try {
            const response = await axios.get('/api/batches/');
            const batchList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setBatches(batchList);
        } catch (err) {
            console.error('Failed to fetch batches', err);
        }
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.batch || !formData.day_of_week || !formData.start_time || !formData.end_time) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await axios.post('/api/schedules/', {
                batch: formData.batch,
                day_of_week: dayMapping[formData.day_of_week],
                start_time: formData.start_time,
                end_time: formData.end_time,
                room_number: formData.room_number,
                building: formData.building
            });
            setSuccess('Schedule created successfully!');
            setFormData({
                batch: '',
                day_of_week: '',
                start_time: '',
                end_time: '',
                room_number: '',
                building: ''
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
            const dayCode = dayMapping[day];
            grouped[day] = schedules.filter(s => s.day_of_week === dayCode);
        });
        return grouped;
    };

    const scheduledByDay = groupByDay();

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-6 mb-8 rounded-xl shadow-sm">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Class Schedule Management</h1>
                    <p className="text-gray-900">Manage physical class schedules and timings</p>
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
                    <div className="text-center py-12 text-gray-700">Loading schedules...</div>
                ) : (
                    <div className="space-y-6">
                        {daysOfWeek.map(day => (
                            <div key={day} className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {day}
                                </h3>
                                {scheduledByDay[day]?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {scheduledByDay[day].map(schedule => (
                                            <div key={schedule.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 mb-1">{schedule.batch_info || 'Unknown Batch'}</h4>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{schedule.start_time} - {schedule.end_time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{schedule.room_number || schedule.building || 'TBA'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-700 text-sm">No classes scheduled for this day</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Schedule Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Class Schedule</h2>

                        <form onSubmit={handleCreateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Batch *</label>
                                <select
                                    value={formData.batch}
                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.course_name} - Batch {batch.batch_number} ({batch.instructor_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Day *</label>
                                    <select
                                        value={formData.day_of_week}
                                        onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">End Time *</label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Room Number</label>
                                    <input
                                        type="text"
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                        placeholder="e.g., Room 101"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Building</label>
                                    <input
                                        type="text"
                                        value={formData.building}
                                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                        placeholder="e.g., Main Building"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition"
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
