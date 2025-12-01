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

    // Get batches for a course
    getBatchesForCourse: async (courseId) => {
        const response = await api.get(`/api/batches/?course=${courseId}`);
        return response.data;
    },

    // Enroll in a course (creates enrollment in first available batch)
    enrollInCourse: async (courseId, studentId) => {
        // First, fetch batches for this course
        try {
            const batches = await this.getBatchesForCourse(courseId);
            
            // Find first available batch with space
            const availableBatch = Array.isArray(batches) 
                ? batches.find(b => b.available_seats > 0)
                : batches.results?.find(b => b.available_seats > 0);
            
            if (!availableBatch) {
                throw new Error('No available batches for this course');
            }

            // Enroll in the available batch
            const response = await api.post('/api/enrollments/', {
                batch: availableBatch.id,
                student: studentId,
                status: 'active'
            });
            return response.data;
        } catch (error) {
            console.error('Enrollment error:', error);
            throw error;
        }
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
