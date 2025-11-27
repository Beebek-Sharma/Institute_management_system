import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Target, Zap, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Quality Education',
      description: 'We provide high-quality education programs designed for the modern world.',
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Learn from industry-experienced professionals dedicated to your success.',
    },
    {
      icon: Zap,
      title: 'Innovative Learning',
      description: 'Cutting-edge curriculum and teaching methods for effective learning.',
    },
    {
      icon: Award,
      title: 'Recognized Certificates',
      description: 'Earn credentials recognized by leading organizations worldwide.',
    },
  ];

  const stats = [
    { number: '5000+', label: 'Students Trained' },
    { number: '50+', label: 'Courses Offered' },
    { number: '100+', label: 'Expert Instructors' },
    { number: '15+', label: 'Years Experience' },
  ];

  const team = [
    { name: 'Dr. Ramesh Sharma', role: 'Founder & Director', bio: 'PhD in Education with 20+ years of experience' },
    { name: 'Prof. Priya Patel', role: 'Academic Head', bio: 'M.Tech in Computer Science, published researcher' },
    { name: 'Ajay Kumar', role: 'Operations Manager', bio: 'MBA, expert in institutional management' },
    { name: 'Neha Singh', role: 'Head of Student Affairs', bio: 'M.A in Social Sciences, student advocate' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-blue-100">
              Building excellence in education since 2010
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Mission</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We are committed to providing accessible, high-quality education that empowers 
                  individuals to achieve their goals and contribute meaningfully to society. Our 
                  mission is to create an inclusive learning environment where every student can 
                  thrive and develop skills for success in their chosen careers.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Vision</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To become the leading educational institution in South Asia, recognized for 
                  academic excellence, innovative teaching methodologies, and the success of our 
                  graduates. We envision a future where quality education is accessible to all, 
                  and where our graduates lead with integrity and excellence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">By The Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-lg bg-gray-50 hover:bg-blue-50 transition">
                    <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                  <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div className="p-6 -mt-16 relative">
                    <div className="w-16 h-16 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-white font-bold text-xl mb-4">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 text-center font-semibold mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600 text-center">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-gray-900">Why Choose Us?</h2>
            <div className="space-y-4">
              {[
                'Expert faculty with industry experience and academic credentials',
                'State-of-the-art facilities and modern learning infrastructure',
                'Flexible scheduling to accommodate working professionals',
                'Placement assistance and career development support',
                'Strong alumni network across leading organizations',
                'Continuous skill development and professional growth',
              ].map((reason, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <p className="text-gray-600 text-lg">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
