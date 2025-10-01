import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.js';

export function admin(req: AuthRequest, res: Response, next: NextFunction) {
   if (!req.user?.isAdmin) {
      return res
         .status(403)
         .json({ error: 'Access denied. Admin privileges required.' });
   }
   next();
}
