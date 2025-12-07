# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend of a fullstack Expo + Tamagui mobile/web application integrated with a Better Auth authentication system. The app supports iOS, Android, and Web platforms.

## Technology Stack

- **Expo SDK 54** with Expo Router (file-based routing)
- **Tamagui v1.138** - High-performance UI components with theme support
- **Better Auth v1.4** with Expo plugin for authentication
- **React Query** (TanStack Query) for server state management
- **TypeScript** with strict mode enabled
- **Bun** as package manager and runtime

## Development Commands

```bash
# Start Expo dev server (choose platform interactively)
bun run start

# Launch specific platforms
bun run web        # Web version
bun run ios        # iOS simulator (Mac only)
bun run android    # Android emulator

# Type checking
bun run tc         # Run TypeScript compiler without emit
```

## Tamagui guideline

@.docs/tamagui-guideline.md

## Project Architecture

### Routing Structure (Expo Router v6)

The app uses file-based routing with route groups:

```
app/
├── _layout.tsx              # Root layout with providers
├── (auth)/                  # Auth route group (unauthenticated)
│   ├── _layout.tsx
│   └── login.tsx
├── (tabs)/                  # Main app route group (authenticated)
│   ├── _layout.tsx          # Tab navigation layout
│   ├── index.tsx
│   └── settings.tsx
└── +not-found.tsx
```

**Route Groups**: Parentheses in folder names `(auth)`, `(tabs)` create logical groups without affecting the URL path.

### Authentication Flow

**Better Auth Integration**:

- Auth client configured in `lib/auth-client.ts`
- Uses `@better-auth/expo` plugin with SecureStore for token storage
- Backend API base URL from `EXPO_PUBLIC_API_URL` env var (defaults to `http://localhost:3000` in dev)

**Auto Navigation Guard** (`hooks/useAuthRedirect.ts`):

- Called in root `_layout.tsx`
- Unauthenticated users → redirected to `/login`
- Authenticated users accessing `/login` → redirected to `/(tabs)`

**Session Management**:

- `useSession()` hook from Better Auth React client
- Session stored in Expo SecureStore
- App scheme: `fullstackapp` (matches `app.json`)

### State Management

- **React Query** (`lib/query-client.ts`): Server state, API data fetching
- **Better Auth React**: Authentication state via `useSession()`

### Providers Hierarchy

```tsx
QueryClientProvider
  └── TamaguiProvider
      └── Theme (auto dark/light mode)
          └── RootNavigator
```

## Environment Configuration

Create `.env` file (see `.env.example`):

```env
EXPO_PUBLIC_API_URL=http://localhost:3000  # Backend API URL
```

**Important**:

- Use `EXPO_PUBLIC_*` prefix for variables accessed in client code
- For real devices in dev, replace `localhost` with your computer's LAN IP address
- In production, set this to your actual API domain

## Key Architectural Patterns

### Component Structure

- UI components in `components/ui/`
- Page components in `app/` (Expo Router)
- Shared hooks in `hooks/`
- Shared utilities/config in `lib/`

### Better Auth Configuration

- Client uses `expoClient` plugin with SecureStore
- Storage prefix: `fullstackapp_auth`
- Scheme must match `app.json` for OAuth redirects

### Theme System

- Tamagui auto-detects system color scheme (light/dark)
- Config in `tamagui.config.ts`
- Uses system fonts (SF Pro on iOS, Roboto on Android)
- Lucide icons available via `@tamagui/lucide-icons`

## Common Tasks

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/profile.tsx`)
2. Export default component
3. Access via `router.push('/profile')` or `<Link href="/profile">`

### Adding to Tab Navigation

1. Add new file in `app/(tabs)/` directory
2. Update `app/(tabs)/_layout.tsx` to add tab configuration

### Working with Authentication

```tsx
import { useSession } from '@/lib/auth-client';

function MyComponent() {
   const { data: session, isPending } = useSession();

   if (isPending) return <LoadingSpinner />;
   if (!session) return <LoginPrompt />;

   return <AuthenticatedContent user={session.user} />;
}
```

### API Calls with React Query

Better Auth handles authentication endpoints automatically. For custom API calls:

```tsx
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
   queryKey: ['myData'],
   queryFn: async () => {
      const res = await fetch(
         `${process.env.EXPO_PUBLIC_API_URL}/api/my-endpoint`
      );
      return res.json();
   },
});
```

## Backend Integration

The frontend connects to a Node.js/Express backend with:

- Better Auth server (`/api/auth/*` endpoints)
- MySQL database via Prisma
- Phone number + SMS OTP authentication
- Session-based auth with httpOnly cookies

**Auth Endpoints** (handled by Better Auth):

- `POST /api/auth/phone-number/send-otp` - Send SMS code
- `POST /api/auth/phone-number/verify` - Verify code & login
- `POST /api/auth/sign-in/phone-number` - Password login
- `GET /api/auth/get-session` - Check session
- `POST /api/auth/sign-out` - Logout

## Important Notes

### TypeScript

- Strict mode enabled in `tsconfig.json`
- Fix type errors or temporarily disable strict mode if blocking development
- Run `bun run tc` frequently to catch type issues

### Platform-Specific Considerations

- **iOS**: Requires Mac with Xcode for native builds
- **Android**: Requires Android Studio and SDK
- **Web**: Works on any browser, best for quick testing

### Path Aliases

- `@/` maps to root directory (configured in `tsconfig.json`)
- Example: `import { useSession } from '@/lib/auth-client'`

### Expo Router Conventions

- `_layout.tsx` = Layout component (wraps child routes)
- `+not-found.tsx` = 404 page
- `index.tsx` = Default route in directory
- `(folder)` = Route group (doesn't affect URL)

## Testing on Physical Devices

1. Ensure phone and computer are on same WiFi network
2. Find your computer's LAN IP (e.g., `192.168.1.100`)
3. Update `.env`: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`
4. Run `bun run start` and scan QR code with Expo Go app

## Monorepo Context

This frontend is part of a Bun workspace monorepo:

- Root `package.json` defines workspace: `["./backend", "./frontend"]`
- Shared dev dependencies (Prettier, Husky) at root level
- Run `bun run dev` from root to start both backend and frontend concurrently
