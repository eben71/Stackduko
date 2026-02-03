# Stackdoku - Reveal & Resolve

## Overview

Stackdoku is a web-based puzzle game that combines Mahjong-style layered tile mechanics with Sudoku solving. Players remove "free" tiles from a 3D isometric stack to reveal numbers on a hidden 9x9 Sudoku grid, then must solve the puzzle with the revealed information.

The application uses a hybrid React + Phaser 3 architecture: Phaser handles the game canvas (tiles, interactions, animations) while React manages the UI layer (menus, HUD, dialogs). The backend is a Node.js/Express server with PostgreSQL for persistent leaderboard storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for UI components and routing
- **Phaser 3** for game rendering and input handling within a canvas element
- **Zustand** for global state management bridging React and Phaser
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state and API caching
- **Framer Motion** for UI animations and transitions
- **Tailwind CSS** with shadcn/ui component library for styling

The game uses a clear separation: React renders the HTML overlay (menus, HUD, score displays) while Phaser manages the WebGL/Canvas game scene. Communication between them happens through the Zustand store.

### Backend Architecture
- **Express 5** REST API server running on Node.js
- **TypeScript** throughout with ES modules
- **Drizzle ORM** for type-safe database operations
- Shared schema definitions in `/shared/schema.ts` used by both client and server
- API routes defined in `/shared/routes.ts` with Zod validation schemas

### Data Storage
- **PostgreSQL** database for persistent storage
- **Drizzle ORM** with drizzle-zod for schema validation
- Two main tables: `users` (guest accounts) and `scores` (leaderboard entries)
- Database connection via `DATABASE_URL` environment variable

### Build System
- **Vite** for frontend development and bundling
- **esbuild** for server bundling in production
- Custom build script at `/script/build.ts` that bundles both client and server
- Output: client assets to `dist/public`, server to `dist/index.cjs`

### Project Structure
```
client/           # React frontend application
  src/
    components/   # shadcn/ui components
    game/         # Phaser game code and logic
    hooks/        # React hooks including API hooks
    pages/        # Route components
    store/        # Zustand state management
    lib/          # Utilities
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
```

## External Dependencies

### Database
- PostgreSQL database (connection string via `DATABASE_URL` environment variable)
- Drizzle Kit for database migrations (`npm run db:push`)

### Key NPM Packages
- **phaser**: Game engine for 2D/isometric rendering
- **zustand**: State management for React-Phaser bridge
- **@tanstack/react-query**: Server state management
- **drizzle-orm** + **drizzle-zod**: Type-safe ORM with validation
- **framer-motion**: Animation library for UI
- **zod**: Runtime type validation for API contracts

### Replit-Specific Integrations
- `@replit/vite-plugin-runtime-error-modal`: Development error overlay
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development environment indicator

### Fonts (External)
- Google Fonts: Fredoka (display), Nunito (body), DM Sans, Fira Code, Geist Mono