import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { paymentPlansAPI } from '../../api/paymentPlans';
import axios from '../../api/axios';

const AdminPaymentPlans = () => {
    const [plans, setPlans] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [createData, setCreateData] = useState({
        enrollment_id: '',
        down_payment: '',
        num_installments: '3'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansRes, enrRes] = await Promise.all([
                paymentPlansAPI.getPlans(),
                axios.get('/api/enrollments/')
            ]);
            setPlans(plansRes.data?.results || plansRes.data || []);
            setEnrollments(enrRes.data?.results || enrRes.data || []);
        } catch (error) {
            console.error('Error fetching payment plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await paymentPlansAPI.createPlan(createData);
            setShowCreateModal(false);
            setCreateData({ enrollment_id: '', down_payment: '', num_installments: '3' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create payment plan');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayInstallment = async (planId, installmentId) => {
        if (!window.confirm('Mark this installment as received and paid?')) return;
        try {
            await paymentPlansAPI.payInstallment(planId, { installment_id: installmentId });
            fetchData();
            if (selectedPlan && selectedPlan.id === planId) {
                const updated = await paymentPlansAPI.getPlan(planId);
                setSelectedPlan(updated.data);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to process installment payment');
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-teal-400" />
                            Installment Payment Plans
                        </h1>
                        <p className="text-sm text-gray-400">
                            Set up flexible multi-month installment schedules and track payments per student.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 shadow-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Payment Plan
                    </button>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading installment plans...</div>
                ) : plans.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700/60">
                        No active payment plans found. Click "Create Payment Plan" to set up installment billing.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white text-sm">
                                                {plan.student_name || plan.enrollment_details?.student_name || `Plan #${plan.id}`}
                                            </h3>
                                            <p className="text-xs text-teal-400">
                                                {plan.course_name || plan.enrollment_details?.course_name || 'Course Plan'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                            plan.status === 'completed'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        }`}>
                                            {plan.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-900/60 rounded-lg text-xs space-y-1.5 border border-slate-700/50">
                                        <div className="flex justify-between text-gray-300">
                                            <span>Total Fee:</span>
                                            <span className="font-semibold text-white">NPR {plan.total_amount}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Down Payment:</span>
                                            <span className="text-emerald-400 font-semibold">NPR {plan.down_payment}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Remaining Due:</span>
                                            <span className="text-amber-400 font-semibold">NPR {plan.remaining_amount}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Installments:</span>
                                            <span className="text-white">{plan.number_of_installments} Term(s)</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedPlan(plan)}
                                    className="w-full py-2 bg-slate-700 text-teal-300 border border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-650 transition-colors"
                                >
                                    View Installments Breakdown
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Plan Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-teal-400" />
                                Create Payment Plan
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Select Student Enrollment *</label>
                                    <select
                                        required
                                        value={createData.enrollment_id}
                                        onChange={e => setCreateData({ ...createData, enrollment_id: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    >
                                        <option value="">-- Choose Student & Course --</option>
                                        {enrollments.map(enr => (
                                            <option key={enr.id} value={enr.id}>
                                                {enr.student_name || enr.student?.username} - {enr.batch_details?.course_name || enr.course?.name} (Fee: NPR {enr.batch_details?.course_fee || 15000})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Down Payment (Min 30%) *</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 5000"
                                        value={createData.down_payment}
                                        onChange={e => setCreateData({ ...createData, down_payment: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Number of Monthly Installments</label>
                                    <select
                                        value={createData.num_installments}
                                        onChange={e => setCreateData({ ...createData, num_installments: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    >
                                        <option value="2">2 Installments</option>
                                        <option value="3">3 Installments</option>
                                        <option value="4">4 Installments</option>
                                        <option value="6">6 Installments</option>
                                        <option value="12">12 Installments</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-3.5 py-1.5 bg-slate-700 text-gray-300 rounded font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded font-semibold shadow"
                                    >
                                        {submitting ? 'Creating Plan...' : 'Generate Plan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Installments Breakdown Modal */}
                {selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-teal-400" />
                                    Installment Schedule (Plan #{selectedPlan.id})
                                </h2>
                                <button
                                    onClick={() => setSelectedPlan(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 space-y-1">
                                <p><span className="text-gray-400">Student:</span> <strong className="text-white">{selectedPlan.student_name || 'Enrolled Student'}</strong></p>
                                <p><span className="text-gray-400">Total:</span> NPR {selectedPlan.total_amount} (Remaining: <span className="text-amber-400 font-semibold">NPR {selectedPlan.remaining_amount}</span>)</p>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {selectedPlan.installments && selectedPlan.installments.length > 0 ? (
                                    selectedPlan.installments.map((inst, idx) => (
                                        <div key={inst.id || idx} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-white">Installment #{inst.installment_number || idx + 1}</p>
                                                <p className="text-[11px] text-gray-400">
                                                    Due: {inst.due_date || 'Upcoming'} • NPR {inst.amount}
                                                </p>
                                            </div>
                                            <div>
                                                {inst.status === 'paid' ? (
                                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold text-[10px]">
                                                        Paid ✓
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePayInstallment(selectedPlan.id, inst.id)}
                                                        className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded hover:bg-teal-500/30 text-[11px] font-semibold"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-4">No individual installments registered yet.</p>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setSelectedPlan(null)}
                                    className="px-4 py-1.5 bg-slate-700 text-gray-300 rounded font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminPaymentPlans;
