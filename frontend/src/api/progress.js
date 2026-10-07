import axios from './axios';

export const assignmentsAPI = {
    // List assignments, optional batch filter
    getAssignments: (batchId) => axios.get(batchId ? `/api/assignments/?batch=${batchId}` : '/api/assignments/'),

    // Get single assignment
    getAssignment: (id) => axios.get(`/api/assignments/${id}/`),

    // Create assignment (Instructor/Admin)
    createAssignment: (data) => axios.post('/api/assignments/', data),

    // Update assignment
    updateAssignment: (id, data) => axios.put(`/api/assignments/${id}/`, data),

    // Delete assignment
    deleteAssignment: (id) => axios.delete(`/api/assignments/${id}/`),

    // Submit assignment (Student)
    submit: (id, formData) => axios.post(`/api/assignments/${id}/submit/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Grade submission (Instructor/Admin)
    grade: (id, data) => axios.post(`/api/assignments/${id}/grade/`, data),

    // View all submissions for an assignment
    getSubmissions: (id) => axios.get(`/api/assignments/${id}/submissions/`),
};

export const examsAPI = {
    // List exams, optional batch filter
    getExams: (batchId) => axios.get(batchId ? `/api/exams/?batch=${batchId}` : '/api/exams/'),

    // Get single exam
    getExam: (id) => axios.get(`/api/exams/${id}/`),

    // Create exam (Instructor/Admin)
    createExam: (data) => axios.post('/api/exams/', data),

    // Update exam
    updateExam: (id, data) => axios.put(`/api/exams/${id}/`, data),

    // Enter exam results for batch
    enterResults: (id, resultsData) => axios.post(`/api/exams/${id}/enter_results/`, { results: resultsData }),

    // Get all results for an exam
    getResults: (id) => axios.get(`/api/exams/${id}/results/`),
};

export const progressAPI = {
    // List progress records
    getAllProgress: () => axios.get('/api/progress/'),

    // Get logged-in student's progress
    getMyProgress: () => axios.get('/api/progress/my_progress/'),

    // Get at-risk students (Admin/Instructor)
    getAtRisk: () => axios.get('/api/progress/at_risk/'),

    // Get batch analytics (Instructor/Admin)
    getBatchAnalytics: (batchId) => axios.get(`/api/progress/batch_analytics/?batch_id=${batchId}`),

    // Recalculate batch progress
    recalculate: (batchId) => axios.post('/api/progress/recalculate/', { batch_id: batchId }),
};
