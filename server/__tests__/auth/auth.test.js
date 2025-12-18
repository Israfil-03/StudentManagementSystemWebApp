const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');
const bcrypt = require('bcrypt');

describe('Auth Module', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await prisma.user.create({
      data: {
        username: 'testuser_auth',
        email: 'testauth@example.com',
        password: hashedPassword,
        role: 'STAFF',
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser_auth',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.username).toBe('testuser_auth');
      expect(response.body.data.user).not.toHaveProperty('password');

      authToken = response.body.data.token;
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser_auth',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistent_user',
          password: 'SomePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.username).toBe('testuser_auth');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBeDefined();

      // Verify login with new password
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser_auth',
          password: 'NewPassword123!',
        });

      expect(loginResponse.status).toBe(200);

      // Reset password back for other tests
      await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
        .send({
          currentPassword: 'NewPassword123!',
          newPassword: 'TestPassword123!',
        });
    });

    it('should fail with wrong current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(401);
    });
  });
});
