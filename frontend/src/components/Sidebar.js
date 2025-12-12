import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-md">
        <CardHeader>
          <CardTitle className="text-base text-white">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Active Courses</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Pending Tasks</p>
            <p className="text-2xl font-bold text-teal-500">0</p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-md">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-400">
            <p className="text-sm">No upcoming events</p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="bg-gradient-to-br from-amber-900 to-amber-950 border-amber-700 shadow-md">
        <CardHeader>
          <CardTitle className="text-base text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-amber-100/80">
            Keep track of important announcements and deadlines here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
