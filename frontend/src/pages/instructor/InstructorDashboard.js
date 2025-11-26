import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI } from '../../api/courses';
import { enrollmentsAPI } from '../../api/enrollments';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, BookOpen, Clock, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalHours: 0,
    completionRate: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, we'd have specific endpoints for instructor stats
        // For now, we'll fetch all courses and filter by instructor
        const coursesData = await coursesAPI.getCourses();
        const myCourses = coursesData.filter(c => c.instructor === user.id);
        setCourses(myCourses);

        // Fetch enrollments for my courses
        // This would typically be a specific endpoint like /api/instructor/enrollments/
        // For now we'll use the general one which returns filtered results based on role
        const enrollmentsData = await enrollmentsAPI.getEnrollments();
        setEnrollments(enrollmentsData);

        // Calculate stats
        setStats({
          totalStudents: new Set(enrollmentsData.map(e => e.student)).size,
          activeCourses: myCourses.length,
          totalHours: myCourses.reduce((acc, c) => acc + (c.duration_weeks * 2), 0), // Approx
          completionRate: 85 // Mock
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Courses"
            value={stats.activeCourses}
            icon={BookOpen}
            color="green"
          />
          <StatCard
            title="Teaching Hours"
            value={stats.totalHours}
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={TrendingUp}
            color="yellow"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.slice(0, 5).map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>
                        {enrollments.filter(e => e.course === course.id).length}
                      </TableCell>
                    </TableRow>
                  ))}
                  {courses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        No courses assigned yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.slice(0, 5).map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.student_name || `Student #${enrollment.student}`}
                      </TableCell>
                      <TableCell>{enrollment.course_name}</TableCell>
                      <TableCell>
                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {enrollments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        No recent enrollments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;