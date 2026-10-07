import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { paymentPlansAPI } from '../../api/paymentPlans';

const StudentPaymentPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await paymentPlansAPI.getPlans();
            setPlans(res.data?.results || res.data || []);
        } catch (error) {
            console.error('Error loading student payment plans:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-teal-400" />
                        My Installment Payment Plans
                    </h1>
                    <p className="text-sm text-gray-400">
                        Track upcoming monthly dues, installment breakdowns, and payment completion for your enrolled courses.
                    </p>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading your payment schedules...</div>
                ) : plans.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700/60 p-6 space-y-2">
                        <CreditCard className="w-10 h-10 text-gray-500 mx-auto" />
                        <p className="text-white font-semibold">No Installment Plans Active</p>
                        <p className="text-xs text-gray-400 max-w-md mx-auto">
                            You currently do not have any multi-part installment plans. If you need financial flexibility, contact the administration or submit a scholarship request.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-xl space-y-5">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                                    <div>
                                        <h2 className="text-base font-bold text-white">
                                            {plan.course_name || plan.enrollment_details?.course_name || 'Enrolled Course'}
                                        </h2>
                                        <p className="text-xs text-gray-400">
                                            Plan #{plan.id} • Started on {plan.start_date || 'Recently'}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                                        plan.status === 'completed'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}>
                                        {plan.status === 'completed' ? 'Fully Paid ✓' : 'Active Plan'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-gray-400 uppercase font-semibold">Total Course Fee</p>
                                        <p className="text-lg font-bold text-white mt-1">NPR {plan.total_amount}</p>
                                    </div>
                                    <div className="bg-emerald-950/30 border border-emerald-800/50 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-emerald-400 uppercase font-semibold">Down Payment</p>
                                        <p className="text-lg font-bold text-emerald-300 mt-1">NPR {plan.down_payment}</p>
                                    </div>
                                    <div className="bg-amber-950/30 border border-amber-800/50 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-amber-400 uppercase font-semibold">Remaining Due</p>
                                        <p className="text-lg font-bold text-amber-300 mt-1">NPR {plan.remaining_amount}</p>
                                    </div>
                                    <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-gray-400 uppercase font-semibold">Installments</p>
                                        <p className="text-lg font-bold text-teal-300 mt-1">{plan.number_of_installments} Total</p>
                                    </div>
                                </div>

                                {/* Installments Timeline */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-teal-400" />
                                        Scheduled Installments
                                    </h3>

                                    <div className="space-y-2">
                                        {plan.installments && plan.installments.length > 0 ? (
                                            plan.installments.map((inst, idx) => (
                                                <div
                                                    key={inst.id || idx}
                                                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                                        inst.status === 'paid'
                                                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                                                            : 'bg-slate-900 border-slate-700 text-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {inst.status === 'paid' ? (
                                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                        ) : (
                                                            <Clock className="w-5 h-5 text-amber-400" />
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-white">
                                                                Installment #{inst.installment_number || idx + 1}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400">
                                                                {inst.due_date ? `Due Date: ${inst.due_date}` : 'Upcoming'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-bold text-sm text-white">NPR {inst.amount}</p>
                                                        <span className={`text-[10px] font-semibold uppercase ${
                                                            inst.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                                                        }`}>
                                                            {inst.status === 'paid' ? 'Paid ✓' : 'Pending Payment'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No breakdown generated.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentPaymentPlans;
