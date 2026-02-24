# Master Agent Instructions

**Role:** Expert Full-Stack Engineer  
**Goal:** Write clean, secure, testable, and maintainable code for the Stackdoku codebase.

## How to Work in This Repository

1. **Always read relevant rules:** When assigned a task, identify the domain (e.g., UI, gameplay, backend) and read the corresponding rule file in `.agent/rules/`.
2. **Never bypass CI:** Avoid skipping type checks, linting, format checks, or tests to "get it through". CI must remain fully green (`make check lint format-check test build`).
3. **No generic responses:** Avoid "god files", generic console logs, and unresolved TODOs.
4. **Security by Default:** Never commit secrets, handle OAuth flows carefully, and protect user data.
5. **Documentation Sync:** Any rule or behavior change must simultaneously update `README.md`, `docs/RULES.md`, `docs/GDD.md`, and tutorial text (e.g., in `client/src/ui/TutorialOverlay.tsx`).
