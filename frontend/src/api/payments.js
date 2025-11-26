import api from './axios';

export const paymentsAPI = {
    // Get user's payments
    getPayments: async () => {
        const response = await api.get('/api/payments/');
        return response.data;
    },

    // Get single payment
    getPayment: async (id) => {
        const response = await api.get(`/api/payments/${id}/`);
        return response.data;
    },

    // Create payment
    createPayment: async (paymentData) => {
        const response = await api.post('/api/payments/', paymentData);
        return response.data;
    },

    // Update payment
    updatePayment: async (id, paymentData) => {
        const response = await api.patch(`/api/payments/${id}/`, paymentData);
        return response.data;
    },
};
