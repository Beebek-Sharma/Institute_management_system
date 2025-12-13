import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, GraduationCap, Lightbulb, Award } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardLayout from '../components/DashboardLayout';
import axios from '../api/axios';
import Loader from '../components/Loader';

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
      const response = await axios.get('/api/courses/');
      setCourses(response.data.slice(0, 6)); // Show first 6 courses
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const banners = [
    {
      id: 1,
      title: 'Welcome to Institute Management System',
      subtitle: 'Streamline your educational institution with our comprehensive course and enrollment management platform.',
      cta: 'Explore Courses',
      discount: '📚',
    },
    {
      id: 2,
      title: 'Enroll Today',
      subtitle: 'Join thousands of students advancing their careers through quality education and professional courses.',
      cta: 'Browse Courses',
      discount: '🎓',
    },
    {
      id: 3,
      title: 'Expert Instructors',
      subtitle: 'Learn from experienced professionals and industry experts in your field of interest.',
      cta: 'View Instructors',
      discount: '👨‍🏫',
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900/95 to-teal-800/95 backdrop-blur-sm border border-teal-700/50 shadow-2xl">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`bg-gradient-to-br from-teal-900 to-teal-800 text-white p-8 md:p-16 transition-all duration-700 rounded-2xl ${index === currentSlide ? 'block animate-fadeIn' : 'hidden'
                  }`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">{banner.title}</h2>
                    {banner.subtitle && (
                      <p className="text-base md:text-lg mb-6 text-teal-700">{banner.subtitle}</p>
                    )}
                    <Button
                      onClick={() => {
                        if (user && user.id) {
                          navigate('/student/courses');
                        } else {
                          navigate('/login');
                        }
                      }}
                      className="bg-white text-teal-900 hover:bg-teal-50 font-bold px-8 py-2 rounded-lg transition-colors"
                    >
                      {banner.cta} →
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl md:text-8xl mb-4">{banner.discount}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-20 transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-teal-900" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-20 transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-teal-900" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white0'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Courses</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {loadingCourses ? (
              <div className="w-full flex justify-center items-center py-12">
                <Loader />
              </div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="w-full text-center py-12">
                <p className="text-gray-700">No courses available at the moment</p>
              </div>
            )}
          </div>
          {courses.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => {
                  if (user && user.id) {
                    navigate('/student/courses');
                  } else {
                    navigate('/login');
                  }
                }}
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
};

export default HomePage;
