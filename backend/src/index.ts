import { config } from '@dotenvx/dotenvx';

// Load environment variables based on NODE_ENV
config({
   path: [
      `.env.${process.env.NODE_ENV}`, // .env.development
   ],
});

import express from 'express';
import { logger } from './utils/logger.js';

const app = express();

// Initialize startup modules and wait for them to complete
await import('./startup/logging.js').then((m) => m.default());
await import('./startup/cors.js').then((m) => m.default(app));
await import('./startup/db.js').then((m) => m.default());
await import('./startup/config.js').then((m) => m.default());
await import('./startup/routes.js').then((m) => m.default(app));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
   logger.info(`Server is running on http://localhost:${port}`);
});

export default server;
