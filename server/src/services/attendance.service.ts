import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface MarkAttendanceInput {
  studentId: string;
  classId: string;
  date: Date;
  status: AttendanceStatus;
}

interface BulkAttendanceInput {
  classId: string;
  date: Date;
  attendances: Array<{
    studentId: string;
    status: AttendanceStatus;
  }>;
}

export const markAttendance = async (input: MarkAttendanceInput) => {
  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_classId_date: {
        studentId: input.studentId,
        classId: input.classId,
        date: input.date,
      },
    },
    update: {
      status: input.status,
    },
    create: {
      studentId: input.studentId,
      classId: input.classId,
      date: input.date,
      status: input.status,
    },
    include: {
      student: true,
    },
  });

  return attendance;
};

export const markBulkAttendance = async (input: BulkAttendanceInput) => {
  const results = await Promise.all(
    input.attendances.map((attendance) =>
      prisma.attendance.upsert({
        where: {
          studentId_classId_date: {
            studentId: attendance.studentId,
            classId: input.classId,
            date: input.date,
          },
        },
        update: {
          status: attendance.status,
        },
        create: {
          studentId: attendance.studentId,
          classId: input.classId,
          date: input.date,
          status: attendance.status,
        },
      })
    )
  );

  return results;
};

export const getAttendanceByClass = async (classId: string, date?: Date) => {
  const whereClause: any = { classId };
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    whereClause.date = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const attendances = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      student: true,
    },
    orderBy: [
      { date: 'desc' },
      { student: { lastName: 'asc' } },
    ],
  });

  return attendances;
};

export const getAttendanceByStudent = async (studentId: string) => {
  const attendances = await prisma.attendance.findMany({
    where: { studentId },
    include: {
      class: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return attendances;
};

export const getAttendanceStats = async (studentId: string) => {
  const attendances = await prisma.attendance.findMany({
    where: { studentId },
  });

  const total = attendances.length;
  const present = attendances.filter((a) => a.status === 'PRESENT').length;
  const absent = attendances.filter((a) => a.status === 'ABSENT').length;
  const late = attendances.filter((a) => a.status === 'LATE').length;

  return {
    total,
    present,
    absent,
    late,
    attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0,
  };
};
