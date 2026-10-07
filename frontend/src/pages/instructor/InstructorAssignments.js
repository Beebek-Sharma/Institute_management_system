import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, CheckCircle, Clock, FileText, Award, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { assignmentsAPI } from '../../api/progress';
import axios from '../../api/axios';

const InstructorAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const [gradingSubId, setGradingSubId] = useState(null);
    const [gradeMarks, setGradeMarks] = useState('');
    const [gradeFeedback, setGradeFeedback] = useState('');

    const [createData, setCreateData] = useState({
        title: '',
        description: '',
        assignment_type: 'homework',
        batch: '',
        due_date: '',
        max_marks: '100',
        passing_marks: '40',
        allow_late_submission: true,
        late_penalty_percent: '10'
    });

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [selectedBatch]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/api/batches/');
            setBatches(res.data?.results || res.data || []);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await assignmentsAPI.getAssignments(selectedBatch);
            setAssignments(res.data?.results || res.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await assignmentsAPI.createAssignment(createData);
            setShowCreateModal(false);
            setCreateData({
                title: '',
                description: '',
                assignment_type: 'homework',
                batch: '',
                due_date: '',
                max_marks: '100',
                passing_marks: '40',
                allow_late_submission: true,
                late_penalty_percent: '10'
            });
            fetchAssignments();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create assignment');
        }
    };

    const openSubmissions = async (assignment) => {
        setActiveAssignment(assignment);
        setShowSubmissionsModal(true);
        setSubLoading(true);
        try {
            const res = await assignmentsAPI.getSubmissions(assignment.id);
            setSubmissions(res.data || []);
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setSubLoading(false);
        }
    };

    const handleGrade = async (submissionId) => {
        if (!gradeMarks) {
            alert('Please enter marks');
            return;
        }
        try {
            await assignmentsAPI.grade(activeAssignment.id, {
                submission_id: submissionId,
                marks: gradeMarks,
                feedback: gradeFeedback
            });
            setGradingSubId(null);
            setGradeMarks('');
            setGradeFeedback('');
            // Refresh submissions
            const res = await assignmentsAPI.getSubmissions(activeAssignment.id);
            setSubmissions(res.data || []);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to grade submission');
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-teal-400" />
                            Assignments & Evaluations
                        </h1>
                        <p className="text-sm text-gray-400">
                            Create homework tasks, projects, lab reports and grade student submissions.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 shadow-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Assignment
                    </button>
                </div>

                {/* Batch Filter */}
                <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-xs font-semibold text-gray-300">Filter Batch:</span>
                    <select
                        value={selectedBatch}
                        onChange={e => setSelectedBatch(e.target.value)}
                        className="p-1.5 bg-slate-900 border border-slate-600 rounded text-xs text-white"
                    >
                        <option value="">All Batches</option>
                        {batches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.course_name || b.course?.name} (Batch {b.batch_number})
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading course assignments...</div>
                ) : assignments.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700 p-6">
                        No assignments created yet for this batch. Click "Create Assignment" to add homework or quizzes.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map(item => (
                            <div key={item.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white text-base">{item.title}</h3>
                                        <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-[10px] font-bold uppercase">
                                            {item.assignment_type || 'Task'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-300 line-clamp-2">{item.description}</p>

                                    <div className="p-3 bg-slate-900/60 rounded-lg text-xs space-y-1 text-gray-300 border border-slate-700/50">
                                        <p>Batch: <strong className="text-white">{item.batch_name || `Batch #${item.batch}`}</strong></p>
                                        <p>Max Marks: <strong className="text-teal-300">{item.max_marks} pts</strong> (Pass: {item.passing_marks})</p>
                                        <p>Due Date: <strong className="text-amber-300">{item.due_date ? new Date(item.due_date).toLocaleString() : 'Open'}</strong></p>
                                        <p>Submissions: <strong className="text-emerald-300">{item.submission_count || 0} Submitted</strong></p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openSubmissions(item)}
                                    className="w-full py-2 bg-slate-700 text-teal-300 border border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-650 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    View & Grade Submissions
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Assignment Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-teal-400" />
                                Add Course Assignment
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Target Batch *</label>
                                    <select
                                        required
                                        value={createData.batch}
                                        onChange={e => setCreateData({ ...createData, batch: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    >
                                        <option value="">-- Select Class Section / Batch --</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.course_name || b.course?.name} - Batch {b.batch_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Lab 3: Relational SQL Joins & Schema Design"
                                        value={createData.title}
                                        onChange={e => setCreateData({ ...createData, title: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Type</label>
                                        <select
                                            value={createData.assignment_type}
                                            onChange={e => setCreateData({ ...createData, assignment_type: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        >
                                            <option value="homework">Homework</option>
                                            <option value="project">Project</option>
                                            <option value="quiz">Quiz</option>
                                            <option value="lab">Lab Report</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Deadline Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={createData.due_date}
                                            onChange={e => setCreateData({ ...createData, due_date: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Max Score</label>
                                        <input
                                            type="number"
                                            value={createData.max_marks}
                                            onChange={e => setCreateData({ ...createData, max_marks: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Passing Score</label>
                                        <input
                                            type="number"
                                            value={createData.passing_marks}
                                            onChange={e => setCreateData({ ...createData, passing_marks: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Instructions / Description</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Enter instructions, submission format requirements, etc."
                                        value={createData.description}
                                        onChange={e => setCreateData({ ...createData, description: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
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
                                        className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded font-semibold shadow"
                                    >
                                        Create Assignment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Submissions & Grading Modal */}
                {showSubmissionsModal && activeAssignment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-3xl w-full shadow-2xl space-y-4 text-xs">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                <div>
                                    <h2 className="text-base font-bold text-white">
                                        Submissions: {activeAssignment.title}
                                    </h2>
                                    <p className="text-gray-400 text-[11px]">
                                        Max Score: {activeAssignment.max_marks} pts • Passing: {activeAssignment.passing_marks} pts
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowSubmissionsModal(false);
                                        setActiveAssignment(null);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {subLoading ? (
                                <div className="py-8 text-center text-gray-400">Loading submissions...</div>
                            ) : submissions.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">No students have submitted this assignment yet.</div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                                    {submissions.map(sub => (
                                        <div key={sub.id} className="p-3.5 bg-slate-900 border border-slate-700 rounded-xl space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-white">{sub.student_name || sub.student?.username || `Student #${sub.student}`}</p>
                                                    <p className="text-[11px] text-gray-400">
                                                        Submitted on {new Date(sub.submitted_at || sub.created_at).toLocaleString()}
                                                        {sub.is_late && <span className="ml-2 text-rose-400 font-semibold">(Late Submission)</span>}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                    sub.status === 'graded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                                }`}>
                                                    {sub.status === 'graded' ? `Score: ${sub.marks_obtained}/${activeAssignment.max_marks}` : 'Needs Grading'}
                                                </span>
                                            </div>

                                            {sub.submission_text && (
                                                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-gray-300 text-[11px]">
                                                    <p className="font-semibold text-gray-400 mb-0.5">Answer text:</p>
                                                    <p>{sub.submission_text}</p>
                                                </div>
                                            )}

                                            {sub.submission_file && (
                                                <a
                                                    href={sub.submission_file}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-teal-400 hover:underline text-[11px]"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> View Attached File
                                                </a>
                                            )}

                                            {sub.status === 'graded' ? (
                                                sub.feedback && (
                                                    <p className="text-[11px] text-emerald-400 italic">
                                                        Feedback: {sub.feedback}
                                                    </p>
                                                )
                                            ) : gradingSubId === sub.id ? (
                                                <div className="pt-2 border-t border-slate-800 space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder={`Marks (out of ${activeAssignment.max_marks})`}
                                                            value={gradeMarks}
                                                            onChange={e => setGradeMarks(e.target.value)}
                                                            className="p-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Feedback comments..."
                                                            value={gradeFeedback}
                                                            onChange={e => setGradeFeedback(e.target.value)}
                                                            className="p-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setGradingSubId(null)}
                                                            className="px-2.5 py-1 bg-slate-700 text-gray-300 rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleGrade(sub.id)}
                                                            className="px-3 py-1 bg-emerald-600 text-white rounded font-semibold"
                                                        >
                                                            Save Grade
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="pt-1 flex justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setGradingSubId(sub.id);
                                                            setGradeMarks('');
                                                            setGradeFeedback('');
                                                        }}
                                                        className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded hover:bg-teal-500/30 font-semibold"
                                                    >
                                                        Grade Submission
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default InstructorAssignments;
