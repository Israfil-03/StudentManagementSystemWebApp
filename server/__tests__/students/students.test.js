const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');
const bcrypt = require('bcrypt');

describe('Students Module', () => {
  let adminUser;
  let adminToken;
  let testStudent;

  beforeAll(async () => {
    // Create an admin user for testing
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    adminUser = await prisma.user.create({
      data: {
        username: 'testadmin_students',
        email: 'testadmin_students@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'testadmin_students',
        password: 'AdminPassword123!',
      });

    adminToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    if (testStudent) {
      await prisma.student.delete({ where: { id: testStudent.id } }).catch(() => {});
    }
    await prisma.user.delete({ where: { id: adminUser.id } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/students', () => {
    it('should create a new student', async () => {
      const studentData = {
        studentId: 'STU_TEST_001',
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com',
        dateOfBirth: '2005-01-15',
        gender: 'MALE',
        guardianName: 'Test Guardian',
        guardianPhone: '1234567890',
      };

      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData);

      expect(response.status).toBe(201);
      expect(response.body.data.student).toBeDefined();
      expect(response.body.data.student.studentId).toBe('STU_TEST_001');
      expect(response.body.data.student.firstName).toBe('Test');

      testStudent = response.body.data.student;
    });

    it('should fail with duplicate student ID', async () => {
      const studentData = {
        studentId: 'STU_TEST_001',
        firstName: 'Another',
        lastName: 'Student',
        dateOfBirth: '2005-02-20',
        gender: 'FEMALE',
        guardianName: 'Another Guardian',
        guardianPhone: '0987654321',
      };

      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData);

      expect(response.status).toBe(409);
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Incomplete',
        });

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/students')
        .send({
          studentId: 'STU_TEST_002',
          firstName: 'Test',
          lastName: 'Student',
          dateOfBirth: '2005-01-15',
          gender: 'MALE',
          guardianName: 'Test Guardian',
          guardianPhone: '1234567890',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/students', () => {
    it('should return paginated students list', async () => {
      const response = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.students).toBeDefined();
      expect(Array.isArray(response.body.data.students)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by search term', async () => {
      const response = await request(app)
        .get('/api/v1/students')
        .query({ search: 'STU_TEST_001' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.students.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/students')
        .query({ status: 'ACTIVE' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.students).toBeDefined();
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/students')
        .query({ page: 1, limit: 5 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('should return a student by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.student.id).toBe(testStudent.id);
      expect(response.body.data.student.studentId).toBe('STU_TEST_001');
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/v1/students/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/students/:id', () => {
    it('should update a student', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '9999999999',
      };

      const response = await request(app)
        .put(`/api/v1/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.student.firstName).toBe('Updated');
      expect(response.body.data.student.lastName).toBe('Name');
    });

    it('should update student status', async () => {
      const response = await request(app)
        .put(`/api/v1/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INACTIVE' });

      expect(response.status).toBe(200);
      expect(response.body.data.student.status).toBe('INACTIVE');

      // Reset status
      await request(app)
        .put(`/api/v1/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACTIVE' });
    });
  });

  describe('DELETE /api/v1/students/:id', () => {
    it('should delete a student', async () => {
      // Create a student to delete
      const createResponse = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STU_TO_DELETE',
          firstName: 'Delete',
          lastName: 'Me',
          dateOfBirth: '2005-03-10',
          gender: 'OTHER',
          guardianName: 'Delete Guardian',
          guardianPhone: '1111111111',
        });

      const studentToDelete = createResponse.body.data.student;

      const response = await request(app)
        .delete(`/api/v1/students/${studentToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/v1/students/${studentToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
