import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { waitlistAPI } from '../../api/waitlists';

const AdminWaitlists = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [waitlists, setWaitlists] = useState([]);
    const [filteredWaitlists, setFilteredWaitlists] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || !['admin', 'staff'].includes(user?.role)) {
                navigate('/unauthorized');
            } else {
                fetchWaitlists();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterWaitlists();
    }, [waitlists, searchTerm, statusFilter]);

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

    const filterWaitlists = () => {
        let filtered = waitlists;

        if (statusFilter) {
            filtered = filtered.filter(w => w.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(w =>
                w.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredWaitlists(filtered);
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'waiting':
                return <Clock className="w-4 h-4" />;
            case 'enrolled':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
            case 'expired':
                return <XCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Waitlist Management</h1>
                    <p className="text-gray-900">Manage student waitlists for full batches</p>
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

                {/* Search & Filter */}
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
                            <input
                                type="text"
                                placeholder="Search by student, course, or batch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">All Status</option>
                            <option value="waiting">Waiting</option>
                            <option value="enrolled">Enrolled</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                {/* Waitlists Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading waitlists...</div>
                ) : (
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-white">
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Position</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Student</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Course</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Batch</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Joined Date</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWaitlists.map((waitlist) => (
                                        <tr key={waitlist.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                                    <span className="text-lg font-bold text-blue-600">#{waitlist.position}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{waitlist.student_name}</div>
                                                    <div className="text-sm text-gray-700">{waitlist.student_username}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{waitlist.course_name}</div>
                                                    <div className="text-sm text-gray-700">{waitlist.course_code}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                Batch {waitlist.batch_number}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {formatDate(waitlist.joined_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(waitlist.status)}`}>
                                                    {getStatusIcon(waitlist.status)}
                                                    {waitlist.status_display}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {waitlist.status === 'waiting' && (
                                                    <button
                                                        onClick={() => handleCancelWaitlist(waitlist.id)}
                                                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition text-sm font-semibold"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredWaitlists.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-700">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p>No waitlist entries found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                        <div className="text-gray-700 text-sm font-semibold mb-2">Cancelled</div>
                        <div className="text-4xl font-bold text-gray-400">
                            {waitlists.filter(w => w.status === 'cancelled').length}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminWaitlists;
