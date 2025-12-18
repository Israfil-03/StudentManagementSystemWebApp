import { useAuth } from '../../../app/AuthProvider';
import { useDashboardStats } from '../hooks';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../../components/ui';
import { formatCurrency, formatPercentage, formatDateTime } from '../../../lib/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-danger">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Dashboard</h1>
        <p className="text-surface-400 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={<StudentsIcon />}
          color="primary"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers || 0}
          icon={<TeachersIcon />}
          color="cyan"
        />
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses || 0}
          icon={<ClassesIcon />}
          color="purple"
        />
        <StatCard
          title="Today's Attendance"
          value={formatPercentage(stats?.todayAttendancePercentage || 0)}
          subtitle={`${stats?.todayAttendanceMarked || 0} marked`}
          icon={<AttendanceIcon />}
          color="success"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fees Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Fees Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-warning">
                  {stats?.feesDueCount || 0}
                </p>
                <p className="text-surface-400">Pending Payments</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-surface-100">
                  {formatCurrency(stats?.feesDueAmount || 0)}
                </p>
                <p className="text-surface-400">Total Due</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-surface-300">Present: {stats?.weeklyAttendanceSummary?.present || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger"></div>
                <span className="text-surface-300">Absent: {stats?.weeklyAttendanceSummary?.absent || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-surface-300">Late: {stats?.weeklyAttendanceSummary?.late || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Class Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.enrollmentsByClass?.map((cls) => (
              <div key={cls.id} className="p-4 bg-surface-900 rounded-lg">
                <p className="font-medium text-surface-100">{cls.name}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Enrolled</span>
                    <span className="text-surface-200">{cls.enrolled}/{cls.capacity}</span>
                  </div>
                  <div className="mt-2 h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full"
                      style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-surface-900 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${getActionColor(activity.action)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-200 truncate">{activity.summary}</p>
                    <p className="text-xs text-surface-500">
                      by {activity.actor} • {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                  <Badge color={getActionBadgeColor(activity.action)}>
                    {activity.action}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-center py-4">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-500/5 border-primary-500/30',
    cyan: 'from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/30',
    purple: 'from-accent-purple/20 to-accent-purple/5 border-accent-purple/30',
    success: 'from-success/20 to-success/5 border-success/30',
  };

  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-surface-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-surface-100 mt-1">{value}</p>
          {subtitle && <p className="text-surface-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="text-surface-400">{icon}</div>
      </div>
    </div>
  );
}

function getActionColor(action) {
  switch (action) {
    case 'CREATE': return 'bg-success';
    case 'UPDATE': return 'bg-primary-500';
    case 'DELETE': return 'bg-danger';
    default: return 'bg-surface-500';
  }
}

function getActionBadgeColor(action) {
  switch (action) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'primary';
    case 'DELETE': return 'danger';
    default: return 'default';
  }
}

// Icons
function StudentsIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function TeachersIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ClassesIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function AttendanceIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
