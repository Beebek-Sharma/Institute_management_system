import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { User, Mail, Phone, Calendar, Award, Shield, Briefcase, GraduationCap, Edit, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { authAPI } from '../api/auth';
import { getMediaUrl } from '../api/utils';
import Loader from '../components/Loader';

const Profile = () => {
    const { user, loading, updateProfile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        profile_picture: null,
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        } else if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                email: user.email || '',
                profile_picture: null
            });
            setPreviewImage(getMediaUrl(user.profile_picture));
        }
    }, [loading, user, navigate]);

    if (loading) {
        return <Loader fullScreen={true} />;
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="w-6 h-6 text-red-400" />;
            case 'staff': return <Briefcase className="w-6 h-6 text-blue-400" />;
            case 'instructor': return <GraduationCap className="w-6 h-6 text-purple-400" />;
            case 'student': return <User className="w-6 h-6 text-green-400" />;
            default: return <User className="w-6 h-6 text-gray-700" />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'from-red-500 to-red-600';
            case 'staff': return 'from-blue-500 to-blue-600';
            case 'instructor': return 'from-purple-500 to-purple-600';
            case 'student': return 'from-green-500 to-green-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profile_picture: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('first_name', formData.first_name);
            data.append('last_name', formData.last_name);
            data.append('phone', formData.phone);
            if (formData.profile_picture) {
                data.append('profile_picture', formData.profile_picture);
            }

            console.log('Sending profile update with FormData');
            const response = await authAPI.updateProfile(data);
            console.log('Profile update response:', response);

            if (response && response.user) {
                // Update the user context and localStorage with new data
                updateProfile(response.user);

                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                });
                setIsEditOpen(false);

                // Update preview image with new profile picture
                setPreviewImage(getMediaUrl(response.user.profile_picture));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            console.error('Error response:', error.response?.data);

            let errorMsg = 'Failed to update profile';

            if (error.response?.data) {
                // Handle field-level errors from backend
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    // Get first error message from any field
                    const firstErrorKey = Object.keys(errorData)[0];
                    const firstError = errorData[firstErrorKey];
                    if (Array.isArray(firstError)) {
                        errorMsg = firstError[0];
                    } else if (typeof firstError === 'string') {
                        errorMsg = firstError;
                    }
                } else if (typeof errorData === 'string') {
                    errorMsg = errorData;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
                        <p className="text-gray-900">View and manage your profile</p>
                    </div>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-teal-600 hover:bg-teal-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-gray-200 text-gray-900 sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-teal-500">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {formData.first_name?.[0]}{formData.last_name?.[0]}
                                                </span>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-teal-600 p-1.5 rounded-full cursor-pointer hover:bg-teal-700 transition">
                                            <Edit className="w-4 h-4 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">First Name</label>
                                        <Input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="bg-white border-gray-300 text-gray-900 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                                        <Input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="bg-white border-gray-300 text-gray-900 focus:ring-teal-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    // Often email update requires more validation, but backend allows it
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Profile Card */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto md:mx-0">
                    {/* Profile Header with Avatar */}
                    <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center text-gray-900 text-3xl font-bold mb-4 shadow-lg overflow-hidden`}>
                            {user?.profile_picture ? (
                                <img src={getMediaUrl(user.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{user?.first_name} {user?.last_name}</h2>
                        <div className="flex items-center gap-2 text-gray-700 text-lg bg-white px-4 py-1 rounded-full">
                            {getRoleIcon(user?.role)}
                            <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</span>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="space-y-6">
                        {/* Email */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white transition-colors">
                            <Mail className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                                <p className="text-gray-900 text-lg">{user?.email}</p>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white transition-colors">
                            <User className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Username</p>
                                <p className="text-gray-900 text-lg">{user?.username}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white transition-colors">
                            <Phone className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                                <p className="text-gray-900 text-lg">{user?.phone || 'Not set'}</p>
                            </div>
                        </div>

                        {/* Enrollment/Join Date */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white transition-colors">
                            <Calendar className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                    {user?.role === 'student' ? 'Enrollment Date' : 'Joined Date'}
                                </p>
                                <p className="text-gray-900 text-lg">
                                    {user?.enrollment_date || user?.date_joined || user?.created_at
                                        ? new Date(user.enrollment_date || user.date_joined || user.created_at).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end">
                        <Button
                            variant="outline"
                            className="text-gray-700 border-gray-600 hover:bg-white"
                            onClick={() => navigate('/student/settings')}
                        >
                            Advanced Settings
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
