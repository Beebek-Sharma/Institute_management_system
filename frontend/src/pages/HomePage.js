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

  const banners = [
    {
      id: 1,
      title: 'Build any skill with Black Friday savings',
      subtitle: 'Join today and tap into 10,000+ programs from Google, Adobe, IBM, Microsoft, and more.',
      cta: 'Save on Coursera Plus',
      discount: 'Save 40%',
      bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
      textColor: 'text-white',
    },
  ];
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

      {/* Banner Carousel */}
      <section className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm border border-slate-700/50">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-12 transition-all duration-500 rounded-2xl ${index === currentSlide ? 'block' : 'hidden'
                  }`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4">{banner.title}</h2>
                    {banner.subtitle && <p className="text-base md:text-lg mb-6 text-gray-200">{banner.subtitle}</p>}
                    <Button className="bg-white text-slate-900 hover:bg-gray-100 font-bold px-6">
                      {banner.cta} →
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl md:text-7xl font-bold text-white">{banner.discount}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-20"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-20"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                />
              ))}
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
