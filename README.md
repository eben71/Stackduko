# Project Template Base

This repository is a **base for new projects**. It provides a starting structure for documentation, contribution guidelines, quality gates, CI/CD, housekeeping, and agent guardrails.

## What This Template Does Not Do

- It **does not** include language- or framework-specific code.
- It **does not** define concrete build or test commands.
- It **does not** prescribe architecture choices for derived projects.

Derived repositories must replace placeholders (for example, `<install-deps-command>` and `<run-tests>`) with concrete, stack-specific commands and implementations.

## Repo Structure

- `src/` or `apps/`: primary source or application directories (placeholder).
- `packages/`: shared libraries or packages (placeholder).
- `docs/`: project documentation and contribution guides.
- `infra/docker/`: infrastructure and container assets (placeholder).
- `.github/`: CI/CD workflows and repository automation.
- `scripts/`: quality gate and documentation checks.
- `skills/`: agent scripts and guardrails for automated remediation.

## Local Development

1. Copy `.env.example` to `.env` and fill in required values.
2. Run `make setup` to install dependencies.
3. Use `make dev` to start local services.
4. Run quality checks via `make lint`, `make format-check`, `make typecheck`, and `make test`.

> **Note:** All `make` targets are placeholders. Derived repositories must replace the placeholder commands with stack-specific equivalents.

## Additional Details (Customize in Derived Repos)

- Architecture overview
- Environment setup specifics
- Deployment workflows
- Observability, monitoring, and runbooks

This template is intentionally minimal and **must be customized** in derived repositories.
