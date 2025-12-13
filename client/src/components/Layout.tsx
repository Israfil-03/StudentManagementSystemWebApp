import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/students', label: 'Students' },
          { to: '/admin/teachers', label: 'Teachers' },
          { to: '/admin/classes', label: 'Classes' },
          { to: '/admin/subjects', label: 'Subjects' },
        ];
      case 'TEACHER':
        return [
          { to: '/teacher/dashboard', label: 'Dashboard' },
          { to: '/teacher/classes', label: 'My Classes' },
          { to: '/teacher/attendance', label: 'Attendance' },
          { to: '/teacher/marks', label: 'Marks' },
        ];
      case 'STUDENT':
        return [
          { to: '/student/dashboard', label: 'Dashboard' },
          { to: '/student/attendance', label: 'My Attendance' },
          { to: '/student/marks', label: 'My Marks' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold">SMS</span>
              <div className="hidden md:flex space-x-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {user?.email} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-indigo-500 px-4 py-2">
        <div className="flex flex-wrap gap-2">
          {getNavLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-1 rounded-md text-sm text-white hover:bg-indigo-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
