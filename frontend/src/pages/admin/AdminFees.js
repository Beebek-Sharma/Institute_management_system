import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign, TrendingUp, Download, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const AdminFees = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [methodFilter, setMethodFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState({
        total_revenue: 0,
        pending_amount: 0,
        verified_amount: 0,
        refunded_amount: 0
    });

    const paymentMethods = ['esewa', 'khalti', 'phonepay', 'cash', 'bank_transfer'];

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'admin') {
                navigate('/unauthorized');
            } else {
                fetchPayments();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterPayments();
        calculateStats();
    }, [payments, searchTerm, statusFilter, methodFilter]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/payments/');
            setPayments(response.data || []);
        } catch (err) {
            setError('Failed to fetch payments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = payments;

        if (statusFilter) {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (methodFilter) {
            filtered = filtered.filter(p => p.payment_method === methodFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPayments(filtered);
    };

    const calculateStats = () => {
        const total = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const pending = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const verified = payments
            .filter(p => p.status === 'verified')
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const refunded = payments
            .filter(p => p.status === 'refunded')
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        setStats({
            total_revenue: total,
            pending_amount: pending,
            verified_amount: verified,
            refunded_amount: refunded
        });
    };

    const handleVerifyPayment = async (paymentId) => {
        try {
            await axios.post(`/api/payments/${paymentId}/verify/`);
            setSuccess('Payment verified successfully!');
            fetchPayments();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to verify payment');
        }
    };

    const handleRefund = async (paymentId) => {
        if (window.confirm('Are you sure you want to refund this payment?')) {
            try {
                await axios.post(`/api/payments/${paymentId}/refund/`);
                setSuccess('Payment refunded successfully!');
                fetchPayments();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to refund payment');
            }
        }
    };

    const exportPayments = () => {
        const csvContent = [
            ['Date', 'Student', 'Course', 'Amount (NPR)', 'Method', 'Status', 'Transaction ID'],
            ...filteredPayments.map(p => [
                p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A',
                p.student_name || 'Unknown',
                p.course_title || 'Unknown',
                p.amount || 0,
                p.payment_method || 'N/A',
                p.status || 'pending',
                p.transaction_id || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Payments exported successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const getStatusColor = (status) => {
        const colors = {
            verified: 'bg-green-50 text-green-300 border-green-500/30',
            pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            failed: 'bg-red-50 text-red-600 border-red-500/30',
            refunded: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    };

    const getMethodBadge = (method) => {
        const badges = {
            esewa: 'bg-green-600 text-white',
            khalti: 'bg-purple-600 text-white',
            phonepay: 'bg-blue-600 text-white',
            cash: 'bg-gray-600 text-white',
            bank_transfer: 'bg-indigo-600 text-white'
        };
        return badges[method] || 'bg-gray-500 text-white';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment & Fee Management</h1>
                    <p className="text-gray-900">Track payments, revenue, and manage refunds</p>
                </div>

                {/* Alert */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-green-300 text-sm font-semibold">Total Revenue</div>
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">NPR {stats.total_revenue.toLocaleString()}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-blue-300 text-sm font-semibold">Verified</div>
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">NPR {stats.verified_amount.toLocaleString()}</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md border border-yellow-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-yellow-300 text-sm font-semibold">Pending</div>
                            <RefreshCw className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">NPR {stats.pending_amount.toLocaleString()}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-purple-300 text-sm font-semibold">Refunded</div>
                            <XCircle className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">NPR {stats.refunded_amount.toLocaleString()}</div>
                    </div>
                </div>

                {/* Payment Gateway Status */}
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Gateway Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div>
                                <div className="font-semibold text-gray-900">Esewa</div>
                                <div className="text-xs text-gray-700">Nepal's Payment Gateway</div>
                            </div>
                            <div className="px-3 py-1 bg-green-600 text-gray-900 text-xs rounded-full">Active</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <div>
                                <div className="font-semibold text-gray-900">Khalti</div>
                                <div className="text-xs text-gray-700">Digital Wallet</div>
                            </div>
                            <div className="px-3 py-1 bg-purple-600 text-gray-900 text-xs rounded-full">Active</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div>
                                <div className="font-semibold text-gray-900">PhonePay</div>
                                <div className="text-xs text-gray-700">Mobile Payment</div>
                            </div>
                            <div className="px-3 py-1 bg-blue-600 text-gray-900 text-xs rounded-full">Active</div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
                            <input
                                type="text"
                                placeholder="Search payments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <select
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">All Methods</option>
                            <option value="esewa">Esewa</option>
                            <option value="khalti">Khalti</option>
                            <option value="phonepay">PhonePay</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                        <button
                            onClick={exportPayments}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition"
                        >
                            <Download className="w-5 h-5" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Payments Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading payments...</div>
                ) : (
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-white">
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Date</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Student</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Course</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Amount</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Method</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-gray-200 hover:bg-white transition">
                                            <td className="px-6 py-4 text-gray-700">
                                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                {payment.student_name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {payment.course_title || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-white font-semibold">
                                                NPR {parseFloat(payment.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMethodBadge(payment.payment_method)}`}>
                                                    {payment.payment_method || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(payment.status)}`}>
                                                    {payment.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {payment.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleVerifyPayment(payment.id)}
                                                            className="p-2 bg-green-50 hover:bg-green-500/40 text-green-300 rounded-lg transition"
                                                            title="Verify Payment"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {payment.status === 'verified' && (
                                                        <button
                                                            onClick={() => handleRefund(payment.id)}
                                                            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg transition text-xs"
                                                        >
                                                            Refund
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredPayments.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-700">
                                No payments found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminFees;
