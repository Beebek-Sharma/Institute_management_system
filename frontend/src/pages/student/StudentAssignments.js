import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Upload, FileText, Send, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { assignmentsAPI } from '../../api/progress';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await assignmentsAPI.getAssignments();
            setAssignments(res.data?.results || res.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('submission_text', submissionText);
        if (submissionFile) {
            formData.append('submission_file', submissionFile);
        }

        try {
            await assignmentsAPI.submit(selectedAssignment.id, formData);
            setSuccessMessage(`Successfully submitted assignment: ${selectedAssignment.title}!`);
            setSelectedAssignment(null);
            setSubmissionText('');
            setSubmissionFile(null);
            fetchAssignments();
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit assignment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-teal-400" />
                        Course Assignments & Projects
                    </h1>
                    <p className="text-sm text-gray-400">
                        View active deadlines, submit your solutions, and review evaluations from your instructors.
                    </p>
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        {successMessage}
                    </div>
                )}

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading your assignments...</div>
                ) : assignments.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700 p-6 space-y-2">
                        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                        <p className="text-white font-semibold">You're All Caught Up!</p>
                        <p className="text-xs text-gray-400">No pending assignments or homework for your current courses.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {assignments.map(item => {
                            const isSubmitted = item.user_submission || item.is_submitted;
                            const isPastDue = item.due_date && new Date(item.due_date) < new Date();

                            return (
                                <div key={item.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-white text-base">{item.title}</h3>
                                            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-[10px] font-bold uppercase">
                                                {item.assignment_type || 'Task'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>

                                        <div className="p-3 bg-slate-900/60 rounded-lg text-xs space-y-1.5 text-gray-300 border border-slate-700/50">
                                            <div className="flex justify-between">
                                                <span>Course / Batch:</span>
                                                <strong className="text-white">{item.batch_name || 'Enrolled Course'}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Max Marks:</span>
                                                <strong className="text-teal-300">{item.max_marks} pts</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Deadline:</span>
                                                <strong className={isPastDue ? 'text-rose-400' : 'text-amber-300'}>
                                                    {item.due_date ? new Date(item.due_date).toLocaleString() : 'Open'}
                                                </strong>
                                            </div>
                                        </div>

                                        {isSubmitted && item.user_submission && (
                                            <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 space-y-1">
                                                <p className="font-semibold flex items-center gap-1.5">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Submitted: {item.user_submission.status === 'graded' ? `Score: ${item.user_submission.marks_obtained}/${item.max_marks}` : 'Under Review'}
                                                </p>
                                                {item.user_submission.feedback && (
                                                    <p className="text-[11px] text-gray-300 italic">Feedback: {item.user_submission.feedback}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {isSubmitted ? (
                                            <div className="w-full py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-xs text-center text-gray-400 font-semibold flex items-center justify-center gap-1.5">
                                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                Assignment Completed
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedAssignment(item)}
                                                className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 shadow flex items-center justify-center gap-1.5"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Submit Assignment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Submit Modal */}
                {selectedAssignment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <Send className="w-4 h-4 text-teal-400" />
                                Submit Solution: {selectedAssignment.title}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Text Submission / Notes / Code Link</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Type your answer, solution code, explanation, or GitHub link..."
                                        value={submissionText}
                                        onChange={e => setSubmissionText(e.target.value)}
                                        className="w-full p-2.5 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Attach File (PDF, ZIP, Document)</label>
                                    <input
                                        type="file"
                                        onChange={e => setSubmissionFile(e.target.files[0])}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-gray-300"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAssignment(null)}
                                        className="px-3.5 py-1.5 bg-slate-700 text-gray-300 rounded font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || (!submissionText && !submissionFile)}
                                        className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded font-semibold disabled:opacity-50 shadow"
                                    >
                                        {submitting ? 'Submitting...' : 'Turn In Assignment'}
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

export default StudentAssignments;
