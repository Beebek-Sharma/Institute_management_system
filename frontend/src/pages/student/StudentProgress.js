import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle, AlertTriangle, BookOpen, Clock, FileText } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { progressAPI } from '../../api/progress';

const StudentProgress = () => {
    const [progressList, setProgressList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const res = await progressAPI.getMyProgress();
            setProgressList(res.data?.results || res.data || []);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-teal-400" />
                        Academic Progress & Grade Report
                    </h1>
                    <p className="text-sm text-gray-400">
                        View cumulative performance, assignment completion rates, examination averages, and letter grades.
                    </p>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Calculating academic performance records...</div>
                ) : progressList.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700 p-6 space-y-2">
                        <Award className="w-10 h-10 text-gray-500 mx-auto" />
                        <p className="text-white font-semibold">No Performance Records Yet</p>
                        <p className="text-xs text-gray-400">
                            Once your instructors grade assignments and post exam evaluations, your academic trajectory will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {progressList.map(item => (
                            <div key={item.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-xl space-y-5">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            {item.course_name || `Enrollment #${item.enrollment}`}
                                        </h2>
                                        <p className="text-xs text-teal-400">
                                            Batch: {item.batch_name || 'Standard Batch'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {item.is_at_risk && (
                                            <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Academic Warning
                                            </span>
                                        )}
                                        <div className="px-3 py-1 bg-teal-500/20 border border-teal-500/40 rounded-lg text-teal-300 text-center">
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Grade</p>
                                            <p className="text-xl font-extrabold text-white">{item.current_grade || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-gray-400 uppercase font-semibold">Overall Score</p>
                                        <p className="text-xl font-bold text-teal-300 mt-1">
                                            {item.overall_percentage ? `${Number(item.overall_percentage).toFixed(1)}%` : '0.0%'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-gray-400 uppercase font-semibold">GPA Equivalent</p>
                                        <p className="text-xl font-bold text-white mt-1">
                                            {item.gpa !== undefined && item.gpa !== null ? Number(item.gpa).toFixed(2) : '0.00'} / 4.0
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-gray-400 uppercase font-semibold">Assignments</p>
                                        <p className="text-xl font-bold text-white mt-1">
                                            {item.assignments_submitted || 0} / {item.assignments_total || 0}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-xl">
                                        <p className="text-[11px] text-gray-400 uppercase font-semibold">Attendance Rate</p>
                                        <p className="text-xl font-bold text-emerald-400 mt-1">
                                            {item.attendance_percentage ? `${Number(item.attendance_percentage).toFixed(1)}%` : '100%'}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Visual Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-300">
                                        <span>Course Syllabus & Performance Standing</span>
                                        <span className="font-semibold text-teal-300">
                                            {item.overall_percentage ? `${Number(item.overall_percentage).toFixed(1)}%` : '0%'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
                                        <div
                                            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, item.overall_percentage || 0))}%` }}
                                        />
                                    </div>
                                </div>

                                {item.at_risk_reasons && item.at_risk_reasons.length > 0 && (
                                    <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-300 space-y-1">
                                        <p className="font-semibold flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                                            Areas Requiring Focus:
                                        </p>
                                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200">
                                            {item.at_risk_reasons.map((r, i) => (
                                                <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentProgress;
