# Stackdoku Roadmap (Pre-Launch)

## Completed

- Level generator and solver foundations are in place (including solvability-focused logic).
- Tutorial screen/overlay scaffold exists in the game UI.
- Mahjong free-tile rule logic is implemented and tested.
- Basic UI overlays are implemented (HUD, pause, help, settings, win/fail states).
- Local state management exists for settings and progress/score tracking.

## Outstanding Before Launch

- Polish the full UI/UX experience:
  - Better animation timing and feedback effects.
  - Sound design pass (SFX/music balancing and event coverage).
  - Responsive layout hardening across phone/tablet/desktop.
- Finalize robust persistence behavior for settings/scores (MVP localStorage or IndexedDB with migration/versioning strategy).
- Upgrade tutorial/help overlays into production-grade onboarding with clearer legal/illegal move examples.
- Fully integrate and balance tray, undo, and hint limits across all difficulties.
- Improve visible vs hidden mode clarity with stronger visual affordances and accessibility support.
- Strengthen level progression tuning and difficulty ramp validation.
- Expand automated test coverage for full gameplay loop interactions and seeded regression cases.
- App-store readiness package:
  - Icons, splash assets, metadata.
  - Privacy notes and policy links.
  - Performance and startup optimization checks.
- Free vs premium product handling:
  - Ad-supported free flow.
  - Paid ad-removal/premium path.
  - Entitlement and fallback UX.
- Add privacy-safe analytics/telemetry for funnel and balancing insights.

## Recommended Launch-Plus Work

- Daily seeded puzzle pipeline and event/challenge framework.
- Cosmetic progression (themes/skins) with non-pay-to-win boundaries.
- Cloud sync/profile portability for multi-device continuity.
- LiveOps hooks for curated puzzle drops and seasonal content.
