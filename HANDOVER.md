# HANDOVER — Carry One

Date: 2026-09-05  
State: `MVP_VERTICAL_SLICE_1_BLINDSPOT_HARDENING_MERGED`

## Product

Carry One is a destination-bound human routing Mini App:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

One verified 1-NIM baton moves through consenting human bridges until the defined destination becomes the finalized recipient. The path is the product; no points, streaks, leaderboards, prizes, forwarding rewards, AI routing, marketplace matching or unique-human claims.

## Frozen laws

1. Exactly 100000 Luna goes to the next bridge.
2. Every Cycle-II mission has a known private target wallet; creator must attest target consent.
3. Invitation acceptance precedes payment.
4. Only independently verified FINAL changes custody.
5. Decline/expiry/withdraw/invalid do not move custody.
6. After tx hash, cancel/reroute is forbidden until resolution.
7. FINAL target recipient -> ARRIVED.
8. A finalized route wallet cannot re-enter the same mission.
9. A stalled mission never reassigns/claws back the baton.
10. Reach Mission uses mandatory opaque on-chain hop commitments, not clear mission/sequence tags.

## Blind-spot hardening — COMPLETE

PR **#7 — Harden Carry One blind spots before vertical slice** merged to `main`.

Merge SHA: `c35389047639b7ba8b7a1ebad240ec30fcce07cc`

### P0 resolved in code/contracts

**Destination paradox** — Cycle-II beachhead is narrowed to known target wallets. `CREATE_MISSION` requires `targetConsentConfirmed=true`. This is creator-attested policy, not cryptographic target-consent proof. Target claiming/discovery is deferred.

**Dead holder / zombie mission** — mission status stays ACTIVE but display activity becomes STALLED after 24h inactivity. STALLED never changes holder/sequence/funds. `Start a new route` means create a new mission; no clawback.

**Multi-account sender mismatch** — Mini App payment preflights `listAccounts()` for the canonical expected holder. The send API cannot force a sender account, so this remains UX protection only; independent on-chain sender verification is authoritative.

**On-chain metadata privacy** — Reach Mission pass intents bind a required opaque `co:v1:<sha256-base64url>` commitment <=64 bytes to mission/sequence/holder/recipient/random nonce. Missing/wrong commitment is rejected. Legacy clear-text tags remain only for relay-spike compatibility and the Reach Mission client refuses them.

### P1/P2 resolved or bounded

- `mission_note` is the human purpose/ask: **Why should this reach them?**
- former participants can follow the route read-only where authorized; ARRIVED may offer `Start your own mission`; no gamification.
- native Nimiq Pay private invite deeplink builder added.
- finalized route wallet reuse blocked (`ROUTE_WALLET_REUSE`).
- payment request is exactly 100000 Luna + explicit fee 0 + opaque data.
- resilient read RPC client supports fallback endpoints; all down -> `VERIFICATION_DELAYED`, never false INVALID/custody move.
- privacy-safe real-usage aggregator counts missions/invites/accepts/completions/FINAL hops/arrivals/unique participating wallets without exposing wallet list or claiming unique humans.
- public-scale stronger target consent/opt-out remains a pre-public requirement.

## Verification

Code-bearing CI:
- run **33950354706**
- head `e94e2ca9348be10e738ec27ab510bc8eb9642ec5`
- npm ci ✅
- strict TypeScript ✅
- **66/66 Vitest tests across 13 files ✅**
- build ✅

Final full PR-head CI after README/contracts/canonical-state updates:
- run **33950458528**
- head `e3b5d56d29e9cf4ee8d79a578a4dbdbd70e1295e`
- install ✅
- typecheck ✅
- tests ✅
- build ✅

Pre-hardening authoritative count was 56; the block adds 10 automated tests with no baseline regression. **66 is now the authoritative automated test count.**

New automated proofs include target consent, STALLED/no custody mutation, opaque commitment strictness, route-loop rejection, expected-holder wallet preflight, zero-fee request shape, RPC fallback/verification delay, Nimiq Pay invite deeplink construction, privacy-safe usage aggregation and restart persistence of opaque pass intent.

## Runtime validations deliberately NOT claimed PASS

These remain explicit vertical-slice gates and require actual Nimiq Pay/testnet/device execution:

1. multi-account Nimiq Pay session identifies/uses the canonical holder correctly;
2. a wallet funded with **exactly 1 NIM** forwards exactly 1 NIM with recipient data and explicit fee 0;
3. native Nimiq Pay invite deeplink launches the intended private invite screen on a real device.

## Privacy reality

Target wallet remains encrypted/HMAC'd and redacted from normal APIs. Opaque recipient data removes unnecessary clear-text mission metadata, but Carry One does **not** claim blockchain transaction anonymity: sender, recipient, value and transaction existence remain public.

## Persistence boundary

Local restart durability remains proven. PostgreSQL schema/migration now encode target-consent enforcement and opaque recipient data on pass intents; participant uniqueness is the intended production DB-level route-loop guard. Production PostgreSQL adapters (`PgMissionRepository`, `PgRelayStore`) are implemented behind the `CARRY_ONE_REPOSITORY=postgres` toggle (`file` remains default), with a hermetic pg-mem test suite; run `npx tsx scripts/migrate.ts` once to apply the schema before first start.

## Current gate

`CARRY_ONE_BLINDSPOT_HARDENING = PASS`

## NEXT EXACT GATE

`CARRY_ONE_MVP_VERTICAL_SLICE_1 = READY`

Scope:
1. production PostgreSQL repository + migration runner;
2. production auth/mission/invitation/pass HTTP bindings with validation/idempotency/rate limits;
3. secure unlisted route-following authorization;
4. Mini App challenge -> Nimiq Pay sign -> server verification;
5. accepted pass -> Nimiq Pay 1 NIM/fee 0/opaque data -> tx hash -> independent FINAL;
6. functional five-screen skeleton without polish creep;
7. real 2–3 wallet testnet mission through ARRIVED;
8. run the three real-runtime validations above;
9. persist/report genuine usage evidence as unique wallets, never unique humans.

## Still blocked

Public Early Access, public repo before secret scan, mainnet/funds, marketing launch, full visual polish before vertical proof, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, AI routing, marketplace expansion and unique-human claims.

## Source of truth

`CANONICAL-STATE.yaml` overrides chat memory when conflicts appear.
