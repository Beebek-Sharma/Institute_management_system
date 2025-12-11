import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, BookOpen, Users, Calendar, User, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import CourseCard from '../../components/CourseCard';
import axios from '../../api/axios';

const AdminCourses = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        category: '',
        duration_weeks: '',
        max_capacity: '',
        fee: '',
        instructor: '',
        image: null
    });

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== 'admin' && user.role !== 'staff') {
                navigate('/');
            } else {
                fetchCourses();
                fetchInstructors();
                fetchCategories();
            }
        }
    }, [user, authLoading, navigate]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/courses/');
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (err) {
            console.error('Fetch courses error:', err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            const response = await axios.get('/api/users/?role=instructor');
            setInstructors(response.data);
        } catch (err) {
            console.error('Fetch instructors error:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/course-categories/');
            setCategories(response.data);
        } catch (err) {
            console.error('Fetch categories error:', err);
        }
    };

    useEffect(() => {
        let filtered = courses;

        if (searchTerm) {
            filtered = filtered.filter(course =>
                (course.name || course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (course.code || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(course => course.category === parseInt(categoryFilter));
        }

        setFilteredCourses(filtered);
    }, [searchTerm, categoryFilter, courses]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'image' && !formData[key]) return; // Skip if no image
                data.append(key, formData[key]);
            });

            await axios.post('/api/courses/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Course created successfully!');
            setFormData({
                name: '',
                code: '',
                description: '',
                category: '',
                duration_weeks: '',
                max_capacity: '',
                fee: '',
                instructor: '',
                image: null
            });
            setShowCreateModal(false);
            fetchCourses();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Create course error:', err);
            setError(err.response?.data?.error || 'Failed to create course');
        }
    };

    const handleEditClick = (course) => {
        console.log('Editing course:', course);
        setSelectedCourse(course);
        setFormData({
            name: course.name || course.title || '',
            code: course.code || '',
            description: course.description || '',
            category: course.category || '',
            duration_weeks: course.duration_weeks || course.duration || '',
            max_capacity: course.max_capacity || course.max_students || '',
            fee: course.fee || '',
            instructor: course.instructor || '',
            image: null // Reset image on edit open, or keep existing URL if needed visually, but for upload we start null
        });
        setShowCreateModal(true);
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedCourse) return;

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'image' && !formData[key]) return;
                data.append(key, formData[key]);
            });

            await axios.put(`/api/courses/${selectedCourse.id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Course updated successfully!');
            setFormData({
                name: '',
                code: '',
                description: '',
                category: '',
                duration_weeks: '',
                max_capacity: '',
                fee: '',
                instructor: '',
                image: null
            });
            setShowCreateModal(false);
            setSelectedCourse(null);
            fetchCourses();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Update course error:', err);
            setError(err.response?.data?.error || 'Failed to update course');
        }
    };

    const handleAssignInstructor = async (e) => {
        e.preventDefault();
        if (!selectedCourse || !formData.instructor) {
            setError('Please select an instructor');
            return;
        }

        try {
            // If the backend expects a specific endpoint for assignment, use it.
            // Otherwise, we might just update the course with the new instructor.
            // Based on previous code, it used a specific endpoint.
            // But standard REST update would be PATCH /api/courses/:id/ with { instructor: id }
            // Let's stick to the previous pattern if it exists, or fallback to PATCH.
            // Checking previous code: axios.post(`/api/courses/${selectedCourse.id}/assign-instructor/`, ...
            // I'll assume that endpoint exists or I should use PATCH.
            // Ideally, standard update is better. Let's try PATCH first as it's more standard for DRF ModelViewSet.

            await axios.patch(`/api/courses/${selectedCourse.id}/`, {
                instructor: formData.instructor
            });

            setSuccess('Instructor assigned successfully!');
            setShowAssignModal(false);
            setSelectedCourse(null);
            fetchCourses();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Assign instructor error:', err);
            setError(err.response?.data?.error || 'Failed to assign instructor');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/api/courses/${courseId}/`);
                setSuccess('Course deleted successfully!');
                fetchCourses();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to delete course');
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">Course Management</h1>
                    <p className="text-gray-200">Manage all physical courses, batches, and instructors</p>
                </div>

                {/* Alerts */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                {/* Search & Actions */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                setSelectedCourse(null);
                                setFormData({
                                    name: '',
                                    code: '',
                                    description: '',
                                    category: '',
                                    duration_weeks: '',
                                    max_capacity: '',
                                    fee: '',
                                    instructor: ''
                                });
                                setShowCreateModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
                        >
                            <Plus className="w-5 h-5" />
                            Create Course
                        </button>
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-300">Loading courses...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                actionSlot={
                                    <div className="flex gap-2 w-full mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCourse(course);
                                                setShowAssignModal(true);
                                            }}
                                            className="flex-1 p-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg transition border border-green-200 flex items-center justify-center"
                                            title="Assign Instructor"
                                        >
                                            <User className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(course);
                                            }}
                                            className="flex-1 p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-lg transition border border-blue-200 flex items-center justify-center"
                                            title="Edit Course"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCourse(course.id);
                                            }}
                                            className="flex-1 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition border border-red-200 flex items-center justify-center"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}

                {filteredCourses.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-300">
                        No courses found. Create your first course to get started!
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/40 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedCourse ? 'Edit Course' : 'Create New Course'}</h2>

                        <form onSubmit={selectedCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Course Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Web Development"
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Course Code *</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g., WEB-101"
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Course description..."
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Course Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFormData({ ...formData, image: e.target.files[0] });
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Duration (Weeks)</label>
                                    <input
                                        type="number"
                                        value={formData.duration_weeks}
                                        onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                                        placeholder="e.g., 12"
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Max Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.max_capacity}
                                        onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                                        placeholder="e.g., 30"
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Course Fee (NPR)</label>
                                    <input
                                        type="number"
                                        value={formData.fee}
                                        onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                        placeholder="e.g., 15000"
                                        className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition"
                                >
                                    {selectedCourse ? 'Update Course' : 'Create Course'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedCourse(null);
                                    }}
                                    className="flex-1 bg-gray-300/30 hover:bg-gray-400/30 text-gray-800 font-semibold py-3 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Instructor Modal */}
            {showAssignModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full border border-white/40 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Instructor</h2>
                        <p className="text-gray-700 mb-6">Course: <span className="font-semibold">{selectedCourse.name || selectedCourse.title}</span></p>

                        <form onSubmit={handleAssignInstructor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Select Instructor *</label>
                                <select
                                    value={formData.instructor}
                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white/30 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="">Choose an instructor</option>
                                    {instructors.map(instructor => (
                                        <option key={instructor.id} value={instructor.id}>
                                            {instructor.first_name} {instructor.last_name} ({instructor.username})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition"
                                >
                                    Assign
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedCourse(null);
                                    }}
                                    className="flex-1 bg-gray-300/30 hover:bg-gray-400/30 text-gray-800 font-semibold py-3 rounded-lg transition"
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

export default AdminCourses;
