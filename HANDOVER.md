# HANDOVER — Carry One

Date: 2026-09-05  
State: `MVP_VERTICAL_SLICE_1_BLINDSPOT_HARDENING_VERIFIED`

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

## Blind-spot hardening — PR #7

Branch: `mvp/blindspot-hardening`  
PR: **#7 — Harden Carry One blind spots before vertical slice**

### P0 resolved in code/contracts

**Destination paradox** — Cycle-II beachhead is narrowed to known target wallets. `CREATE_MISSION` requires `targetConsentConfirmed=true`. This is creator-attested policy, not cryptographic target-consent proof. Target claiming/discovery is deferred.

**Dead holder / zombie mission** — mission status stays ACTIVE but display activity becomes STALLED after 24h inactivity. STALLED never changes holder/sequence/funds. `Start a new route` means create a new mission; no clawback.

**Multi-account sender mismatch** — Mini App payment preflights `listAccounts()` for the canonical expected holder. The send API cannot force a sender account, so this remains UX protection only; independent on-chain sender verification is authoritative.

**On-chain metadata privacy** — Reach Mission pass intents now bind a required opaque `co:v1:<sha256-base64url>` commitment <=64 bytes to mission/sequence/holder/recipient/random nonce. Missing/wrong commitment is rejected. Legacy clear-text tags remain only for relay-spike compatibility and the Reach Mission client refuses them.

### P1/P2 resolved or bounded

- `mission_note` is now the human purpose/ask: **Why should this reach them?**
- former participants can follow the route read-only where authorized; ARRIVED may offer `Start your own mission`; no gamification.
- native Nimiq Pay private invite deeplink builder added.
- finalized route wallet reuse blocked (`ROUTE_WALLET_REUSE`).
- payment request is exactly 100000 Luna + explicit fee 0 + opaque data.
- resilient read RPC client supports fallback endpoints; all down -> `VERIFICATION_DELAYED`, never false INVALID/custody move.
- privacy-safe real-usage aggregator counts missions/invites/accepts/completions/FINAL hops/arrivals/unique participating wallets without exposing wallet list or claiming unique humans.
- public-scale stronger target consent/opt-out remains a pre-public requirement.

## Verification

Latest code-bearing CI run: **33950354706**  
Verified head: `e94e2ca9348be10e738ec27ab510bc8eb9642ec5`

- npm ci ✅
- strict TypeScript ✅
- **66/66 Vitest tests across 13 files ✅**
- build ✅

Pre-hardening authoritative count was 56, so this block adds 10 automated tests while preserving the existing baseline.

New automated proofs include:
- target consent required;
- STALLED does not change custody;
- opaque commitment mandatory/exact/<=64 bytes/no clear mission id;
- route-loop rejection;
- expected-holder Nimiq Pay preflight;
- explicit zero-fee request;
- RPC fallback + verification-delay behavior;
- native invite deeplink construction;
- privacy-safe usage aggregation;
- restart recovery preserves opaque pass commitment.

## Runtime validations deliberately NOT claimed PASS

These cannot be proven by repository CI alone and remain explicit vertical-slice gates:

1. real Nimiq Pay multi-account session uses/identifies the canonical holder correctly;
2. a wallet funded with **exactly 1 NIM** successfully forwards exactly 1 NIM with recipient data and explicit fee 0;
3. native Nimiq Pay invite deeplink launches the intended private invite screen on a real device.

Do not report these three as complete until executed on actual Nimiq Pay/testnet.

## Privacy reality

Target wallet remains encrypted/HMAC'd and redacted from normal APIs. Opaque recipient data removes unnecessary clear-text mission metadata, but Carry One does **not** claim blockchain transaction anonymity: sender, recipient, value and transaction existence remain public.

## Persistence

Foundation local durability remains proven. PostgreSQL schema/migration now include target-consent enforcement and durable opaque `recipient_data` on pass intents; participant uniqueness is the production DB-level route-loop invariant.

Production multi-instance PostgreSQL repository/row-lock implementation is still pending.

## Current gate

`CARRY_ONE_BLINDSPOT_HARDENING = PASS_PENDING_FINAL_FULL_HEAD_CI_AND_PR7_MERGE`

## NEXT EXACT GATE after PR #7 merge

`CARRY_ONE_MVP_VERTICAL_SLICE_1`

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
