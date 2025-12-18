const prisma = require('../../db/prisma');

const getStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get total counts
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalStaff,
    feesDue,
    todayAttendance
  ] = await Promise.all([
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.teacher.count(),
    prisma.classSection.count(),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'STAFF'] } } }),
    prisma.fee.aggregate({
      where: { status: 'DUE' },
      _count: true,
      _sum: { amount: true }
    }),
    prisma.attendance.findMany({
      where: { date: today }
    })
  ]);

  // Calculate today's attendance percentage
  const attendanceCount = todayAttendance.length;
  const presentCount = todayAttendance.filter(a => a.status === 'P' || a.status === 'L').length;
  const todayAttendancePercentage = attendanceCount > 0 
    ? Math.round((presentCount / attendanceCount) * 100 * 100) / 100
    : 0;

  // Get recent activity (audit logs)
  const recentActivity = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { select: { id: true, name: true } }
    }
  });

  // Get enrollment trends by class
  const enrollmentsByClass = await prisma.classSection.findMany({
    select: {
      id: true,
      name: true,
      capacity: true,
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Get attendance summary for the week
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyAttendance = await prisma.attendance.groupBy({
    by: ['status'],
    where: {
      date: { gte: weekAgo }
    },
    _count: true
  });

  const weeklyAttendanceSummary = {
    present: 0,
    absent: 0,
    late: 0
  };
  weeklyAttendance.forEach(a => {
    if (a.status === 'P') weeklyAttendanceSummary.present = a._count;
    else if (a.status === 'A') weeklyAttendanceSummary.absent = a._count;
    else if (a.status === 'L') weeklyAttendanceSummary.late = a._count;
  });

  return {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalStaff,
    todayAttendanceMarked: attendanceCount,
    todayAttendancePercentage,
    feesDueCount: feesDue._count,
    feesDueAmount: feesDue._sum.amount || 0,
    recentActivity: recentActivity.map(a => ({
      id: a.id,
      action: a.action,
      entity: a.entity,
      summary: a.summary,
      actor: a.actor?.name || 'System',
      createdAt: a.createdAt
    })),
    enrollmentsByClass: enrollmentsByClass.map(c => ({
      id: c.id,
      name: c.name,
      capacity: c.capacity,
      enrolled: c._count.enrollments,
      available: c.capacity - c._count.enrollments
    })),
    weeklyAttendanceSummary
  };
};

module.exports = {
  getStats
};
