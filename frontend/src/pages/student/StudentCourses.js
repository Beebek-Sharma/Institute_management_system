import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import { enrollmentsAPI } from '../../api/enrollments';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, BookOpen, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [enrollmentLoading, setEnrollmentLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, enrollmentsData] = await Promise.all([
        coursesAPI.getCourses(),
        enrollmentsAPI.getEnrollments()
      ]);

      // Ensure data is an array (handle potential pagination or unexpected format)
      const safeCourses = Array.isArray(coursesData) ? coursesData : (coursesData?.results || []);
      const safeEnrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.results || []);

      setCourses(safeCourses);
      setEnrolledCourseIds(new Set(safeEnrollments.map(e => e.course)));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load courses. Please try again later.');
      setCourses([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollmentLoading(courseId);
      await enrollmentsAPI.enrollInCourse(courseId);

      // Update local state
      setEnrolledCourseIds(prev => new Set(prev).add(courseId));

      // Show success message or toast (optional)
      alert('Successfully enrolled in course!');
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrollmentLoading(null);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Courses</h1>
          <p className="text-gray-600">Browse and enroll in courses to advance your skills</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses by name or code..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search terms or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const isEnrolled = enrolledCourseIds.has(course.id);

              return (
                <Card key={course.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {course.code}
                      </Badge>
                      <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 border-0">
                        {course.credits} Credits
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{course.name}</CardTitle>
                    <CardDescription className="line-clamp-3 mt-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <User className="h-4 w-4" />
                      <span>Instructor: {course.instructor_name || 'TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Schedule: {course.schedule || 'TBA'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {course.duration_weeks} weeks</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t bg-gray-50">
                    <Button
                      className={`w-full ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700'}`}
                      disabled={isEnrolled || enrollmentLoading === course.id}
                      onClick={() => handleEnroll(course.id)}
                    >
                      {enrollmentLoading === course.id ? (
                        'Enrolling...'
                      ) : isEnrolled ? (
                        'Enrolled'
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </DashboardLayout>
  );
};

export default StudentCourses;