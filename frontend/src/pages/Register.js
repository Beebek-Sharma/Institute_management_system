import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const dataToSend = {
        ...registrationData,
        password_confirm: formData.password,
        role: 'student'
      };
      const result = await register(dataToSend);

      if (result.success) {
        navigate('/student/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/lunar-logo.png" alt="Lunar IT Solution" className="h-12 w-auto" />
            <span className="text-2xl font-bold text-[#0056D2]">Lunar IT Solution</span>
          </Link>
          <p className="text-gray-600 text-sm mt-2">Institute Management System</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 border border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Log in or create account</h2>
              <p className="text-gray-600 text-sm">
                Learn on your own time from top universities and businesses.
              </p>
            </div>
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-bold text-gray-700">
                  First Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-bold text-gray-700">
                  Last Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-gray-700">
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 px-4 border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold text-gray-700">
                Username <span className="text-red-600">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="h-11 px-4 border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-bold text-gray-700">
                Phone Number <span className="text-red-600">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-11 px-4 border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-gray-700">
                  Password <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">
                  Confirm Password <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-md"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-base rounded-md transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Continue'
              )}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Social Signup Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-md flex items-center justify-center gap-3"
                disabled
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-md flex items-center justify-center gap-3"
                disabled
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-md flex items-center justify-center gap-3"
                disabled
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor" />
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="text-center pt-4 mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0056D2] hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link to="/organization-signup" className="text-sm text-[#0056D2] hover:underline">
                Sign up with your organization
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              I accept Lunar IT Solution's{' '}
              <a href="#" className="text-[#0056D2] hover:underline">Terms of Use</a> and{' '}
              <a href="#" className="text-[#0056D2] hover:underline">Privacy Notice</a>. Having trouble logging in?{' '}
              <a href="#" className="text-[#0056D2] hover:underline">Learner help center</a>
            </p>
            <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
              This site is protected by reCAPTCHA Enterprise and the Google{' '}
              <a href="#" className="text-[#0056D2] hover:underline">Privacy Policy</a> and{' '}
              <a href="#" className="text-[#0056D2] hover:underline">Terms of Service</a> apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;