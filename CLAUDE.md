# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fullstack monorepo template with:

- **Backend**: Express + TypeScript API with Better Auth phone authentication
- **Frontend**: Expo + Tamagui mobile/web application
- **Database**: MySQL via Prisma ORM
- **Runtime**: Bun for both package management and execution

## Monorepo Structure

```
fullstack-app-template/
├── backend/               # Express API server
├── frontend/              # Expo + Tamagui app (iOS/Android/Web)
├── index.ts               # Concurrently runs both servers
├── package.json           # Workspace root with shared dev deps
└── node_modules/          # Shared dependencies
```

**Workspace Configuration**: Root `package.json` defines `workspaces: ["./backend", "./frontend"]`

For detailed subsystem documentation, see:

- @backend/CLAUDE.md - Backend-specific details
- @frontend/CLAUDE.md - Frontend-specific details
