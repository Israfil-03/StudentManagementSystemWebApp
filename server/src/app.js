const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const { sendResponse } = require('./utils/response');

// Import routes
const authRoutes = require('./modules/auth/routes');
const studentRoutes = require('./modules/students/routes');
const teacherRoutes = require('./modules/teachers/routes');
const classRoutes = require('./modules/classes/routes');
const subjectRoutes = require('./modules/subjects/routes');
const enrollmentRoutes = require('./modules/enrollments/routes');
const attendanceRoutes = require('./modules/attendance/routes');
const feeRoutes = require('./modules/fees/routes');
const dashboardRoutes = require('./modules/dashboard/routes');
const auditLogRoutes = require('./modules/audit-logs/routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  sendResponse(res, 200, { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
