import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllSubjects = async () => {
  const subjects = await prisma.subject.findMany({
    include: {
      classes: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return subjects;
};

export const getSubjectById = async (id: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      classes: true,
      marks: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!subject) {
    throw new Error('Subject not found');
  }

  return subject;
};

export const createSubject = async (data: { name: string }) => {
  const subject = await prisma.subject.create({
    data: {
      name: data.name,
    },
  });

  return subject;
};

export const updateSubject = async (id: string, data: { name: string }) => {
  const subject = await prisma.subject.update({
    where: { id },
    data,
  });

  return subject;
};

export const deleteSubject = async (id: string) => {
  await prisma.$transaction([
    prisma.mark.deleteMany({ where: { subjectId: id } }),
    prisma.subject.update({
      where: { id },
      data: {
        classes: {
          set: [],
        },
      },
    }),
    prisma.subject.delete({ where: { id } }),
  ]);

  return { message: 'Subject deleted successfully' };
};
