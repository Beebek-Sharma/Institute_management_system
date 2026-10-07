import axios from './axios';

export const scholarshipsAPI = {
    // List available scholarships
    getScholarships: () => axios.get('/api/scholarships/'),

    // Retrieve single scholarship
    getScholarship: (id) => axios.get(`/api/scholarships/${id}/`),

    // Create scholarship (Admin/Staff)
    createScholarship: (data) => axios.post('/api/scholarships/', data),

    // Update scholarship (Admin/Staff)
    updateScholarship: (id, data) => axios.put(`/api/scholarships/${id}/`, data),

    // Delete scholarship (Admin/Staff)
    deleteScholarship: (id) => axios.delete(`/api/scholarships/${id}/`),

    // List scholarship applications (student sees own, admin/staff sees all)
    getApplications: () => axios.get('/api/scholarship-applications/'),

    // Submit new scholarship application
    apply: (data) => axios.post('/api/scholarship-applications/', data),

    // Approve application (Admin/Staff)
    approveApplication: (id, reviewNotes) => axios.post(`/api/scholarship-applications/${id}/approve/`, { review_notes: reviewNotes }),

    // Reject application (Admin/Staff)
    rejectApplication: (id, reviewNotes) => axios.post(`/api/scholarship-applications/${id}/reject/`, { review_notes: reviewNotes }),
};
