import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export type UserRole = 'ADMINISTRATOR' | 'LEAD_AUDITOR' | 'AUDITOR' | 'COMPLIANCE_OFFICER' | 'DEPARTMENT_OWNER';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  department: string | null;
  avatar: string | null;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      department: true,
      avatar: true,
    },
  });

  return user;
}

export const rolePermissions: Record<UserRole, string[]> = {
  ADMINISTRATOR: [
    'manage_users',
    'manage_regulations',
    'manage_requirements',
    'manage_audits',
    'manage_findings',
    'manage_corrective_actions',
    'manage_evidence',
    'view_all',
    'edit_all',
    'delete_all',
    'generate_reports',
    'manage_settings',
  ],
  LEAD_AUDITOR: [
    'manage_regulations',
    'manage_requirements',
    'manage_audits',
    'manage_findings',
    'manage_corrective_actions',
    'manage_evidence',
    'view_all',
    'edit_assigned',
    'generate_reports',
  ],
  AUDITOR: [
    'view_assigned_audits',
    'manage_own_findings',
    'manage_own_evidence',
    'view_evidence',
    'edit_own',
  ],
  COMPLIANCE_OFFICER: [
    'view_all',
    'view_regulations',
    'view_requirements',
    'view_findings',
    'manage_corrective_actions',
    'approve_evidence',
  ],
  DEPARTMENT_OWNER: [
    'view_department_audits',
    'view_department_findings',
    'manage_department_corrective_actions',
    'upload_evidence',
  ],
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false;
}
