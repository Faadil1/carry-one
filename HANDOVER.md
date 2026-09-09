# HANDOVER — Carry One

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_SIP_SHOW_DEMO_USABLE_HTTP_SECURITY_NEXT`

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone, update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md` so a new conversation can take the lead without prior chat history.

## Product laws — frozen

Carry One is a destination-bound human routing Nimiq Pay Mini App:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

- exactly `100000` Luna is the baton;
- target wallet is known/private for Cycle II and creator attests target consent;
- bridge accepts before payment;
- only independently verified `FINAL` changes custody;
- decline/expiry/invalid do not move custody;
- no reroute/cancel after tx hash until resolution;
- finalized route wallet cannot re-enter;
- `STALLED` never claws back/reassigns;
- destination as finalized recipient -> `ARRIVED`;
- product flow uses opaque `co:v1:` commitment;
- no gamification, prizes, forwarding rewards, wagers, AI routing or unique-human claims.

## Repository / security

Repo `Faadil1/carry-one` is **public**, MIT. CI scans tracked files + reachable Git history for high-confidence credential material. Public Early Access is still **NOT authorized**.

## Frontend + Sip & Show demo — CURRENT

The five-screen frontend is merged. The public Sip & Show demo URL confirmed by Faadil to open without a Vercel login is:

`https://carry-one-sip-show.vercel.app/?demo=1`

The demo is intentionally **demo-only**:
- no wallet writes;
- no backend/network mutations;
- no testnet transaction proof;
- localStorage simulated state only.

It may be shown as a clickable product skeleton, never as the real testnet E2E.

### Opeyemi usability report — FIXED IN SOURCE

Opeyemi reported on 2026-09-09 that `Accept as bridge` appeared to do nothing and the tab had no favicon.

Root cause: the demo path correctly saved `ACCEPTED` and set `PASS_1_NIM`, but intentionally remained on the invitation screen, so the successful transition was invisible.

PR **#16 — Fix Sip & Show demo navigation and branding** is merged to `main` at:

`37e518d0661baadb72e2c0283fccef31246dd7f6`

Changes:
- successful `?demo=1` acceptance now returns visibly to Mission Home;
- `Pass 1 NIM` is then exposed to the presenter;
- branded Carry One SVG favicon added;
- behavior is isolated to demo mode; real wallet/backend authority paths were not changed;
- regression tests added.

CI run `34360347801` is green:
- `npm ci` ✅
- public-repo secret scan ✅
- typecheck ✅
- **124/124 tests across 20 files ✅**
- build ✅

### Deployment caveat after PR #16

Faadil has confirmed the public URL no longer asks for Vercel login. However, the Vercel connector still gets `403` on the `faadil-s-projects` scope, so it cannot prove that the production alias has already redeployed the new PR #16 bytes.

Before Sip & Show, manually refresh `https://carry-one-sip-show.vercel.app/?demo=1` and confirm:
1. browser tab shows the Carry One favicon;
2. after accepting as bridge, the UI returns to Mission Home;
3. `Pass 1 NIM` is visible.

If those three are visible, the source fix is live. If not, redeploy the current `main` to the `carry-one-sip-show` project. Do not treat this as a product/testnet blocker; it is a demo deployment synchronization check.

## PostgreSQL — MERGED AND HARDENED

Authoritative PostgreSQL integration is PR #12, merge SHA:

`2b9193cd4fc51ba8d140bbd7078a34793b1b9c8a`

It includes `PgMissionRepository`, `PgRelayStore`, migration runner, restart recovery, DB route/reentry guards and durability-before-ack. Cycle-II PostgreSQL mode remains **single application writer (`replicas=1`)**; active-active/multi-writer safety is not claimed.

Do not redo PostgreSQL work.

## Opeyemi HTTP branch — LIVE HEAD MOVED

Branch: `feat/mission-http-bindings`

Latest observed head on 2026-09-09:

`4f219cbd153484e560c4079ffd8c549ec52e483f`

This is newer than the previously audited `ed610999...`. Opeyemi merged his prior HTTP work with the repository line containing the PostgreSQL work. It is **not merged to current main** and must be reconciled from this live head (or a newer live head if it moves again), without force-updating his branch.

Known strengths: signed mutation auth, request validation, `Idempotency-Key`, rate limits, mission DTOs.

### Security/integration blockers that remain before merge/Public Early Access

1. Replace spoofable `X-Wallet` route-view identity with a verified server-signed/Bearer route-view capability.
2. Redact `why_you` and private invitation context for unauthorized mission readers.
3. Protect transaction-hash broadcast claim with a short-lived scoped capability bound to mission + invitation + sequence.
4. Generate `Idempotency-Key` automatically for frontend mutations.
5. Disable or explicit-dev-gate legacy `/relay` mutation routes in the product server.
6. Reconcile the frontend + HTTP + PostgreSQL runtime into one combined vertical flow.

## NEXT EXACT GATE

`CARRY_ONE_HTTP_SECURITY_AND_VERTICAL_INTEGRATION = READY`

Execution order:
1. re-fetch Opeyemi's live HTTP branch head;
2. create a clean integration branch from current `main`;
3. preserve/reconcile his HTTP work without force-updating it;
4. close the five security/integration blockers above;
5. run combined frontend/backend harness tests;
6. run full CI and merge only if green;
7. immediately update `CANONICAL-STATE.yaml` + `HANDOVER.md` again.

## Runtime proofs still pending — never fake PASS

- real Nimiq Pay multi-account behavior;
- wallet funded with exactly 1 NIM forwarding exactly 1 NIM with data and requested fee 0;
- native Nimiq Pay invite deeplink on a real device;
- full 2–3 wallet testnet `CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> PASS -> FINAL -> ARRIVED`;
- source PR #16 visibly confirmed on the public Sip & Show alias after redeploy/sync.

## What remains after secure HTTP closure

After the real vertical proof is green: real-user evidence/telemetry, UX corrections from actual use, TRACE/full visual polish, Sip & Show/Nimiq feedback incorporation, submission video/story, Skool/social promotion checklist and final judging-package assurance.

## Still blocked

Public Early Access, mainnet funds/cutover, broad marketing launch, full TRACE polish before vertical proof, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, AI spend/routing, marketplace expansion and unique-human claims.
