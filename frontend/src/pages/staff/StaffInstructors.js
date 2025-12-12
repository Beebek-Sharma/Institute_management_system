import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Eye, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';

const StaffInstructors = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [instructors, setInstructors] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedInstructors, setSelectedInstructors] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user?.role !== 'staff') {
                navigate('/unauthorized');
            } else {
                fetchInstructors();
            }
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        filterInstructors();
    }, [instructors, searchTerm]);

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/users/');
            const instructorUsers = response.data.users?.filter(u => u.role === 'instructor') || [];
            setInstructors(instructorUsers);
        } catch (err) {
            setError('Failed to fetch instructors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterInstructors = () => {
        let filtered = instructors;

        if (searchTerm) {
            filtered = filtered.filter(instructor =>
                instructor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredInstructors(filtered);
    };

    const handleSelectInstructor = (instructorId) => {
        setSelectedInstructors(prev =>
            prev.includes(instructorId)
                ? prev.filter(id => id !== instructorId)
                : [...prev, instructorId]
        );
    };

    const handleSelectAll = () => {
        if (selectedInstructors.length === filteredInstructors.length) {
            setSelectedInstructors([]);
        } else {
            setSelectedInstructors(filteredInstructors.map(i => i.id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedInstructors.length === 0) {
            setError('No instructors selected');
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${selectedInstructors.length} instructor(s)?`)) {
            try {
                await Promise.all(
                    selectedInstructors.map(id => axios.delete(`/api/admin/users/${id}/delete/`))
                );
                setSuccess(`${selectedInstructors.length} instructor(s) deleted successfully!`);
                setSelectedInstructors([]);
                fetchInstructors();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete some instructors');
            }
        }
    };

    const viewInstructorDetails = async (instructor) => {
        setSelectedInstructor(instructor);
        setShowDetailsModal(true);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Instructor Management</h1>
                    <p className="text-gray-900">View and manage all instructors</p>
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

                {/* Search & Actions */}
                <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
                            <input
                                type="text"
                                placeholder="Search instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/staff/create-instructor')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Instructor
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedInstructors.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <span className="text-blue-300 font-semibold">{selectedInstructors.length} selected</span>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Instructors Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-700">Loading instructors...</div>
                ) : (
                    <>
                        {/* Desktop View - Table */}
                        <div className="hidden md:block bg-white backdrop-blur-md border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-white">
                                            <th className="px-6 py-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedInstructors.length === filteredInstructors.length && filteredInstructors.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-gray-700 font-semibold">Username</th>
                                            <th className="px-6 py-4 text-left text-gray-700 font-semibold">Name</th>
                                            <th className="px-6 py-4 text-left text-gray-700 font-semibold">Email</th>
                                            <th className="px-6 py-4 text-left text-gray-700 font-semibold">Phone</th>
                                            <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInstructors.map((instructor) => (
                                            <tr key={instructor.id} className="border-b border-gray-200 hover:bg-white transition">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedInstructors.includes(instructor.id)}
                                                        onChange={() => handleSelectInstructor(instructor.id)}
                                                        className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-white font-medium">{instructor.username}</td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {instructor.first_name} {instructor.last_name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{instructor.email}</td>
                                                <td className="px-6 py-4 text-gray-700">{instructor.phone || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => viewInstructorDetails(instructor)}
                                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredInstructors.length === 0 && !loading && (
                                <div className="text-center py-12 text-gray-700">
                                    No instructors found
                                </div>
                            )}
                        </div>

                        {/* Mobile View - Cards */}
                        <div className="md:hidden space-y-4">
                            {filteredInstructors.length === 0 ? (
                                <div className="text-center py-12 text-gray-700 bg-white backdrop-blur-md border border-gray-200 rounded-lg">
                                    No instructors found
                                </div>
                            ) : (
                                filteredInstructors.map((instructor) => (
                                    <div key={instructor.id} className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-semibold">{instructor.username}</p>
                                                <p className="text-sm text-gray-700">{instructor.first_name} {instructor.last_name}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedInstructors.includes(instructor.id)}
                                                onChange={() => handleSelectInstructor(instructor.id)}
                                                className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2 mb-4 border-t border-gray-200 pt-3">
                                            <p className="text-xs text-gray-700">
                                                <span className="text-gray-700">Email:</span> {instructor.email}
                                            </p>
                                            <p className="text-xs text-gray-700">
                                                <span className="text-gray-700">Phone:</span> {instructor.phone || 'N/A'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => viewInstructorDetails(instructor)}
                                            className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                        <div className="text-gray-700 text-sm font-semibold mb-2">Total Instructors</div>
                        <div className="text-4xl font-bold text-gray-900">{instructors.length}</div>
                    </div>
                    <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
                        <div className="text-gray-700 text-sm font-semibold mb-2">Selected</div>
                        <div className="text-4xl font-bold text-purple-400">{selectedInstructors.length}</div>
                    </div>
                </div>
            </div>

            {/* Instructor Details Modal */}
            {showDetailsModal && selectedInstructor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 p-4 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Instructor Details</h2>

                        <div className="space-y-4 sm:space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.username}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.first_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.last_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                                    <p className="text-gray-900 font-medium">{selectedInstructor.phone || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Bio */}
                            {selectedInstructor.bio && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Bio</label>
                                    <p className="text-gray-900">{selectedInstructor.bio}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedInstructor(null);
                                }}
                                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default StaffInstructors;
