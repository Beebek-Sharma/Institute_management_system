import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, Search, BookOpen, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HelpCenter = () => {
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'How do I enroll in a course?', a: 'Click on any course and select "Enroll Now". You can start immediately after enrollment.' },
        { q: 'How do I access my courses?', a: 'Go to "My Learning" or your student dashboard to see all enrolled courses.' },
        { q: 'Is there a free trial?', a: 'Many courses offer a free preview. Check individual course pages for trial options.' }
      ]
    },
    {
      category: 'Learning & Courses',
      questions: [
        { q: 'Can I download course materials?', a: 'Most courses allow you to download resources. Check the course details for availability.' },
        { q: 'How long do I have access to courses?', a: 'You typically have lifetime access to purchased courses.' },
        { q: 'Can I get a certificate?', a: 'Yes! Complete all course requirements to earn a certificate.' }
      ]
    },
    {
      category: 'Payments & Billing',
      questions: [
        { q: 'What payment methods do you accept?', a: 'We accept major credit cards and digital payment methods.' },
        { q: 'Can I get a refund?', a: 'Refunds are available within 30 days of purchase if you haven\'t completed the course.' },
        { q: 'Are there discounts available?', a: 'Check the Deals page for current promotions and discounts.' }
      ]
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-transparent">
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Help Center</h1>
            <p className="text-gray-200">Find answers to your questions</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          {/* Search Bar */}
          <div className="mb-12">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-12 pr-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a href="#" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:border-white/40 transition">
            <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Courses</h3>
            <p className="text-gray-300 text-sm">Learn about course enrollment and access</p>
          </a>
          <a href="#" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:border-white/40 transition">
            <Users className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Community</h3>
            <p className="text-gray-300 text-sm">Connect with other learners and instructors</p>
          </a>
          <a href="#" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:border-white/40 transition">
            <MessageCircle className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Support</h3>
            <p className="text-gray-300 text-sm">Contact our support team for assistance</p>
          </a>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((section, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">{section.category}</h3>
                <div className="space-y-4">
                  {section.questions.map((item, qIdx) => (
                    <div key={qIdx} className="border-l-2 border-blue-400/30 pl-4">
                      <p className="text-white font-semibold mb-1">{item.q}</p>
                      <p className="text-gray-300 text-sm">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Still need help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/contact" className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              <div>
                <h4 className="text-white font-semibold">Contact Support</h4>
                <p className="text-gray-300 text-sm">Send us a message</p>
              </div>
            </a>
            <a href="mailto:support@example.com" className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <Mail className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="text-white font-semibold">Email Us</h4>
                <p className="text-gray-300 text-sm">support@example.com</p>
              </div>
            </a>
            <a href="tel:+1234567890" className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <Phone className="w-6 h-6 text-purple-400" />
              <div>
                <h4 className="text-white font-semibold">Call Us</h4>
                <p className="text-gray-300 text-sm">+1 (234) 567-890</p>
              </div>
            </a>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HelpCenter;
