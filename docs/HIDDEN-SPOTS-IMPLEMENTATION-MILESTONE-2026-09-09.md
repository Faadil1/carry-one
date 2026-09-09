# NimCarry — Hidden-Spot Implementation Milestone

Date: 2026-09-09  
Status: **MERGED TO MAIN — prerequisite-gated actions remain intentionally unclaimed**

## Merge

PR #19 — `Implement Cycle II hidden spots in product, proof and judge-readiness layer`  
Squash merge: `7ccf67aefb53ee101b2df7fdc1dc638d976cb4cc`

Pre-merge CI run `34413498020`: **PASS** including public-repo secret scan, browser JavaScript syntax, TypeScript typecheck, Vitest suite and build.

Opeyemi's `feat/mission-http-bindings` branch was re-fetched before the work and remained at `4f219cbd153484e560c4079ffd8c549ec52e483f`. It was not force-updated or modified.

## Hidden spots now implemented in the product/repo

- problem-first home framing;
- concrete warm-introduction example so a judge can map the product to their own life;
- five-step `Create → Invite → Accept → Pass → Arrive` visual path;
- explicit 1 NIM custody-baton semantics;
- explicit not-reward / not-stake / not-wager / not-prize / not-pool disambiguation;
- visible wallet approval → independent FINAL → custody movement proof ladder;
- bridge accept/decline/after-handoff lifecycle explanation;
- private bridge invite sharing without referral rewards;
- FINAL-only route-state explanation;
- privacy-safe ARRIVED `Verified Route Receipt` derived from already-authorized route data;
- explicit local-demo receipt preview that cannot be confused with real testnet evidence;
- static `/health.json` judge-window marker;
- `scripts/judge-smoke.mjs` + `npm run smoke:judge`;
- manual `Judge Window Smoke` GitHub Action;
- browser-runtime JavaScript syntax check in CI;
- first-five observed 60-second testing protocol;
- 4/11/25 legitimate-user score-floor ladder;
- gated Skool and public-social promotion drafts;
- README rewritten so the human problem, why 1 NIM, FINAL, ARRIVED and Route Receipt are judge-legible.

Primary implementation contract:
`docs/CYCLE2-HIDDEN-SPOT-IMPLEMENTATION-PACK-2026-09-09.md`

## Hidden spots intentionally gated by prerequisites

These are not marked complete because doing so would fabricate evidence:

- real A→B→C Nimiq Pay testnet proof;
- 5 real observed first-time tests;
- 4 / 11 / 25 genuine unique wallet opens;
- actual Skool/public promotion posts;
- Sep 16 real-product Sip & Show proof;
- scheduled judge-window monitoring against the final secure production URL;
- `My Routes` if it cannot be added safely after E2E;
- reusable external route/receipt verification primitive.

## Next gate

Resume `NIMCARRY_HTTP_SECURITY_AND_VERTICAL_INTEGRATION`.

The next technical action is to preserve Opeyemi's branch and close the agreed HTTP blockers, then integrate frontend + HTTP + PostgreSQL + NimCarry branding, run full CI, and only after that execute the real three-wallet testnet route to `ARRIVED`.
