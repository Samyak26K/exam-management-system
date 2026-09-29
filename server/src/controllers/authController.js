import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function getCookieOptions(environment = process.env.NODE_ENV) {
  const isProduction = environment === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000
  };
}

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export function validateCredentials({ name, email, password, academicYear, section, role }) {
  const hasName = typeof name === 'string' && name.trim();
  const normalizedEmail = typeof email === 'string' ? email.trim() : '';
  if (!hasName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 8) {
    return 'Name, valid email, and a password of at least 8 characters are required';
  }
  if (role === 'student' && (typeof academicYear !== 'string' || !academicYear.trim() || typeof section !== 'string' || !section.trim())) return 'Academic year and section are required';
  return null;
}

export function isValidProvisioningKey(suppliedKey, configuredKey) {
  if (typeof suppliedKey !== 'string' || typeof configuredKey !== 'string' || !configuredKey) return false;
  const suppliedBuffer = Buffer.from(suppliedKey);
  const configuredBuffer = Buffer.from(configuredKey);
  return suppliedBuffer.length === configuredBuffer.length && timingSafeEqual(suppliedBuffer, configuredBuffer);
}

async function register(request, response, role) {
  const { name, email, password, academicYear, section, setupKey } = request.body && typeof request.body === 'object' ? request.body : {};
  const validationError = validateCredentials({ name, email, password, academicYear, section, role });
  if (validationError) return response.status(400).json({ message: validationError });
  if (role === 'admin' && !isValidProvisioningKey(setupKey, process.env.ADMIN_SETUP_KEY)) {
    return response.status(403).json({ message: 'Invalid administrator provisioning key' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) return response.status(409).json({ message: 'An account with this email already exists' });

  const userData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, 12),
    role
  };
  if (role === 'student') {
    userData.academicYear = academicYear.trim();
    userData.section = section.trim();
  }

  await User.create(userData);

  response.status(201).json({ message: `${role} account created successfully` });
}

export const registerStudent = (request, response, next) => register(request, response, 'student').catch(next);
export const registerAdmin = (request, response, next) => register(request, response, 'admin').catch(next);

export async function login(request, response, next) {
  try {
    const { email, password, role } = request.body && typeof request.body === 'object' ? request.body : {};
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password || !['admin', 'student'].includes(role)) {
      return response.status(400).json({ message: 'Email, password, and account type are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), role }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ message: 'Invalid email, password, or account type' });
    }

    response.cookie('token', createToken(user.id), getCookieOptions()).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, academicYear: user.academicYear, section: user.section }
    });
  } catch (error) {
    next(error);
  }
}

export function logout(_request, response) {
  response.clearCookie('token', getCookieOptions()).json({ message: 'Logged out successfully' });
}

export function currentUser(request, response) {
  response.json({ user: request.user });
}
