import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HomePage from './HomePage';
import { ResetPasswordCard } from '../components/ui/reset-password-card';
import api from '../api/axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (formData) => {
    if (!formData.password) {
      return 'Password is required';
    } else if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!formData.password_confirm) {
      return 'Please confirm your password';
    }
    if (formData.password !== formData.password_confirm) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (formData) => {
    setError('');
    setSuccess('');

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/password-reset-confirm/', {
        token,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomePage />
      <ResetPasswordCard
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
        success={success}
        invalidToken={!token}
      />
    </>
  );
};

export default ResetPassword;
