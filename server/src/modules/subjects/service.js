const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, q }) => {
  const where = {};
  
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { code: { contains: q, mode: 'insensitive' } }
    ];
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    }),
    prisma.subject.count({ where })
  ]);

  return { subjects, total };
};

const getById = async (id) => {
  const subject = await prisma.subject.findUnique({
    where: { id }
  });

  if (!subject) {
    throw { status: 404, message: 'Subject not found', code: 'NOT_FOUND' };
  }

  return subject;
};

const create = async (data) => {
  const subject = await prisma.subject.create({ data });
  return subject;
};

const update = async (id, data) => {
  const existing = await prisma.subject.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Subject not found', code: 'NOT_FOUND' };
  }

  const subject = await prisma.subject.update({
    where: { id },
    data
  });

  return subject;
};

const remove = async (id) => {
  const existing = await prisma.subject.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Subject not found', code: 'NOT_FOUND' };
  }

  await prisma.subject.delete({ where: { id } });
  return { message: 'Subject deleted successfully' };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
