import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SignUpCard } from '../components/ui/sign-up-card';
import HomePage from './HomePage';

const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (formData) => {
    if (!formData.first_name.trim()) {
      return 'First name is required';
    }
    if (!formData.last_name.trim()) {
      return 'Last name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!formData.username.trim()) {
      return 'Username is required';
    } else if (formData.username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!formData.password) {
      return 'Password is required';
    } else if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSignUp = async (formData) => {
    setError('');

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        navigate('/student/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error
        || err.response?.data?.username?.[0]
        || err.response?.data?.email?.[0]
        || err.response?.data?.password?.[0]
        || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomePage />
      <SignUpCard
        onSignUp={handleSignUp}
        isLoading={loading}
        error={error}
      />
    </>
  );
};

export default Register;
