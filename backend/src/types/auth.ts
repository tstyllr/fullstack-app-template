import type { Request } from 'express';

export type UserPayload = {
   _id: string;
   phone: string;
   name?: string;
   isAdmin: boolean;
};

export interface AuthRequest extends Request {
   user?: UserPayload;
}
