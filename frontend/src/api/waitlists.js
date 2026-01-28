import axios from './axios';

export const waitlistAPI = {
  // Get all waitlists (admin/staff/instructor) or user's waitlists (student)
  getWaitlists: () => axios.get('/api/waitlists/'),
  
  // Join waitlist for a batch
  joinWaitlist: (batchId) => axios.post('/api/waitlists/', { batch: batchId }),
  
  // Cancel waitlist entry
  cancelWaitlist: (id) => axios.post(`/api/waitlists/${id}/cancel/`),
  
  // Get user's position in waitlist for a specific batch
  getWaitlistPosition: (batchId) => axios.get(`/api/waitlists/my_position/?batch=${batchId}`),
  
  // Get specific waitlist entry
  getWaitlist: (id) => axios.get(`/api/waitlists/${id}/`),
  
  // Admin: Delete waitlist entry
  deleteWaitlist: (id) => axios.delete(`/api/waitlists/${id}/`),
};
