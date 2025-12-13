import { Request, Response } from 'express';
import { z } from 'zod';
import * as attendanceService from '../services/attendance.service';
import { AuthRequest } from '../middlewares/auth';

const markAttendanceSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  date: z.string().transform((val) => new Date(val)),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
});

const bulkAttendanceSchema = z.object({
  classId: z.string(),
  date: z.string().transform((val) => new Date(val)),
  attendances: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
    })
  ),
});

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const validatedData = markAttendanceSchema.parse(req.body);
    const attendance = await attendanceService.markAttendance(validatedData);
    res.status(201).json(attendance);
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

export const markBulkAttendance = async (req: Request, res: Response) => {
  try {
    const validatedData = bulkAttendanceSchema.parse(req.body);
    const results = await attendanceService.markBulkAttendance(validatedData);
    res.status(201).json(results);
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

export const getAttendanceByClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const attendances = await attendanceService.getAttendanceByClass(classId, date);
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttendanceByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const attendances = await attendanceService.getAttendanceByStudent(studentId);
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
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
    
    const attendances = await attendanceService.getAttendanceByStudent(student.id);
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const stats = await attendanceService.getAttendanceStats(studentId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
