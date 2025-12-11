import React, { useState } from 'react';
import HomePage from './HomePage';
import { ForgotPasswordCard } from '../components/ui/forgot-password-card';
import api from '../api/axios';

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (email) => {
    setError('');
    setSuccess('');

    const validationError = validateForm(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/password-reset/', { email });

      setSuccess(response.data.message);
      setSubmitted(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to process password reset request.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomePage />
      <ForgotPasswordCard
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
        success={success}
        submitted={submitted}
      />
    </>
  );
};

export default ForgotPassword;
