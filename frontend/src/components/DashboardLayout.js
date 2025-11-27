import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Header from './Header';
import Footer from './Footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  LayoutDashboard,
  BookOpen,
  User,
  CreditCard,
  Award,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: BookOpen, label: 'Courses', path: '/student/courses' },
          { icon: Award, label: 'My Enrollments', path: '/student/enrollments' },
          { icon: CreditCard, label: 'Payments', path: '/student/payments' },
          { icon: User, label: 'Profile', path: '/student/profile' },
        ];
      case 'instructor':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor/dashboard' },
          { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
          { icon: Users, label: 'Enrollments', path: '/instructor/enrollments' },
        ];
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
          { icon: Users, label: 'Students', path: '/admin/students' },
          { icon: Users, label: 'Instructors', path: '/admin/instructors' },
          { icon: Award, label: 'Enrollments', path: '/admin/enrollments' },
          { icon: CreditCard, label: 'Fees', path: '/admin/fees' },
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                : 'text-gray-200 hover:bg-slate-800/50'
              }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />
      
      {/* Mobile Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed bottom-6 right-6 z-40 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>
      
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-slate-900/40 backdrop-blur-md border-r border-slate-700/30 min-h-[calc(100vh-64px)] sticky top-16 transition-all duration-300">
          <div className="p-4">
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