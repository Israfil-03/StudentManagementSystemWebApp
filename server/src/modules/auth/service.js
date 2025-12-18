const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
const config = require('../../config/env');

/**
 * Authenticate user with email and password
 */
const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw { status: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
  }

  if (!user.active) {
    throw { status: 401, message: 'Account deactivated', code: 'ACCOUNT_DEACTIVATED' };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw { status: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
  }

  const token = jwt.sign(
    { userId: user.id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

/**
 * Get current user data
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true
    }
  });

  if (!user) {
    throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };
  }

  return user;
};

/**
 * Create a new staff member (ADMIN or STAFF role)
 */
const createStaff = async (data, creatorRole) => {
  // Only SUPER_ADMIN can create ADMIN
  if (data.role === 'ADMIN' && creatorRole !== 'SUPER_ADMIN') {
    throw { status: 403, message: 'Only Super Admin can create Admin users', code: 'FORBIDDEN' };
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existing) {
    throw { status: 409, message: 'Email already registered', code: 'DUPLICATE_EMAIL' };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true
    }
  });

  return user;
};

/**
 * List all staff members with pagination
 */
const listStaff = async ({ page, limit, skip, q, role }) => {
  const where = {};
  
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } }
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total };
};

/**
 * Deactivate a staff member
 */
const deactivateStaff = async (staffId, actorId, actorRole) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId }
  });

  if (!staff) {
    throw { status: 404, message: 'Staff not found', code: 'NOT_FOUND' };
  }

  // Cannot deactivate SUPER_ADMIN
  if (staff.role === 'SUPER_ADMIN') {
    throw { status: 403, message: 'Cannot deactivate Super Admin', code: 'FORBIDDEN' };
  }

  // Only SUPER_ADMIN can deactivate ADMIN
  if (staff.role === 'ADMIN' && actorRole !== 'SUPER_ADMIN') {
    throw { status: 403, message: 'Only Super Admin can deactivate Admin users', code: 'FORBIDDEN' };
  }

  // Cannot deactivate yourself
  if (staff.id === actorId) {
    throw { status: 400, message: 'Cannot deactivate your own account', code: 'SELF_DEACTIVATION' };
  }

  const updated = await prisma.user.update({
    where: { id: staffId },
    data: { active: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true
    }
  });

  return updated;
};

/**
 * Reactivate a staff member
 */
const reactivateStaff = async (staffId, actorRole) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId }
  });

  if (!staff) {
    throw { status: 404, message: 'Staff not found', code: 'NOT_FOUND' };
  }

  // Only SUPER_ADMIN can reactivate ADMIN
  if (staff.role === 'ADMIN' && actorRole !== 'SUPER_ADMIN') {
    throw { status: 403, message: 'Only Super Admin can reactivate Admin users', code: 'FORBIDDEN' };
  }

  const updated = await prisma.user.update({
    where: { id: staffId },
    data: { active: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true
    }
  });

  return updated;
};

/**
 * Reset staff password
 */
const resetStaffPassword = async (staffId, newPassword, actorId, actorRole) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId }
  });

  if (!staff) {
    throw { status: 404, message: 'Staff not found', code: 'NOT_FOUND' };
  }

  // Cannot reset SUPER_ADMIN password (they should use their own method)
  if (staff.role === 'SUPER_ADMIN' && staff.id !== actorId) {
    throw { status: 403, message: 'Cannot reset Super Admin password', code: 'FORBIDDEN' };
  }

  // Only SUPER_ADMIN can reset ADMIN password
  if (staff.role === 'ADMIN' && actorRole !== 'SUPER_ADMIN') {
    throw { status: 403, message: 'Only Super Admin can reset Admin passwords', code: 'FORBIDDEN' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: staffId },
    data: { passwordHash }
  });

  return { message: 'Password reset successfully' };
};

module.exports = {
  login,
  getCurrentUser,
  createStaff,
  listStaff,
  deactivateStaff,
  reactivateStaff,
  resetStaffPassword
};
