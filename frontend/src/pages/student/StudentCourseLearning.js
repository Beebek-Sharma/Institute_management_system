import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI } from '../../api/courses';
import { enrollmentsAPI } from '../../api/enrollments';
import DashboardLayout from '../../components/DashboardLayout';
import { BookOpen, Calendar, Clock, User, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const StudentCourseLearning = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/unauthorized');
      return;
    }
    fetchCourseData();
  }, [courseId, user, navigate]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Fetch course details
      const allCourses = await coursesAPI.getCourses();
      const coursesArray = Array.isArray(allCourses) ? allCourses : (allCourses?.results || []);
      const foundCourse = coursesArray.find(c => c.id === parseInt(courseId));

      if (!foundCourse) {
        setError('Course not found');
        return;
      }

      setCourse(foundCourse);

      // Fetch student's enrollments to find this course enrollment
      const enrollments = await enrollmentsAPI.getEnrollments();
      const safeEnrollments = Array.isArray(enrollments) ? enrollments : (enrollments?.results || []);
      const courseEnrollment = safeEnrollments.find(e => e.course === parseInt(courseId));

      if (!courseEnrollment) {
        setError('You are not enrolled in this course');
        return;
      }

      setEnrollment(courseEnrollment);
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-gray-700">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
              <p className="text-lg font-semibold mb-2">Error</p>
              <p>{error || 'Course not found'}</p>
              <Button
                onClick={() => navigate('/student/courses')}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Back to Courses
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Course Header */}
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <Badge className="mb-2 bg-teal-500/20 text-teal-600 border-teal-500/30">
                  {course.code}
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {course.name}
                </h1>
                <p className="text-gray-700 mb-4">
                  {course.description || 'Professional course to advance your skills'}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_weeks || 'N/A'} weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="w-4 h-4" />
                    <span>{course.credits || 'N/A'} Credits</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-300">Enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400 mb-2">Active</div>
                <p className="text-gray-700 text-sm">You are actively enrolled</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Enrollment Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-teal-600">
                  {enrollment?.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : 'N/A'}
                </div>
                <p className="text-gray-700 text-sm">Date you joined</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">0%</div>
                <p className="text-gray-700 text-sm">Course completion</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Content Section */}
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Materials</h2>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-gray-900 font-semibold">Course Overview</p>
                      <p className="text-gray-700 text-sm">Getting started with {course.name}</p>
                    </div>
                  </div>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => alert('Course content coming soon!')}
                  >
                    Start
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 opacity-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-800" />
                    <div>
                      <p className="text-gray-700 font-semibold">Course Content</p>
                      <p className="text-gray-800 text-sm">Locked - Complete overview first</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Description */}
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
            <p className="text-gray-700 leading-relaxed">
              {course.description || 'No description available'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => navigate('/student/schedule')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              variant="outline"
            >
              View Schedule
            </Button>
            <Button
              onClick={() => navigate('/student/courses')}
              className="bg-gray-600 hover:bg-gray-700 text-white"
              variant="outline"
            >
              Browse More Courses
            </Button>
            <Button
              onClick={async () => {
                if (window.confirm('Are you sure you want to complete this course?')) {
                  try {
                    await enrollmentsAPI.markComplete(enrollment.id);
                    navigate('/student/certificates');
                  } catch (error) {
                    console.error('Error completing course:', error);
                    alert('Failed to complete course. Please try again.');
                  }
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Award className="w-4 h-4" />
              Complete Course & Get Certificate
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourseLearning;
