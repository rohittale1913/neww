import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegistrationMenu from './pages/AdminRegistrationMenu';
import AdminStudentRegister from './pages/AdminStudentRegister';
import AdminTeacherRegister from './pages/AdminTeacherRegister';
import AdminStaffRegister from './pages/AdminStaffRegister';
import AdminUserManagement from './pages/AdminUserManagement';
import StudentUsersView from './pages/StudentUsersView';
import TeacherUsersView from './pages/TeacherUsersView';
import StaffUsersView from './pages/StaffUsersView';
import AdminAttendanceManagement from './pages/AdminAttendanceManagement';
import FeeManagement from './pages/FeeManagement';
import AdminExamsManagement from './pages/AdminExamsManagement';
import AdminTeacherAssignment from './pages/AdminTeacherAssignment';
import StudentDashboard from './pages/StudentDashboard';
import StudentAssignments from './pages/StudentAssignments';
import StudentAssignmentView from './pages/StudentAssignmentView';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAssignmentCreate from './pages/TeacherAssignmentCreate';
import TeacherAssignmentDetail from './pages/TeacherAssignmentDetail';
import AccountantDashboard from './pages/AccountantDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import TransportManagerDashboard from './pages/TransportManagerDashboard';
import ParentDashboard from './pages/ParentDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { user, token } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registration"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRegistrationMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/register-student"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminStudentRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/register-teacher"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTeacherRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/register-staff"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminStaffRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students-view"
          element={
            <ProtectedRoute requiredRole="admin">
              <StudentUsersView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers-view"
          element={
            <ProtectedRoute requiredRole="admin">
              <TeacherUsersView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff-view"
          element={
            <ProtectedRoute requiredRole="admin">
              <StaffUsersView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAttendanceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute requiredRole="admin">
              <FeeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminExamsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/class-assignments"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTeacherAssignment />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/create"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAssignmentCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/:assignmentId"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAssignmentDetail />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:assignmentId"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAssignmentView />
            </ProtectedRoute>
          }
        />

        {/* Accountant Routes */}
        <Route
          path="/accountant"
          element={
            <ProtectedRoute requiredRole="accountant">
              <AccountantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Librarian Routes */}
        <Route
          path="/librarian"
          element={
            <ProtectedRoute requiredRole="librarian">
              <LibrarianDashboard />
            </ProtectedRoute>
          }
        />

        {/* Transport Manager Routes */}
        <Route
          path="/transport_manager"
          element={
            <ProtectedRoute requiredRole="transport_manager">
              <TransportManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Parent Routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute requiredRole="parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect / to login or dashboard based on role */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
