import React, { useState, useEffect } from 'react';
import { Award, Plus, Calendar, CheckCircle, Clock, Users, FileSpreadsheet } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { examsAPI } from '../../api/progress';
import axios from '../../api/axios';

const InstructorExams = () => {
    const [exams, setExams] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [activeExam, setActiveExam] = useState(null);
    const [batchStudents, setBatchStudents] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [marksInput, setMarksInput] = useState({});
    const [submittingResults, setSubmittingResults] = useState(false);

    const [createData, setCreateData] = useState({
        title: '',
        exam_type: 'midterm',
        batch: '',
        exam_date: '',
        max_marks: '100',
        passing_marks: '40',
        weightage: '30'
    });

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        fetchExams();
    }, [selectedBatch]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/api/batches/');
            setBatches(res.data?.results || res.data || []);
        } catch (error) {
            console.error('Error loading batches:', error);
        }
    };

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await examsAPI.getExams(selectedBatch);
            setExams(res.data?.results || res.data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await examsAPI.createExam(createData);
            setShowCreateModal(false);
            setCreateData({
                title: '',
                exam_type: 'midterm',
                batch: '',
                exam_date: '',
                max_marks: '100',
                passing_marks: '40',
                weightage: '30'
            });
            fetchExams();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create exam');
        }
    };

    const openResults = async (exam) => {
        setActiveExam(exam);
        setShowResultsModal(true);
        try {
            const [resultsRes, enrRes] = await Promise.all([
                examsAPI.getResults(exam.id),
                axios.get('/api/enrollments/')
            ]);
            const existingResults = resultsRes.data || [];
            setExamResults(existingResults);

            // Filter enrollments for this exam's batch
            const relevantEnrs = (enrRes.data?.results || enrRes.data || []).filter(
                e => String(e.batch?.id || e.batch) === String(exam.batch?.id || exam.batch)
            );
            setBatchStudents(relevantEnrs);

            const initialMarks = {};
            existingResults.forEach(r => {
                initialMarks[r.student] = r.marks_obtained;
            });
            setMarksInput(initialMarks);
        } catch (error) {
            console.error('Error loading results:', error);
        }
    };

    const handleSaveResults = async () => {
        if (!activeExam) return;
        setSubmittingResults(true);

        const resultsToSave = Object.keys(marksInput).map(studentId => ({
            student_id: studentId,
            marks: marksInput[studentId] || 0
        }));

        try {
            await examsAPI.enterResults(activeExam.id, resultsToSave);
            alert('Exam grades recorded successfully!');
            setShowResultsModal(false);
            fetchExams();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to save exam results');
        } finally {
            setSubmittingResults(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Award className="w-6 h-6 text-teal-400" />
                            Exams & Academic Evaluations
                        </h1>
                        <p className="text-sm text-gray-400">
                            Schedule examination sessions, grade student performance, and compute letter grades.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 shadow-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule Exam
                    </button>
                </div>

                {/* Filter */}
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
                                {b.course_name || b.course?.name} - Batch {b.batch_number}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading exams...</div>
                ) : exams.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-slate-800/40 rounded-xl border border-slate-700 p-6">
                        No examination records found. Click "Schedule Exam" to configure midterms or finals.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map(exam => (
                            <div key={exam.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white text-base">{exam.title}</h3>
                                        <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-[10px] font-bold uppercase">
                                            {exam.exam_type || 'Exam'}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-900/60 rounded-lg text-xs space-y-1.5 text-gray-300 border border-slate-700/50">
                                        <div className="flex justify-between">
                                            <span>Batch:</span>
                                            <strong className="text-white">{exam.batch_name || `Batch #${exam.batch}`}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Marks:</span>
                                            <strong className="text-teal-300">{exam.max_marks} pts (Pass: {exam.passing_marks})</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Weightage:</span>
                                            <strong className="text-white">{exam.weightage}% of final grade</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Date:</span>
                                            <strong className="text-amber-300">
                                                {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBD'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openResults(exam)}
                                    className="w-full py-2 bg-slate-700 text-teal-300 border border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-650 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    Enter & View Grades
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Exam Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-teal-400" />
                                Schedule Academic Exam
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
                                        <option value="">-- Select Class Batch --</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.course_name || b.course?.name} - Batch {b.batch_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Exam Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Midterm Theory Assessment"
                                        value={createData.title}
                                        onChange={e => setCreateData({ ...createData, title: e.target.value })}
                                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Exam Type</label>
                                        <select
                                            value={createData.exam_type}
                                            onChange={e => setCreateData({ ...createData, exam_type: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        >
                                            <option value="midterm">Midterm Exam</option>
                                            <option value="final">Final Exam</option>
                                            <option value="quiz">Class Quiz</option>
                                            <option value="practical">Practical / Lab Exam</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Exam Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={createData.exam_date}
                                            onChange={e => setCreateData({ ...createData, exam_date: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Max Marks</label>
                                        <input
                                            type="number"
                                            value={createData.max_marks}
                                            onChange={e => setCreateData({ ...createData, max_marks: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Passing Marks</label>
                                        <input
                                            type="number"
                                            value={createData.passing_marks}
                                            onChange={e => setCreateData({ ...createData, passing_marks: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Weightage (%)</label>
                                        <input
                                            type="number"
                                            value={createData.weightage}
                                            onChange={e => setCreateData({ ...createData, weightage: e.target.value })}
                                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white"
                                        />
                                    </div>
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
                                        Schedule Exam
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Grade Entry Modal */}
                {showResultsModal && activeExam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-3xl w-full shadow-2xl space-y-4 text-xs">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                <div>
                                    <h2 className="text-base font-bold text-white">
                                        Record Exam Grades: {activeExam.title}
                                    </h2>
                                    <p className="text-gray-400 text-[11px]">
                                        Total Marks: {activeExam.max_marks} pts • Passing: {activeExam.passing_marks} pts
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowResultsModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                                {batchStudents.length === 0 ? (
                                    <p className="py-6 text-center text-gray-400">No enrolled students found in this batch.</p>
                                ) : (
                                    batchStudents.map(enr => {
                                        const studentId = enr.student?.id || enr.student;
                                        const studentName = enr.student_name || enr.student?.username || `Student #${studentId}`;
                                        const currentVal = marksInput[studentId] || '';

                                        return (
                                            <div key={enr.id} className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-white">{studentName}</p>
                                                    <p className="text-[11px] text-gray-400">Enrollment ID: #{enr.id}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">Score:</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        max={activeExam.max_marks}
                                                        value={currentVal}
                                                        onChange={e => setMarksInput({ ...marksInput, [studentId]: e.target.value })}
                                                        className="w-20 p-1.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-bold"
                                                    />
                                                    <span className="text-gray-500">/ {activeExam.max_marks}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowResultsModal(false)}
                                    className="px-3.5 py-1.5 bg-slate-700 text-gray-300 rounded font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={submittingResults || batchStudents.length === 0}
                                    onClick={handleSaveResults}
                                    className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded font-semibold shadow"
                                >
                                    {submittingResults ? 'Saving...' : 'Submit Grades & Calculate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default InstructorExams;
