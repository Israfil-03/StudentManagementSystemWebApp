const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, q, status, orderBy }) => {
  const where = {};
  
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { employeeId: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { specialization: { contains: q, mode: 'insensitive' } }
    ];
  }

  if (status) {
    where.status = status;
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy || { createdAt: 'desc' }
    }),
    prisma.teacher.count({ where })
  ]);

  return { teachers, total };
};

const getById = async (id) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id }
  });

  if (!teacher) {
    throw { status: 404, message: 'Teacher not found', code: 'NOT_FOUND' };
  }

  return teacher;
};

const create = async (data) => {
  const teacher = await prisma.teacher.create({ data });
  return teacher;
};

const update = async (id, data) => {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Teacher not found', code: 'NOT_FOUND' };
  }

  const teacher = await prisma.teacher.update({
    where: { id },
    data
  });

  return teacher;
};

const remove = async (id) => {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Teacher not found', code: 'NOT_FOUND' };
  }

  await prisma.teacher.delete({ where: { id } });
  return { message: 'Teacher deleted successfully' };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
