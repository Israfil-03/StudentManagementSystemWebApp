import { Request, Response } from 'express';
import { z } from 'zod';
import * as subjectService from '../services/subject.service';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
});

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await subjectService.getAllSubjects();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subject = await subjectService.getSubjectById(id);
    res.status(200).json(subject);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const validatedData = subjectSchema.parse(req.body);
    const subject = await subjectService.createSubject(validatedData);
    res.status(201).json(subject);
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

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = subjectSchema.parse(req.body);
    const subject = await subjectService.updateSubject(id, validatedData);
    res.status(200).json(subject);
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

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await subjectService.deleteSubject(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
