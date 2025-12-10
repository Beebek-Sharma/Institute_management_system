import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../api/courses';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import CourseCard from "../../components/CourseCard";
import { BookOpen, Users, Clock, AlertCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";

const StaffCourses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [newCourse, setNewCourse] = useState({
        code: '',
        name: '',
        description: '',
        credits: '',
        schedule: '',
        capacity: ''
    });
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Fetch courses on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await coursesAPI.getCourses();
            setCourses(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch courses",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAssignInstructor = async () => {
        if (!selectedCourse || !selectedInstructor) return;
        try {
            await api.patch(`/courses/${selectedCourse.id}/`, { instructor: selectedInstructor });
            toast({ title: "Success", description: "Instructor assigned successfully" });
            fetchCourses();
            setSelectedCourse(null);
            setSelectedInstructor('');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to assign instructor",
            });
        }
    };

    const handleCreateCourse = async () => {
        try {
            if (coursesAPI.createCourse) {
                await coursesAPI.createCourse(newCourse);
            } else {
                await api.post('/courses/', newCourse);
            }
            toast({ title: "Success", description: "Course created successfully" });
            fetchCourses();
            setNewCourse({ code: '', name: '', description: '', credits: '', schedule: '', capacity: '' });
            setShowCreateDialog(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create course",
            });
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                        <p className="text-gray-300">Loading courses...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Course Management</h1>
                            <p className="text-gray-200">Manage all physical courses, batches, and instructors</p>
                        </div>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
                        >
                            + Create Course
                        </Button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <Input
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/20 border-white/40 text-white placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setViewMode('cards')}
                                variant={viewMode === 'cards' ? 'default' : 'outline'}
                                className={viewMode === 'cards' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                            >
                                Cards
                            </Button>
                            <Button
                                onClick={() => setViewMode('table')}
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                className={viewMode === 'table' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                            >
                                Table
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Cards View */}
                {viewMode === 'cards' && (
                    <div className="mb-8">
                        <div className="flex flex-wrap justify-center gap-6">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        actionSlot={
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCourse(course);
                                                        setSelectedInstructor(course.instructor || '');
                                                    }}
                                                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs h-8"
                                                >
                                                    Assign
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/courses/${course.id}`);
                                                    }}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                                >
                                                    Details
                                                </Button>
                                            </div>
                                        }
                                    />
                                ))
                            ) : (
                                <div className="w-full text-center py-12">
                                    <p className="text-gray-400">No courses found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                    <Card className="bg-white/10 border-white/20">
                        <CardHeader>
                            <CardTitle className="text-white">All Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/20">
                                        <TableHead className="text-gray-300">Code</TableHead>
                                        <TableHead className="text-gray-300">Name</TableHead>
                                        <TableHead className="text-gray-300">Category</TableHead>
                                        <TableHead className="text-gray-300">Duration</TableHead>
                                        <TableHead className="text-gray-300">Enrolled</TableHead>
                                        <TableHead className="text-gray-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCourses.map((course) => (
                                        <TableRow key={course.id} className="border-white/20 hover:bg-white/5">
                                            <TableCell className="text-white font-mono text-sm">{course.code}</TableCell>
                                            <TableCell className="text-white">{course.title || course.name}</TableCell>
                                            <TableCell className="text-gray-300">{course.category || 'General'}</TableCell>
                                            <TableCell className="text-gray-300">{course.duration_weeks || 'N/A'} weeks</TableCell>
                                            <TableCell className="text-gray-300">{course.enrolled_count || 0}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedCourse(course)}
                                                                className="text-xs"
                                                            >
                                                                Assign
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Assign Instructor to {course.code}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <label htmlFor="instructor" className="text-right">Instructor ID</label>
                                                                    <Input
                                                                        id="instructor"
                                                                        value={selectedInstructor}
                                                                        onChange={(e) => setSelectedInstructor(e.target.value)}
                                                                        placeholder="Enter Instructor ID"
                                                                    />
                                                                </div>
                                                                <Button onClick={handleAssignInstructor}>Save Changes</Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Create Course Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="bg-slate-900 border-white/20">
                        <DialogHeader>
                            <DialogTitle className="text-white">Create New Course</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Code"
                                    value={newCourse.code}
                                    onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                                <Input
                                    placeholder="Name"
                                    value={newCourse.name}
                                    onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                            </div>
                            <Input
                                placeholder="Description"
                                value={newCourse.description}
                                onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <Input
                                    placeholder="Credits"
                                    value={newCourse.credits}
                                    onChange={e => setNewCourse({ ...newCourse, credits: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                                <Input
                                    placeholder="Schedule"
                                    value={newCourse.schedule}
                                    onChange={e => setNewCourse({ ...newCourse, schedule: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                                <Input
                                    placeholder="Capacity"
                                    value={newCourse.capacity}
                                    onChange={e => setNewCourse({ ...newCourse, capacity: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                            </div>
                            <Button
                                onClick={handleCreateCourse}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                            >
                                Create Course
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default StaffCourses;
