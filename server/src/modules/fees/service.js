const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, studentId, status }) => {
  const where = {};
  
  if (studentId) where.studentId = studentId;
  if (status) where.status = status;

  const [fees, total] = await Promise.all([
    prisma.fee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dueDate: 'desc' },
      include: {
        student: { select: { id: true, studentId: true, firstName: true, lastName: true } }
      }
    }),
    prisma.fee.count({ where })
  ]);

  return { fees, total };
};

const getById = async (id) => {
  const fee = await prisma.fee.findUnique({
    where: { id },
    include: {
      student: true
    }
  });

  if (!fee) {
    throw { status: 404, message: 'Fee record not found', code: 'NOT_FOUND' };
  }

  return fee;
};

const create = async (data) => {
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: data.studentId }
  });
  if (!student) {
    throw { status: 404, message: 'Student not found', code: 'STUDENT_NOT_FOUND' };
  }

  const fee = await prisma.fee.create({
    data: {
      studentId: data.studentId,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      status: 'DUE'
    },
    include: {
      student: { select: { id: true, studentId: true, firstName: true, lastName: true } }
    }
  });

  return fee;
};

const markPaid = async (id) => {
  const existing = await prisma.fee.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Fee record not found', code: 'NOT_FOUND' };
  }

  if (existing.status === 'PAID') {
    throw { status: 400, message: 'Fee already marked as paid', code: 'ALREADY_PAID' };
  }

  const fee = await prisma.fee.update({
    where: { id },
    data: {
      status: 'PAID',
      paymentDate: new Date()
    },
    include: {
      student: { select: { id: true, studentId: true, firstName: true, lastName: true } }
    }
  });

  return fee;
};

const remove = async (id) => {
  const existing = await prisma.fee.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Fee record not found', code: 'NOT_FOUND' };
  }

  await prisma.fee.delete({ where: { id } });
  return { message: 'Fee record deleted successfully' };
};

module.exports = {
  getAll,
  getById,
  create,
  markPaid,
  remove
};
