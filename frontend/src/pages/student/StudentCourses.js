import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import { enrollmentsAPI } from '../../api/enrollments';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import CourseCard from '../../components/CourseCard';
import { Badge } from '../../components/ui/badge';
import { Search, BookOpen, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';


const StudentCourses = () => {
  const { user } = useAuth();
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
      if (!user || !user.id) {
        alert('User not authenticated. Please log in.');
        return;
      }

      setEnrollmentLoading(courseId);
      console.log(`[StudentCourses] Enrolling in course ${courseId} for user ${user.id}`);

      const result = await enrollmentsAPI.enrollInCourse(courseId, user.id);
      console.log(`[StudentCourses] Enrollment successful:`, result);

      // Update local state
      setEnrolledCourseIds(prev => new Set(prev).add(courseId));

      // Show success message or toast (optional)
      alert('Successfully enrolled in course!');
    } catch (err) {
      console.error('[StudentCourses] Enrollment error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
      console.error('[StudentCourses] Error details:', errorMsg);
      alert(`Failed to enroll: ${errorMsg}`);
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
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses by name or code..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                <CourseCard
                  key={course.id}
                  course={course}
                  actionSlot={
                    <Button
                      className={`w-full font-bold ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={isEnrolled || enrollmentLoading === course.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click navigation
                        handleEnroll(course.id);
                      }}
                    >
                      {enrollmentLoading === course.id ? (
                        'Enrolling...'
                      ) : isEnrolled ? (
                        'Enrolled'
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout >
  );
};

export default StudentCourses;