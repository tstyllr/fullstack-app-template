# Backend Server Template

A modern, production-ready backend server template combining best practices from Express, TypeScript, MySQL, and modern tooling.

## Features

✅ **TypeScript** - Full type safety with strict mode enabled
✅ **Express** - Fast, unopinionated web framework
✅ **MySQL + Prisma** - Type-safe database access with modern ORM
✅ **Zod Validation** - Runtime type validation for API requests
✅ **Winston Logging** - Comprehensive logging with file and console output
✅ **CORS** - Cross-origin resource sharing support
✅ **Error Handling** - Centralized error handling with express-async-errors
✅ **Modular Architecture** - Clean separation of concerns with startup modules
✅ **Service-Controller-Repository Pattern** - Organized code structure

## Architecture

```
template/
├── src/
│   ├── controllers/     # Request/response handling & validation
│   ├── services/        # Business logic
│   ├── repositories/    # Database access layer
│   ├── routes/          # API route definitions
│   ├── middleware/      # Auth, error handling, etc.
│   ├── startup/         # Application initialization modules
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper functions (logger, etc.)
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── logs/                # Application logs (auto-generated)
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- MySQL database running
- Node.js (optional, for compatibility)

### Installation

1. Clone or copy this template
2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL` - Your MySQL connection string
   - `PORT` - Server port (default: 3000)
   - `REQUIRES_AUTH` - Enable/disable authentication (default: true)

4. Set up the database:

   ```bash
   # Run migrations
   bun run db:migrate

   # Generate Prisma client
   bun run db:generate
   ```

5. Start the server:

   ```bash
   # Development mode (with hot reload)
   bun run dev

   # Production mode
   bun start
   ```

## API Endpoints

### Health Check

```http
GET /health
```

## Configuration

### Environment Variables

| Variable        | Description                          | Default       |
| --------------- | ------------------------------------ | ------------- |
| `PORT`          | Server port                          | `3000`        |
| `NODE_ENV`      | Environment (development/production) | `development` |
| `DATABASE_URL`  | MySQL connection string              | Required      |
| `REQUIRES_AUTH` | Enable/disable authentication        | `true`        |

### Database Schema

The template includes a basic User model. To add more models:

1. Edit `prisma/schema.prisma`
2. Run migrations:
   ```bash
   bun run db:migrate
   ```
3. Generate Prisma client:
   ```bash
   bun run db:generate
   ```

## Development

### Adding New Features

1. **Add a new model** in `prisma/schema.prisma`
2. **Create a repository** in `src/repositories/`
3. **Create a service** in `src/services/`
4. **Create a controller** in `src/controllers/` with Zod validation
5. **Create routes** in `src/routes/`
6. **Register routes** in `src/startup/routes.ts`

### Middleware

Available middleware:

- `errorHandler` - Centralized error handling

### Logging

Winston logger is configured with:

- Console output (in development)
- File output (`logs/error.log` for errors, `logs/combined.log` for all)

Usage:

```typescript
import { logger } from './utils/logger.js';

logger.info('Info message');
logger.error('Error message', { error });
```

## Project Structure Highlights

### Startup Modules

The application uses a modular startup pattern (inspired by server1):

- `startup/logging.ts` - Logging and error handling setup
- `startup/cors.ts` - CORS configuration
- `startup/config.ts` - Environment validation
- `startup/db.ts` - Database connection
- `startup/routes.ts` - Route registration

### Service-Controller-Repository Pattern

- **Controllers**: Handle HTTP requests, validate input with Zod, return responses
- **Services**: Contain business logic, call repositories
- **Repositories**: Direct database access via Prisma

## Security Features

- Environment variable validation
- Admin role authorization
- CORS protection
- Error message sanitization in production

## License

ISC
