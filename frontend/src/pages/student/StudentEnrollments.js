import React, { useState, useEffect } from 'react';
import { enrollmentsAPI } from '../../api/enrollments';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { BookOpen, Calendar, Award, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const StudentEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentsAPI.getEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to load enrollments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      dropped: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={`${styles[status] || 'bg-gray-100 text-gray-800'} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Enrollments</h1>
          <p className="text-gray-600">Track your progress and manage your courses</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading enrollments...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No enrollments yet</h3>
                <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => window.location.href = '/student/courses'}
                >
                  Browse Courses
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-bold">{enrollment.course_name}</div>
                          <div className="text-xs text-gray-500">{enrollment.course_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.instructor_name || 'TBA'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell className="w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{enrollment.progress || 0}%</span>
                          </div>
                          <Progress value={enrollment.progress || 0} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {enrollment.status === 'completed' && (
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Certificate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentEnrollments;