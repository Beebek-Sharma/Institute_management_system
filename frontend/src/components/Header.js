import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExploreDropdown from "./ui/ExploreDropdown";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, LogOut, Settings, Award, ShoppingBag, User, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coursesAPI } from "../api/courses";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const exploreTimeout = useRef();
  const profileTimeout = useRef();

  const handleExploreEnter = () => {
    clearTimeout(exploreTimeout.current);
    setExploreOpen(true);
  };
  const handleExploreLeave = () => {
    exploreTimeout.current = setTimeout(() => setExploreOpen(false), 120);
  };

  const handleProfileEnter = () => {
    clearTimeout(profileTimeout.current);
    setProfileOpen(true);
  };
  const handleProfileLeave = () => {
    profileTimeout.current = setTimeout(() => setProfileOpen(false), 120);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      try {
        const courses = await coursesAPI.getCourses();
        const results = courses.filter(course =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery("");
      } catch (error) {
        console.error("Search error:", error);
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery("");
      }
    }
  };

  return (
    <header className="bg-transparent backdrop-blur-md border-b border-slate-700/30 sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between h-14 max-w-full mx-auto px-6">
        {/* Left Side: Hamburger + Logo + Nav + Search */}
        <div className="flex items-center gap-6 flex-1">
          {/* Hamburger Menu + Logo */}
          <div className="flex items-center gap-4">
            {user && onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                title="Toggle sidebar"
              >
                <Menu className="w-6 h-6 text-gray-200" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Lunar IT Solution" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Center Nav */}
          <nav className="flex items-center gap-2">
            <div
              className="relative"
              onMouseEnter={handleExploreEnter}
              onMouseLeave={handleExploreLeave}
              style={{ display: "inline-block" }}
            >
              <button className="text-base font-medium text-gray-200 hover:text-[#00a878] px-3 py-2 flex items-center gap-1 focus:outline-none">
                Explore <span className="ml-1">▾</span>
              </button>
              <ExploreDropdown open={exploreOpen} />
            </div>
            <Link to="/my-learning" className="text-base font-medium text-gray-200 hover:text-[#00a878] px-3 py-2">
              My Learning
            </Link>
            <Link to="/degrees" className="text-base font-medium text-gray-200 hover:text-[#00a878] px-3 py-2">
              Degrees
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="What do you want to learn?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-10 pr-4 h-10 bg-slate-800 border-slate-600 text-white placeholder-gray-400 rounded-full focus:border-[#00a878] focus:ring-1 focus:ring-[#00a878]"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Notifications + Dashboard + Profile */}
        <div className="flex items-center gap-4">
          <button className="rounded-full hover:bg-slate-800/50 p-2 text-gray-400 transition-colors">
            <span role="img" aria-label="bell">🔔</span>
          </button>
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  switch (user.role) {
                    case "student":
                      navigate("/student/dashboard");
                      break;
                    case "instructor":
                      navigate("/instructor/dashboard");
                      break;
                    case "admin":
                      navigate("/admin/dashboard");
                      break;
                    case "staff":
                      navigate("/staff/dashboard");
                      break;
                    default:
                      break;
                  }
                }}
                className="text-base font-medium text-gray-200 hover:text-[#00a878]"
              >
                Dashboard
              </Button>
              {/* Profile Menu */}
              <div
                className="relative"
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button className="w-8 h-8 rounded-full bg-[#0056D2] text-white flex items-center justify-center font-bold text-base hover:bg-[#00419e] transition">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/student/profile');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>

                    {user?.role === 'student' && (
                      <button
                        onClick={() => {
                          navigate('/student/my-purchases');
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        My Purchases
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigate('/student/settings');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    {user?.role === 'student' && (
                      <button
                        onClick={() => {
                          navigate('/student/accomplishments');
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        Accomplishments
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigate('/help-center');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Help Center
                    </button>

                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="text-base font-medium border-[#0056D2] text-[#0056D2] hover:bg-blue-50"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="text-base font-medium bg-[#0056D2] hover:bg-[#00419e] text-white"
              >
                Join for Free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
