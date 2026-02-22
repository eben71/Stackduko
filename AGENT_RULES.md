# AGENT_RULES

## Core Principles

- Keep gameplay logic pure and testable.
- Keep rendering separate from logic.
- Preserve deterministic seed based generation.
- Always validate level solvability before play.
- Keep tutorial flow intact and tested.
- Avoid new dependencies unless justified and approved.
- Keep UI polished, responsive, and accessible.
- Avoid m-dashes in any text output.

## Quality Gates

- Documentation sync is a quality gate. Any rule or behavior change must update `docs/RULES.md`, `README.md`, `docs/GDD.md`, and tutorial text in `client/src/ui/TutorialOverlay.tsx` in the same change.
