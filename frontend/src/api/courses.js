import api from './axios';

export const coursesAPI = {
    // Get all courses
    getCourses: async () => {
        const response = await api.get('/api/courses/');
        return response.data;
    },

    // Get single course
    getCourse: async (id) => {
        const response = await api.get(`/api/courses/${id}/`);
        return response.data;
    },

    // Create new course (admin/instructor only)
    createCourse: async (courseData) => {
        const response = await api.post('/api/courses/', courseData);
        return response.data;
    },

    // Update course
    updateCourse: async (id, courseData) => {
        const response = await api.put(`/api/courses/${id}/`, courseData);
        return response.data;
    },

    // Delete course
    deleteCourse: async (id) => {
        const response = await api.delete(`/api/courses/${id}/`);
        return response.data;
    },
};
