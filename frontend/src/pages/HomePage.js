import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, GraduationCap, Lightbulb, Award } from 'lucide-react';
import { FlippingCard } from '../components/ui/flipping-card';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardLayout from '../components/DashboardLayout';
import { coursesAPI } from '../api/courses';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const allCourses = await coursesAPI.getCourses();
      setCourses(allCourses.slice(0, 4)); // Show first 4 courses
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const banners = [];
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));

  const partners = [
    { name: 'Google', logo: '🔍', isEmoji: true },
    { name: 'Microsoft', logo: '🪟', isEmoji: true },
    { name: 'Amazon', logo: '📦', isEmoji: true },
    { name: 'IBM', logo: '💼', isEmoji: true },
    { name: 'Meta', logo: '👥', isEmoji: true },
    { name: 'Apple', logo: '🍎', isEmoji: true },
  ];

  const features = [
    { title: 'Learn from experts', icon: GraduationCap, color: 'text-blue-500' },
    { title: 'Flexible learning', icon: Lightbulb, color: 'text-yellow-500' },
    { title: 'Earn certificates', icon: Award, color: 'text-green-500' },
  ];

  // Content component to avoid duplication
  const PageContent = () => (
    <div className="min-h-screen bg-transparent flex flex-col">
      {!user && <Header />}

      {/* Institute Management Banner */}
      <section className="relative py-12 px-4 bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border-b border-teal-700/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Manage Your Institute with Ease
              </h1>
              <p className="text-lg text-gray-200 mb-6">
                Streamline student enrollment, course scheduling, and academic management in one unified platform. Designed for modern educational institutions.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2"
                >
                  Get Started
                </Button>
                <Button 
                  onClick={() => navigate('/about')}
                  className="bg-transparent border-2 border-teal-400 text-teal-300 hover:bg-teal-900/20 font-semibold px-6 py-2"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl text-center text-teal-400/30">
                📚
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mt-8">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-teal-400">100%</div>
                  <p className="text-sm text-gray-300">Digital Management</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-cyan-400">24/7</div>
                  <p className="text-sm text-gray-300">Access Anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Certificates */}
      <section className="py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">Most Popular Courses</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {loadingCourses ? (
              <div className="w-full flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                  <p className="text-gray-300">Loading courses...</p>
                </div>
              </div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <FlippingCard
                  key={course.id}
                  width={300}
                  height={380}
                  frontContent={
                    <div className="flex flex-col h-full w-full">
                      <div className="relative h-40 overflow-hidden rounded-t-lg bg-gradient-to-br from-slate-700 to-slate-800">
                        {course.image_url ? (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.backgroundColor = '#1e293b';
                              e.target.alt = 'Course image unavailable';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                        )}
                        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                          Featured
                        </div>
                        {course.credits && (
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
                            <span>⭐</span> {course.credits} Credits
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1 bg-slate-900">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🎓</span>
                          <span className="text-xs text-gray-300 font-medium">{course.category || 'Course'}</span>
                        </div>
                        <h3 className="text-base font-bold mb-2 text-white line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-300 mb-3 line-clamp-2">
                          {course.description || 'Enroll now to learn more about this course'}
                        </p>
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 text-[#00a878] text-xs font-semibold mb-2">
                            <span className="border border-teal-600 bg-teal-900/30 px-2 py-0.5 rounded">
                              {course.duration_weeks ? `${course.duration_weeks} weeks` : 'Self-paced'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {course.level || 'All Levels'} • Instructor Led
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                  backContent={
                    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center bg-slate-900">
                      <div className="text-4xl mb-4">🎓</div>
                      <h3 className="text-lg font-bold mb-3 text-white">{course.title}</h3>
                      <p className="text-sm text-gray-300 mb-4">
                        {course.description || 'Expand your skills with this comprehensive course'}
                      </p>
                      <div className="space-y-2 mb-6 w-full">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Category:</span>
                          <span className="font-semibold text-white">{course.category || 'General'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Level:</span>
                          <span className="font-semibold text-white">{course.level || 'All Levels'}</span>
                        </div>
                        {course.duration_weeks && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Duration:</span>
                            <span className="font-semibold text-white">{course.duration_weeks} weeks</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="bg-[#00a878] hover:bg-[#008c65] text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors"
                      >
                        Enroll Now
                      </button>
                    </div>
                  }
                />
              ))
            ) : (
              <div className="w-full text-center py-12">
                <p className="text-gray-400">No courses available at the moment</p>
              </div>
            )}
          </div>
          {courses.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => navigate('/courses')}
                variant="outline"
                className="text-[#00a878] border-[#00a878] font-bold hover:bg-teal-900/20"
              >
                Explore All Courses →
              </Button>
            </div>
          )}
        </div>
      </section>

      {!user && <Footer />}
    </div>
  );

  // Return with or without DashboardLayout based on login status
  return user ? (
    <DashboardLayout>
      <PageContent />
    </DashboardLayout>
  ) : (
    <PageContent />
  );
}

export default HomePage;
