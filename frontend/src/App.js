import React, { useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";

// Pages
import HomePage from "./pages/HomePage";
import CourseDetails from "./pages/CourseDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentEnrollments from "./pages/student/StudentEnrollments";
import StudentPayments from "./pages/student/StudentPayments";
import StudentProfile from "./pages/student/StudentProfile";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorEnrollments from "./pages/instructor/InstructorEnrollments";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffCourses from "./pages/staff/StaffCourses";
import StaffEnrollments from "./pages/staff/StaffEnrollments";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const vantaRef = useRef(null);

  useEffect(() => {
    if (window.VANTA && window.VANTA.CELLS && vantaRef.current) {
      const vantaEffect = window.VANTA.CELLS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        scale: 1.0,
        color1: 0x00a878,
        color2: 0x0d3b3b,
        backgroundColor: 0x001a1a,
        speed: 0.8,
        size: 1.2,
      });
      return () => {
        if (vantaEffect) vantaEffect.destroy();
      };
    }
  }, []);

  return (
    <AuthProvider>
      <div className="App relative">
        <div 
          ref={vantaRef}
          className="fixed inset-0 z-0"
          style={{ minHeight: '100vh' }}
        ></div>
        <div className="relative z-10">
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/search" element={<Search />} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/enrollments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentEnrollments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/payments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/enrollments"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorEnrollments />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/courses"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/enrollments"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffEnrollments />
                </ProtectedRoute>
              }
            />

            {/* Catch all - 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
