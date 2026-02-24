---
trigger: always_on
---

# Tech Stack & Coding Patterns

## Core Stack

- **Frontend Framework:** React 18, Vite, Wouter (Routing)
- **Styling:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion
- **State Management:** Zustand, TanStack React Query
- **Backend Framework:** Express 5, Node.js
- **Database & ORM:** PostgreSQL (pg), Drizzle ORM, drizzle-kit
- **Testing:** Vitest, Supertest
- **Tooling:** TypeScript, ESLint, Prettier

## Architectural Patterns

- **Clear Boundaries:**
  - API Layer: Request/response handling and orchestration only.
  - Services Layer: Core business logic.
  - Persistence Layer: Repositories/DAOs only.
- **Micro-functions:** Prefer small, single-purpose functions over complex, nested logic.
- **Dependency Management:** Only introduce new dependencies with clear justification. Prefer opportunistically upgrading patch/minor versions.
