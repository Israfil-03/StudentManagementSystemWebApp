import React, { useEffect, useState } from 'react';
import { studentsApi, Student } from '@/api/students';
import { marksApi, Mark, MarkStats } from '@/api/marks';
import { attendanceApi, AttendanceStats } from '@/api/attendance';
import Layout from '@/components/Layout';

const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [markStats, setMarkStats] = useState<MarkStats | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentProfile = await studentsApi.getMyProfile();
        setProfile(studentProfile);

        const [marksRes, marksStatsRes, attendanceStatsRes] = await Promise.all([
          marksApi.getMyMarks(),
          marksApi.getStats(studentProfile.id),
          attendanceApi.getStats(studentProfile.id),
        ]);

        setMarks(marksRes);
        setMarkStats(marksStatsRes);
        setAttendanceStats(attendanceStatsRes);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Class Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">My Class</h3>
                <p className="text-2xl font-bold text-indigo-600">
                  {profile?.class?.name || 'Not Assigned'}
                </p>
              </div>

              {/* Attendance Rate */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Attendance Rate</h3>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceStats ? `${attendanceStats.attendanceRate.toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {attendanceStats?.present || 0} present / {attendanceStats?.total || 0} total
                </p>
              </div>

              {/* Average Marks */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Marks</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {markStats?.averageMarks ? markStats.averageMarks.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  Across {markStats?.subjectCount || 0} subjects
                </p>
              </div>
            </div>

            {/* Recent Marks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Marks</h2>
              {marks.length === 0 ? (
                <p className="text-gray-500">No marks recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marks.slice(0, 5).map((mark) => (
                        <tr key={mark.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mark.subject?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mark.examName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mark.marks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
