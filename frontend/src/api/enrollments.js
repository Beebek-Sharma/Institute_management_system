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
            console.log(`[Enrollment] Fetching batches for course ${courseId}`);
            const batches = await enrollmentsAPI.getBatchesForCourse(courseId);
            
            console.log(`[Enrollment] Batches response:`, batches);
            
            // Find first available batch with space
            const batchList = Array.isArray(batches) 
                ? batches
                : (batches?.results || []);
            
            console.log(`[Enrollment] Batch list:`, batchList);
            
            const availableBatch = batchList.find(b => {
                console.log(`[Enrollment] Checking batch ${b.id}: available_seats=${b.available_seats}`);
                return b.available_seats > 0;
            });
            
            if (!availableBatch) {
                throw new Error('No available batches for this course');
            }

            console.log(`[Enrollment] Creating enrollment for batch ${availableBatch.id}, student ${studentId}`);
            
            // Enroll in the available batch
            const response = await api.post('/api/enrollments/', {
                batch: availableBatch.id,
                student: studentId,
                status: 'active'
            });
            
            console.log(`[Enrollment] Success:`, response.data);
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
