import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';

const StudentProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-200">View your profile information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-2xl">
          {/* Profile Header with Avatar */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-300 text-lg">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
          </div>

          {/* Information Grid */}
          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-1">Email</p>
                <p className="text-white text-lg">{user?.email}</p>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-start gap-4">
              <User className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-1">Username</p>
                <p className="text-white text-lg">{user?.username}</p>
              </div>
            </div>

            {/* Phone */}
            {user?.phone && (
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-300 mb-1">Phone</p>
                  <p className="text-white text-lg">{user.phone}</p>
                </div>
              </div>
            )}

            {/* Enrollment Date */}
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-1">Member Since</p>
                <p className="text-white text-lg">
                  {user?.enrollment_date 
                    ? new Date(user.enrollment_date).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-start gap-4 pt-4">
              <Award className="w-6 h-6 text-orange-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-1">Role</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  user?.role === 'admin' ? 'bg-red-500/30 text-red-200' :
                  user?.role === 'staff' ? 'bg-blue-500/30 text-blue-200' :
                  user?.role === 'instructor' ? 'bg-purple-500/30 text-purple-200' :
                  'bg-green-500/30 text-green-200'
                }`}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <button
              onClick={() => navigate('/student/settings')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;