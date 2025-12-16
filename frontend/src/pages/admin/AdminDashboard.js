import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'student'
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user?.role !== 'admin') {
        navigate('/unauthorized');
      } else {
        fetchUsers();
      }
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users/');
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('Username, email, and password are required');
      return;
    }

    try {
      let endpoint = '/api/admin/create-staff/';
      if (formData.role === 'instructor') {
        endpoint = '/api/admin/create-instructor/';
      } else if (formData.role === 'student') {
        endpoint = '/api/admin/create-student/';
      } else if (formData.role === 'admin') {
        endpoint = '/api/auth/create-admin/';
      }

      const response = await axios.post(endpoint, formData);
      setSuccess(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} created successfully!`);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'student'
      });
      setShowCreateModal(false);
      fetchUsers();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}/delete/`);
        setSuccess('User deleted successfully!');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };



  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      instructor: 'bg-purple-100 text-purple-800',
      student: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        {/* Loading */}
        {authLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-700">Loading dashboard...</p>
            </div>
          </div>
        )}

        {!authLoading && (
          <>
            {/* Header */}
            <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-900">Manage users, courses, and institute settings</p>
            </div>

            {/* Alerts */}
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

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-semibold transition-all ${activeTab === 'users'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-700 hover:text-gray-900'
                  }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 font-semibold transition-all ${activeTab === 'stats'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-700 hover:text-gray-900'
                  }`}
              >
                Statistics
              </button>
            </div>

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search & Filter */}
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="instructor">Instructor</option>
                      <option value="student">Student</option>
                    </select>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
                    >
                      <Plus className="w-5 h-5" />
                      Create User
                    </button>
                  </div>

                  {/* Users Table */}
                  {loading ? (
                    <div className="text-center py-8 text-gray-700">Loading users...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Username</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Email</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Name</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Role</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="border-b border-gray-200 hover:bg-white transition">
                              <td className="px-4 py-3 text-gray-900 font-medium">{u.username}</td>
                              <td className="px-4 py-3 text-gray-700">{u.email}</td>
                              <td className="px-4 py-3 text-gray-700">{u.first_name} {u.last_name}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(u.role)}`}>
                                  {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 flex gap-2">

                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-700">No users found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                  <div className="text-gray-700 text-sm font-semibold mb-2">Total Users</div>
                  <div className="text-4xl font-bold text-gray-900">{users.length}</div>
                </div>
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                  <div className="text-gray-700 text-sm font-semibold mb-2">Admins</div>
                  <div className="text-4xl font-bold text-red-400">{users.filter(u => u.role === 'admin').length}</div>
                </div>
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                  <div className="text-gray-700 text-sm font-semibold mb-2">Instructors</div>
                  <div className="text-4xl font-bold text-purple-400">{users.filter(u => u.role === 'instructor').length}</div>
                </div>
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                  <div className="text-gray-700 text-sm font-semibold mb-2">Students</div>
                  <div className="text-4xl font-bold text-green-400">{users.filter(u => u.role === 'student').length}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-300 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="First name"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Last name"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {formData.role === 'instructor' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition"
                >
                  Create User
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

export default AdminDashboard;