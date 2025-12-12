import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, BookOpen, User } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const StudentSchedule = () => {
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
            if (!user || user?.role !== 'student') {
                navigate('/unauthorized');
            } else {
                fetchMySchedule();
            }
        }
    }, [authLoading, user, navigate]);

    const fetchMySchedule = async () => {
        setLoading(true);
        try {
            console.log('Fetching student schedule...');
            // Get student's enrollments to find their batches
            const enrollmentRes = await axios.get('/api/enrollments/');
            console.log('Enrollments:', enrollmentRes.data);
            
            // Get all schedules (backend will filter if needed)
            const scheduleRes = await axios.get('/api/schedules/');
            console.log('All schedules count:', scheduleRes.data.length);
            
            // Get batch IDs from enrollments
            const batchIds = new Set(enrollmentRes.data.map(e => e.batch));
            console.log('Student batch IDs:', Array.from(batchIds));
            
            // Filter schedules to only those in the student's batches
            const studentSchedules = scheduleRes.data.filter(s => batchIds.has(s.batch));
            console.log('Filtered schedules for student:', studentSchedules.length);
            
            setSchedules(studentSchedules || []);
            setError('');
        } catch (err) {
            console.error('Error fetching schedule:', err);
            console.error('Response:', err.response?.data);
            setError('Failed to fetch your schedule');
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const groupByDay = () => {
        const grouped = {};
        daysOfWeek.forEach(day => {
            const dayCode = Object.keys(dayMapping).find(key => dayMapping[key] === day);
            grouped[day] = schedules.filter(s => s.day_of_week === dayCode);
        });
        return grouped;
    };

    const scheduledByDay = groupByDay();

    const getTodaySchedule = () => {
        const today = daysOfWeek[new Date().getDay() - 1]; // Monday = 0
        return scheduledByDay[today] || [];
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Class Schedule</h1>
                    <p className="text-gray-900">View your weekly class timings</p>
                </div>

                {/* Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {/* Today's Classes */}
                {getTodaySchedule().length > 0 && (
                    <div className="mb-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-6 h-6" />
                            Today's Classes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {getTodaySchedule().map(schedule => (
                                <div key={schedule.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-900 mb-2">{schedule.course_title}</h3>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{schedule.start_time} - {schedule.end_time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{schedule.room || 'Room TBA'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{schedule.instructor_name || 'Instructor TBA'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">Total Classes/Week</div>
                            <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{schedules.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Active Days</div>
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {Object.values(scheduledByDay).filter(day => day.length > 0).length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-blue-300 text-sm font-semibold">Enrolled Courses</div>
                            <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {new Set(schedules.map(s => s.course_id)).size}
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule View */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading your schedule...</div>
                ) : (
                    <div className="space-y-6">
                        {daysOfWeek.map(day => (
                            <div key={day} className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                                            <div key={schedule.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="mb-3">
                                                    <h4 className="font-bold text-gray-900 mb-1">{schedule.course_title || 'Unknown Course'}</h4>
                                                    <p className="text-sm text-gray-700">{schedule.batch || 'No batch'}</p>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{schedule.start_time} - {schedule.end_time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{schedule.room || 'Room TBA'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <User className="w-4 h-4" />
                                                        <span>{schedule.instructor_name || 'Instructor TBA'}</span>
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

                {schedules.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white backdrop-blur-md border border-gray-200 rounded-lg">
                        <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-700 text-lg">No schedule available</p>
                        <p className="text-gray-700 text-sm mt-2">Enroll in courses to see your class schedule</p>
                    </div>
                )}

                {/* Info Note */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                        <strong>Note:</strong> Make sure to arrive 5-10 minutes before class starts. Check for any schedule changes or announcements regularly.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentSchedule;
