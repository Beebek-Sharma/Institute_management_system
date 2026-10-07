import React, { useState, useEffect } from 'react';
import { Award, Plus, CheckCircle, XCircle, Clock, DollarSign, Filter, Search } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { scholarshipsAPI } from '../../api/scholarships';

const AdminScholarships = () => {
    const [scholarships, setScholarships] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('scholarships'); // 'scholarships' | 'applications'
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // New scholarship form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        scholarship_type: 'merit',
        discount_type: 'percentage',
        discount_value: '',
        min_percentage_required: '75',
        total_slots: '10',
        deadline: '',
        is_active: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schRes, appRes] = await Promise.all([
                scholarshipsAPI.getScholarships(),
                scholarshipsAPI.getApplications()
            ]);
            setScholarships(schRes.data?.results || schRes.data || []);
            setApplications(appRes.data?.results || appRes.data || []);
        } catch (error) {
            console.error('Error fetching scholarships:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await scholarshipsAPI.createScholarship(formData);
            setShowCreateModal(false);
            setFormData({
                name: '',
                description: '',
                scholarship_type: 'merit',
                discount_type: 'percentage',
                discount_value: '',
                min_percentage_required: '75',
                total_slots: '10',
                deadline: '',
                is_active: true
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create scholarship');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReview = async (appId, decision) => {
        setActionLoading(true);
        try {
            if (decision === 'approve') {
                await scholarshipsAPI.approveApplication(appId, reviewNotes);
            } else {
                await scholarshipsAPI.rejectApplication(appId, reviewNotes);
            }
            setSelectedApplication(null);
            setReviewNotes('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || `Failed to ${decision} application`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Award className="w-6 h-6 text-teal-400" />
                            Scholarship & Financial Aid Management
                        </h1>
                        <p className="text-sm text-gray-400">
                            Configure institutional grants, merit discounts, and review student aid applications.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 shadow-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Scholarship
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 space-x-6 text-sm">
                    <button
                        onClick={() => setActiveTab('scholarships')}
                        className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
                            activeTab === 'scholarships'
                                ? 'text-teal-400 border-b-2 border-teal-400'
                                : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <Award className="w-4 h-4" />
                        Available Schemes ({scholarships.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
                            activeTab === 'applications'
                                ? 'text-teal-400 border-b-2 border-teal-400'
                                : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        Student Applications ({applications.length})
                    </button>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading scholarship information...</div>
                ) : activeTab === 'scholarships' ? (
                    /* Scholarships Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scholarships.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700/60">
                                No scholarships created yet. Click "Create Scholarship" to add your first grant.
                            </div>
                        ) : (
                            scholarships.map(s => (
                                <div key={s.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-white text-base">{s.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                                s.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-gray-400'
                                            }`}>
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-300 line-clamp-2">{s.description || 'Institutional educational scholarship scheme.'}</p>

                                        <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
                                            <div className="flex justify-between text-gray-300">
                                                <span>Benefit:</span>
                                                <span className="font-semibold text-teal-300">
                                                    {s.discount_type === 'percentage' ? `${s.discount_value}% Discount` : `NPR ${s.discount_value} Waiver`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-gray-300">
                                                <span>Category:</span>
                                                <span className="capitalize text-white">{s.scholarship_type || 'Merit'}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-300">
                                                <span>Capacity:</span>
                                                <span className="text-white">{s.awarded_count || 0} / {s.total_slots || 'Unlimited'} Awarded</span>
                                            </div>
                                            {s.deadline && (
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Deadline:</span>
                                                    <span className="text-amber-300">{s.deadline}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* Applications Table */
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                        {applications.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-sm">No student applications submitted yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-300">
                                    <thead className="bg-slate-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                                        <tr>
                                            <th className="p-3.5">Student</th>
                                            <th className="p-3.5">Scheme</th>
                                            <th className="p-3.5">Course / Batch</th>
                                            <th className="p-3.5">Status</th>
                                            <th className="p-3.5">Applied Date</th>
                                            <th className="p-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/60">
                                        {applications.map(app => (
                                            <tr key={app.id} className="hover:bg-slate-750 transition-colors">
                                                <td className="p-3.5 font-medium text-white">
                                                    {app.student_name || app.student?.username || `Student #${app.student}`}
                                                </td>
                                                <td className="p-3.5 text-teal-300">
                                                    {app.scholarship_name || app.scholarship?.name || 'Grant'}
                                                </td>
                                                <td className="p-3.5">
                                                    {app.course_name || 'Enrolled Course'}
                                                </td>
                                                <td className="p-3.5">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                                        app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                                                        app.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                                                        'bg-amber-500/20 text-amber-300'
                                                    }`}>
                                                        {app.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-gray-400">
                                                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}
                                                </td>
                                                <td className="p-3.5 text-right space-x-2">
                                                    {app.status === 'pending' ? (
                                                        <button
                                                            onClick={() => setSelectedApplication(app)}
                                                            className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded hover:bg-teal-500/30 font-semibold"
                                                        >
                                                            Review
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Reviewed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Scholarship Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-teal-400" />
                                Add Scholarship Grant
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-gray-300 mb-1">Scholarship Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Academic Merit Excellence 2026"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Category</label>
                                        <select
                                            value={formData.scholarship_type}
                                            onChange={e => setFormData({ ...formData, scholarship_type: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        >
                                            <option value="merit">Merit-Based</option>
                                            <option value="need_based">Need-Based / Financial Aid</option>
                                            <option value="special">Special / Diversity</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Discount Type</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed_amount">Fixed Amount (NPR)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Value ({formData.discount_type === 'percentage' ? '%' : 'NPR'})</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="e.g. 50"
                                            value={formData.discount_value}
                                            onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Available Slots</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.total_slots}
                                            onChange={e => setFormData({ ...formData, total_slots: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Application Deadline (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Description & Eligibility Criteria</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Explain eligibility requirements, GPA criteria, etc."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 bg-slate-700 text-gray-300 rounded font-semibold hover:bg-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded font-semibold hover:from-teal-600 hover:to-emerald-700 shadow"
                                    >
                                        {actionLoading ? 'Saving...' : 'Create Scholarship'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Review Application Modal */}
                {selectedApplication && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-teal-400" />
                                Review Application #{selectedApplication.id}
                            </h2>

                            <div className="p-3 bg-slate-900 rounded-lg space-y-1.5 border border-slate-700">
                                <p><span className="text-gray-400">Applicant:</span> <strong className="text-white">{selectedApplication.student_name || selectedApplication.student?.username}</strong></p>
                                <p><span className="text-gray-400">Scheme:</span> <strong className="text-teal-300">{selectedApplication.scholarship_name}</strong></p>
                                {selectedApplication.statement && (
                                    <div className="pt-2">
                                        <p className="text-gray-400 font-semibold mb-1">Student Statement:</p>
                                        <p className="italic text-gray-300 bg-slate-950 p-2 rounded border border-slate-800">{selectedApplication.statement}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-1">Review Notes / Feedback</label>
                                <textarea
                                    rows="2"
                                    placeholder="Add optional notes explaining approval or reason for rejection..."
                                    value={reviewNotes}
                                    onChange={e => setReviewNotes(e.target.value)}
                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedApplication(null)}
                                    className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleReview(selectedApplication.id, 'reject')}
                                    className="px-3 py-1.5 bg-rose-600/80 text-white rounded font-semibold hover:bg-rose-600"
                                >
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleReview(selectedApplication.id, 'approve')}
                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-500 shadow"
                                >
                                    Approve Aid
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminScholarships;
