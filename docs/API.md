# Mirage API Documentation

Base URL: `/api/v1`

## Response Format

### Success Response
```json
{
  "data": { ... },
  "error": null,
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": []
  },
  "meta": null
}
```

## Authentication

### POST /api/v1/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "role": "ADMIN"
    },
    "token": "jwt-token-here"
  }
}
```

### GET /api/v1/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

### POST /api/v1/auth/logout
Logout current user.

---

## Staff Management

### GET /api/v1/staff
List all staff members. **Admin/Super Admin only.**

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `q` (string): Search by name or email

### POST /api/v1/staff
Create new staff member. **Admin/Super Admin only.**

**Request Body:**
```json
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "password123",
  "role": "STAFF"
}
```

### PATCH /api/v1/staff/:id/deactivate
Deactivate a staff member.

### PATCH /api/v1/staff/:id/reset-password
Reset staff member password.

---

## Students

### GET /api/v1/students
List all students with pagination and search.

**Query Parameters:**
- `page`, `limit`, `q`, `sort`

### GET /api/v1/students/:id
Get student by ID.

### POST /api/v1/students
Create new student.

**Request Body:**
```json
{
  "rollNo": "2024001",
  "name": "Student Name",
  "email": "student@example.com",
  "phone": "1234567890",
  "dob": "2010-01-15",
  "address": "123 Street",
  "guardianName": "Parent Name",
  "guardianPhone": "0987654321"
}
```

### PUT /api/v1/students/:id
Update student.

### DELETE /api/v1/students/:id
Delete student.

---

## Teachers

### GET /api/v1/teachers
List all teachers.

### GET /api/v1/teachers/:id
Get teacher by ID.

### POST /api/v1/teachers
Create new teacher.

### PUT /api/v1/teachers/:id
Update teacher.

### DELETE /api/v1/teachers/:id
Delete teacher.

---

## Classes

### GET /api/v1/classes
List all class sections.

### POST /api/v1/classes
Create new class section.

**Request Body:**
```json
{
  "name": "10-A",
  "academicYear": "2024-2025",
  "capacity": 40
}
```

### PUT /api/v1/classes/:id
Update class section.

### DELETE /api/v1/classes/:id
Delete class section.

---

## Subjects

### GET /api/v1/subjects
List all subjects.

### POST /api/v1/subjects
Create new subject.

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MATH101"
}
```

---

## Enrollments

### GET /api/v1/enrollments
List enrollments with filters.

**Query Parameters:**
- `studentId`, `classSectionId`, `academicYear`

### POST /api/v1/enrollments
Create enrollment.

**Request Body:**
```json
{
  "studentId": "uuid",
  "classSectionId": "uuid",
  "academicYear": "2024-2025"
}
```

### DELETE /api/v1/enrollments/:id
Delete enrollment.

---

## Attendance

### GET /api/v1/attendance
Get attendance records.

**Query Parameters:**
- `classSectionId`, `date`, `startDate`, `endDate`, `studentId`

### POST /api/v1/attendance
Mark attendance for a class.

**Request Body:**
```json
{
  "classSectionId": "uuid",
  "date": "2024-01-15",
  "records": [
    { "studentId": "uuid", "status": "P" },
    { "studentId": "uuid", "status": "A" },
    { "studentId": "uuid", "status": "L" }
  ]
}
```

### GET /api/v1/attendance/history/:studentId
Get attendance history for a student.

---

## Fees

### GET /api/v1/fees
List fee records.

**Query Parameters:**
- `studentId`, `status` (DUE/PAID), `page`, `limit`

### POST /api/v1/fees
Create fee record.

**Request Body:**
```json
{
  "studentId": "uuid",
  "amount": 5000,
  "dueDate": "2024-02-01"
}
```

### PATCH /api/v1/fees/:id/pay
Mark fee as paid.

---

## Dashboard

### GET /api/v1/dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "data": {
    "totalStudents": 150,
    "totalTeachers": 20,
    "totalClasses": 10,
    "todayAttendancePercentage": 92.5,
    "feesDueCount": 25,
    "feesDueAmount": 125000,
    "recentActivity": [...]
  }
}
```

---

## Audit Logs

### GET /api/v1/audit-logs
Get audit logs. **Super Admin only.**

**Query Parameters:**
- `page`, `limit`, `entity`, `action`, `actorId`
