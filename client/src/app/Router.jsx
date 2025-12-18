import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import Layout from '../components/layout/Layout';

// Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';

// Protected Pages
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import StaffPage from '../features/staff/pages/StaffPage';
import StudentsPage from '../features/students/pages/StudentsPage';
import StudentDetailPage from '../features/students/pages/StudentDetailPage';
import TeachersPage from '../features/teachers/pages/TeachersPage';
import ClassesPage from '../features/classes/pages/ClassesPage';
import AttendancePage from '../features/attendance/pages/AttendancePage';
import FeesPage from '../features/fees/pages/FeesPage';
import AuditPage from '../features/audit/pages/AuditPage';

// Loading spinner
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-surface-400">Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
  const { user, loading, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public route (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="fees" element={<FeesPage />} />
        
        {/* Admin Only Routes */}
        <Route
          path="staff"
          element={
            <ProtectedRoute adminOnly>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        
        {/* Super Admin Only Routes */}
        <Route
          path="audit"
          element={
            <ProtectedRoute superAdminOnly>
              <AuditPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
