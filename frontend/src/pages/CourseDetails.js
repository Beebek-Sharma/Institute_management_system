import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentsAPI } from '../api/enrollments';
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
    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    // Mock Data (In a real app, fetch this based on courseId)
    const course = {
        id: courseId,
        title: 'Google Data Analytics',
        subtitle: 'Professional Certificate',
        description: 'Get on the fast track to a career in Data Analytics. In this program, you’ll learn in-demand skills that will have you job-ready in less than 6 months. No degree or experience required.',
        partner: 'Google',
        partnerLogo: 'https://logo.clearbit.com/google.com',
        rating: 4.8,
        reviews: '136k',
        level: 'Beginner Level',
        duration: '6 months at 10 hours a week',
        schedule: 'Flexible schedule',
        language: 'English',
        skills: ['Data Analysis', 'R Programming', 'SQL', 'Tableau', 'Data Visualization', 'Spreadsheet', 'Data Cleansing', 'Data Collection'],
        outcomes: [
            'Gain an immersive understanding of the practices and processes used by a junior or associate data analyst in their day-to-day job',
            'Learn key analytical skills (data cleaning, analysis, & visualization) and tools (spreadsheets, SQL, R programming, Tableau)',
            'Understand how to clean and organize data for analysis, and complete analysis and calculations using spreadsheets, SQL and R programming',
            'Learn how to visualize and present data findings in dashboards, presentations and commonly used visualization platforms'
        ],
        syllabus: [
            {
                title: 'Foundations: Data, Data, Everywhere',
                duration: '21 hours',
                description: 'This course will introduce you to the world of data analytics. You’ll learn about the data ecosystem, the process of data analysis, and the tools used by data analysts.'
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
        ]
    };

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setEnrolling(true);
            // Simulate API call or use real one if course exists in backend
            // await enrollmentsAPI.enrollInCourse(courseId);

            // For demo purposes, just redirect to dashboard
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Enrollment failed:', error);
        } finally {
            setEnrolling(false);
        }
    };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />            <main className="flex-grow">
            {/* Hero Section */}
            <div className="bg-[#f5f7f8] border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1">
                            {/* Breadcrumbs */}
                            <nav className="flex items-center text-sm text-gray-600 mb-6">
                                <Link to="/" className="hover:underline">Browse</Link>
                                <span className="mx-2">›</span>
                                <span className="hover:underline">Data Science</span>
                                <span className="mx-2">›</span>
                                <span className="font-semibold text-gray-900">Data Analytics</span>
                            </nav>

                            {/* Partner Logo */}
                            <div className="flex items-center gap-2 mb-6">
                                <img src={course.partnerLogo} alt={course.partner} className="h-8 w-auto" />
                                <span className="font-bold text-gray-900">{course.partner}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {course.title}
                            </h1>
                            <p className="text-xl text-gray-700 mb-6 max-w-3xl">
                                {course.description}
                            </p>

                            {/* Ratings & Stats */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 mb-8">
                                <div className="flex items-center gap-1">
                                    <div className="flex text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="font-bold text-gray-900">{course.rating}</span>
                                    <span className="text-gray-500">({course.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">{course.level}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{course.schedule}</span>
                                </div>
                            </div>

                            {/* Enroll Button (Desktop) */}
                            <div className="hidden lg:flex items-center gap-4">
                                <Button
                                    onClick={handleEnroll}
                                    className="bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-lg px-8 py-6 h-auto"
                                    disabled={enrolling}
                                >
                                    {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                                </Button>
                                <p className="text-sm text-gray-600">Starts Nov 26</p>
                            </div>
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
                    className="w-full bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-lg py-6 h-auto"
                    disabled={enrolling}
                >
                    {enrolling ? 'Enrolling...' : 'Enroll for Free'}
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
                                {course.outcomes.map((outcome, index) => (
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
                                {course.skills.map((skill, index) => (
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
                                {course.syllabus.map((item, index) => (
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
                            {course.instructors.map((instructor, index) => (
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
            </main>

            <Footer />
        </div>
    );
};

export default CourseDetails;
