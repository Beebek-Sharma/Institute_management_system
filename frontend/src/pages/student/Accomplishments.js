import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Award, Trophy, Target, Zap } from 'lucide-react';

const Accomplishments = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [accomplishments] = useState([
    {
      id: 1,
      title: 'Course Completer',
      description: 'Complete your first course',
      icon: Trophy,
      completed: false,
      progress: 0
    },
    {
      id: 2,
      title: 'Fast Learner',
      description: 'Complete 3 courses in 1 month',
      icon: Zap,
      completed: false,
      progress: 0
    },
    {
      id: 3,
      title: 'Expert Achiever',
      description: 'Complete 10 courses',
      icon: Target,
      completed: false,
      progress: 0
    },
    {
      id: 4,
      title: 'Certificate Holder',
      description: 'Earn a certificate in any course',
      icon: Award,
      completed: false,
      progress: 0
    }
  ]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user?.role !== 'student') {
        navigate('/unauthorized');
      }
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-gray-900">Accomplishments</h1>
          </div>
          <p className="text-gray-900">Track your achievements and progress</p>
        </div>

        {/* Accomplishments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accomplishments.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    achievement.completed
                      ? 'bg-yellow-500/30'
                      : 'bg-gray-600/30'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      achievement.completed ? 'text-yellow-400' : 'text-gray-700'
                    }`} />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-gray-700 text-sm mb-4">{achievement.description}</p>
                  <div className="w-full bg-gray-600/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-700 text-xs mt-2">{achievement.progress}% Complete</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
            <div className="text-gray-700 text-sm font-semibold mb-2">Total Achievements</div>
            <div className="text-4xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
            <div className="text-gray-700 text-sm font-semibold mb-2">Completed Courses</div>
            <div className="text-4xl font-bold text-green-400">0</div>
          </div>
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
            <div className="text-gray-700 text-sm font-semibold mb-2">Certificates Earned</div>
            <div className="text-4xl font-bold text-yellow-400">0</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Accomplishments;
