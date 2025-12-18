const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, studentId, classSectionId, academicYear }) => {
  const where = {};
  
  if (studentId) where.studentId = studentId;
  if (classSectionId) where.classSectionId = classSectionId;
  if (academicYear) where.academicYear = academicYear;

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { id: true, studentId: true, firstName: true, lastName: true }
        },
        classSection: {
          select: { id: true, name: true, academicYear: true }
        }
      }
    }),
    prisma.enrollment.count({ where })
  ]);

  return { enrollments, total };
};

const getById = async (id) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: true,
      classSection: true
    }
  });

  if (!enrollment) {
    throw { status: 404, message: 'Enrollment not found', code: 'NOT_FOUND' };
  }

  return enrollment;
};

const create = async (data) => {
  // Check if student exists
  const student = await prisma.student.findUnique({ 
    where: { id: data.studentId } 
  });
  if (!student) {
    throw { status: 404, message: 'Student not found', code: 'STUDENT_NOT_FOUND' };
  }

  // Check if class exists
  const classSection = await prisma.classSection.findUnique({ 
    where: { id: data.classSectionId } 
  });
  if (!classSection) {
    throw { status: 404, message: 'Class not found', code: 'CLASS_NOT_FOUND' };
  }

  // Check capacity
  const currentEnrollments = await prisma.enrollment.count({
    where: { classSectionId: data.classSectionId, academicYear: data.academicYear }
  });
  if (currentEnrollments >= classSection.capacity) {
    throw { status: 400, message: 'Class is at full capacity', code: 'CLASS_FULL' };
  }

  const enrollment = await prisma.enrollment.create({
    data,
    include: {
      student: { select: { id: true, studentId: true, firstName: true, lastName: true } },
      classSection: { select: { id: true, name: true, academicYear: true } }
    }
  });

  return enrollment;
};

const remove = async (id) => {
  const existing = await prisma.enrollment.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Enrollment not found', code: 'NOT_FOUND' };
  }

  await prisma.enrollment.delete({ where: { id } });
  return { message: 'Enrollment deleted successfully' };
};

module.exports = {
  getAll,
  getById,
  create,
  remove
};
