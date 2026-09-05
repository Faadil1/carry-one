# HANDOVER — Carry One

Date: 2026-09-04  
State: `REACH_MISSION_UX_STATE_CONTRACT_LOCKED`

## Product

Carry One is a **destination-bound human routing product**:

> One verified 1-NIM baton moves through consenting human bridges until it reaches one defined destination.

Working promise:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Core holder question:

> **Who can move this one person closer?**

The path is the product. No points, streaks, leaderboards, mini-games, prize pools, forwarding rewards, AI routing or marketplace matching are authorized for the Cycle II MVP.

## Product laws

1. The baton is exactly 1 NIM to the recipient; network fee is separate.
2. Every mission has one private destination wallet.
3. No one becomes a bridge by surprise: invitation acceptance happens before payment.
4. Only a finalized independently verified transaction changes custody.
5. Decline, expiry, withdrawal and invalid transactions leave custody unchanged.
6. After a transaction hash is recorded, Carry One does not permit cancel/reroute; it reconciles fail-closed.
7. The mission ends only when the destination is the finalized recipient.
8. The verified route is the reward.

## Five-screen UX contract

1. `Mission Home`
2. `Create Mission`
3. `Bridge Invitation`
4. `Pass 1 NIM`
5. `Route / Arrival`

The detailed wire/state contract is frozen in:

`docs/REACH-MISSION-UX-STATE-CONTRACT.md`

Key behavior:

- Mission Home exposes one primary action only.
- One mission may have only one open invitation at a time.
- Invitation states: `INVITED / ACCEPTED / DECLINED / EXPIRED / WITHDRAWN`.
- Invitation default TTL: 12h.
- After acceptance, holder has a 60-minute pass window.
- `ACCEPTED` never changes custody.
- `FINAL` alone advances the holder.
- `ARRIVED` is terminal.

## Persistence contract

Reference PostgreSQL-compatible contract:

`docs/REACH-MISSION-PERSISTENCE.sql`

Durable entities:

- missions;
- invitations;
- hops;
- participants;
- auth challenges;
- audit events.

Critical invariants:

- one open invitation per mission;
- one hop per mission sequence;
- global transaction-hash uniqueness;
- atomic finalization updates hop + holder + sequence + arrival;
- decline/expiry/withdraw/invalid never advances custody.

Target wallet storage uses encrypted ciphertext plus a **keyed HMAC** for equality matching. Do not use a plain hash as a privacy mechanism.

## Wallet authorization and invitation security

Security contract:

`docs/REACH-MISSION-SECURITY-AUTH.md`

Nimiq Pay's Mini App provider supports message signing. Carry One uses a canonical domain-separated challenge (`carry-one:v1`) with short-lived one-time nonces for holder-sensitive mutations.

Signed actions:

- CREATE_MISSION
- CREATE_INVITATION
- ACCEPT_INVITATION
- WITHDRAW_INVITATION
- AUTHORIZE_PASS
- CANCEL_MISSION

Invite links are private high-entropy capabilities (>=256 bits), stored server-side only as a hash. For unbound invitations, the first valid signed acceptance binds a wallet, but the holder still sees the resulting wallet fingerprint and explicitly authorizes the pass before funds can move.

## API privacy contract

`docs/REACH-MISSION-API-CONTRACT.md`

Rules:

- target wallet is never returned in normal Mission/Invitation/Route DTOs;
- full wallet addresses are not rendered by default;
- the accepted recipient wallet may be returned only to the authenticated current holder inside a server-authorized pass intent because the holder must approve the payment;
- invite tokens, target wallet data, wallet signatures and private `why_you` text are excluded/redacted from routine logs and analytics;
- mutation retries require idempotency.

## Test contract

`docs/REACH-MISSION-TEST-MATRIX.md`

Coverage is defined for:

- mission creation;
- single-open-invitation enforcement;
- accept / decline / expiry / withdrawal;
- wallet signature replay and authorization;
- pass verification/finality;
- target arrival;
- reroute;
- cancellation;
- privacy/redaction;
- stolen/expired invite-token cases;
- five-screen state assertions;
- real-usage instrumentation.

## Backend ancestry issue — RESOLVED

The old PR #1 had diverged/no-common-ancestor behavior and was deliberately not force-merged.

Resolution:

- latest observed Opeyemi branch head imported: `93cc22675b7912e2e56e7133f1024431c3a12a04`;
- clean integration branch built from canonical `main`: `integration/backend-spike-reconciled`;
- backend/source/tests/CI/MIT files copied by Git object identity while preserving canonical product docs;
- reconciliation PR: **#3**;
- reconciliation PR head: `93434d93cf60756b79e6820d9311ca0cd0c20382`;
- PR #3 CI: **GREEN**;
- PR #3 merged to main at `147d79c67d73c5563304f9c0ba6e136cd1201bb2`.

Verified PR #3 CI evidence:

- npm ci ✅
- TypeScript typecheck ✅
- Vitest: **44 / 44 tests passed** across 6 test files ✅
- production build ✅

44 is now the authoritative independently verified test count for the reconciled backend. Do not cite the older collaborator-reported 76 as verified.

## Current gate

`CARRY_ONE_REACH_MISSION_UX_AND_STATE_CONTRACT = PASS`

Completed:

- exact five-screen wire contract ✅
- durable persistence schema ✅
- wallet-signature authorization scheme ✅
- invite-token threat model ✅
- target-wallet privacy/API contract ✅
- accept/decline/expiry/arrival test matrix ✅
- backend ancestry reconciliation ✅

## Next exact gate

`CARRY_ONE_FOUNDATION_IMPLEMENTATION_SLICE_1`

Authorized scope only:

1. implement durable persistence + migrations;
2. implement Nimiq signed-action challenge verification;
3. implement mission create/read/cancel;
4. implement one-active-invitation create/accept/decline/withdraw/expiry;
5. implement target-wallet encryption + keyed HMAC + API redaction;
6. bind the existing relay/pass service to mission/invitation state;
7. automate the security-critical contract tests.

Exit criteria:

- restart/recovery proven;
- signature replay protection proven;
- target wallet never leaks at API/log boundary;
- invitation race closes fail-safe;
- existing 44 tests remain green;
- new foundation tests green;
- CI typecheck/test/build green.

## Still blocked

- full visual frontend polish before foundation gate passes;
- public Early Access before secret/privacy/deployment hardening;
- mainnet cutover before explicit gate;
- prizes/wagering/pools;
- forwarding rewards;
- AI routing;
- marketplace expansion;
- unique-human claims.

## First real-user experiment later

After the foundation + UX implementation gates, use a consenting destination inside the Nimiq builder community. Dry run with genuine users first, then a public mission during the official measurement period. Never manufacture wallets or usage.

## Source of truth

`CANONICAL-STATE.yaml` overrides chat memory when conflicts appear.
