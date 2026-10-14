# 三据点占领 Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.
**Goal:** Add selectable 21×17 domination to local AI, online AI, friends and matchmaking, without changing existing battles/tutorials.
**Architecture:** A pure shared domination module owns rules/state, the engine resolves it after damage/rollback, and public state flows through save/network/render. Reuse map-size support completed by the tutorial.
**Tech Stack:** Vue/Pinia/Three.js/TypeScript/Vitest/Fastify.
**Spec:** docs/superpowers/specs/2026-10-14-domination-design.md

## Global Constraints
- Preserve existing uncommitted workspace and tutorial v0.5.12. Work in place on codex/online-v042; no commits of existing migration, push or deployment.
- User authorized implementation; proceed without another approval handoff. Use TDD, independent scoped implementation/review where useful.
- Mode BattleMode = 'annihilation' | 'domination'. Optional Game.battleMode defaults to annihilation. Existing factory calls and missing wire payload remain annihilation; new UI explicitly selects mode (default annihilation for compatibility).
- createFleetGame(ids?, seed?, enemy?, battleMode:BattleMode='annihilation') creates 21×17 domination only when selected.
- DominationState: points CapturePoint[]; scores [number,number]; lastRound number; lastGain {round:number;points:[number,number];ships:[number,number]}.
- CapturePoint: id 'A'|'B'|'C'; center Hex; radius 2; owner 0|1|null; progressTeam 0|1|null; progress 0|50; capturedRound number|null; contested boolean.
- Optional domination field on Game, Observation, BattleFrame, ClientGame/Frame, MapModel. No hidden unit IDs/coordinates in public capture state.
- Canonical constants DOMINATION_RULES: width21 height17 radius2 target100 pointIncome5 sinkingIncome15. Last gain fields represent score gained, not ship counts.
- Settlement after main damage/rollback, before end frame; tick count unchanged; end/duplicate settlement guarded by lastRound.
- Each batch increments version once at end (baseline v0.5.12 → v0.5.13 if no concurrent version change).

## Review Focus
- Duplicate round/reconnect/restore must never add score twice.
- Public score must not reveal hidden ship positions or per-ship sinking IDs.
- At final scoring, sunk or rolled-back ships must not retain their former presence.
- Old saves, old deterministic games and new tutorial remain playable.
- Queue separates modes; room host mode cannot silently change a started match.

### Task 1: Domain, map, engine, local AI
Files: shared/game.ts, shared/domination.ts (new), src/domination-map.ts (new), src/engine.ts, tests/domination.test.ts (new).
Interfaces: above state/types, createFleetGame fourth parameter. shared/domination exports createDominationState(), settleDomination(game,beforeShips), dominationWinner(game,counts), dominationIncome(state,team), dominationTurnsToWin(state,team).
- [x] Add failing tests for capture50→owned→income5, frozen/cleared/rotated progress, enemy neutralization, ship losses15, final damage/rollback, tie rules, no duplicate settlements, maps/determinism and objective AI.
- [x] Run targeted tests to observe missing behavior.
- [x] Implement pure state machine, connected protected-lane map, engine snapshots and objective-aware AI based only on observe().
- [x] Run targeted and existing deterministic/fog tests.

### Task 2: Persistence
Files: src/save.ts, tests/domination-save.test.ts.
Consumes shared state and engine factories.
- [x] Roundtrip a 21×17 game with edge coordinates, partial capture and scores; malformed mode/state/centers rejected; 19×15 legacy unchanged.
- [x] Run RED, add contextual map validation and strict domination validation, run GREEN.

### Task 3: Server/network/remote AI
Files: server/* relevant files, shared/network.ts, tests/server-domination.test.ts.
Consumes engine fourth argument and public state.
- [x] RED tests for rooms, split matchmaking, AI creation, map bounds, filtering, double-submit no double-score and history.
- [x] Carry battleMode in create/update/start payloads, room/match/queue state and recorded outcomes. Never pair differing modes. Only host updates room mode, invalidate ready.
- [x] Project public domination + real map size; retain old missing-field behavior. AI prompt/history includes only public objective/score state.
- [x] GREEN targeted tests, report changed files and commands.

### Task 4: Frontend/local creation/scene
Files: src/pages/* relevant pages, stores, composables (except engine/save.ts), shared/render.ts, src/scene/board.ts, new BattleModeSelect.vue/DominationPanel.vue, tests/ui-domination.test.ts.
Consumes engine fourth argument; server optional battleMode; snapshots.
- [x] RED mounted UI for mode choice→357 cells, plans→capture progress, save/load mode, score and contested text.
- [x] Add mode selection to local/AI/room/matchmaking with visible descriptions; client sends selected battleMode. Room join displays host mode.
- [x] Wire local factory and loaded mode, scoreboard with separate per-round income/gains/forecast, public point circles in all phases and replay (no future score leakage).
- [x] Explain mode in rules/result UI; test desktop/mobile and old modes.

### Task 5: Integration and delivery
- [x] Generate contracts, typecheck, full tests; address failures by cause.
- [x] Independent scoped final review and fix meaningful findings with regression evidence.
- [x] Browser desktop/mobile local and live server scenarios; verify capture, income, restore and result.
- [x] Run version:next once; user then explicitly selected 0.6, so set 0.6.0 without another patch increment. Update README/ONLINE and task-state validation evidence; build.
- [x] Report implementation, evidence and material remaining limitations.



## Completion evidence (2026-10-14)

Final version **v0.6.0**, explicitly selected by user during validation. `npm test`: 85 files / 472 tests passed; `npm run typecheck`: exit 0; `npm run build`: front and server successful. Independent review fixed old-server capability negotiation and reports no remaining P1/P2. Real Chrome local flow verified capture50→ownership→income5→reload, snapshot-aware replay, controlled100-point win, desktop1440×1050 and mobile390×844. Built server on127.0.0.1:4176 verified real online AI round and domination room creation using local test AI only. No deployment or repository integration requested. Detailed logs and screenshots are in/private/tmp/domination-*; task-state records exact provenance.
