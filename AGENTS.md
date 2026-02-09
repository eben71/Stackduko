# AGENTS.md

## Purpose

**Status:** active (initial Replit scaffold)

This file guides development agents and reviewers toward secure, clean, testable, and maintainable code for the Stackdoku codebase.

Primary goals:

- Secure coding by default
- Clean, well-structured code
- Meaningful tests with >= 80% repo-wide coverage enforced in CI
- Sensible dependency management
- Green CI at all times
- Documentation that stays current with behavior and API changes

Non-goals:

- Shipping code that "just works" but is unsafe, untested, or undocumented
- Over-testing or cargo-cult testing patterns

---

## Hard Quality Gates (Current)

A change must NOT be merged if any of the following fail:

1. Security standards (see below)
2. Code quality standards
3. CI pipeline is not fully green
4. Documentation not updated when behavior, APIs, or architecture changes

Note: Test coverage is enforced at >= 80% in CI for the core logic surface (see `vitest.config.ts`).

---

## Security Standards (Must Follow)

### Secrets and Sensitive Data

- Never commit or log:
  - API keys
  - OAuth authorization codes
  - Access tokens
  - Refresh tokens
  - Encryption keys
- Secrets must come from environment variables or a secrets manager.
- Logs must be scrubbed of PII and sensitive metadata.

### OAuth and Authentication

- Treat OAuth and identity flows as high-risk.
- Refresh tokens:
  - must be encrypted at rest
  - must not be overwritten if a provider omits a refresh token on renewal
- Validate:
  - redirect URIs
  - state parameters (anti-CSRF)
  - token expiry and refresh failure paths
- Never log token payloads or decoded JWTs.

### Data Protection

- Treat as sensitive:
  - user identifiers
  - photo metadata (including EXIF/location data)
  - embeddings, hashes, perceptual fingerprints
- Store only what is required for the feature.
- Provide deletion paths (at least internal/admin) for user data.

### Crypto Rules

- Do not invent cryptography.
- Use well-known, actively maintained libraries.
- Use authenticated encryption where applicable.
- Keys must be rotatable and externalized.

---

## Code Quality and Structure

- Prefer small, focused functions.
- Avoid "god files" and excessive conditional logic.
- Maintain clear boundaries:
  - API layer: request/response + orchestration only
  - Services: business logic
  - Persistence: repositories/DAOs only
  - Workers: idempotent background execution
- Remove dead code, commented-out blocks, and unresolved TODOs.
- Use consistent patterns for:
  - configuration access
  - logging
  - error handling

---

## Testing Strategy

### Current State

- Automated tests exist for core logic and API routes.
- CI runs typecheck, lint, format, tests (coverage), and build.

### External Services

- No live external calls in CI.
- Use mocks or fixtures.
- Validate contract expectations (payload shapes, error cases).

---

## Dependency Management

- Prefer latest stable versions.
- Avoid adding new dependencies unless clearly justified.
- For new dependencies:
  - explain why existing ones are insufficient
  - confirm license compatibility
  - confirm active maintenance and security posture
- Opportunistically upgrade patch/minor versions when touching an area.
- Large or risky upgrades should be isolated into separate PRs unless requested.

---

## CI Expectations

CI must pass:

- Type checks (`npm run check`)
- Lint (`npm run lint`)
- Format check (`npm run format:check`)
- Tests + coverage (`npm run test`)
- Build (`npm run build`)

Never bypass or weaken CI gates to "get it through".

---

## Documentation Is Mandatory

Documentation must be updated when code changes affect:

- public APIs
- authentication flows
- configuration
- architecture
- operational behavior
- developer workflows

Minimum expectations:

- `README.md` kept current
- `.env.example` updated for new config
- Architecture or flow changes documented in `replit.md` or `/docs`
- Breaking changes clearly called out

---

## Review Workflow (Agent Checklist)

1. Understand scope and intent
2. Threat-model the change
3. Trace execution paths (success + failure)
4. Validate data integrity and lifecycle
5. Review test coverage and test choice
6. Run locally (mirror CI as closely as possible)
7. Verify documentation updates

---

## Common Blockers (Must Be Fixed)

- Secrets or PII in logs or code
- Lost or overwritten refresh tokens
- Missing timeouts or retries on external calls
- Non-idempotent workers
- Silent exception swallowing
- Disabling CI checks to pass
- Behavior changes without documentation updates

---

## Review Output Format

Use:

- Severity: High / Medium / Low
- Location: file:line
- Risk: what could break or leak
- Fix: concrete recommendation

Conclude with:

- Blockers to merge
- Non-blocking improvements
- Open questions or assumptions

---

## Ready-to-Merge Checklist

- [ ] Security rules followed
- [ ] Clean, maintainable structure
- [ ] Appropriate tests added
- [ ] CI fully green
- [ ] README and docs updated
- [ ] Config examples updated
- [ ] Background jobs safe and idempotent (if applicable)

---

## Final Rule

If something feels ambiguous, risky, or unclear:
Stop and ask. Quality over speed, always.
