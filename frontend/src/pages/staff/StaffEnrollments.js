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
    const [batches, setBatches] = useState([]);
    const [loadingBatches, setLoadingBatches] = useState(false);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const response = await api.get('/api/enrollments/');
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

    const fetchBatches = async (courseIdParam) => {
        try {
            setLoadingBatches(true);
            const response = await api.get(`/api/batches/?course=${courseIdParam}`);
            const batchList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setBatches(batchList);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch batches",
            });
            setBatches([]);
        } finally {
            setLoadingBatches(false);
        }
    };

    const handleEnroll = async () => {
        if (!studentId || !courseId) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter both student ID and course ID",
            });
            return;
        }

        try {
            // Fetch batches for the given course
            const response = await api.get(`/api/batches/?course=${courseId}`);
            const batchList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            
            // Find first available batch with seats
            const availableBatch = batchList.find(b => b.available_seats > 0);
            
            if (!availableBatch) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No available batches for this course",
                });
                return;
            }

            // Enroll student in the batch
            await api.post('/api/enrollments/', {
                student: studentId,
                batch: availableBatch.id,
                status: 'active'
            });

            toast({
                title: "Success",
                description: `Student enrolled successfully in Batch ${availableBatch.batch_number}`,
            });
            fetchEnrollments();
            setStudentId("");
            setCourseId("");
            setBatches([]);
        } catch (error) {
            console.error('Enrollment error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.error || "Failed to enroll student",
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
                    <div className="space-y-4">
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
                                    onChange={(e) => {
                                        setCourseId(e.target.value);
                                        if (e.target.value) {
                                            fetchBatches(e.target.value);
                                        } else {
                                            setBatches([]);
                                        }
                                    }}
                                    placeholder="Enter Course ID"
                                />
                            </div>
                            <Button onClick={handleEnroll} disabled={!studentId || !courseId || loadingBatches}>
                                {loadingBatches ? 'Loading...' : 'Enroll Student'}
                            </Button>
                        </div>
                        
                        {batches.length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                <p className="font-semibold text-blue-900">Available Batches: {batches.length}</p>
                                <p className="text-blue-800">Will enroll in: <span className="font-semibold">{batches[0].batch_number}</span> (Instructor: {batches[0].instructor_name || 'TBA'})</p>
                            </div>
                        )}
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
