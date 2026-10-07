import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Users, Award, BarChart3, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { progressAPI } from '../../api/progress';
import axios from '../../api/axios';

const AdminAnalytics = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [atRiskList, setAtRiskList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);

    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            loadBatchAnalytics(selectedBatch);
        }
    }, [selectedBatch]);

    const initData = async () => {
        setLoading(true);
        try {
            const [bRes, rRes] = await Promise.all([
                axios.get('/api/batches/'),
                progressAPI.getAtRisk()
            ]);
            const batchList = bRes.data?.results || bRes.data || [];
            setBatches(batchList);
            setAtRiskList(rRes.data?.results || rRes.data || []);
            if (batchList.length > 0) {
                setSelectedBatch(batchList[0].id);
            }
        } catch (error) {
            console.error('Error initializing analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBatchAnalytics = async (batchId) => {
        try {
            const res = await progressAPI.getBatchAnalytics(batchId);
            setAnalytics(res.data);
        } catch (error) {
            console.error('Error loading batch analytics:', error);
        }
    };

    const handleRecalculate = async () => {
        if (!selectedBatch) return;
        setRecalculating(true);
        try {
            await progressAPI.recalculate(selectedBatch);
            await loadBatchAnalytics(selectedBatch);
            const rRes = await progressAPI.getAtRisk();
            setAtRiskList(rRes.data?.results || rRes.data || []);
            alert('Batch progress and grade standing recalculated successfully!');
        } catch (error) {
            alert('Recalculation error');
        } finally {
            setRecalculating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-teal-400" />
                            Academic Analytics & Performance Monitoring
                        </h1>
                        <p className="text-sm text-gray-400">
                            Class-wide grade distributions, top academic performers, and automated early warning detection.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedBatch}
                            onChange={e => setSelectedBatch(e.target.value)}
                            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none"
                        >
                            {batches.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.course_name || b.course?.name} - Batch {b.batch_number}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleRecalculate}
                            disabled={recalculating || !selectedBatch}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors shadow"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                            Recalculate
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Computing analytics metrics...</div>
                ) : (
                    <>
                        {/* Summary KPI Cards */}
                        {analytics && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Total Students</p>
                                    <p className="text-2xl font-bold text-white mt-1">{analytics.total_students || 0}</p>
                                </div>
                                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Average Class Score</p>
                                    <p className="text-2xl font-bold text-teal-300 mt-1">
                                        {analytics.average_grade ? `${Number(analytics.average_grade).toFixed(1)}%` : '0.0%'}
                                    </p>
                                </div>
                                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                                    <p className="text-xs text-rose-400 font-semibold uppercase">At-Risk Count</p>
                                    <p className="text-2xl font-bold text-rose-300 mt-1">{analytics.at_risk_count || 0}</p>
                                </div>
                                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                                    <p className="text-xs text-emerald-400 font-semibold uppercase">Passing Standing</p>
                                    <p className="text-2xl font-bold text-emerald-300 mt-1">
                                        {analytics.total_students
                                            ? `${Math.round(((analytics.total_students - (analytics.at_risk_count || 0)) / analytics.total_students) * 100)}%`
                                            : '100%'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Grade Distribution Bar Chart */}
                        {analytics?.grade_distribution && (
                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg space-y-3">
                                <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Letter Grade Distribution
                                </h2>

                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
                                    {Object.entries(analytics.grade_distribution).map(([grade, count]) => (
                                        <div key={grade} className="bg-slate-900 border border-slate-700/60 p-3 rounded-lg text-center space-y-1">
                                            <p className="text-xs font-bold text-white">{grade}</p>
                                            <p className="text-lg font-extrabold text-teal-300">{count}</p>
                                            <p className="text-[10px] text-gray-500">Students</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Performers and At-Risk Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top Performers */}
                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg space-y-3">
                                <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                    <Award className="w-4 h-4 text-emerald-400" />
                                    Top Academic Performers
                                </h2>

                                {analytics?.top_performers?.length > 0 ? (
                                    <div className="space-y-2">
                                        {analytics.top_performers.map((student, idx) => (
                                            <div key={idx} className="p-3 bg-slate-900 border border-slate-700/70 rounded-lg flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-white">{student.student_name || `Student #${student.enrollment}`}</p>
                                                        <p className="text-[11px] text-gray-400">GPA: {Number(student.gpa || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-emerald-400 text-sm">
                                                        {Number(student.overall_percentage || 0).toFixed(1)}%
                                                    </span>
                                                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-white">
                                                        {student.current_grade}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 py-4 text-center">No graded records available yet.</p>
                                )}
                            </div>

                            {/* Class-wide At-Risk Alert List */}
                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg space-y-3">
                                <h2 className="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                                    Early Warning: At-Risk Students ({atRiskList.length})
                                </h2>

                                {atRiskList.length > 0 ? (
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {atRiskList.map((item, idx) => (
                                            <div key={idx} className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-xs space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold text-white">{item.student_name || `Student #${item.enrollment}`}</p>
                                                    <span className="text-rose-400 font-bold">
                                                        {Number(item.overall_percentage || 0).toFixed(1)}% ({item.current_grade})
                                                    </span>
                                                </div>
                                                {item.at_risk_reasons && item.at_risk_reasons.length > 0 && (
                                                    <p className="text-[11px] text-rose-300">
                                                        Notice: {item.at_risk_reasons.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-emerald-400 py-6 text-center">
                                        ✓ No students currently flagged as academically at-risk.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminAnalytics;
