import express, { type Express, type Request, type Response } from 'express';
import { errorHandler } from '../middleware/error.js';
import authRouter from '../routes/auth.js';
import usersRouter from '../routes/users.js';

export default function (app: Express) {
   app.use(express.json());

   // Health check endpoint
   app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });

   // API routes
   app.use('/api/auth', authRouter);
   app.use('/api/users', usersRouter);

   // Error handling middleware (must be last)
   app.use(errorHandler);
}
