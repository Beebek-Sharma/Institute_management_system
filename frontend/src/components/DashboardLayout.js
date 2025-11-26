import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/lunar-logo.png"
                alt="Lunar IT Solution"
                className="h-12 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Lunar IT Solution</h1>
                <p className="text-xs text-gray-500">Institute Management System</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-teal-500">
                    <AvatarImage src={user?.photo} alt={user?.first_name} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-600 text-white">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === 'student' && (
                  <DropdownMenuItem onClick={() => navigate('/student/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <div className="p-4">
            <NavLinks />
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <aside className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <NavLinks />
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;