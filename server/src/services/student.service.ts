import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateStudentInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  classId?: string;
}

interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  classId?: string | null;
}

export const getAllStudents = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [students, total] = await Promise.all([
    prisma.student.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        class: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    }),
    prisma.student.count(),
  ]);

  return {
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStudentById = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      class: {
        include: {
          teacher: true,
          subjects: true,
        },
      },
      attendances: {
        orderBy: {
          date: 'desc',
        },
        take: 30,
      },
      marks: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  return student;
};

export const getStudentByUserId = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      class: {
        include: {
          teacher: true,
          subjects: true,
        },
      },
      attendances: {
        orderBy: {
          date: 'desc',
        },
        take: 30,
      },
      marks: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  return student;
};

export const updateStudent = async (id: string, data: UpdateStudentInput) => {
  const student = await prisma.student.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
      ...(data.classId !== undefined && { classId: data.classId }),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      class: true,
    },
  });

  return student;
};

export const deleteStudent = async (id: string) => {
  // First get the student to find the userId
  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Delete in order: marks, attendances, student, user
  await prisma.$transaction([
    prisma.mark.deleteMany({ where: { studentId: id } }),
    prisma.attendance.deleteMany({ where: { studentId: id } }),
    prisma.student.delete({ where: { id } }),
    prisma.user.delete({ where: { id: student.userId } }),
  ]);

  return { message: 'Student deleted successfully' };
};

export const assignStudentToClass = async (studentId: string, classId: string) => {
  const student = await prisma.student.update({
    where: { id: studentId },
    data: { classId },
    include: {
      class: true,
    },
  });

  return student;
};

export const removeStudentFromClass = async (studentId: string) => {
  const student = await prisma.student.update({
    where: { id: studentId },
    data: { classId: null },
    include: {
      class: true,
    },
  });

  return student;
};
