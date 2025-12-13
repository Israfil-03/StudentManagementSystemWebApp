import { Request, Response } from 'express';
import { z } from 'zod';
import * as marksService from '../services/marks.service';
import { AuthRequest } from '../middlewares/auth';

const addMarkSchema = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  examName: z.string().min(1, 'Exam name is required'),
  marks: z.number().min(0).max(100),
});

export const addMark = async (req: Request, res: Response) => {
  try {
    const validatedData = addMarkSchema.parse(req.body);
    const mark = await marksService.addMark(validatedData);
    res.status(201).json(mark);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMarksByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const marks = await marksService.getMarksByStudent(studentId);
    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyMarks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    // Get student by user ID first
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const marks = await marksService.getMarksByStudent(student.id);
    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMarksBySubject = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const marks = await marksService.getMarksBySubject(subjectId);
    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMarksByClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const examName = req.query.examName as string | undefined;
    const marks = await marksService.getMarksByClass(classId, examName);
    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await marksService.deleteMark(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentStats = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const stats = await marksService.getStudentStats(studentId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
