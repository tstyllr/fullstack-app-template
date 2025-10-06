import type { Request } from 'express';

export type UserPayload = {
   id: number;
   phone: string;
   isAdmin: boolean;
   name?: string;
};

export interface AuthRequest extends Request {
   user?: UserPayload;
}
