import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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

const StaffEnrollments = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState("");
    const [courseId, setCourseId] = useState("");

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const response = await api.get('/enrollments/');
            setEnrollments(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch enrollments",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!studentId || !courseId) return;

        try {
            await api.post('/enrollments/', {
                student: studentId,
                course: courseId,
                status: 'active'
            });

            toast({
                title: "Success",
                description: "Student enrolled successfully",
            });
            fetchEnrollments();
            setStudentId("");
            setCourseId("");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to enroll student",
            });
        }
    };

    return (
        <DashboardLayout title="Manage Enrollments" user={user}>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>New Enrollment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <label htmlFor="studentId">Student ID</label>
                            <input
                                id="studentId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="Enter Student ID"
                            />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <label htmlFor="courseId">Course ID</label>
                            <input
                                id="courseId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                placeholder="Enter Course ID"
                            />
                        </div>
                        <Button onClick={handleEnroll}>Enroll Student</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                    <TableCell>{enrollment.id}</TableCell>
                                    <TableCell>{enrollment.student}</TableCell>
                                    <TableCell>{enrollment.course}</TableCell>
                                    <TableCell>{enrollment.status}</TableCell>
                                    <TableCell>{enrollment.enrollment_date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default StaffEnrollments;
