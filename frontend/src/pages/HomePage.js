import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, GraduationCap, Lightbulb, Award } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />
      
      {/* Banner Carousel */}
      <section className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm border border-slate-700/50">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-12 transition-all duration-500 rounded-2xl ${
                  index === currentSlide ? 'block' : 'hidden'
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
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
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
          <h2 className="text-2xl font-bold text-white mb-6">Most Popular Certificates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 1,
                title: 'Google Data Analytics',
                partner: 'Google',
                logo: '🔍',
                image:
                  'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/f4/b434709c0011e8a93259b6284d1f2e/Google-Data-Analytics.png?auto=format%2Ccompress&dpr=1',
                label: 'Professional Certificate',
              },
              {
                id: 2,
                title: 'Google Project Management',
                partner: 'Google',
                logo: '📊',
                image:
                  'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/d4/6347209c0011e8a93259b6284d1f2e/Google-Project-Management.png?auto=format%2Ccompress&dpr=1',
                label: 'Professional Certificate',
              },
              {
                id: 3,
                title: 'Google IT Support',
                partner: 'Google',
                logo: '💻',
                image:
                  'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/83/e258e0532611e5a5072321239ff4d4/Google-IT-Support.png?auto=format%2Ccompress&dpr=1',
                label: 'Professional Certificate',
              },
              {
                id: 4,
                title: 'Google UX Design',
                partner: 'Google',
                logo: '🎨',
                image:
                  'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/93/0115a0532611e5a5072321239ff4d4/Google-UX-Design.png?auto=format%2Ccompress&dpr=1',
                label: 'Professional Certificate',
              },
            ].map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="group cursor-pointer flex flex-col bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow hover:bg-slate-800"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                      e.target.alt = 'Course image unavailable';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                    Free Trial
                  </div>
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
                    <span>✨</span> AI skills
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {typeof course.logo === 'string' && course.logo.startsWith('http') ? (
                      <img src={course.logo} alt={course.partner} className="h-5 w-5 object-contain" />
                    ) : (
                      <span className="text-lg">{course.logo}</span>
                    )}
                    <span className="text-xs text-gray-300 font-medium">{course.partner}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#00a878] group-hover:underline">
                    {course.title}
                  </h3>
                  <div className="mt-auto pt-4">
                    <div className="flex items-center gap-2 text-[#00a878] text-xs font-semibold mb-1">
                      <span className="border border-teal-600 bg-teal-900/30 px-1 rounded">Build toward a degree</span>
                    </div>
                    <p className="text-xs text-gray-400">{course.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button variant="outline" className="text-[#00a878] border-[#00a878] font-bold hover:bg-teal-900/20">
              Show 8 more
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
