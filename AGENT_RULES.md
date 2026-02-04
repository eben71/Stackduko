# AGENT_RULES.md

## Token Safety (Non-Negotiable)

- Never commit or log access/refresh tokens or authorization codes.
- Token storage must be encrypted at rest (or system keychain if used).

## Documentation Outputs (Required)

- Maintain the root docs where applicable in the project:
  - `DECISIONS.md`
  - `RISK_REGISTER.md`
  - `ROADMAP.md`

## Quality Gates

- Security standards in `AGENTS.md` are mandatory.
- Repo-wide tests must remain green; coverage must not drop below 80%.
- CI checks must remain fully green.

## If Ambiguous

- Stop and ask. Quality over speed.
