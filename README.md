# BrainQuest — Adaptive Intelligence Release

**Release:** v0.3.0 — Phase 3  
**Product:** BrainQuest — The Adventure of Smart Minds  
**Runtime:** Static HTML5/CSS3/Vanilla JavaScript ES modules  
**Storage:** IndexedDB v2 with LocalStorage fallback for supported stores  
**Game content:** 90 playable levels across four islands  
**Backend:** None; all child data remains on the local device

## Run the application

Serve this directory with any static HTTP server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Production gameplay does not require Node, a build step, a backend, accounts, paid APIs or external game libraries. Node is only used for the dependency-free development test suite.

## Phase 3 functionality

### Independent adaptive skill profiles

- Four separate profiles: Memory, Mathematics, Logic and Pattern Recognition.
- Each profile is scoped to a local player ID and stored in IndexedDB `skills`.
- Profiles record normalized session score, accuracy, mistakes, hint usage, challenge complexity and timestamp.
- A rolling window retains the latest 10 completed sessions per skill.
- Difficulty bands range from 1 to 5 and start at band 3.
- Sustained average performance of 85 or above gradually increases difficulty; sustained average performance of 55 or below gradually reduces it. At least three consecutive qualifying updates are required after the minimum three-session sample. Middle-band results reset the streak.
- Each adjustment moves only one band. The authored level is shifted by at most two levels and clamped to that island's valid level range. Band 3 leaves authored levels unchanged.
- Age is not used as an ability score. BrainQuest does not estimate IQ or intelligence.

### Normalized scoring

```text
Score = 100 × (0.60 × Accuracy + 0.20 × Efficiency + 0.20 × Independence)
```

All components are normalized to 0–1 and clamped. Accuracy is the game module's validated correctness percentage. Independence is `max(0, 1 - hints / 3)`. Efficiency is challenge-specific:

- Memory Forest: `pairs / moves` (bounded to 0–1).
- Number Kingdom: `rounds / (rounds + mistakes)` (bounded to 0–1).
- Logic Mountain: `optimal route steps / actual steps` (bounded to 0–1).
- Pattern Ocean: `1 / attempts` (bounded to 0–1).

Incomplete sessions receive zero score and zero stars. Completed score thresholds are 90–100 = 3 stars, 70–89 = 2 stars, 1–69 = 1 star, and zero = 0 stars. Invalid negative, non-finite or out-of-range statistics are rejected.

### Rewards, achievements and history

- Five knowledge crystals are awarded per star on a level's first completion only. Replays cannot farm completion crystals.
- Best stars and best normalized score are preserved per player, island and level. Every replay still receives its own session result record.
- Six achievements have explicit unlock conditions and one-time crystal bonuses: First Steps, Four-World Explorer, Perfect Focus, Independent Thinker, Ten Adventures and Crystal Collector.
- The Progress screen shows skill bands, recent averages, achievement gallery and the latest 12 session results.
- Daily activity aggregates local play duration and completed sessions by player and date.

### IndexedDB migration

- Database version increased from 1 to 2.
- Existing `players`, `progress` and `results` object stores are retained in place.
- Version 2 adds `skills`, `achievements` and `dailyActivity`.
- Upgrade logic only creates missing stores; it does not clear or recreate existing stores.
- A LocalStorage fallback is retained for environments without IndexedDB.

## Phase 1 and Phase 2 functionality retained

- Player profiles, profile-specific progress and the original four-island dashboard.
- 20 Memory Forest matching levels with Fisher–Yates shuffle and mismatch protection.
- 30 Number Kingdom levels with counting, arithmetic, comparison, missing numbers, multiplication, sequences and word problems.
- 20 Logic Mountain maze levels with randomized maze generation, A* pathfinding and Manhattan heuristic, solvability validation, collectibles and accessible direction controls.
- 20 Pattern Ocean levels with reusable generators, explicit accepted-answer lists and bilingual explanations.
- Shared game registry and module lifecycle, English/Urdu challenge content, contextual hints and offline service-worker precache.

## Project structure

```text
brainquest/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── RELEASE_NOTES_v0.3.0.md
├── package.json
├── css/styles.css
├── js/
│   ├── app.js
│   ├── algorithms/pathfinding.js
│   ├── core/
│   ├── data/
│   ├── games/
│   ├── services/
│   │   ├── scoring.js
│   │   ├── adaptive-difficulty.js
│   │   ├── achievements.js
│   │   └── achievement-manager.js
│   └── storage/
└── tests/
    ├── smoke-test.mjs
    ├── phase2.test.mjs
    └── phase3.test.mjs
```

## Run tests

```bash
npm test
```

The dependency-free suite covers Phase 1/2 regression, all 90 game constructors, scoring formula and thresholds, efficiency functions, statistics validation, adaptive updates and hysteresis, profile isolation, achievements, one-time rewards, IndexedDB schema migration and persistence behavior.

## Privacy and scope boundaries

All data remains local to the device. No advertising, chat, online account, behavioral tracking or third-party analytics are included. Parent verification/dashboard and daily playtime enforcement remain Phase 5 work. PWA/offline installation hardening remains Phase 6 work. The client-side skill profiles are educational game adaptation only and are not clinical, psychological or intelligence assessments.

## Release roadmap

- v0.1.0 — Foundation and initial gameplay.
- v0.2.0 — Four islands and 90 playable levels.
- **v0.3.0 — Adaptive skill profiles, normalized scoring, achievements and history.**
- v0.4.0 — Complete Urdu/RTL coverage, visual and audio polish.
- v0.5.0 — Parent experience and safety controls.
- v0.6.0 — PWA/offline completion.
- v1.0.0 — Production verification and release.
