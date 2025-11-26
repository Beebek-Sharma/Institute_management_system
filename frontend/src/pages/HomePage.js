import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, ChevronLeft, ChevronRight, Tent, Lightbulb, GraduationCap } from 'lucide-react';

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
            badge: 'BLACK FRIDAY SALE',
        },
        {
            id: 2,
            title: 'Train your team in top skills and join 4,500+ teams worldwide',
            subtitle: '',
            cta: 'Save 40% off team training',
            discount: '40% off team training',
            bgColor: 'bg-gradient-to-br from-blue-900 to-blue-700',
            textColor: 'text-white',
            badge: 'FOR BUSINESS',
        },
    ];

    const features = [
        {
            icon: Tent,
            title: 'Launch a new career',
            color: 'text-blue-600',
        },
        {
            icon: Lightbulb,
            title: 'Gain in-demand skills',
            color: 'text-blue-600',
        },
        {
            icon: GraduationCap,
            title: 'Earn a degree',
            color: 'text-blue-600',
        },
    ];

    const partners = [
        { name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
        { name: 'DeepLearning.AI', logo: 'https://logo.clearbit.com/deeplearning.ai' },
        { name: 'Stanford University', logo: 'https://logo.clearbit.com/stanford.edu' },
        { name: 'IBM', logo: 'https://logo.clearbit.com/ibm.com' },
        { name: 'University of Pennsylvania', logo: 'https://logo.clearbit.com/upenn.edu' },
        { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
        { name: 'University of Michigan', logo: 'https://logo.clearbit.com/umich.edu' },
        { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com' },
        { name: 'Adobe', logo: 'https://logo.clearbit.com/adobe.com' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Navigation */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/lunar-logo.png" alt="Lunar IT Solution" className="h-10 w-auto" />
                                <span className="text-xl font-bold text-[#0056D2] hidden sm:block">Lunar IT</span>
                            </Link>
                            <nav className="hidden md:flex items-center gap-6">
                                <button className="text-sm text-gray-700 hover:text-[#0056D2] font-medium">
                                    Explore ▾
                                </button>
                                <Link to="/degrees" className="text-sm text-gray-700 hover:text-[#0056D2] font-medium">
                                    Degrees
                                </Link>
                            </nav>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden lg:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder="What do you want to learn?"
                                    className="w-full pl-10 pr-4 h-10 border-gray-300 rounded-full focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2]"
                                />
                            </div>
                        </div>

                        {/* Auth Buttons / User Menu */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            switch (user.role) {
                                                case 'student':
                                                    navigate('/student/dashboard');
                                                    break;
                                                case 'instructor':
                                                    navigate('/instructor/dashboard');
                                                    break;
                                                case 'admin':
                                                    navigate('/admin/dashboard');
                                                    break;
                                                case 'staff':
                                                    navigate('/staff/dashboard');
                                                    break;
                                                default:
                                                    break;
                                            }
                                        }}
                                        className="text-sm font-medium text-gray-700 hover:text-[#0056D2]"
                                    >
                                        Dashboard
                                    </Button>
                                    <div className="w-8 h-8 rounded-full bg-[#0056D2] text-white flex items-center justify-center font-bold text-sm">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/login')}
                                        className="text-sm font-medium border-[#0056D2] text-[#0056D2] hover:bg-blue-50"
                                    >
                                        Log In
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/register')}
                                        className="text-sm font-medium bg-[#0056D2] hover:bg-[#00419e] text-white"
                                    >
                                        Join for Free
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Banner Carousel */}
            <section className="relative bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`${banner.bgColor} ${banner.textColor} p-8 md:p-12 transition-all duration-500 ${index === currentSlide ? 'block' : 'hidden'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex-1">
                                        {banner.badge && (
                                            <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm mb-4">
                                                {banner.badge}
                                            </div>
                                        )}
                                        <h2 className="text-3xl md:text-4xl font-bold mb-4">{banner.title}</h2>
                                        {banner.subtitle && <p className="text-lg mb-6">{banner.subtitle}</p>}
                                        <Button className="bg-white text-[#0056D2] hover:bg-gray-100 font-bold px-6">
                                            {banner.cta} →
                                        </Button>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-6xl md:text-8xl font-bold">{banner.discount}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-800" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
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

            {/* Feature Cards */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex flex-col items-center text-center p-6 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="mb-4">
                                        <Icon className={`w-16 h-16 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Partner Logos */}
            <section className="py-12 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-center text-lg font-semibold text-gray-900 mb-8">
                        Learn from 350+ leading universities and companies
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {partners.map((partner, index) => (
                            <div key={index} className="flex items-center justify-center h-12 grayscale hover:grayscale-0 transition-all">
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-8 object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">{partner.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
