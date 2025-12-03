import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BookOpen, Users, UserPlus } from 'lucide-react';

const StaffDashboard = () => {
    const { user } = useAuth();

    const stats = [
        {
            title: "Manage Courses",
            value: "Assign Instructors",
            icon: BookOpen,
            link: "/staff/courses",
            color: "text-blue-600"
        },
        {
            title: "Manage Enrollments",
            value: "Assign Students",
            icon: Users,
            link: "/staff/enrollments",
            color: "text-green-600"
        },
        {
            title: "Students",
            value: "View All Students",
            icon: Users,
            link: "/staff/students",
            color: "text-orange-600"
        },
        {
            title: "Instructors",
            value: "View All Instructors",
            icon: Users,
            link: "/staff/instructors",
            color: "text-purple-600"
        }
    ];

    return (
        <DashboardLayout title="Staff Dashboard" user={user}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default StaffDashboard;
