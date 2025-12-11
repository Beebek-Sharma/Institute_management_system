import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SignInCard } from '../components/ui/sign-in-card-2';
import HomePage from './HomePage';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (email, password) => {
    if (!email.trim()) {
      return 'Email or username is required';
    }
    if (!password) {
      return 'Password is required';
    } else if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleSignIn = async (email, password, rememberMe) => {
    setError('');

    const validationError = validateForm(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Note: rememberMe is not currently handled by the backend login function as per original code, 
      // but we accept it here for future use or if the auth context supports it.
      const result = await login(email, password);

      if (result.success) {
        switch (result.user.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'instructor':
            navigate('/instructor/dashboard');
            break;
          case 'admin':
          case 'staff':
            navigate('/admin/dashboard');
            break;
          default:
            break;
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomePage />
      <SignInCard
        onSignIn={handleSignIn}
        isLoading={loading}
        error={error}
      />
    </>
  );
};

export default Login;

