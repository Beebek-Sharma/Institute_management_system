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

const DashboardLayout = ({ children, disablePadding = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper to safely access localStorage
  const safeGetLocalStorage = (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch {
      return null;
    }
  };

  const safeSetLocalStorage = (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch {
      // Silently fail
    }
  };

  // Initialize from localStorage or default to expanded on first load
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const savedState = safeGetLocalStorage('sidebarExpanded');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Toggle function that also saves to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    safeSetLocalStorage('sidebarExpanded', JSON.stringify(newState));
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
              ? 'bg-gray-100 text-gray-900 font-medium shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            title={!sidebarExpanded ? item.label : ''}
          >
            <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
            {sidebarExpanded && <span className="text-sm">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <Header onMenuClick={() => {
        // On desktop: toggle sidebar expansion
        // On mobile: toggle mobile sidebar
        if (window.innerWidth >= 1024) {
          toggleSidebar();
        } else {
          setSidebarOpen(!sidebarOpen);
        }
      }} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (YouTube Style) */}
        <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-200 h-full transition-all duration-300 overflow-y-auto ${sidebarExpanded ? 'w-64' : 'w-20'
          }`}>
          {/* Navigation Links */}
          <div className="flex-1 p-4">
            <NavLinks />
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
              className="w-64 bg-white h-full shadow-2xl fixed left-0 top-0 z-40 animate-in slide-in-from-left duration-300 border-r border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4">
                <NavLinks />
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${disablePadding ? '' : 'p-4 md:p-6 lg:p-8'} bg-gray-50 overflow-y-auto h-full`}>
          <div className="w-full min-h-full flex flex-col">
            {/* Main content area */}
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;