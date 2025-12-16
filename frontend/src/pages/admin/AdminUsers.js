import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { Search, Plus, Trash2, Edit, MoreVertical, User, Shield, GraduationCap, Briefcase } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const AdminUsers = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student',
        phone: '',
    });

    useEffect(() => {
        fetchUsers();
    }, [searchQuery, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let url = '/api/admin/users/';
            const params = new URLSearchParams();

            if (searchQuery) params.append('search', searchQuery);
            if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter);

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await axios.get(url);
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "An error occurred while fetching users",
                variant: "destructive",
            });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value) => {
        setFormData(prev => ({ ...prev, role: value }));
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role: 'student',
            phone: '',
        });
        setSelectedUser(null);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            // Determine endpoint based on role
            let endpoint = '/api/admin/create-student/';
            if (formData.role === 'staff') endpoint = '/api/admin/create-staff/';
            if (formData.role === 'instructor') endpoint = '/api/admin/create-instructor/';
            if (formData.role === 'admin') endpoint = '/api/auth/create-admin/';

            const response = await axios.post(endpoint, formData);

            toast({
                title: "Success",
                description: "User created successfully",
            });
            setIsAddUserOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to create user",
                variant: "destructive",
            });
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            phone: user.phone || '',
            // Password not included in edit usually
        });
        setIsEditUserOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const response = await axios.put(`/api/admin/users/${selectedUser.id}/`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
            });

            toast({
                title: "Success",
                description: "User updated successfully",
            });
            setIsEditUserOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update user",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await axios.delete(`/api/admin/users/${userId}/delete/`);

            toast({
                title: "Success",
                description: "User deleted successfully",
            });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-red-600" />;
            case 'staff': return <Briefcase className="w-4 h-4 text-blue-600" />;
            case 'instructor': return <GraduationCap className="w-4 h-4 text-purple-600" />;
            case 'student': return <User className="w-4 h-4 text-green-600" />;
            default: return <User className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'instructor': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'student': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage all users in the system</p>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-gray-200 text-gray-900">
                            <DialogHeader>
                                <DialogTitle className="text-gray-900">Add New User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">First Name</label>
                                        <Input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                                        <Input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Username</label>
                                    <Input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Password</label>
                                    <Input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                    <Select value={formData.role} onValueChange={handleRoleChange}>
                                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200">
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="instructor">Instructor</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.role === 'instructor' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Phone</label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                        />
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddUserOpen(false)} className="text-gray-700 hover:bg-gray-100">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                                        Create User
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-200 bg-gray-50 hover:bg-gray-100">
                                    <TableHead className="text-gray-700 font-semibold">User</TableHead>
                                    <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                                    <TableHead className="text-gray-700 font-semibold">Email</TableHead>
                                    <TableHead className="text-gray-700 font-semibold">Joined Date</TableHead>
                                    <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            Loading users...
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="border-gray-200 hover:bg-gray-50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                        {user.first_name?.[0] || user.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-700">{user.email}</TableCell>
                                            <TableCell className="text-gray-700">
                                                {new Date(user.date_joined || user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-md">
                                                        <DropdownMenuItem onClick={() => handleEditClick(user)} className="hover:bg-gray-100 cursor-pointer text-gray-700">
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:bg-red-50 cursor-pointer">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View - Cards */}
                    <div className="md:hidden">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No users found</div>
                        ) : (
                            <div className="space-y-4 p-4">
                                {users.map((user) => (
                                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                                        {/* Header with avatar and name */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                                                    {user.first_name?.[0] || user.username[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                                                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-900 shadow-md">
                                                    <DropdownMenuItem onClick={() => handleEditClick(user)} className="hover:bg-gray-100 cursor-pointer">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:bg-red-50 cursor-pointer">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Role Badge */}
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="text-gray-900 break-all text-right">{user.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Joined:</span>
                                                <span className="text-gray-900">{new Date(user.date_joined || user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent className="bg-white border-gray-200 text-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900">Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <Input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <Input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                    required
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
                                className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditUserOpen(false)} className="text-gray-700 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                                Update User
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminUsers;
