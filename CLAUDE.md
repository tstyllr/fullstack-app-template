# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo fullstack application template with:

- **Backend**: Express + TypeScript + MySQL + Prisma (Bun runtime)
- **Frontend**: Expo (React Native) with file-based routing
- **Tooling**: Bun for package management, Prettier for formatting, Husky for git hooks

## Development Commands

### Running the Application

```bash
# Run both backend and frontend concurrently (from root)
bun run dev

# Backend only
cd backend && bun run dev

# Frontend web (from frontend directory)
bun run web

# Frontend iOS/Android
bun run ios
bun run android
```

### Backend-Specific Commands

```bash
# Database operations (run from backend/)
bun run db:migrate      # Run Prisma migrations
bun run db:generate     # Generate Prisma client
bun run db:studio       # Open Prisma Studio

# Server
bun run dev            # Development with watch mode
bun start              # Production mode

# Testing
bun run test           # Run tests once
bun run test:watch     # Run tests in watch mode
```

### Code Quality

```bash
# Format code (from root)
bun run format         # Prettier on all files

# Frontend linting and type-checking
cd frontend && bun run lint
cd frontend && bun run tc

# Backend type-checking
cd backend && bun run tc
```

## Project Structure

### Monorepo Layout

- **Root**: Workspace configuration with concurrently script (index.ts) to run both services
- **backend/**: Express server with Service-Controller-Repository pattern
- **frontend/**: Expo app with file-based routing (React Native)

### Backend Architecture (backend/src/)

The backend follows a modular startup pattern with clear separation of concerns:

```
src/
├── controllers/     # HTTP request handling & Zod validation
├── services/        # Business logic layer
├── repositories/    # Database access via Prisma
├── routes/          # API route definitions (auth, users, chat)
├── middleware/      # auth, admin, errorHandler
├── startup/         # Modular initialization (logging, cors, db, config, routes)
├── types/           # TypeScript type definitions
└── utils/           # Shared utilities (logger)
```

**Key patterns:**

- Controllers validate input with Zod schemas and delegate to services
- Services contain business logic and call repositories
- Repositories provide Prisma-based database access
- Startup modules in src/startup/ initialize app components (loaded dynamically in index.ts)

### Database (backend/prisma/)

- **schema.prisma**: Defines User, RefreshToken, VerificationCode, ChatMessage models
- Prisma client generated to backend/generated/prisma/
- Uses MySQL as database provider

## Configuration Files

### Environment Variables

**Backend** (uses @dotenvx/dotenvx):

- Environment-specific files: `.env` (default)
- Key variables:
   - `DATABASE_URL`: MySQL connection string
   - `PORT`: Server port (default: 3000)
   - `REQUIRES_AUTH`: Enable/disable auth (default: true)
   - SMS API credentials (Tencent Cloud): `SMS_APP_ID`, `SMS_APP_KEY`, `SMS_TEMPLATE_ID`, `SMS_SIGN_NAME`

### Git Hooks

- **pre-commit**: Runs lint-staged → Prettier formatting on staged files
- Configuration in .lintstagedrc

## Testing & Development

- Backend runs on Bun runtime with hot reload (--watch flag)
- Backend testing with Bun's built-in test runner (bun test)
- Prisma Studio available for database inspection (bun run db:studio)
- Type checking available for both frontend and backend via `bun run tc`

## Adding New Features

### Backend

1. Define model in prisma/schema.prisma
2. Run migrations: `bun run db:migrate`
3. Create repository in src/repositories/
4. Create service in src/services/
5. Create controller in src/controllers/ with Zod validation
6. Create routes in src/routes/
7. Register routes in src/startup/routes.ts
