import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import { enrollmentsAPI } from '../../api/enrollments';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, BookOpen, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { FlippingCard } from '../../components/ui/flipping-card';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [enrollmentLoading, setEnrollmentLoading] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

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
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Flip Cards
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grid View
            </button>
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
        ) : viewMode === 'cards' ? (
          <div className="flex flex-wrap justify-center gap-6">
            {filteredCourses.map(course => {
              const isEnrolled = enrolledCourseIds.has(course.id);

              return (
                <FlippingCard
                  key={course.id}
                  width={300}
                  height={400}
                  frontContent={
                    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center">
                        <div className="text-5xl">📚</div>
                        <div className="absolute top-2 left-2 bg-white/20 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                          {course.credits} Credits
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                          {course.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">{course.code}</p>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {course.description || 'No description available'}
                        </p>
                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <User className="w-4 h-4 text-teal-400" />
                            <span>{course.instructor_name || 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Clock className="w-4 h-4 text-teal-400" />
                            <span>{course.duration_weeks} weeks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  backContent={
                    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                      <div className="text-4xl mb-3 text-center">🎓</div>
                      <h3 className="text-lg font-bold text-white mb-3 text-center line-clamp-2">
                        {course.name}
                      </h3>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="border-b border-white/20 pb-2">
                          <p className="text-xs text-gray-400">Code</p>
                          <p className="text-white font-semibold">{course.code}</p>
                        </div>
                        <div className="border-b border-white/20 pb-2">
                          <p className="text-xs text-gray-400">Schedule</p>
                          <p className="text-white font-semibold">{course.schedule || 'TBA'}</p>
                        </div>
                        <div className="border-b border-white/20 pb-2">
                          <p className="text-xs text-gray-400">Status</p>
                          <p className={`font-semibold ${isEnrolled ? 'text-green-400' : 'text-orange-400'}`}>
                            {isEnrolled ? '✓ Enrolled' : 'Not Enrolled'}
                          </p>
                        </div>
                      </div>
                      <button
                        className={`w-full ${isEnrolled ? 'bg-green-600 hover:bg-green-700 cursor-default' : 'bg-teal-600 hover:bg-teal-700'} text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50`}
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
                      </button>
                    </div>
                  }
                />
              );
            })}
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