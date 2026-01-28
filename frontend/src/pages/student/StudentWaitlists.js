import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, XCircle, Users, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { waitlistAPI } from '../../api/waitlists';

const StudentWaitlists = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [waitlists, setWaitlists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'student') {
                navigate('/unauthorized');
            } else {
                fetchWaitlists();
            }
        }
    }, [authLoading, user, navigate]);

    const fetchWaitlists = async () => {
        setLoading(true);
        try {
            const response = await waitlistAPI.getWaitlists();
            setWaitlists(response.data || []);
        } catch (err) {
            setError('Failed to fetch waitlists');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelWaitlist = async (waitlistId) => {
        if (!window.confirm('Are you sure you want to cancel this waitlist entry?')) {
            return;
        }

        try {
            await waitlistAPI.cancelWaitlist(waitlistId);
            setSuccess('Waitlist entry cancelled successfully!');
            fetchWaitlists();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel waitlist entry');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            waiting: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            enrolled: 'bg-green-50 text-green-300 border-green-500/30',
            cancelled: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
            expired: 'bg-red-50 text-red-600 border-red-500/30'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Waitlists</h1>
                    <p className="text-gray-900">Track your waitlist positions for full courses</p>
                </div>

                {/* Alerts */}
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

                {/* Waitlists */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading waitlists...</div>
                ) : waitlists.length === 0 ? (
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-12 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Waitlist Entries</h3>
                        <p className="text-gray-700">You're not currently on any waitlists</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {waitlists.map((waitlist) => (
                            <div
                                key={waitlist.id}
                                className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                            >
                                {/* Course Info */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {waitlist.course_name}
                                    </h3>
                                    <p className="text-sm text-gray-700">
                                        {waitlist.course_code} - Batch {waitlist.batch_number}
                                    </p>
                                </div>

                                {/* Position Badge */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
                                        <div>
                                            <p className="text-sm text-gray-700 mb-1">Your Position</p>
                                            <p className="text-3xl font-bold text-blue-600">#{waitlist.position}</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-4">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(waitlist.status)}`}>
                                        <Clock className="w-4 h-4" />
                                        {waitlist.status_display}
                                    </span>
                                </div>

                                {/* Joined Date */}
                                <div className="mb-4 text-sm text-gray-700">
                                    <p>Joined: {formatDate(waitlist.joined_date)}</p>
                                </div>

                                {/* Actions */}
                                {waitlist.status === 'waiting' && (
                                    <button
                                        onClick={() => handleCancelWaitlist(waitlist.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition font-semibold"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel Waitlist
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {waitlists.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                            <div className="text-gray-700 text-sm font-semibold mb-2">Total Waitlists</div>
                            <div className="text-4xl font-bold text-gray-900">{waitlists.length}</div>
                        </div>
                        <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                            <div className="text-gray-700 text-sm font-semibold mb-2">Waiting</div>
                            <div className="text-4xl font-bold text-yellow-400">
                                {waitlists.filter(w => w.status === 'waiting').length}
                            </div>
                        </div>
                        <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                            <div className="text-gray-700 text-sm font-semibold mb-2">Enrolled</div>
                            <div className="text-4xl font-bold text-green-400">
                                {waitlists.filter(w => w.status === 'enrolled').length}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentWaitlists;
