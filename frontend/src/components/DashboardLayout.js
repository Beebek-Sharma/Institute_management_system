import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import Header from './Header';
import Footer from './Footer';
import {
  LayoutDashboard,
  BookOpen,
  User,
  CreditCard,
  Award,
  Users,
  Menu,
  X,
  Calendar,
  Bell,
  ClipboardCheck
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize from localStorage or default to expanded on first load
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Toggle function that also saves to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    localStorage.setItem('sidebarExpanded', JSON.stringify(newState));
  };

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: BookOpen, label: 'Courses', path: '/student/courses' },
          { icon: Award, label: 'My Enrollments', path: '/student/enrollments' },
          { icon: CreditCard, label: 'Payments', path: '/student/payments' },
          { icon: ClipboardCheck, label: 'Attendance', path: '/student/attendance' },
          { icon: Calendar, label: 'Schedule', path: '/student/schedule' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      case 'instructor':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor/dashboard' },
          { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
          { icon: Users, label: 'Students', path: '/instructor/students' },
          { icon: ClipboardCheck, label: 'Attendance', path: '/instructor/attendance' },
          { icon: Calendar, label: 'Schedule', path: '/instructor/schedule' },
          { icon: Award, label: 'Enrollments', path: '/instructor/enrollments' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      case 'staff':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard' },
          { icon: BookOpen, label: 'Courses', path: '/staff/courses' },
          { icon: Users, label: 'Enrollments', path: '/staff/enrollments' },
          { icon: CreditCard, label: 'Payments', path: '/staff/payments' },
          { icon: ClipboardCheck, label: 'Attendance', path: '/staff/attendance' },
          { icon: Users, label: 'Students', path: '/staff/students' },
          { icon: Users, label: 'Instructors', path: '/staff/instructors' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
          { icon: Users, label: 'Students', path: '/admin/students' },
          { icon: Users, label: 'Instructors', path: '/admin/instructors' },
          { icon: Award, label: 'Enrollments', path: '/admin/enrollments' },
          { icon: CreditCard, label: 'Fees', path: '/admin/fees' },
          { icon: Calendar, label: 'Schedules', path: '/admin/schedules' },
          { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const NavLinks = () => (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => {
              setSidebarOpen(false);
            }}
            className={`flex items-center ${sidebarExpanded ? 'gap-6 px-4' : 'justify-center px-0'} py-3 rounded-lg transition-all duration-200 ${isActive
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
              : 'text-gray-200 hover:bg-slate-800/50'
              }`}
            title={!sidebarExpanded ? item.label : ''}
          >
            <Icon className="w-6 h-6 flex-shrink-0" />
            {sidebarExpanded && <span className="font-medium text-sm">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header onMenuClick={() => {
        // On desktop: toggle sidebar expansion
        // On mobile: toggle mobile sidebar
        if (window.innerWidth >= 1024) {
          toggleSidebar();
        } else {
          setSidebarOpen(!sidebarOpen);
        }
      }} />

      <div className="flex flex-1">
        {/* Sidebar - Desktop (YouTube Style) */}
        <aside className={`hidden lg:flex flex-col bg-slate-900/40 backdrop-blur-md border-r border-slate-700/30 min-h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 overflow-hidden ${sidebarExpanded ? 'w-64' : 'w-20'
          }`}>
          {/* Navigation Links */}
          <div className="flex-1 p-4 overflow-y-auto">
            <NavLinks />
          </div>
          
          {/* Collapse/Expand Button */}
          <div className="border-t border-slate-700/30 p-4 flex-shrink-0">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-3 hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer active:bg-slate-700/50"
              title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              type="button"
            >
              <span className="text-gray-300 text-lg font-bold">
                {sidebarExpanded ? '◀' : '▶'}
              </span>
            </button>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            role="button"
            tabIndex="0"
            aria-label="Close sidebar"
          >
            <aside
              className="w-64 bg-slate-900/95 backdrop-blur-md h-full shadow-2xl fixed left-0 top-0 z-40 animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
              <div className="p-4">
                <NavLinks />
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-transparent">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;