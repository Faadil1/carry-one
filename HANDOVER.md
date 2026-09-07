# HANDOVER — Carry One

Date: 2026-09-07  
State: `MVP_VERTICAL_SLICE_1_IN_PROGRESS_FRONTEND_MERGED_BACKEND_PARALLEL`

## Immediate source of truth

Read `CANONICAL-STATE.yaml` first. It overrides chat memory when conflicts appear.

Continuity rule: after every meaningful milestone, update both `CANONICAL-STATE.yaml` and this `HANDOVER.md` so a new conversation can take the lead without depending on prior chat context.

## Product

Carry One is a destination-bound human routing Nimiq Pay Mini App:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

A verified 1-NIM baton moves through consenting human bridges until the private destination wallet becomes the finalized recipient. **The path is the product.** No points, streaks, leaderboards, prizes, forwarding rewards, wagers, AI routing, marketplace matching or unique-human claims.

## Frozen laws

1. Exactly `100000` Luna goes to the next bridge.
2. Every Cycle-II mission has a known private target wallet; creator attests target consent.
3. Invitation acceptance precedes payment.
4. Only independently verified `FINAL` changes custody.
5. Decline/expiry/withdraw/invalid do not move custody.
6. After a tx hash exists, cancel/reroute is forbidden until resolution.
7. `FINAL recipient == private target` -> `ARRIVED`.
8. A finalized route wallet cannot re-enter the same mission.
9. `STALLED` is display-only and never reassigns or claws back the baton.
10. Reach Mission uses a mandatory opaque `co:v1:` on-chain commitment; clear mission/sequence metadata is forbidden in the product flow.

## Repository visibility / security

The repository is now **public**.

PR #9 added a CI secret scanner that checks tracked files plus reachable Git history for high-confidence credential patterns. Final PR-head CI reported:

`Carry One secret scan: PASS — no high-confidence credential material found in tracked files or reachable Git history.`

This is strong static evidence, not an absolute guarantee. Private keys, mnemonics, tokens and production credentials must remain local/env-only and must never be committed.

The previous blocker `public_repository_before_secret_scan` is obsolete. **Public Early Access remains blocked for other reasons below.**

## Frontend vertical slice — MERGED

PR **#9 — Build MVP vertical-slice frontend skeleton** is merged into `main`.

- PR: `https://github.com/Faadil1/carry-one/pull/9`
- head SHA: `749c7479631158b21adee0b93c78b1fb33e5952e`
- merge SHA: `5d7cd7caaa574a3518f8c37ef42472c04e5cd105`
- final CI run: `34120121265`
- **80/80 tests across 15 files ✅**
- `npm ci` ✅
- secret scan ✅
- strict TypeScript ✅
- build ✅

### What the frontend now does

The exact frozen five screens exist:

1. Mission Home
2. Create Mission
3. Bridge Invitation
4. Pass 1 NIM
5. Route / Arrival

Real mode is wired for the current vertical-slice flow:

`challenge -> Nimiq Pay sign -> mission/invitation mutation -> authorize pass -> sendBasicTransactionWithData(100000 Luna, fee 0, co:v1 data) -> tx hash claim -> backend reconcile -> only FINAL advances custody`.

The Mini App also includes:

- expected-holder multi-account selection UX using `listAccounts()`;
- explicit statement that the client cannot force the actual sender and backend on-chain sender verification is authoritative;
- mobile-first shell;
- reduced-motion support;
- explicit `?demo=1` mode that performs no wallet/network writes and must never be presented as testnet evidence;
- native invite deeplink boundary;
- route-follow token client handling (`?view=` -> `sessionStorage` -> URL cleanup -> Bearer header);
- an early compatibility layer for Opeyemi's current HTTP branch response/request shapes.

## Opeyemi backend/infra — ACTIVE PARALLEL WORK

Do **not** overwrite or force-update these branches.

### PostgreSQL

Branch: `feat/postgres-adapter`  
Observed head: `211f091cd27b5cc94f6a9a9c6790dff7863a2917`  
Merged to main: **NO**

Current scope includes PostgreSQL mission/relay repositories, migration runner and file/Postgres storage selection.

### Mission HTTP

Branch: `feat/mission-http-bindings`  
Observed head: `ed6109992adbdd7818f34b6aa4d037e94b7c91c8`  
Merged to main: **NO**

Current scope includes mission auth/HTTP bindings, schema validation, idempotency, rate limits and mission-view DTOs.

The frontend was intentionally reconciled against the observed HTTP branch **before merge** so we do not wait until both sides are complete to discover contract drift.

## Important blocker discovered during early integration

### Secure route-follow authorization is NOT complete

Frontend side is implemented:

`view token in URL -> sessionStorage -> remove token from visible URL -> Bearer token on later reads`.

But the observed `feat/mission-http-bindings` server currently derives read-side viewer identity from an `X-Wallet` header and does **not yet verify the Bearer route-follow capability**.

That means `X-Wallet` cannot be treated as secure participant authorization. Also ensure private invitation context such as `why_you` is not exposed to an unauthorized/unlisted viewer.

Before Public Early Access, backend must add one of the canonical secure read mechanisms, preferably a server-minted unlisted route capability or verified signed-wallet read authorization, with server-side verification, expiry and proper role derivation.

**Effect: `PUBLIC_EARLY_ACCESS = BLOCKED`.**

Do not weaken this gate just to make the demo easier.

## Runtime validations deliberately NOT claimed PASS

These still require actual Nimiq Pay/testnet/device execution:

1. multi-account Nimiq Pay behavior with the canonical holder;
2. wallet funded with **exactly 1 NIM** forwarding exactly 1 NIM with recipient data and requested fee 0;
3. native Nimiq Pay invite deeplink opens the intended private invitation on a real device;
4. complete 2–3 wallet testnet route:
   `CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> PASS -> FINAL -> ARRIVED`.

Mocks, demo mode and CI do not count as evidence for these gates.

## Current gate

`CARRY_ONE_MVP_VERTICAL_SLICE_1 = IN_PROGRESS`

Completed:

- product law / UX-state contract;
- foundation slice;
- blind-spot hardening;
- exact five-screen frontend skeleton;
- frontend Nimiq Pay boundary;
- current frontend/backend contract compatibility layer;
- public-repository high-confidence secret scan;
- **80 automated tests green**.

Pending:

1. review and merge Opeyemi's PostgreSQL adapter after CI/contract validation;
2. review and merge Opeyemi's Mission HTTP bindings after CI/security/privacy validation;
3. implement/verify secure route-follow backend authorization;
4. prove production DB restart/recovery behavior;
5. integrate the merged backend with the frontend on `main`;
6. run local/integration vertical proof;
7. run the three real Nimiq Pay/device validations;
8. run the full 2–3 wallet testnet mission through `ARRIVED`;
9. update canonical state + handover after each meaningful milestone.

## Merge discipline

- `main` is canonical.
- Never force-update Opeyemi's branches.
- Re-fetch branch heads immediately before review/merge; do not trust stale chat SHAs.
- Preserve product laws and privacy boundaries.
- If backend behavior conflicts with the frozen contract, reconcile deliberately before merge.
- Do not mark testnet/device/runtime proof PASS from mocks.
- Do not authorize Public Early Access, mainnet funds, marketing launch or full TRACE polish before the vertical proof and security gates pass.

## Still blocked

- Public Early Access
- mainnet cutover/funds
- marketing launch
- full visual polish before vertical-flow proof
- target claiming/public target discovery
- prizes/wagering/pools
- forwarding rewards
- autonomous AI spend
- marketplace expansion
- unique-human claims

## NEXT EXACT ACTION

**Re-fetch and review both Opeyemi backend branches against the canonical persistence/API/security contracts.**

Priority order:

1. `feat/postgres-adapter`
2. `feat/mission-http-bindings`
3. secure route-follow backend fix
4. integration on `main`
5. real testnet/device proof

If either branch has moved since the observed SHAs in this handover, use the live branch state and update this handover after the resulting milestone.
