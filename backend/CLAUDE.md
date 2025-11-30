# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the backend of a fullstack Express + TypeScript API server integrated with Better Auth for phone number authentication. It uses Prisma ORM with MySQL and follows a clean service-controller-repository pattern.

## Technology Stack

- **Bun** - JavaScript runtime and package manager
- **Express v5** - Web framework
- **TypeScript** with strict mode enabled
- **Better Auth v1.4** - Authentication with phone number + SMS OTP
- **Prisma v6** - Type-safe ORM with MySQL
- **Winston** - Logging with file and console output
- **Zod** - Runtime validation
- **Tencent Cloud SMS** - SMS verification code delivery

## Development Commands

```bash
# Start development server with hot reload
bun run dev

# Start production server
bun start

# Type checking
bun run tc

# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Database operations
bun run db:migrate     # Run Prisma migrations
bun run db:generate    # Generate Prisma client
bun run db:studio      # Open Prisma Studio GUI
```

## Project Architecture

### Modular Startup Pattern

The application uses a modular initialization pattern in `src/index.ts`:

```typescript
await import('./startup/logging.js').then((m) => m.default());     // Error handling & logging
await import('./startup/cors.js').then((m) => m.default(app));     // CORS configuration
await import('./startup/db.js').then((m) => m.default());          // Database connection
await import('./startup/config.js').then((m) => m.default());      // Environment validation
await import('./startup/routes.js').then((m) => m.default(app));   // Route registration
```

Each startup module is a default export function that initializes a specific aspect of the application.

### Service-Controller-Repository Pattern

```
src/
├── controllers/       # HTTP request/response handling + Zod validation
├── services/          # Business logic layer
├── repositories/      # Database access via Prisma
├── routes/            # Route definitions (Express routers)
├── middleware/        # Auth, error handling, role checks
├── startup/           # Application initialization modules
├── lib/               # Third-party integrations (Better Auth)
├── types/             # TypeScript type definitions
└── utils/             # Helper utilities (logger, session)
```

**Data Flow**: Route → Controller (validate) → Service (business logic) → Repository (DB access)

### Authentication Architecture

**Better Auth Integration** (`src/lib/auth.ts`):
- Phone number authentication with SMS OTP (passwordless)
- Optional password-based login after account creation
- Auto-registration on first OTP verification
- Session-based auth with httpOnly cookies (not JWT)
- Temporary email generation: `{phoneNumber}@phone.local`
- Default username: `用户{last4digits}`

**Auth Middleware** (`src/middleware/auth.ts`):
- Validates session via Better Auth API
- Populates `req.user` with authenticated user data
- Blocks suspended users
- Development bypass mode via `REQUIRES_AUTH=false`

**Role-Based Access Control**:
- Roles: `ADMIN`, `MODERATOR`, `USER`, `GUEST` (defined in Prisma schema)
- Middleware: `auth.ts` (authentication), `admin.ts` (ADMIN only), `moderator.ts` (MODERATOR+)
- `requireRole.ts` - Generic role checker factory

**Auth Endpoints** (handled by Better Auth at `/api/auth/*`):
- `POST /api/auth/phone-number/send-otp` - Send SMS verification code
- `POST /api/auth/phone-number/verify` - Verify OTP and login/register
- `POST /api/auth/sign-in/phone-number` - Password-based login
- `GET /api/auth/get-session` - Check current session
- `POST /api/auth/sign-out` - Logout

### Database Schema (Prisma)

**Key Models**:
- `User` - User accounts (cuid ID, phoneNumber, role, isSuspended)
- `Session` - Better Auth sessions (token, expiresAt, ipAddress)
- `Account` - Authentication provider accounts
- `Verification` - SMS OTP codes (5min expiry, 3 attempts)
- `AuditLog` - User action audit trail (actor, target, action, resource)
- `RateLimit` - Better Auth rate limiting storage

**Important**: Prisma client is generated to `generated/prisma/` (not `node_modules/@prisma/client`). Import from:
```typescript
import { PrismaClient } from '../../generated/prisma/index.js';
```

### Environment Configuration

Required variables (see `.env.example`):
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# Better Auth
BETTER_AUTH_SECRET="..."        # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
REQUIRES_AUTH="true"            # Set to "false" to bypass auth in dev

# Tencent Cloud SMS
TENCENT_SMS_SECRET_ID="..."
TENCENT_SMS_SECRET_KEY="..."
TENCENT_SMS_APP_ID="..."
TENCENT_SMS_SIGN_NAME="..."
TENCENT_SMS_TEMPLATE_ID="..."
TENCENT_SMS_REGION="ap-guangzhou"
TENCENT_SMS_CODE_TIMEOUT="2"

# Optional
DEEPSEEK_API_KEY="..."
```

## Key Architectural Patterns

### Better Auth Route Mounting

**CRITICAL**: Better Auth must be mounted BEFORE `express.json()` middleware:

```typescript
// In src/startup/routes.ts
app.all('/api/auth/*splat', toNodeHandler(auth));  // Better Auth first
app.use(express.json());                            // Then JSON middleware
```

Reason: Better Auth handles its own body parsing. Express 5 requires `*splat` syntax (not `*`).

### Logging with Winston

Configured in `src/utils/logger.ts`:
- Console output in development
- File output: `logs/error.log` (errors only), `logs/combined.log` (all)
- JSON format for production, pretty format for development

```typescript
import { logger } from '@/utils/logger.js';

logger.info('User registered', { userId: user.id });
logger.error('SMS failed', { error: err.message });
```

### Error Handling

Global error handler in `src/middleware/error.ts`:
- Sanitizes error messages in production
- Logs all errors with Winston
- Returns consistent JSON error responses

### Audit Logging

Audit service (`src/services/audit.service.ts`) tracks sensitive actions:
- User role changes
- User suspensions
- User deletions
- Records actor, target, action, resource, IP, user-agent

```typescript
import { auditService } from '@/services/audit.service.js';

await auditService.log({
  actorId: req.user!.id,
  targetId: userId,
  action: 'suspend',
  resource: 'user',
  details: JSON.stringify({ reason }),
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

## Common Development Tasks

### Adding a New Feature

1. **Update Prisma schema** (`prisma/schema.prisma`)
2. **Run migration**: `bun run db:migrate`
3. **Generate client**: `bun run db:generate`
4. **Create repository** (`src/repositories/`) - DB access layer
5. **Create service** (`src/services/`) - Business logic
6. **Create controller** (`src/controllers/`) - Request handling + Zod validation
7. **Create routes** (`src/routes/`) - Express router
8. **Register routes** in `src/startup/routes.ts`

### Working with Authentication

**Check if user is authenticated**:
```typescript
import { auth } from '@/middleware/auth.js';

router.get('/protected', auth, (req: AuthRequest, res) => {
  const userId = req.user!.id;  // Always defined after auth middleware
  // ...
});
```

**Require specific role**:
```typescript
import { auth } from '@/middleware/auth.js';
import { admin } from '@/middleware/admin.js';

router.delete('/users/:id', [auth, admin], userController.deleteUser);
```

**Bypass auth in development**:
Set `REQUIRES_AUTH=false` in `.env`. The auth middleware will automatically use the first admin user.

### Testing SMS in Development

Without real SMS credentials, you can:
1. Check server logs for OTP codes (logged by `src/lib/auth.ts`)
2. Use Better Auth's development mode (if enabled)
3. Query the `verifications` table directly for testing

### Database Migrations

**Create new migration**:
```bash
bun run db:migrate
# Follow prompts to name the migration
```

**Reset database** (WARNING: deletes all data):
```bash
bunx prisma migrate reset
```

**View database**:
```bash
bun run db:studio
# Opens Prisma Studio at http://localhost:5555
```

## API Routes

### Authentication (`/api/auth/*`)
Handled by Better Auth - see AUTHENTICATION.md for full documentation

### Users (`/api/users`)
- `GET /api/users/me` - Get current user (auth required)
- `GET /api/users` - List all users (admin only)
- `PUT /api/users/:id/role` - Change user role (admin only)
- `POST /api/users/:id/suspend` - Suspend user (moderator+)
- `POST /api/users/:id/unsuspend` - Unsuspend user (moderator+)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/audit-logs` - View audit logs (admin only)

### Health Check
- `GET /health` - Server health status

## Important Notes

### TypeScript Path Aliases
- `@/` maps to `src/` directory
- Configured in `tsconfig.json`
- Example: `import { logger } from '@/utils/logger.js';`

### Module System
- Using ES modules (`"type": "module"` in package.json)
- All imports MUST include `.js` extension, even for `.ts` files
- Bun handles TypeScript compilation automatically

### Better Auth Rate Limiting
Configured in `src/lib/auth.ts`:
- Global: 100 requests/minute
- Sign-in: 5 requests/minute
- OTP verification: 3 requests/minute
- Sign-up: 3 requests/minute
- Password reset: 3 requests/5 minutes
- Uses database storage for distributed environments

### Phone Number Format
- Must use international format with country code: `+8613800138000`
- Validation happens in Better Auth phone number plugin
- Stored as VARCHAR(20) in database

### Session Management
- Session tokens stored in httpOnly cookies (prefix: `better-auth`)
- Session expires after 30 days
- Session refreshed every 24 hours automatically
- Secure cookies enabled in production only

### Production Considerations
- Change `BETTER_AUTH_SECRET` (use `openssl rand -base64 32`)
- Enable secure cookies (automatic in production)
- Set proper `BETTER_AUTH_URL` to your domain
- Configure MySQL for production (connection pooling, etc.)
- Review and adjust rate limits for your use case
- Set up SMS credentials with proper limits

## Monorepo Context

This backend is part of a Bun workspace monorepo:
- Root `package.json` defines workspace: `["./backend", "./frontend"]`
- Frontend is Expo + Tamagui mobile/web app
- Run `bun run dev` from root to start both servers concurrently
- Backend runs on port 3000 by default
- Frontend connects via `EXPO_PUBLIC_API_URL` env var
