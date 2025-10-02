import express, { type Express, type Request, type Response } from 'express';
import { errorHandler } from '../middleware/error.js';
import authRouter from '../routes/auth.js';
import usersRouter from '../routes/users.js';
import chatRouter from '../routes/chat.js';

export default function (app: Express) {
   app.use(express.json());

   app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });
   app.use('/api/auth', authRouter);
   app.use('/api/users', usersRouter);
   app.use('/api/chat', chatRouter);

   // Error handling middleware (must be last)
   app.use(errorHandler);
}
