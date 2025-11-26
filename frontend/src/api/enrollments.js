import api from './axios';

export const enrollmentsAPI = {
    // Get user's enrollments
    getEnrollments: async () => {
        const response = await api.get('/api/enrollments/');
        return response.data;
    },

    // Get single enrollment
    getEnrollment: async (id) => {
        const response = await api.get(`/api/enrollments/${id}/`);
        return response.data;
    },

    // Enroll in a course
    enrollInCourse: async (courseId) => {
        const response = await api.post('/api/enrollments/', {
            course: courseId,
            status: 'pending'
        });
        return response.data;
    },

    // Update enrollment status
    updateEnrollment: async (id, data) => {
        const response = await api.patch(`/api/enrollments/${id}/`, data);
        return response.data;
    },

    // Delete enrollment
    deleteEnrollment: async (id) => {
        const response = await api.delete(`/api/enrollments/${id}/`);
        return response.data;
    },
};
