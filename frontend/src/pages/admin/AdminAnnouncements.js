import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell, Send, Trash2, Users, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const AdminAnnouncements = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_audience: 'all',
        priority: 'normal'
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'admin') {
                navigate('/unauthorized');
            } else {
                fetchAnnouncements();
            }
        }
    }, [authLoading, user, navigate]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/announcements/');
            setAnnouncements(response.data || []);
        } catch (err) {
            setError('Failed to fetch announcements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/announcements/', formData);
            setSuccess('Announcement created and sent successfully!');
            setFormData({
                title: '',
                message: '',
                target_audience: 'all',
                priority: 'normal'
            });
            setShowCreateModal(false);
            fetchAnnouncements();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create announcement');
        }
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await axios.delete(`/api/announcements/${announcementId}/`);
                setSuccess('Announcement deleted successfully!');
                fetchAnnouncements();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete announcement');
            }
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'bg-red-50 text-red-600 border-red-500/30',
            normal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            low: 'bg-gray-500/20 text-gray-700 border-gray-500/30'
        };
        return colors[priority] || colors.normal;
    };

    const getAudienceIcon = (audience) => {
        switch (audience) {
            case 'students':
                return <Users className="w-4 h-4" />;
            case 'instructors':
                return <BookOpen className="w-4 h-4" />;
            case 'all':
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Announcements</h1>
                    <p className="text-gray-900">Send institute-wide announcements and notifications</p>
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
                        New Announcement
                    </button>
                </div>

                {/* Announcements List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading announcements...</div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(announcement.priority)}`}>
                                                {announcement.priority || 'normal'}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 mb-3">{announcement.message}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-700">
                                            <div className="flex items-center gap-1">
                                                {getAudienceIcon(announcement.target_audience)}
                                                <span>
                                                    {announcement.target_audience === 'all' ? 'Everyone' :
                                                        announcement.target_audience === 'students' ? 'Students' : 'Instructors'}
                                                </span>
                                            </div>
                                            <div>
                                                {announcement.created_at ? new Date(announcement.created_at).toLocaleString() : 'Just now'}
                                            </div>
                                            <div>
                                                By: {announcement.created_by || 'Admin'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {announcements.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-700">
                                No announcements yet. Create your first announcement!
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                        <div className="text-gray-700 text-sm font-semibold mb-2">Total Announcements</div>
                        <div className="text-4xl font-bold text-gray-900">{announcements.length}</div>
                    </div>
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                        <div className="text-gray-700 text-sm font-semibold mb-2">High Priority</div>
                        <div className="text-4xl font-bold text-red-400">
                            {announcements.filter(a => a.priority === 'high').length}
                        </div>
                    </div>
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                        <div className="text-gray-700 text-sm font-semibold mb-2">This Month</div>
                        <div className="text-4xl font-bold text-blue-400">
                            {announcements.filter(a => {
                                const date = new Date(a.created_at);
                                const now = new Date();
                                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                            }).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Announcement Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-300 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Announcement</h2>

                        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Announcement title"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Message *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Announcement message..."
                                    rows="5"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Target Audience *</label>
                                    <select
                                        value={formData.target_audience}
                                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="all">Everyone</option>
                                        <option value="students">Students Only</option>
                                        <option value="instructors">Instructors Only</option>
                                        <option value="staff">Staff Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Priority *</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition"
                                >
                                    <Send className="w-5 h-5" />
                                    Send Announcement
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
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

export default AdminAnnouncements;
