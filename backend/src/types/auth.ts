import type { Request } from 'express';

// Role enum matching Prisma schema
export enum Role {
   ADMIN = 'ADMIN',
   MODERATOR = 'MODERATOR',
   USER = 'USER',
   GUEST = 'GUEST',
}

// Permission types for access control
export type Permission = {
   resource: string;
   action: string;
};

// User payload attached to authenticated requests
export type UserPayload = {
   id: string;
   phone: string;
   email: string;
   name?: string;
   role: Role;
   isSuspended: boolean;
   permissions?: Record<string, string[]>; // Resource -> Actions mapping
};

// Extended Express Request with authenticated user
export interface AuthRequest extends Request {
   user?: UserPayload;
}

// Audit log action types
export enum AuditAction {
   USER_ROLE_CHANGED = 'user.role.changed',
   USER_SUSPENDED = 'user.suspended',
   USER_UNSUSPENDED = 'user.unsuspended',
   USER_DELETED = 'user.deleted',
   USER_CREATED = 'user.created',
   SESSION_INVALIDATED = 'session.invalidated',
   PERMISSIONS_CHANGED = 'permissions.changed',
}
