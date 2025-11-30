import express, { type Express, type Request, type Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { errorHandler } from '../middleware/error.js';
import { auth } from '../lib/auth.js';
import usersRouter from '../routes/users.js';

export default function (app: Express) {
   // Mount Better Auth handler BEFORE express.json() middleware
   // This is important because Better Auth handles its own body parsing
   // Express 5 requires *splat syntax instead of *
   app.all('/api/auth/*splat', toNodeHandler(auth));

   // Now mount express.json() for other routes
   app.use(express.json());

   app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });

   app.use('/api/users', usersRouter);

   // Error handling middleware (must be last)
   app.use(errorHandler);
}
