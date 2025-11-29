import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
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
            const token = localStorage.getItem('token');
            let url = 'http://127.0.0.1:8000/api/admin/users/?';

            if (searchQuery) url += `search=${searchQuery}&`;
            if (roleFilter && roleFilter !== 'all') url += `role=${roleFilter}&`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch users",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "An error occurred while fetching users",
                variant: "destructive",
            });
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
            const token = localStorage.getItem('token');
            // Determine endpoint based on role
            let endpoint = '/api/admin/create-student/';
            if (formData.role === 'staff') endpoint = '/api/admin/create-staff/';
            if (formData.role === 'instructor') endpoint = '/api/admin/create-instructor/';
            if (formData.role === 'admin') endpoint = '/api/auth/create-admin/'; // Assuming this exists or similar

            // Fallback to generic create if specific endpoints fail or for admin
            // Actually, let's use the specific endpoints as per views.py

            const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
                method: 'POST',
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
                    description: "User created successfully",
                });
                setIsAddUserOpen(false);
                resetForm();
                fetchUsers();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to create user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Error",
                description: "An error occurred",
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
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${selectedUser.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    // Role usually shouldn't be changed easily, but if needed:
                    // role: formData.role 
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "User updated successfully",
                });
                setIsEditUserOpen(false);
                resetForm();
                fetchUsers();
            } else {
                const data = await response.json();
                toast({
                    title: "Error",
                    description: data.error || "Failed to update user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: "Error",
                description: "An error occurred",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "User deleted successfully",
                });
                fetchUsers();
            } else {
                const data = await response.json();
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: "An error occurred",
                variant: "destructive",
            });
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
            case 'staff': return <Briefcase className="w-4 h-4 text-blue-500" />;
            case 'instructor': return <GraduationCap className="w-4 h-4 text-purple-500" />;
            case 'student': return <User className="w-4 h-4 text-green-500" />;
            default: return <User className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'staff': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'instructor': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'student': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">User Management</h1>
                        <p className="text-gray-400">Manage all users in the system</p>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-teal-600 hover:bg-teal-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">First Name</label>
                                        <Input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="bg-slate-800 border-slate-700 text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Last Name</label>
                                        <Input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="bg-slate-800 border-slate-700 text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Username</label>
                                    <Input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Password</label>
                                    <Input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Role</label>
                                    <Select value={formData.role} onValueChange={handleRoleChange}>
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="instructor">Instructor</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.role === 'instructor' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Phone</label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddUserOpen(false)} className="text-gray-300 hover:text-white hover:bg-slate-800">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                                        Create User
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Users Table */}
                <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-slate-800/50">
                                <TableHead className="text-gray-300">User</TableHead>
                                <TableHead className="text-gray-300">Role</TableHead>
                                <TableHead className="text-gray-300">Email</TableHead>
                                <TableHead className="text-gray-300">Joined Date</TableHead>
                                <TableHead className="text-gray-300 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                                                    {user.first_name?.[0] || user.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.first_name} {user.last_name}</p>
                                                    <p className="text-xs text-gray-400">@{user.username}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-300">{user.email}</TableCell>
                                        <TableCell className="text-gray-300">
                                            {new Date(user.date_joined || user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-slate-800">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                                                    <DropdownMenuItem onClick={() => handleEditClick(user)} className="hover:bg-slate-700 cursor-pointer">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer">
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
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">First Name</label>
                                <Input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Last Name</label>
                                <Input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    required
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
                                required
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
                            <Button type="button" variant="ghost" onClick={() => setIsEditUserOpen(false)} className="text-gray-300 hover:text-white hover:bg-slate-800">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
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
