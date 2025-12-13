import { Request, Response } from 'express';
import { z } from 'zod';
import * as studentService from '../services/student.service';
import { AuthRequest } from '../middlewares/auth';

const updateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  classId: z.string().nullable().optional(),
});

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await studentService.getAllStudents(page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(id);
    res.status(200).json(student);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const student = await studentService.getStudentByUserId(req.user.userId);
    res.status(200).json(student);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStudentSchema.parse(req.body);
    const student = await studentService.updateStudent(id, validatedData);
    res.status(200).json(student);
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

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await studentService.deleteStudent(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const assignToClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { classId } = req.body;
    
    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }
    
    const student = await studentService.assignStudentToClass(id, classId);
    res.status(200).json(student);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeFromClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await studentService.removeStudentFromClass(id);
    res.status(200).json(student);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
