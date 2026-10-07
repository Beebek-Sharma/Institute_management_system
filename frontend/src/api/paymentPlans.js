import axios from './axios';

export const paymentPlansAPI = {
    // List payment plans (filtered by role on backend)
    getPlans: () => axios.get('/api/payment-plans/'),

    // Retrieve single plan details with installments
    getPlan: (id) => axios.get(`/api/payment-plans/${id}/`),

    // Create installment plan for an enrollment
    createPlan: (data) => axios.post('/api/payment-plans/create_plan/', data),

    // Pay an installment
    payInstallment: (planId, data) => axios.post(`/api/payment-plans/${planId}/pay_installment/`, data),
};
