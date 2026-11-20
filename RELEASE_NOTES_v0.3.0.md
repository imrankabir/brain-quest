# BrainQuest v0.3.0 — Phase 3 Release Notes

## Delivered

- Preserved the complete Phase 1 and Phase 2 application, all four game modules and all 90 authored levels.
- Added four independent, player-scoped skill profiles for Memory, Mathematics, Logic and Pattern Recognition.
- Added a rolling 10-session performance window with accuracy, mistakes, hint usage, challenge complexity and timestamps.
- Added gradual 1–5 adaptive difficulty with a minimum sample, sustained-performance hysteresis, one-band adjustments and level-boundary clamping. The default band is neutral and leaves authored challenge levels unchanged.
- Added the normalized 60/20/20 score formula, bounded component calculations, challenge-specific efficiency rules, validation and incomplete-session handling.
- Added the exact 3/2/1/0 star thresholds.
- Added first-completion-only level crystals, best-score preservation and replay history without repeat farming.
- Added six achievements with explicit unlock conditions and one-time crystal bonuses.
- Added the Progress screen with skill profiles, recent averages, achievement gallery and recent result history.
- Added local daily activity aggregates.
- Upgraded IndexedDB schema from v1 to v2, retaining existing stores and adding `skills`, `achievements` and `dailyActivity`.
- Added bilingual labels for the Phase 3 progress, achievement and score interface.
- Updated service-worker cache version and precached new Phase 3 modules.

## Scoring definitions

`Score = 100 × (0.60 × Accuracy + 0.20 × Efficiency + 0.20 × Independence)`

Accuracy is the game module's validated 0–100 correctness percentage. Efficiency: Memory = pairs/moves; Numbers = rounds/(rounds+mistakes); Logic = optimal route steps/actual steps; Pattern = 1/attempts. Independence = max(0, 1-hints/3). Every component is clamped to 0–1. Incomplete sessions score zero.

## Verification actually performed

- `npm test`: 23 tests passed, 0 failed.
- Phase 2 regression: memory construction and completion for 20 levels; 3,000 mathematics question generations; A* route correctness; 160 deterministic generated mazes; Logic Mountain completion for 20 levels; Pattern Ocean accepted-answer validation for all 20 levels; registry construction for all 90 levels; bilingual hint API.
- Phase 3: score formula and exact star boundaries; four efficiency calculations; invalid statistic rejection; adaptive profile independence, sustained updates and bounded difficulty; level offset clamping; achievement eligibility; IndexedDB v1-to-v2 store-preservation behavior; best-score and one-time crystal persistence; skill/achievement profile isolation; one-time achievement unlocking; all 90 registered level constructors.
- JavaScript syntax checks: run on all application and test JavaScript files.
- ZIP archive integrity: checked after packaging.

## Not performed / known limitations

- No real browser UI automation, Android device, screen-reader, cross-browser or performance audit was performed in this phase.
- IndexedDB migration behavior was tested using a schema mock; a real browser upgrade with pre-existing user data still requires device/browser verification.
- The application remains a static local-first MVP. Client-side parent security and daily playtime enforcement are not implemented until Phase 5.
- Complete Urdu/RTL typography and offline install verification remain later-phase work.
- Skill adaptation changes the challenge variant by a bounded level offset; it is a game difficulty aid, not an IQ or intelligence measurement.
