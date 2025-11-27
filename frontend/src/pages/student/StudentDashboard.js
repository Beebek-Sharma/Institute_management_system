import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen, GraduationCap, Clock, Award } from 'lucide-react';
import api from '../../api/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    completedCourses: 0,
    averageGrade: 'N/A'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch enrollments
        const response = await api.get('/enrollments/');
        const enrollmentData = response.data;
        setEnrollments(enrollmentData);

        // Calculate stats
        const total = enrollmentData.length;
        const active = enrollmentData.filter(e => e.status === 'active').length;
        const completed = enrollmentData.filter(e => e.status === 'completed').length;

        setStats({
          totalCourses: total,
          activeCourses: active,
          completedCourses: completed,
          averageGrade: 'A-' // Mock grade for now
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
          <p className="text-gray-300">Welcome back, {user?.first_name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            title="Active Courses"
            value={stats.activeCourses}
            icon={Clock}
            color="green"
          />
          <StatCard
            title="Completed"
            value={stats.completedCourses}
            icon={GraduationCap}
            color="purple"
          />
          <StatCard
            title="Average Grade"
            value={stats.averageGrade}
            icon={Award}
            color="yellow"
          />
        </div>

        {/* Recent Enrollments */}
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.course_name || `Course #${enrollment.course}`}
                      </TableCell>
                      <TableCell>{enrollment.instructor_name || 'TBA'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${enrollment.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                          {enrollment.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No courses found. Enroll in a course to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;