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

            // Filter for active batches only
            const activeBatches = batchList.filter(b => b.is_active);

            if (activeBatches.length === 0) {
                throw new Error('No active batches available for this course');
            }

            // Find first batch with available seats
            const availableBatch = activeBatches.find(b => {
                console.log(`[Enrollment] Checking batch ${b.id}: available_seats=${b.available_seats}, is_active=${b.is_active}`);
                return b.available_seats > 0;
            });

            if (!availableBatch) {
                // Check if all batches are full
                const allFull = activeBatches.every(b => b.available_seats <= 0);
                if (allFull) {
                    throw new Error('All batches for this course are currently full. Please check back later.');
                }
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

            // Extract meaningful error message from backend
            if (error.response?.data?.error) {
                // Backend returned a specific error message
                const backendError = new Error(error.response.data.error);
                backendError.response = error.response;
                throw backendError;
            }

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

    // Mark enrollment as complete
    markComplete: async (id) => {
        const response = await api.post(`/api/enrollments/${id}/mark_complete/`);
        return response.data;
    },
};
