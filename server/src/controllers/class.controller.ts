import { Request, Response } from 'express';
import { z } from 'zod';
import * as classService from '../services/class.service';

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  teacherId: z.string().optional(),
});

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  teacherId: z.string().nullable().optional(),
});

export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await classService.getAllClasses(page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classData = await classService.getClassById(id);
    res.status(200).json(classData);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const validatedData = createClassSchema.parse(req.body);
    const newClass = await classService.createClass(validatedData);
    res.status(201).json(newClass);
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

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateClassSchema.parse(req.body);
    const updatedClass = await classService.updateClass(id, validatedData);
    res.status(200).json(updatedClass);
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

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await classService.deleteClass(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subjectId } = req.body;
    
    if (!subjectId) {
      return res.status(400).json({ message: 'subjectId is required' });
    }
    
    const result = await classService.addSubjectToClass(id, subjectId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeSubject = async (req: Request, res: Response) => {
  try {
    const { id, subjectId } = req.params;
    const result = await classService.removeSubjectFromClass(id, subjectId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
