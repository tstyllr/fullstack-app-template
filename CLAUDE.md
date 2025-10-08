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
├── llm/             # LLM integration (OpenAI client)
├── types/           # TypeScript type definitions
└── utils/           # Shared utilities (logger)
```

**Key patterns:**

- Controllers validate input with Zod schemas and delegate to services
- Services contain business logic and call repositories
- Repositories provide Prisma-based database access
- Startup modules in src/startup/ initialize app components (loaded dynamically in index.ts)

### Frontend Architecture (frontend/)

Expo app with:

- **app/**: File-based routing (Expo Router)
   - `_layout.tsx`: Root layout
   - `(auth)/`: Authentication screens (login)
   - `(tabs)/`: Tab-based navigation structure (index, setting)
   - `account.tsx`, `theme.tsx`, `change-password.tsx`: User management screens
   - `modal.tsx`: Modal screens
- **components/**: Reusable UI components following Atomic Design
   - **atoms/**: Basic building blocks (buttons, inputs, etc.)
   - **molecules/**: Simple component combinations
   - **organisms/**: Complex UI components
   - **templates/**: Page-level layouts
- **constants/**: App-wide constants (theme configuration)
- **hooks/**: Custom React hooks
- **assets/**: Images, fonts, etc.

### Database (backend/prisma/)

- **schema.prisma**: Defines User, RefreshToken, VerificationCode, ChatMessage models
- Prisma client generated to backend/generated/prisma/
- Uses MySQL as database provider

## Configuration Files

### Environment Variables

**Backend** (uses @dotenvx/dotenvx):

- Environment-specific files: `.env` (default), `.env.development`, `.env.production`, `.env.test`
- Key variables:
   - `DATABASE_URL`: MySQL connection string
   - `JWT_PRIVATE_KEY`: Secret for JWT signing
   - `PORT`: Server port (default: 3000)
   - `REQUIRES_AUTH`: Enable/disable auth (default: true)
   - SMS API credentials (Tencent Cloud): `SMS_APP_ID`, `SMS_APP_KEY`, `SMS_TEMPLATE_ID`, `SMS_SIGN_NAME`
   - OpenAI configuration: `OPENAI_API_KEY`, `OPENAI_BASE_URL`

**Frontend**:

- Standard Expo configuration via app.json

### Git Hooks

- **pre-commit**: Runs lint-staged → Prettier formatting on staged files
- Configuration in .lintstagedrc

## Authentication & Security

Backend implements phone-based authentication:

- JWT token authentication (Bearer scheme)
- Verification codes sent via Tencent Cloud SMS
- Password hashing with bcrypt
- Middleware: `auth` (validates JWT), `admin` (requires admin role)
- RefreshToken model for token rotation

## LLM Integration

Backend includes OpenAI integration:

- LLM client in `src/llm/client.ts`
- Chat API endpoint at `/api/chat`
- ChatMessage model stores conversation history with conversationId grouping
- Messages support system, user, and assistant roles

## Testing & Development

- Backend runs on Bun runtime with hot reload (--watch flag)
- Backend testing with Bun's built-in test runner (bun test)
- Frontend uses Expo development server with Fast Refresh
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

### Frontend

1. Add screens in app/ directory (file-based routing)
2. Create components following Atomic Design pattern:
   - atoms/ for basic elements
   - molecules/ for simple combinations
   - organisms/ for complex components
   - templates/ for page layouts
3. Use themed components for consistent styling and dark mode compatibility
4. Update theme constants in constants/theme.ts if needed
5. Expo Router handles navigation automatically based on file structure

## Important Notes

- **Runtime**: Backend uses Bun, not Node.js (faster execution, native TypeScript support)
- **Logging**: Winston logger available via `import { logger } from './utils/logger.js'`
- **Error Handling**: Centralized error handler in middleware, logs to logs/ directory
- **Prisma Output**: Custom output path at backend/generated/prisma (not default node_modules)
- **TypeScript**: Strict mode enabled, uses ESNext with bundler module resolution
- Frontend is a Universal React Native applications (Android, iOS, and web) built with Expo
- The frontend must be compatible with dark mode
- This project does not support internationalization; it requires Chinese language support
- **Frontend Styling**: Never hardcode `margin`, `padding`, `borderRadius`, typography, or colors—always use theme constants from `constants/theme.ts` (`Spacing`, `BorderRadius`, `Typography`, `Colors`)
- **Frontend Components**: Prefer themed components (`ThemedView`, `ThemedText`, `ThemedButton`, `ThemedInput`) over React Native primitives (`View`, `Text`, `Button`, `TextInput`) for unified theme management and dark mode support
- **Frontend Icons**: Use `IconSymbol` component for platform-native icons (iOS, Android, Web) without bundling additional assets
