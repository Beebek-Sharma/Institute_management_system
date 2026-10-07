import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Clock, XCircle, Send, FileText, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { scholarshipsAPI } from '../../api/scholarships';
import axios from '../../api/axios';

const StudentScholarships = () => {
    const [scholarships, setScholarships] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScholarship, setSelectedScholarship] = useState(null);
    const [applyEnrollmentId, setApplyEnrollmentId] = useState('');
    const [statement, setStatement] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schRes, appRes, enrRes] = await Promise.all([
                scholarshipsAPI.getScholarships(),
                scholarshipsAPI.getApplications(),
                axios.get('/api/enrollments/')
            ]);
            setScholarships(schRes.data?.results || schRes.data || []);
            setMyApplications(appRes.data?.results || appRes.data || []);
            setEnrollments(enrRes.data?.results || enrRes.data || []);
        } catch (error) {
            console.error('Error loading scholarships:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!selectedScholarship) return;
        setSubmitting(true);
        try {
            await scholarshipsAPI.apply({
                scholarship: selectedScholarship.id,
                enrollment: applyEnrollmentId || null,
                statement: statement
            });
            setSuccessMessage('Your scholarship application was submitted successfully!');
            setSelectedScholarship(null);
            setStatement('');
            setApplyEnrollmentId('');
            fetchData();
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Award className="w-6 h-6 text-teal-400" />
                        Scholarships & Financial Aid
                    </h1>
                    <p className="text-sm text-gray-400">
                        Explore available institutional grants, tuition fee waivers, and submit financial aid requests.
                    </p>
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        {successMessage}
                    </div>
                )}

                {/* My Applications Section */}
                {myApplications.length > 0 && (
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg space-y-3">
                        <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            My Submitted Applications ({myApplications.length})
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {myApplications.map(app => (
                                <div key={app.id} className="p-3.5 bg-slate-900 border border-slate-700 rounded-lg text-xs space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-white">{app.scholarship_name || 'Scholarship Scheme'}</p>
                                            <p className="text-[11px] text-gray-400">{app.course_name ? `Course: ${app.course_name}` : 'General Institute Grant'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                            app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                                            app.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                                            'bg-amber-500/20 text-amber-300'
                                        }`}>
                                            {app.status || 'Pending Review'}
                                        </span>
                                    </div>
                                    {app.review_notes && (
                                        <p className="p-2 bg-slate-950 rounded text-gray-300 border border-slate-800 text-[11px]">
                                            <span className="text-gray-400 font-semibold">Feedback:</span> {app.review_notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Scholarships */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        Available Scholarship Schemes
                    </h2>

                    {loading ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Loading available scholarships...</div>
                    ) : scholarships.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700">
                            There are currently no active scholarships open for applications.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scholarships.map(s => {
                                const alreadyApplied = myApplications.some(a => a.scholarship === s.id);
                                return (
                                    <div key={s.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all">
                                        <div className="space-y-2.5">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-bold text-white text-base">{s.name}</h3>
                                                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-[10px] font-bold uppercase">
                                                    {s.discount_type === 'percentage' ? `${s.discount_value}% OFF` : `NPR ${s.discount_value}`}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-300 leading-relaxed">{s.description || 'Institutional grant supporting enrolled students.'}</p>

                                            <div className="p-3 bg-slate-900/60 rounded-lg text-xs space-y-1 text-gray-300 border border-slate-700/50">
                                                <p>Category: <strong className="text-white capitalize">{s.scholarship_type || 'Merit'}</strong></p>
                                                {s.deadline && <p>Application Deadline: <strong className="text-amber-300">{s.deadline}</strong></p>}
                                                <p>Available Slots: <strong className="text-white">{s.total_slots ? `${s.total_slots} Seats` : 'General'}</strong></p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedScholarship(s)}
                                            disabled={alreadyApplied}
                                            className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-all flex items-center justify-center gap-1.5"
                                        >
                                            {alreadyApplied ? (
                                                <>
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Application Submitted
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3.5 h-3.5" />
                                                    Apply for Aid
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Apply Modal */}
                {selectedScholarship && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-teal-400" />
                                Apply for {selectedScholarship.name}
                            </h2>

                            <form onSubmit={handleApply} className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Associated Course Enrollment (Optional)</label>
                                    <select
                                        value={applyEnrollmentId}
                                        onChange={e => setApplyEnrollmentId(e.target.value)}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    >
                                        <option value="">-- Apply to General Tuition / Select Course --</option>
                                        {enrollments.map(enr => (
                                            <option key={enr.id} value={enr.id}>
                                                {enr.batch_details?.course_name || enr.course?.name || `Enrollment #${enr.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Statement of Purpose / Justification *</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Explain why you qualify for this scholarship, your academic background, or your financial situation..."
                                        value={statement}
                                        onChange={e => setStatement(e.target.value)}
                                        className="w-full p-2.5 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedScholarship(null)}
                                        className="px-4 py-2 bg-slate-700 text-gray-300 rounded font-semibold hover:bg-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded font-semibold hover:from-teal-600 hover:to-emerald-700 shadow"
                                    >
                                        {submitting ? 'Submitting Application...' : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentScholarships;
