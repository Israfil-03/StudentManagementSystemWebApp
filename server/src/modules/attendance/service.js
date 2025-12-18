const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, classSectionId, date, startDate, endDate, studentId }) => {
  const where = {};
  
  if (classSectionId) where.classSectionId = classSectionId;
  if (studentId) where.studentId = studentId;
  
  if (date) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    where.date = dateObj;
  } else if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.date.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        student: { select: { id: true, studentId: true, firstName: true, lastName: true } },
        classSection: { select: { id: true, name: true } }
      }
    }),
    prisma.attendance.count({ where })
  ]);

  return { attendance, total };
};

const markAttendance = async (data) => {
  const { classSectionId, date, records } = data;
  
  // Verify class exists
  const classSection = await prisma.classSection.findUnique({
    where: { id: classSectionId }
  });
  if (!classSection) {
    throw { status: 404, message: 'Class not found', code: 'CLASS_NOT_FOUND' };
  }

  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  // Process each attendance record - upsert to allow updating existing records
  const results = await Promise.all(
    records.map(async (record) => {
      return prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: record.studentId,
            date: dateObj
          }
        },
        update: {
          status: record.status,
          classSectionId
        },
        create: {
          studentId: record.studentId,
          classSectionId,
          date: dateObj,
          status: record.status
        },
        include: {
          student: { select: { id: true, studentId: true, firstName: true, lastName: true } }
        }
      });
    })
  );

  return {
    date: dateObj,
    classSectionId,
    classSection: classSection.name,
    recordCount: results.length,
    records: results
  };
};

const getStudentHistory = async (studentId, { page, limit, skip }) => {
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, studentId: true, firstName: true, lastName: true }
  });
  
  if (!student) {
    throw { status: 404, message: 'Student not found', code: 'NOT_FOUND' };
  }

  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId },
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        classSection: { select: { id: true, name: true } }
      }
    }),
    prisma.attendance.count({ where: { studentId } })
  ]);

  // Calculate summary
  const summary = await prisma.attendance.groupBy({
    by: ['status'],
    where: { studentId },
    _count: true
  });

  const summaryObj = {
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  };

  summary.forEach(s => {
    if (s.status === 'P') summaryObj.present = s._count;
    else if (s.status === 'A') summaryObj.absent = s._count;
    else if (s.status === 'L') summaryObj.late = s._count;
    summaryObj.total += s._count;
  });

  summaryObj.attendanceRate = summaryObj.total > 0 
    ? Math.round(((summaryObj.present + summaryObj.late) / summaryObj.total) * 100 * 100) / 100
    : 0;

  return {
    student,
    attendance,
    total,
    summary: summaryObj
  };
};

module.exports = {
  getAll,
  markAttendance,
  getStudentHistory
};
