import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";

// Public Pages
import HomePage from "./pages/HomePage";
import CourseDetails from "./pages/CourseDetails";
import CourseraAuth from "./pages/CourseraAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import HelpCenter from "./pages/HelpCenter";
import Profile from "./pages/Profile";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCourseLearning from "./pages/student/StudentCourseLearning";
import StudentEnrollments from "./pages/student/StudentEnrollments";
import StudentPayments from "./pages/student/StudentPayments";
import StudentProfile from "./pages/student/StudentProfile";
import MyPurchases from "./pages/student/MyPurchases";
import Settings from "./pages/student/Settings";
import Accomplishments from "./pages/student/Accomplishments";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentWaitlists from "./pages/student/StudentWaitlists";
import StudentScholarships from "./pages/student/StudentScholarships";
import StudentPaymentPlans from "./pages/student/StudentPaymentPlans";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentProgress from "./pages/student/StudentProgress";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorEnrollments from "./pages/instructor/InstructorEnrollments";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import InstructorAttendance from "./pages/instructor/InstructorAttendance";
import InstructorSchedule from "./pages/instructor/InstructorSchedule";
import InstructorAssignments from "./pages/instructor/InstructorAssignments";
import InstructorExams from "./pages/instructor/InstructorExams";

// Admin & Staff Management Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminInstructors from "./pages/admin/AdminInstructors";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminFees from "./pages/admin/AdminFees";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminWaitlists from "./pages/admin/AdminWaitlists";
import BulkEnroll from "./pages/admin/BulkEnroll";
import BulkImport from "./pages/admin/BulkImport";
import AdminScholarships from "./pages/admin/AdminScholarships";
import AdminPaymentPlans from "./pages/admin/AdminPaymentPlans";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffCourses from "./pages/staff/StaffCourses";
import StaffEnrollments from "./pages/staff/StaffEnrollments";
import StaffPayments from "./pages/staff/StaffPayments";
import StaffAttendance from "./pages/staff/StaffAttendance";
import StaffCreateInstructor from "./pages/staff/StaffCreateInstructor";
import StaffCreateStudent from "./pages/staff/StaffCreateStudent";
import StaffStudents from "./pages/staff/StaffStudents";
import StaffInstructors from "./pages/staff/StaffInstructors";
import StaffCertificates from "./pages/staff/StaffCertificates";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/auth" element={<CourseraAuth />} />
            {/* Redirect old routes to unified auth */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/search" element={<Search />} />
            <Route path="/help-center" element={<HelpCenter />} />

            {/* Shared Profile & Settings */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'instructor', 'staff', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* ==================== STUDENT ROUTES ==================== */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCourseLearning />
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
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/progress"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProgress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/waitlists"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentWaitlists />
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
              path="/student/payment-plans"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentPaymentPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/scholarships"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentScholarships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'instructor', 'staff', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-purchases"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyPurchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={['student', 'instructor', 'staff', 'admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/accomplishments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Accomplishments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/schedule"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/certificates"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCertificates />
                </ProtectedRoute>
              }
            />

            {/* ==================== INSTRUCTOR ROUTES ==================== */}
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
            <Route
              path="/instructor/courses"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/students"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/assignments"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin', 'staff']}>
                  <InstructorAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/exams"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin', 'staff']}>
                  <InstructorExams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/analytics"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin', 'staff']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/attendance"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/schedule"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorSchedule />
                </ProtectedRoute>
              }
            />

            {/* ==================== ADMIN ROUTES ==================== */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/instructors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminInstructors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enrollments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEnrollments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bulk-enroll"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <BulkEnroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bulk-import"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <BulkImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/waitlists"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminWaitlists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payment-plans"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminPaymentPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/scholarships"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminScholarships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <InstructorAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <InstructorExams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSchedules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnnouncements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCertificates />
                </ProtectedRoute>
              }
            />

            {/* ==================== STAFF ROUTES ==================== */}
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
            <Route
              path="/staff/bulk-enroll"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <BulkEnroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/bulk-import"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <BulkImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/waitlists"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <AdminWaitlists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/payments"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/payment-plans"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <AdminPaymentPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/scholarships"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <AdminScholarships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/attendance"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/create-instructor"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffCreateInstructor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/create-student"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffCreateStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/students"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/instructors"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffInstructors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/certificates"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffCertificates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/settings"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Catch all - 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
