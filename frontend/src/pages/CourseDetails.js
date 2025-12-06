import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentsAPI } from '../api/enrollments';
import { coursesAPI } from '../api/courses';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../components/ui/accordion';
import { Star, Globe, Clock, CheckCircle, Share2, MoreHorizontal, PlayCircle, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [course, setCourse] = useState(null);
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const courses = await coursesAPI.getCourses();
            const coursesArray = Array.isArray(courses) ? courses : (courses?.results || []);
            const foundCourse = coursesArray.find(c => c.id === parseInt(courseId));
            if (foundCourse) {
                // Merge course data with default mock data for display purposes
                const enrichedCourse = {
                    outcomes: [
                        'Gain an immersive understanding of the practices and processes used by a junior or associate data analyst in their day-to-day job',
                        'Learn key analytical skills (data cleaning, analysis, & visualization) and tools (spreadsheets, SQL, R programming, Tableau)',
                        'Understand how to clean and organize data for analysis, and complete analysis and calculations using spreadsheets, SQL and R programming',
                        'Learn how to visualize and present data findings in dashboards, presentations and commonly used visualization platforms'
                    ],
                    skills: ['Data Analysis', 'R Programming', 'SQL', 'Tableau', 'Data Visualization', 'Spreadsheet', 'Data Cleansing', 'Data Collection'],
                    syllabus: [
                        {
                            title: 'Foundations: Data, Data, Everywhere',
                            duration: '21 hours',
                            description: 'This course will introduce you to the world of data analytics. You\'ll learn about the data ecosystem, the process of data analysis, and the tools used by data analysts.'
                        },
                        {
                            title: 'Ask Questions to Make Data-Driven Decisions',
                            duration: '19 hours',
                            description: 'This course will help you learn how to ask effective questions to make data-driven decisions and how to use data to solve problems.'
                        },
                        {
                            title: 'Prepare Data for Exploration',
                            duration: '23 hours',
                            description: 'This course will show you how to prepare data for exploration and how to use spreadsheets and SQL to extract and filter data.'
                        },
                        {
                            title: 'Process Data from Dirty to Clean',
                            duration: '22 hours',
                            description: 'This course will teach you how to check for data integrity and how to clean data using spreadsheets and SQL.'
                        }
                    ],
                    instructors: [
                        {
                            name: 'Google Career Certificates',
                            title: 'Top Instructor',
                            image: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-instructor-photos.s3.amazonaws.com/2a/396e67690e4475a3e39045d4292a3c/Google-Logo.png?auto=format%2Ccompress&dpr=1&w=200&h=200',
                            rating: '4.8',
                            students: '3,000,000+'
                        }
                    ],
                    ...foundCourse
                };
                setCourse(enrichedCourse);
                // Check if user is enrolled
                if (user && user.id) {
                    const enrollments = await enrollmentsAPI.getEnrollments();
                    const safeEnrollments = Array.isArray(enrollments) ? enrollments : (enrollments?.results || []);
                    setIsEnrolled(safeEnrollments.some(e => e.course === foundCourse.id || e.batch?.course === foundCourse.id));
                }
            } else {
                setError('Course not found');
            }
        } catch (err) {
            console.error('Error fetching course:', err);
            setError('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    // Mock course data merged into fetched course in fetchCourseDetails function
    
    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isEnrolled) {
            alert('You are already enrolled in this course!');
            return;
        }

        try {
            setEnrolling(true);
            setError('');
            
            // Convert courseId to integer for API call
            const courseIdInt = parseInt(courseId);
            
            console.log(`[CourseDetails] Enrolling in course ${courseIdInt} for user ${user.id}`);
            
            // Use batch-based enrollment
            const result = await enrollmentsAPI.enrollInCourse(courseIdInt, user.id);
            
            console.log(`[CourseDetails] Enrollment successful:`, result);
            
            setIsEnrolled(true);
            
            // Show success and immediately navigate
            alert('Successfully enrolled in course! Redirecting to your course...');
            console.log(`[CourseDetails] Navigating to /student/courses/${courseIdInt}`);
            
            // Navigate immediately without timeout
            navigate(`/student/courses/${courseIdInt}`);
            
        } catch (error) {
            console.error('[CourseDetails] Enrollment failed:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
            console.error('[CourseDetails] Error details:', errorMsg);
            
            // Check if it's a duplicate enrollment error
            if (errorMsg.includes('already enrolled')) {
                setIsEnrolled(true);
                alert('You are already enrolled in this course!');
            } else {
                setError(`Failed to enroll: ${errorMsg}`);
                alert(`Failed to enroll: ${errorMsg}`);
            }
        } finally {
            setEnrolling(false);
        }
    };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />
      <main className="flex-grow">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-gray-300">Loading course details...</p>
            </div>
          </div>
        ) : error || !course ? (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">{error || 'Course not found'}</h2>
            <Button onClick={() => navigate('/')} className="bg-teal-600 hover:bg-teal-700">
              Back to Home
            </Button>
          </div>
        ) : (
            <>
            {/* Hero Section */}
            <div className="bg-[#f5f7f8] border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1">
                            {/* Breadcrumbs */}
                            <nav className="flex items-center text-sm text-gray-600 mb-6">
                                <Link to="/" className="hover:underline">Browse</Link>
                                <span className="mx-2">›</span>
                                <span className="hover:underline">Courses</span>
                                <span className="mx-2">›</span>
                                <span className="font-semibold text-gray-900">{course.name}</span>
                            </nav>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {course.name}
                            </h1>
                            <p className="text-xl text-gray-700 mb-6 max-w-3xl">
                                {course.description || 'Professional course to advance your skills'}
                            </p>

                            {/* Ratings & Stats */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 mb-8">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">Code: {course.code}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">{course.duration_weeks} weeks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">{course.credits} Credits</span>
                                </div>
                            </div>

                            {/* Enroll Button (Desktop) */}
                            <div className="hidden lg:flex items-center gap-4">
                                <Button
                                    onClick={handleEnroll}
                                    className={`${isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0056D2] hover:bg-[#00419e]'} text-white font-bold text-lg px-8 py-6 h-auto`}
                                    disabled={enrolling || isEnrolled}
                                >
                                    {enrolling ? 'Enrolling...' : isEnrolled ? '✓ Enrolled' : 'Enroll for Free'}
                                </Button>
                                <p className="text-sm text-gray-600">{isEnrolled ? 'You are enrolled' : 'Start learning now'}</p>
                            </div>
                            {error && <p className="text-red-600 mt-2">{error}</p>}
                            <p className="hidden lg:block text-sm text-gray-600 mt-2">
                                Financial aid available
                            </p>
                        </div>

                        {/* Sidebar / Floating Card (Desktop) */}
                        <div className="hidden lg:block w-80">
                            {/* Can add a floating card here if needed, but for now keeping it clean */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Enroll Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
                <Button
                    onClick={handleEnroll}
                    className={`w-full ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0056D2] hover:bg-[#00419e]'} text-white font-bold text-lg py-6 h-auto`}
                    disabled={enrolling || isEnrolled}
                >
                    {enrolling ? 'Enrolling...' : isEnrolled ? '✓ Enrolled' : 'Enroll for Free'}
                </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {['About', 'Outcomes', 'Courses', 'Instructors', 'Reviews'].map((tab) => (
                            <button
                                key={tab}
                                className="py-4 text-sm font-semibold text-gray-600 hover:text-[#0056D2] border-b-2 border-transparent hover:border-[#0056D2] whitespace-nowrap"
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* What you'll learn */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.outcomes && course.outcomes.map((outcome, index) => (
                                    <div key={index} className="flex gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700">{outcome}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills you'll gain</h2>
                            <div className="flex flex-wrap gap-2">
                                {course.skills && course.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 text-sm font-medium">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </section>

                        {/* Syllabus */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">There are 4 courses in this Professional Certificate</h2>
                            <Accordion type="single" collapsible className="w-full">
                                {course.syllabus && course.syllabus.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="hover:no-underline py-6">
                                            <div className="flex flex-col items-start text-left">
                                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Course {index + 1}</span>
                                                <span className="text-lg font-bold text-gray-900">{item.title}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pb-6 text-gray-700">
                                                <p className="mb-4">{item.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{item.duration}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                        <span>4.8</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>

                        {/* Instructors */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructors</h2>
                            {course.instructors && course.instructors.map((instructor, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={instructor.image} alt={instructor.name} />
                                        <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0056D2] underline mb-1">{instructor.name}</h3>
                                        <p className="text-gray-600 mb-2">{instructor.title}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>{instructor.rating} Instructor Rating</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Globe className="w-4 h-4" />
                                                <span>{instructor.students} Learners</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>

                    {/* Sidebar (Desktop) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Professional Certificate</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Prepare for a new career in the high-growth field of data analytics, no experience or degree required. Get professional training designed by Google and have the opportunity to connect with top employers.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">100% online</p>
                                            <p className="text-xs text-gray-500">Start instantly and learn at your own schedule.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">Flexible Schedule</p>
                                            <p className="text-xs text-gray-500">Set and maintain flexible deadlines.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">Beginner Level</p>
                                            <p className="text-xs text-gray-500">No degree or experience required.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )}
            </main>

            <Footer />
        </div>
    );
};

export default CourseDetails;
