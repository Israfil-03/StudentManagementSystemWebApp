import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teachersApi, Teacher } from '@/api/teachers';
import Layout from '@/components/Layout';

const TeacherDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherProfile = await teachersApi.getMyProfile();
        setProfile(teacherProfile);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
        {profile && (
          <p className="text-gray-600 mb-8">
            Welcome, {profile.firstName} {profile.lastName}!
          </p>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* My Classes */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">My Classes</h2>
              {profile?.classes && profile.classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 border rounded-lg hover:border-indigo-500 transition-colors"
                    >
                      <h3 className="font-semibold text-lg text-gray-900">{cls.name}</h3>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          to={`/teacher/attendance?classId=${cls.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          Take Attendance
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          to={`/teacher/marks?classId=${cls.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          Enter Marks
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No classes assigned yet.</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link
                  to="/teacher/attendance"
                  className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-600 font-medium">Mark Attendance</span>
                </Link>
                <Link
                  to="/teacher/marks"
                  className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
                >
                  <span className="text-blue-600 font-medium">Enter Marks</span>
                </Link>
                <Link
                  to="/teacher/classes"
                  className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
                >
                  <span className="text-purple-600 font-medium">View Students</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
