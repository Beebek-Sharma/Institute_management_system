import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import HomePage from './HomePage';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const validationErrors = [];

    if (!email.trim()) {
      validationErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('Please enter a valid email address');
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/password-reset/', { email });
      
      setSuccess(response.data.message);
      setSubmitted(true);
      setEmail('');
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
      <AuthModal title="Forgot Password">
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
            <p className="text-gray-600 text-sm">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50/80 backdrop-blur border border-red-200/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50/80 backdrop-blur border border-green-200/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-semibold">Success!</p>
                <p className="text-sm text-green-600 mt-1">{success}</p>
              </div>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-white/60 text-sm transition backdrop-blur-sm text-gray-900 placeholder:text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 backdrop-blur border border-blue-200/30 rounded-lg">
                <p className="text-sm text-blue-700">
                  Please check your email inbox and follow the instructions to reset your password.
                </p>
              </div>
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/30"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white/50 text-gray-500 backdrop-blur-sm">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-700">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </AuthModal>
    </>
  );
};

export default ForgotPassword;
