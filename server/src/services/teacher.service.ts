import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTeachers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
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
        classes: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    }),
    prisma.teacher.count(),
  ]);

  return {
    teachers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      classes: {
        include: {
          students: true,
          subjects: true,
        },
      },
    },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  return teacher;
};

export const getTeacherByUserId = async (userId: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      classes: {
        include: {
          students: true,
          subjects: true,
        },
      },
    },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  return teacher;
};

export const updateTeacher = async (id: string, data: { firstName?: string; lastName?: string }) => {
  const teacher = await prisma.teacher.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      classes: true,
    },
  });

  return teacher;
};

export const deleteTeacher = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  // Remove teacher from classes first, then delete teacher and user
  await prisma.$transaction([
    prisma.class.updateMany({
      where: { teacherId: id },
      data: { teacherId: null },
    }),
    prisma.teacher.delete({ where: { id } }),
    prisma.user.delete({ where: { id: teacher.userId } }),
  ]);

  return { message: 'Teacher deleted successfully' };
};

export const assignTeacherToClass = async (teacherId: string, classId: string) => {
  const updatedClass = await prisma.class.update({
    where: { id: classId },
    data: { teacherId },
    include: {
      teacher: true,
    },
  });

  return updatedClass;
};
