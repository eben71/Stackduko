# Domain Rules: Gameplay & Stackdoku Mechanics

## Core Principles

1. **Pure Gameplay Logic:** Keep gameplay logic pure and testable. Do not intertwine logical state mutations with rendering code.
2. **Separation of Concerns:** Keep UI rendering (React/Phaser) entirely separate from the core game rules.
3. **Determinism:** Preserve deterministic seed-based level generation.
4. **Validation:** Always validate level solvability before allowing play.
5. **Tutorial Flow:** Ensure the tutorial flow remains intact and gets tested whenever core rules change.
6. **UI Polish:** Keep the UI responsive, accessible, and polished. Avoid generic components.
7. **Text Formatting:** Avoid m-dashes (`—`) in any text output.
