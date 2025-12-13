import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import AdminDashboard from '@/features/dashboard/pages/AdminDashboard';
import StudentDashboard from '@/features/dashboard/pages/StudentDashboard';
import TeacherDashboard from '@/features/dashboard/pages/TeacherDashboard';
import StudentsPage from '@/features/students/pages/StudentsPage';
import PrivateRoute from '@/components/PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Admin Routes
  {
    path: '/admin/dashboard',
    element: (
      <PrivateRoute allowedRoles={['ADMIN']}>
        <AdminDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/students',
    element: (
      <PrivateRoute allowedRoles={['ADMIN']}>
        <StudentsPage />
      </PrivateRoute>
    ),
  },
  // Student Routes
  {
    path: '/student/dashboard',
    element: (
      <PrivateRoute allowedRoles={['STUDENT']}>
        <StudentDashboard />
      </PrivateRoute>
    ),
  },
  // Teacher Routes
  {
    path: '/teacher/dashboard',
    element: (
      <PrivateRoute allowedRoles={['TEACHER']}>
        <TeacherDashboard />
      </PrivateRoute>
    ),
  },
  // Catch all - redirect to login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
