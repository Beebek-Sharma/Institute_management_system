import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const InstructorEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        // Use new endpoint to get students in instructor's courses
        const data = await axios.get('/api/enrollments/my_students/');
        setEnrollments(data.data || []);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Enrollments</h1>
          <p className="text-gray-600">Manage student enrollments in your courses</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading enrollments...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Enrollments ({enrollments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Batch/Course</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.student_name || `Student #${enrollment.student}`}
                      </TableCell>
                      <TableCell>{enrollment.batch_name || enrollment.course_name || 'N/A'}</TableCell>
                      <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{enrollment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {enrollments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No enrollments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstructorEnrollments;