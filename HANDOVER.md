# HANDOVER — Carry One

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_SIP_SHOW_DEMO_DEPLOYED_HTTP_SECURITY_NEXT`

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

Repo `Faadil1/carry-one` is **public**. CI contains a high-confidence scanner over tracked files + reachable Git history. Secrets/private wallet material remain env/local only.

Public Early Access is still **NOT authorized**.

## Frontend — merged

PR #9 merged at `5d7cd7caaa574a3518f8c37ef42472c04e5cd105`.

Frozen five screens exist: Mission Home, Create Mission, Bridge Invitation, Pass 1 NIM, Route/Arrival. Nimiq Pay boundary is wired for challenge/sign, expected-holder account preflight, exactly 1 NIM + requested fee 0 + opaque data, tx-hash claim and backend reconciliation. Route-follow Bearer handling exists client-side. Final PR #9 CI had **80/80 tests**.

## Sip & Show clickable demo — DEPLOYMENT CREATED

A dedicated rough clickable demo was deployed for the Nimiq Sip & Show so Opeyemi can point to a product surface even if the full secure HTTP/testnet E2E is not closed yet.

- deployment name: `carry-one-sip-show`
- deployment id: `dpl_C2Je2UT7YBf85YzxU9wxJNXQr6p1`
- deployment URL: `https://carry-one-sip-show-mi6uo1a99-faadil-s-projects.vercel.app`
- production alias: `https://carry-one-sip-show-faadil-s-projects.vercel.app`
- target: production

The deployed surface intentionally defaults to **DEMO MODE**. It reuses the merged five-screen frontend visual/product flow, but all state is local/demo-only:

- no Nimiq wallet writes;
- no backend/network mutations;
- no testnet transaction claim;
- no real `FINAL` proof;
- localStorage only for the simulated path.

This deployment **may be shown as a clickable product skeleton**, but must **never** be presented as the real 2–3-wallet testnet E2E or as wallet/runtime evidence.

### Runtime verification caveat

The Vercel deployment action returned success and created the production deployment, but follow-up status checks through the connector are currently blocked by Vercel scope authorization (`faadil-s-projects`). Therefore public HTTP readiness of the alias is still **PENDING VERIFICATION**.

Before the live Sip & Show, Faadil or Opeyemi should open the production alias in a normal browser. If it loads, use it. If it does not, re-authenticate the Vercel connector/scope or use another static-host deployment path.

## PostgreSQL — MERGED AND HARDENED

Opeyemi source branch remains `feat/postgres-adapter` at observed head `211f091cd27b5cc94f6a9a9c6790dff7863a2917`; it was **not force-updated**.

Raw PR #11 diverged from current main. A clean integration branch `integration/postgres-hardened` was reconstructed on current main while preserving Opeyemi's source head as merge ancestry.

Authoritative integration:
- PR **#12 — Integrate and harden PostgreSQL persistence**
- merged to `main`
- merge SHA `2b9193cd4fc51ba8d140bbd7078a34793b1b9c8a`
- CI run `34129860675`
- secret scan ✅
- typecheck ✅
- **122/122 tests across 20 files ✅**
- build ✅

GitHub later marks #11 merged because its head became reachable through #12 ancestry. Do **not** interpret that as a separate raw-tree merge; PR #12 is the authoritative resulting tree.

### PostgreSQL changes now on main

- `PgMissionRepository` + `PgRelayStore`;
- migration runner and storage bootstrap;
- pg/pg-mem test coverage;
- `migrations/002_postgres_concurrency_guards.sql`;
- invitation insert locks/revalidates canonical mission holder+sequence at DB boundary;
- invite acceptance and finalized participant route-reentry DB guards;
- `CanonicalRelayService.flushDurability()`;
- Reach Mission authorize/broadcast/reconcile waits for durable relay flush before acknowledgement/projection;
- legacy relay HTTP mutations also wait for durability.

### Important deployment boundary

Cycle-II PostgreSQL mode is **single application writer only (`replicas=1`)**. PostgreSQL itself may be HA, but the current relay state machine remains in-memory authoritative with durable Postgres snapshots; active-active/multi-writer safety is **not claimed**. See `docs/POSTGRES-RUNTIME-BOUNDARY.md`.

## HTTP branch — NEXT

Opeyemi branch:
- `feat/mission-http-bindings`
- observed head `ed6109992adbdd7818f34b6aa4d037e94b7c91c8`
- not merged to main yet.

Strengths already present: signed mutation auth, validation, `Idempotency-Key`, rate limits, mission DTOs.

### P0 issues found in audit — must fix before merge/Public Early Access

1. **Route-follow auth:** mission reads currently derive role from spoofable `X-Wallet`; client Bearer token is not verified.
2. **Invitation privacy:** generic mission view can expose open-invite context/`why_you` beyond current holder/intended invitee.
3. **Broadcast hash claim:** `/missions/:id/broadcast` currently accepts invitation id + tx hash without signed/scoped authorization; this can be used to attach an arbitrary hash to an active intent.
4. **Frontend idempotency mismatch:** backend requires `Idempotency-Key`, merged frontend does not yet generate it automatically.
5. **Legacy `/relay` mutations:** product mission server currently delegates legacy relay mutation routes; they must be disabled or explicitly dev-gated in production mode.

## NEXT EXACT GATE

`CARRY_ONE_HTTP_SECURITY_AND_VERTICAL_INTEGRATION = READY`

Execute as one clean-main integration block without force-updating Opeyemi:

1. re-fetch `feat/mission-http-bindings` live head;
2. reconstruct/preserve his HTTP work on current `main`;
3. replace `X-Wallet` trust with a server-signed short-lived route-view capability;
4. redact `why_you`/private invitation context by verified role;
5. mint a short-lived broadcast capability from signed `AUTHORIZE_PASS`, bind it to mission+invitation+sequence, and require it for tx-hash claim;
6. generate `Idempotency-Key` in frontend mutation requests;
7. disable/dev-gate legacy relay mutations in the product server;
8. integrate PostgreSQL bootstrap + HTTP server + frontend contract;
9. run full CI; merge only if green;
10. immediately update canonical state + handover again.

## Runtime proofs still pending — do not fake PASS

- real Nimiq Pay multi-account behavior;
- wallet with exactly 1 NIM forwarding exactly 1 NIM with data + fee 0;
- native Nimiq Pay deeplink on a real device;
- full 2–3 wallet testnet `CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> PASS -> FINAL -> ARRIVED`;
- Sip & Show production alias HTTP readiness until opened in a normal browser.

## Still blocked

Public Early Access, mainnet funds/cutover, marketing launch, full TRACE polish, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, AI spend/routing, marketplace expansion, unique-human claims.
