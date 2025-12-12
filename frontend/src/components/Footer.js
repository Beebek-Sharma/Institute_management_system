import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  const courses = [
    { name: 'Web Development', path: '/' },
    { name: 'Data Science', path: '/' },
    { name: 'Business', path: '/' },
    { name: 'Design', path: '/' },
  ];

  const company = [
    { name: 'About Us', path: '/about' },
    { name: 'Blog', path: '/' },
    { name: 'Careers', path: '/' },
    { name: 'Press', path: '/' },
  ];

  const legal = [
    { name: 'Privacy Policy', path: '/' },
    { name: 'Terms of Service', path: '/' },
    { name: 'Cookie Policy', path: '/' },
    { name: 'Accessibility', path: '/' },
  ];

  return (
    <footer className="bg-white text-gray-600 mt-16 border-t border-gray-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">I</span>
              </div>
              <span className="text-gray-900 font-bold text-lg">Institute</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Empowering education through innovative learning solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-gray-500 hover:text-gray-900 transition"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4">Courses</h3>
            <ul className="space-y-2">
              {courses.map((course) => (
                <li key={course.name}>
                  <button
                    onClick={() => navigate(course.path)}
                    className="text-sm text-gray-500 hover:text-gray-900 transition"
                  >
                    {course.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-sm text-gray-500 hover:text-gray-900 transition"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Kathmandu, Nepal
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  +977-1-4123456
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@institute.edu.np"
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  info@institute.edu.np
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; 2025 Physical Institute Management System. All rights reserved.
          </p>
          <div className="flex gap-6">
            {legal.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="text-sm text-gray-500 hover:text-gray-900 transition"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
