import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllClasses = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      skip,
      take: limit,
      include: {
        teacher: true,
        students: true,
        subjects: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.class.count(),
  ]);

  return {
    classes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getClassById = async (id: string) => {
  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      teacher: true,
      students: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      subjects: true,
    },
  });

  if (!classData) {
    throw new Error('Class not found');
  }

  return classData;
};

export const createClass = async (data: { name: string; teacherId?: string }) => {
  const newClass = await prisma.class.create({
    data: {
      name: data.name,
      ...(data.teacherId && { teacherId: data.teacherId }),
    },
    include: {
      teacher: true,
      students: true,
      subjects: true,
    },
  });

  return newClass;
};

export const updateClass = async (id: string, data: { name?: string; teacherId?: string | null }) => {
  const updatedClass = await prisma.class.update({
    where: { id },
    data,
    include: {
      teacher: true,
      students: true,
      subjects: true,
    },
  });

  return updatedClass;
};

export const deleteClass = async (id: string) => {
  // Remove students from class first
  await prisma.$transaction([
    prisma.student.updateMany({
      where: { classId: id },
      data: { classId: null },
    }),
    prisma.attendance.deleteMany({
      where: { classId: id },
    }),
    prisma.class.update({
      where: { id },
      data: {
        subjects: {
          set: [],
        },
      },
    }),
    prisma.class.delete({ where: { id } }),
  ]);

  return { message: 'Class deleted successfully' };
};

export const addSubjectToClass = async (classId: string, subjectId: string) => {
  const updatedClass = await prisma.class.update({
    where: { id: classId },
    data: {
      subjects: {
        connect: { id: subjectId },
      },
    },
    include: {
      subjects: true,
    },
  });

  return updatedClass;
};

export const removeSubjectFromClass = async (classId: string, subjectId: string) => {
  const updatedClass = await prisma.class.update({
    where: { id: classId },
    data: {
      subjects: {
        disconnect: { id: subjectId },
      },
    },
    include: {
      subjects: true,
    },
  });

  return updatedClass;
};
