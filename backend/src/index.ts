import dotenv from 'dotenv';
import express from 'express';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();

// Initialize startup modules
import('./startup/logging.js').then((m) => m.default());
import('./startup/cors.js').then((m) => m.default(app));
import('./startup/routes.js').then((m) => m.default(app));
import('./startup/db.js').then((m) => m.default());
import('./startup/config.js').then((m) => m.default());

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
   logger.info(`Server is running on http://localhost:${port}`);
});

export default server;
