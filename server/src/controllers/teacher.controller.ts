import { Request, Response } from 'express';
import { z } from 'zod';
import * as teacherService from '../services/teacher.service';
import { AuthRequest } from '../middlewares/auth';

const updateTeacherSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await teacherService.getAllTeachers(page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await teacherService.getTeacherById(id);
    res.status(200).json(teacher);
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
    const teacher = await teacherService.getTeacherByUserId(req.user.userId);
    res.status(200).json(teacher);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateTeacherSchema.parse(req.body);
    const teacher = await teacherService.updateTeacher(id, validatedData);
    res.status(200).json(teacher);
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

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await teacherService.deleteTeacher(id);
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
    
    const result = await teacherService.assignTeacherToClass(id, classId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
