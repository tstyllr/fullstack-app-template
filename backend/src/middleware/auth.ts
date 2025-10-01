import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest, JwtPayload } from '../types/auth.js';

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
   // Check if authentication is required
   if (process.env.REQUIRES_AUTH === 'false') {
      return next();
   }

   const authHeader = req.header('Authorization');
   if (!authHeader) {
      return res.status(401).json({
         error: 'Access denied. No token provided.',
         code: 'NO_TOKEN',
      });
   }

   // Extract token from "Bearer <token>" format
   const parts = authHeader.split(' ');
   if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
         error: 'Invalid authorization format. Use: Bearer <token>',
         code: 'INVALID_FORMAT',
      });
   }

   const token = parts[1] as string;

   try {
      const decoded = jwt.verify(
         token,
         process.env.JWT_PRIVATE_KEY!
      ) as JwtPayload;
      req.user = decoded;
      next();
   } catch (ex: any) {
      // Distinguish between token expired and invalid token
      if (ex.name === 'TokenExpiredError') {
         return res.status(401).json({
            error: 'Access token has expired. Please refresh your token.',
            code: 'TOKEN_EXPIRED',
         });
      }

      res.status(403).json({
         error: 'Invalid token. Please login again.',
         code: 'INVALID_TOKEN',
      });
   }
}
