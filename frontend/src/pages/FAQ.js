import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const faqCategories = [
    {
      category: 'General',
      faqs: [
        {
          question: 'What is the Physical Institute Management System?',
          answer:
            'The Physical Institute Management System is a comprehensive platform designed to streamline all administrative and educational operations for physical educational institutions. It helps manage courses, batches, enrollments, attendance, payments, and more.',
        },
        {
          question: 'Who can use this system?',
          answer:
            'The system is designed for students, instructors, staff, and administrators. Each role has specific access and capabilities tailored to their responsibilities.',
        },
        {
          question: 'Is the system mobile-friendly?',
          answer:
            'Yes, the system is fully responsive and works seamlessly on mobile devices, tablets, and desktops.',
        },
        {
          question: 'Do I need any special software to use the system?',
          answer:
            "No, the system is web-based and requires only an internet browser. No additional software installation is needed.",
        },
      ],
    },
    {
      category: 'Enrollment & Courses',
      faqs: [
        {
          question: 'How do I enroll in a course?',
          answer:
            'As a student, navigate to the "Browse Courses" section, select a course, and click the "Enroll" button. You may need to make a payment to complete the enrollment.',
        },
        {
          question: 'Can I enroll in multiple courses at the same time?',
          answer:
            'Yes, you can enroll in multiple courses simultaneously. However, check the class schedule to ensure there are no time conflicts.',
        },
        {
          question: 'What happens if I want to drop a course?',
          answer:
            'You can drop a course through your dashboard. Depending on the institute policy and timing, you may be eligible for a refund.',
        },
        {
          question: 'Are there any prerequisites for courses?',
          answer:
            'Some courses may have prerequisites. These are clearly listed in the course description. Check the course details before enrolling.',
        },
        {
          question: 'How long do courses typically run?',
          answer:
            'Course duration varies. Most courses run for 8-16 weeks, but this can vary. Check the course details for specific duration information.',
        },
      ],
    },
    {
      category: 'Payments',
      faqs: [
        {
          question: 'What payment methods are accepted?',
          answer:
            'We accept multiple payment methods including Esewa, Khalti, PhonePay, Bank Transfer, and Cash payment options.',
        },
        {
          question: 'Is the payment system secure?',
          answer:
            'Yes, our payment system uses industry-standard encryption and security protocols to protect your financial information.',
        },
        {
          question: 'When should I make the payment?',
          answer:
            'Payment should be completed before or during the course enrollment process. Some batches may have specific payment deadlines.',
        },
        {
          question: 'Can I get a refund after payment?',
          answer:
            'Refund policies vary by course. Generally, refunds are available if requested within the first 7 days of enrollment, minus any administrative fees.',
        },
        {
          question: 'How can I check my payment status?',
          answer:
            'You can view your payment history and status in the "Payments" section of your student dashboard.',
        },
      ],
    },
    {
      category: 'Attendance & Grades',
      faqs: [
        {
          question: 'How is attendance tracked?',
          answer:
            'Instructors mark attendance for each class session. Students can view their attendance records in the student dashboard.',
        },
        {
          question: 'What is the attendance requirement?',
          answer:
            'Most courses require a minimum of 75% attendance. Check the course syllabus for specific requirements. Poor attendance may affect your grades.',
        },
        {
          question: 'When will I receive my grades?',
          answer:
            'Grades are typically released within 2-3 weeks after the course ends. You can view them in your student dashboard.',
        },
        {
          question: 'Can I see my grades before the course ends?',
          answer:
            'Instructors may release partial grades or progress reports during the course. Check with your instructor for details.',
        },
        {
          question: 'How are grades calculated?',
          answer:
            'Grades are calculated based on various assessments including participation, assignments, quizzes, and final exams. The exact weightage is provided in the course syllabus.',
        },
      ],
    },
    {
      category: 'Technical Support',
      faqs: [
        {
          question: 'I forgot my password. How can I reset it?',
          answer:
            'Click on "Forgot Password" on the login page. Enter your email address, and we\'ll send you a password reset link.',
        },
        {
          question: 'What should I do if I cannot log in?',
          answer:
            'First, check that you\'re using the correct email and password. If the issue persists, contact our support team at support@institute.edu.np.',
        },
        {
          question: 'The system is running slowly. What can I do?',
          answer:
            'Try clearing your browser cache, disabling browser extensions, or using a different browser. If the issue continues, contact our support team.',
        },
        {
          question: 'I\'m having trouble with notifications. What should I do?',
          answer:
            'Check your notification preferences in the settings. Ensure that notifications are enabled in your browser settings.',
        },
        {
          question: 'How do I contact technical support?',
          answer:
            'You can reach our support team via email at support@institute.edu.np or call +977-1-4123456 during business hours.',
        },
      ],
    },
    {
      category: 'Instructors & Staff',
      faqs: [
        {
          question: 'How do I mark attendance for my class?',
          answer:
            'Instructors can mark attendance in the "Attendance" section of their dashboard. Select the class date and mark each student\'s attendance status.',
        },
        {
          question: 'Can I view my class roster?',
          answer:
            'Yes, you can view your class roster with all enrolled students in the "Enrollments" section of your instructor dashboard.',
        },
        {
          question: 'How do I upload grades?',
          answer:
            'Staff can use the "Grades" section in their dashboard to upload grades. Use the provided template or upload manually.',
        },
        {
          question: 'Can I send announcements to my students?',
          answer:
            'Yes, use the "Notifications" feature to send announcements to your class. Students will receive notifications in the system.',
        },
        {
          question: 'How do I manage course materials?',
          answer:
            'You can upload course materials, syllabus, and resources in the "Course Materials" section of your instructor dashboard.',
        },
      ],
    },
    {
      category: 'Certificates',
      faqs: [
        {
          question: 'Will I receive a certificate after completing a course?',
          answer:
            'Yes, upon successful completion of the course (meeting attendance and grade requirements), you\'ll receive a certificate of completion.',
        },
        {
          question: 'How do I download my certificate?',
          answer:
            'Once your course is completed and grades are finalized, you can download your certificate from the "Certificates" section in your dashboard.',
        },
        {
          question: 'Are the certificates recognized by employers?',
          answer:
            'Yes, our certificates are recognized by leading organizations and employers. They represent verified completion of the course.',
        },
        {
          question: 'Can I request a duplicate certificate?',
          answer:
            'Yes, you can request a duplicate certificate from the "Certificates" section. Please contact support for any special requests.',
        },
      ],
    },
  ];

  const FAQAccordion = ({ faqs }) => (
    <div className="space-y-4">
      {faqs.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setExpandedIndex(expandedIndex === index ? -1 : index)
            }
            className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition flex justify-between items-center"
          >
            <span>{item.question}</span>
            {expandedIndex === index ? (
              <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </button>
          {expandedIndex === index && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100">
              Find answers to common questions about our platform
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search/Info */}
            <div className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700">
                Can't find the answer you're looking for? Contact our support team at{' '}
                <a href="mailto:support@institute.edu.np" className="text-blue-600 font-semibold hover:text-blue-700">
                  support@institute.edu.np
                </a>{' '}
                or call{' '}
                <a href="tel:+977-1-4123456" className="text-blue-600 font-semibold hover:text-blue-700">
                  +977-1-4123456
                </a>
              </p>
            </div>

            {/* FAQ by Category */}
            <div className="space-y-12">
              {faqCategories.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-3xl font-bold text-gray-900">{section.category}</h2>
                  </div>
                  <FAQAccordion faqs={section.faqs} />
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-center border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help. Don't hesitate to reach out!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Contact Us
                </a>
                <a
                  href="mailto:support@institute.edu.np"
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
