import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, CheckCircle, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const StaffPayments = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    amount: '',
    payment_method: 'cash',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user?.role !== 'staff') {
        navigate('/unauthorized');
      } else {
        fetchPayments();
        fetchStudents();
        fetchCourses();
      }
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    filterPayments();
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

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/admin/users/');
      const studentList = response.data.users?.filter(u => u.role === 'student') || [];
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses/');
      setCourses(response.data || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
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

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/payments/', {
        ...formData,
        status: 'verified' // Staff-entered payments are auto-verified
      });
      setSuccess('Payment recorded successfully!');
      setFormData({
        student_id: '',
        course_id: '',
        amount: '',
        payment_method: 'cash',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowCreateModal(false);
      fetchPayments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record payment');
    }
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
      failed: 'bg-red-50 text-red-600 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-700 border-gray-500/30';
  };

  const getMethodBadge = (method) => {
    const badges = {
      cash: 'bg-green-600 text-white',
      bank_transfer: 'bg-indigo-600 text-white',
      esewa: 'bg-green-600 text-white',
      khalti: 'bg-purple-600 text-white',
      phonepay: 'bg-blue-600 text-white'
    };
    return badges[method] || 'bg-gray-500 text-white';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-900">Handle offline payments and verify transactions</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-300 text-sm font-semibold">Total Payments</div>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{payments.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-300 text-sm font-semibold">Verified</div>
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {payments.filter(p => p.status === 'verified').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md border border-yellow-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-300 text-sm font-semibold">Pending</div>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {payments.filter(p => p.status === 'pending').length}
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
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="esewa">Esewa</option>
              <option value="khalti">Khalti</option>
              <option value="phonepay">PhonePay</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Payment
            </button>
            <button
              onClick={exportPayments}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
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
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handleVerifyPayment(payment.id)}
                            className="p-2 bg-green-50 hover:bg-green-500/40 text-green-300 rounded-lg transition"
                            title="Verify Payment"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
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

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-300 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Offline Payment</h2>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Student *</label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Course *</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Amount (NPR) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Method *</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-400/30 text-gray-800 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffPayments;
