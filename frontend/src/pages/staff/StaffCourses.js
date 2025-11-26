import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI } from '../../api/courses';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
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
    const { toast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedInstructor, setSelectedInstructor] = useState('');
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
            <DashboardLayout title="Manage Courses" user={user}>
                <p>Loading courses...</p>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Manage Courses" user={user}>
            <Card className="mb-6">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>All Courses</CardTitle>
                    <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                        Add Course
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>{course.code}</TableCell>
                                    <TableCell>{course.name}</TableCell>
                                    <TableCell>{course.instructor ? `ID: ${course.instructor}` : 'Unassigned'}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course)}>
                                                    Assign Instructor
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Create Course Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Course</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Code" value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })} />
                            <Input placeholder="Name" value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} />
                        </div>
                        <Input placeholder="Description" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                        <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Credits" value={newCourse.credits} onChange={e => setNewCourse({ ...newCourse, credits: e.target.value })} />
                            <Input placeholder="Schedule" value={newCourse.schedule} onChange={e => setNewCourse({ ...newCourse, schedule: e.target.value })} />
                            <Input placeholder="Capacity" value={newCourse.capacity} onChange={e => setNewCourse({ ...newCourse, capacity: e.target.value })} />
                        </div>
                        <Button onClick={handleCreateCourse}>Create Course</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default StaffCourses;
