import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const InstructorSchedule = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayMapping = {
        'MON': 'Monday',
        'TUE': 'Tuesday',
        'WED': 'Wednesday',
        'THU': 'Thursday',
        'FRI': 'Friday',
        'SAT': 'Saturday',
        'SUN': 'Sunday'
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'instructor') {
                navigate('/unauthorized');
            } else {
                fetchMySchedule();
            }
        }
    }, [authLoading, user, navigate]);
    const fetchMySchedule = async () => {
        setLoading(true);
        try {
            console.log('Fetching schedules...');
            
            // Fetch schedules for batches assigned to this instructor
            const response = await axios.get('/api/schedules/?instructor=true');
            console.log('Schedule response:', response.data);
            setSchedules(response.data || []);
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Error fetching schedules:', err);
            console.error('Response data:', err.response?.data);
            console.error('Response status:', err.response?.status);
            console.error('Error message:', err.message);
            
            const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
            setError(`Failed to fetch your schedule: ${errorMessage}`);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const groupByDay = () => {
        const grouped = {};
        daysOfWeek.forEach(day => {
            // Convert day name to code for matching
            const dayCode = Object.keys(dayMapping).find(key => dayMapping[key] === day);
            grouped[day] = schedules.filter(s => s.day_of_week === dayCode);
        });
        return grouped;
    };

    const scheduledByDay = groupByDay();

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">My Class Schedule</h1>
                    <p className="text-gray-200">View your weekly class timings</p>
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
                            <div className="text-blue-300 text-sm font-semibold">Total Classes/Week</div>
                            <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{schedules.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">Active Days</div>
                            <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {Object.values(scheduledByDay).filter(day => day.length > 0).length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Unique Courses</div>
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {new Set(schedules.map(s => s.course_name)).size}
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule View */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading your schedule...</div>
                ) : (
                    <div className="space-y-6">
                        {daysOfWeek.map(day => (
                            <div key={day} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {day}
                                    {scheduledByDay[day]?.length > 0 && (
                                        <span className="ml-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                            {scheduledByDay[day].length} {scheduledByDay[day].length === 1 ? 'class' : 'classes'}
                                        </span>
                                    )}
                                </h3>
                                {scheduledByDay[day]?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {scheduledByDay[day].map(schedule => (
                                            <div key={schedule.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                                <div className="mb-3">
                                                    <h4 className="font-bold text-white mb-1">{schedule.course_name || 'Unknown Course'}</h4>
                                                    <p className="text-sm text-gray-400">{schedule.batch_info || 'No batch specified'}</p>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{schedule.start_time} - {schedule.end_time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{schedule.room_number || schedule.building || 'Room TBA'}</span>
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

                {schedules.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 text-lg">No schedule available</p>
                        <p className="text-gray-400 text-sm mt-2">Contact admin to get your class schedule set up</p>
                    </div>
                )}

                {/* Info Note */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                        <strong>Note:</strong> This is a view-only schedule. To request changes to your class timings, please contact the administrator.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorSchedule;
