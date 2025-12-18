const { z } = require('zod');

const attendanceRecordSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  status: z.enum(['P', 'A', 'L'], { 
    errorMap: () => ({ message: 'Status must be P (Present), A (Absent), or L (Late)' })
  })
});

const createAttendanceSchema = z.object({
  classSectionId: z.string().uuid('Invalid class ID'),
  date: z.string().min(1, 'Date is required'),
  records: z.array(attendanceRecordSchema).min(1, 'At least one attendance record is required')
});

const attendanceQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  classSectionId: z.string().uuid().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  studentId: z.string().uuid().optional()
});

const studentIdParamSchema = z.object({
  studentId: z.string().uuid('Invalid student ID')
});

module.exports = {
  createAttendanceSchema,
  attendanceQuerySchema,
  studentIdParamSchema
};
