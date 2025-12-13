import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';

const prisma = new PrismaClient();

interface RegisterInput {
  email: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (input: RegisterInput) => {
  const { email, password, role, firstName, lastName, dateOfBirth } = input;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with role-specific profile
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      ...(role === 'STUDENT' && {
        student: {
          create: {
            firstName,
            lastName,
            dateOfBirth: dateOfBirth || new Date(),
          },
        },
      }),
      ...(role === 'TEACHER' && {
        teacher: {
          create: {
            firstName,
            lastName,
          },
        },
      }),
    },
    include: {
      student: true,
      teacher: true,
    },
  });

  const token = generateToken(user.id, user.email, user.role);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: true,
      teacher: true,
    },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id, user.email, user.role);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: {
        include: {
          class: true,
        },
      },
      teacher: {
        include: {
          classes: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.student || user.teacher || null,
  };
};

const generateToken = (userId: string, email: string, role: Role): string => {
  return jwt.sign({ userId, email, role }, config.jwtSecret, {
    expiresIn: '7d',
  });
};
