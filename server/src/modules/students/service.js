const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, q, status, orderBy }) => {
  const where = {};
  
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { studentId: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } }
    ];
  }
  
  if (status) {
    where.status = status;
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        enrollments: {
          include: {
            classSection: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    }),
    prisma.student.count({ where })
  ]);

  return { students, total };
};

const getById = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { classSection: true },
        orderBy: { createdAt: 'desc' }
      },
      attendance: {
        orderBy: { date: 'desc' },
        take: 30
      },
      fees: {
        orderBy: { dueDate: 'desc' }
      }
    }
  });

  if (!student) {
    throw { status: 404, message: 'Student not found', code: 'NOT_FOUND' };
  }

  return student;
};

const create = async (data) => {
  // Convert dateOfBirth string to Date if provided
  if (data.dateOfBirth) {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }

  const student = await prisma.student.create({
    data
  });

  return student;
};

const update = async (id, data) => {
  // Check if exists
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Student not found', code: 'NOT_FOUND' };
  }

  // Convert dateOfBirth string to Date if provided
  if (data.dateOfBirth) {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }

  const student = await prisma.student.update({
    where: { id },
    data
  });

  return student;
};

const remove = async (id) => {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Student not found', code: 'NOT_FOUND' };
  }

  await prisma.student.delete({ where: { id } });
  return { message: 'Student deleted successfully' };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
