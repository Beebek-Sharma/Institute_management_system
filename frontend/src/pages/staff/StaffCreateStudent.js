import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const StaffCreateStudent = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'staff') {
                navigate('/unauthorized');
            }
        }
    }, [authLoading, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validation
            if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
                setError('Username, email, and password are required');
                setLoading(false);
                return;
            }

            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long');
                setLoading(false);
                return;
            }

            if (!formData.email.includes('@')) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }

            const response = await axios.post('/api/auth/create-student/', formData);
            
            setSuccess('Student created successfully!');
            setFormData({
                username: '',
                email: '',
                password: '',
                first_name: '',
                last_name: ''
            });

            setTimeout(() => {
                navigate('/staff/dashboard');
            }, 2000);

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to create student';
            setError(errorMessage);
            console.error('Error creating student:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/staff/dashboard')}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                        title="Go back"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold text-white">Create Student</h1>
                        <p className="text-gray-300">Add a new student to the system</p>
                    </div>
                </div>

                {/* Alert Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
                        ✓ {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                        ✗ {error}
                    </div>
                )}

                {/* Form */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Username <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="student123"
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="student@example.com"
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Password <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Jane"
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Smith"
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition"
                            >
                                {loading ? 'Creating...' : 'Create Student'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/staff/dashboard')}
                                disabled={loading}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-semibold rounded-lg transition border border-white/20"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-lg p-4 max-w-2xl">
                    <h3 className="text-green-300 font-semibold mb-2">ℹ️ Important Information</h3>
                    <ul className="text-green-200 text-sm space-y-1">
                        <li>• Username must be unique across the system</li>
                        <li>• Email must be a valid email address</li>
                        <li>• Password must be at least 8 characters long</li>
                        <li>• Share the credentials with the student securely</li>
                        <li>• Students can enroll in available courses after login</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StaffCreateStudent;
