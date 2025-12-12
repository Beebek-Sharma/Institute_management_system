import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePage from './HomePage';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import axios from '../api/axios';

export function UnifiedAuth() {
    const navigate = useNavigate();
    const { setAuthData } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/auth/unified-login/', {
                email: formData.email,
                username: formData.username,
                password: formData.password
            });

            const { action, tokens, user } = response.data;

            // Update auth context with user and tokens
            setAuthData(user, tokens);

            // Show success message
            if (action === 'registered') {
                setSuccess('Welcome! Your account has been created.');
            } else {
                setSuccess('Welcome back!');
            }

            // Redirect based on role
            setTimeout(() => {
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'instructor') {
                    navigate('/instructor/dashboard');
                } else if (user.role === 'staff') {
                    navigate('/staff/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            }, 1000);

        } catch (err) {
            console.error('Auth error:', err);
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <HomePage />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md relative z-10 pointer-events-auto"
                    style={{ perspective: 1500 }}
                >
                    <motion.div
                        className="relative bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
                        whileHover={{ rotateY: 2, rotateX: 2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {/* Border effect */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                            <div
                                className="absolute inset-[-2px] bg-gray-200"
                            />
                            <div className="absolute inset-[2px] bg-white backdrop-blur-xl rounded-3xl" />
                        </div>

                        {/* Content */}
                        <div className="relative p-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                            >
                                <User className="w-8 h-8 text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-center text-black mb-2">
                                Get Started
                            </h2>
                            <p className="text-center text-gray-600 mb-8">
                                Enter your credentials to continue
                            </p>

                            {/* Error/Success Messages */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800"
                                >
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{success}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email/Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email or Username
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
                                        <input
                                            type="text"
                                            value={formData.email || formData.username}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.includes('@')) {
                                                    setFormData({ ...formData, email: value, username: '' });
                                                } else {
                                                    setFormData({ ...formData, username: value, email: '' });
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            placeholder="Enter email or username"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Continue</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <p className="mt-6 text-center text-sm text-gray-600">
                                New users will be automatically registered
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}

export default UnifiedAuth;
