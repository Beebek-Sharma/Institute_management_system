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

const Profile = () => {
    const { user, loading, login } = useAuth(); // We might need to update user context after edit
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '', // Usually read-only or requires verification, but let's allow edit if backend allows
    });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        } else if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                email: user.email || '',
            });
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="w-6 h-6 text-red-400" />;
            case 'staff': return <Briefcase className="w-6 h-6 text-blue-400" />;
            case 'instructor': return <GraduationCap className="w-6 h-6 text-purple-400" />;
            case 'student': return <User className="w-6 h-6 text-green-400" />;
            default: return <User className="w-6 h-6 text-gray-400" />;
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/auth/profile/update/', {
                method: 'PATCH', // or PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                });
                setIsEditOpen(false);
                // Ideally we should update the user context here. 
                // Since useAuth might not expose a direct 'updateUser' method, 
                // we might need to reload the page or fetch profile again.
                // For now, let's just reload to be safe and simple, or if we had a fetchProfile in context.
                // A simple window reload is a bit harsh but effective for now.
                window.location.reload();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update profile",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "An error occurred",
                variant: "destructive",
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
                        <p className="text-gray-200">View and manage your profile</p>
                    </div>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-teal-600 hover:bg-teal-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">First Name</label>
                                        <Input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Last Name</label>
                                        <Input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Email</label>
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
                                    <label className="text-sm font-medium text-gray-300">Phone</label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="text-gray-300 hover:text-white hover:bg-slate-800">
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
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-2xl mx-auto md:mx-0">
                    {/* Profile Header with Avatar */}
                    <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/20">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg`}>
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{user?.first_name} {user?.last_name}</h2>
                        <div className="flex items-center gap-2 text-gray-300 text-lg bg-white/5 px-4 py-1 rounded-full">
                            {getRoleIcon(user?.role)}
                            <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</span>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="space-y-6">
                        {/* Email */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors">
                            <Mail className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-400 mb-1">Email</p>
                                <p className="text-white text-lg">{user?.email}</p>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors">
                            <User className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-400 mb-1">Username</p>
                                <p className="text-white text-lg">{user?.username}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors">
                            <Phone className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-400 mb-1">Phone</p>
                                <p className="text-white text-lg">{user?.phone || 'Not set'}</p>
                            </div>
                        </div>

                        {/* Enrollment/Join Date */}
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors">
                            <Calendar className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-400 mb-1">
                                    {user?.role === 'student' ? 'Enrollment Date' : 'Joined Date'}
                                </p>
                                <p className="text-white text-lg">
                                    {user?.enrollment_date || user?.date_joined || user?.created_at
                                        ? new Date(user.enrollment_date || user.date_joined || user.created_at).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
