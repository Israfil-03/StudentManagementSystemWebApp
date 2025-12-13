import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AddMarkInput {
  studentId: string;
  subjectId: string;
  examName: string;
  marks: number;
}

export const addMark = async (input: AddMarkInput) => {
  const mark = await prisma.mark.upsert({
    where: {
      studentId_subjectId_examName: {
        studentId: input.studentId,
        subjectId: input.subjectId,
        examName: input.examName,
      },
    },
    update: {
      marks: input.marks,
    },
    create: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      examName: input.examName,
      marks: input.marks,
    },
    include: {
      student: true,
      subject: true,
    },
  });

  return mark;
};

export const getMarksByStudent = async (studentId: string) => {
  const marks = await prisma.mark.findMany({
    where: { studentId },
    include: {
      subject: true,
    },
    orderBy: [
      { subject: { name: 'asc' } },
      { examName: 'asc' },
    ],
  });

  return marks;
};

export const getMarksBySubject = async (subjectId: string) => {
  const marks = await prisma.mark.findMany({
    where: { subjectId },
    include: {
      student: true,
    },
    orderBy: {
      student: {
        lastName: 'asc',
      },
    },
  });

  return marks;
};

export const getMarksByClass = async (classId: string, examName?: string) => {
  const whereClause: any = {
    student: {
      classId,
    },
  };

  if (examName) {
    whereClause.examName = examName;
  }

  const marks = await prisma.mark.findMany({
    where: whereClause,
    include: {
      student: true,
      subject: true,
    },
    orderBy: [
      { student: { lastName: 'asc' } },
      { subject: { name: 'asc' } },
    ],
  });

  return marks;
};

export const deleteMark = async (id: string) => {
  await prisma.mark.delete({
    where: { id },
  });

  return { message: 'Mark deleted successfully' };
};

export const getStudentStats = async (studentId: string) => {
  const marks = await prisma.mark.findMany({
    where: { studentId },
    include: {
      subject: true,
    },
  });

  if (marks.length === 0) {
    return {
      totalMarks: 0,
      averageMarks: 0,
      highestMark: 0,
      lowestMark: 0,
      subjectCount: 0,
    };
  }

  const markValues = marks.map((m) => m.marks);
  const totalMarks = markValues.reduce((sum, mark) => sum + mark, 0);
  const uniqueSubjects = new Set(marks.map((m) => m.subjectId));

  return {
    totalMarks,
    averageMarks: totalMarks / marks.length,
    highestMark: Math.max(...markValues),
    lowestMark: Math.min(...markValues),
    subjectCount: uniqueSubjects.size,
  };
};
