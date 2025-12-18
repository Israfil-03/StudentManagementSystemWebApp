const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, search, academicYear, status, orderBy }) => {
  const where = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { section: { contains: search, mode: 'insensitive' } },
      { grade: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (academicYear) {
    where.academicYear = academicYear;
  }

  if (status) {
    where.status = status;
  }

  const [classes, total] = await Promise.all([
    prisma.classSection.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy || { name: 'asc' },
      include: {
        classTeacher: true,
        _count: {
          select: { enrollments: true }
        }
      }
    }),
    prisma.classSection.count({ where })
  ]);

  return { classes, total };
};

const getById = async (id) => {
  const classSection = await prisma.classSection.findUnique({
    where: { id },
    include: {
      classTeacher: true,
      enrollments: {
        include: { student: true }
      },
      _count: {
        select: { enrollments: true }
      }
    }
  });

  if (!classSection) {
    throw { status: 404, message: 'Class not found', code: 'NOT_FOUND' };
  }

  return classSection;
};

const getClassStudents = async (id, { skip, limit }) => {
  const classSection = await prisma.classSection.findUnique({ where: { id } });
  if (!classSection) {
    throw { status: 404, message: 'Class not found', code: 'NOT_FOUND' };
  }

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where: { classSectionId: id },
      skip,
      take: limit,
      include: { student: true }
    }),
    prisma.enrollment.count({ where: { classSectionId: id } })
  ]);

  const students = enrollments.map(e => e.student);
  return { students, total };
};

const create = async (data) => {
  const classSection = await prisma.classSection.create({ 
    data,
    include: { classTeacher: true }
  });
  return classSection;
};

const update = async (id, data) => {
  const existing = await prisma.classSection.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Class not found', code: 'NOT_FOUND' };
  }

  const classSection = await prisma.classSection.update({
    where: { id },
    data,
    include: { classTeacher: true }
  });

  return classSection;
};

const remove = async (id) => {
  const existing = await prisma.classSection.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Class not found', code: 'NOT_FOUND' };
  }

  await prisma.classSection.delete({ where: { id } });
  return { message: 'Class deleted successfully' };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
