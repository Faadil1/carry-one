# HANDOVER — Carry One

Date: 2026-09-04  
State: `FOUNDATION_IMPLEMENTATION_SLICE_1_MERGED`

## Product

Carry One is a **destination-bound human routing product**:

> One verified 1-NIM baton moves through consenting human bridges until it reaches one defined destination.

Working promise:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Core holder question:

> **Who can move this one person closer?**

The path is the product. No points, streaks, leaderboards, mini-games, prize pools, forwarding rewards, AI routing or marketplace matching are authorized for the Cycle II MVP.

## Frozen product laws

1. Exactly 1 NIM goes to the next bridge; network fee is separate.
2. Every mission has one private destination wallet.
3. No one becomes a bridge by surprise: invitation acceptance precedes payment.
4. Only a finalized independently verified transaction changes custody.
5. Decline, expiry, withdrawal and invalid transactions never move custody.
6. After a tx hash is recorded, cancel/reroute is forbidden; reconciliation continues fail-closed.
7. The mission ends only when the destination is the finalized recipient.
8. The verified path is the product/reward.

## UX/state contract

Five screens:

1. `Mission Home`
2. `Create Mission`
3. `Bridge Invitation`
4. `Pass 1 NIM`
5. `Route / Arrival`

Mission states: `ACTIVE / ARRIVED / CANCELLED`.

Invitation states: `INVITED / ACCEPTED / DECLINED / EXPIRED / WITHDRAWN / COMPLETED`.

Only `INVITED` and `ACCEPTED` are open states. `COMPLETED` was added during implementation because a finalized successful handoff must close the invitation instead of leaving it ambiguously `ACCEPTED` after custody changes.

## Foundation Slice 1 — COMPLETE

PR **#5 — Implement Reach Mission foundation slice 1** was merged to `main`.

Merge SHA:

`7cb5dba72fa6b4c5d186d637cb0b5f92cd5ab31d`

Implemented:

- mission/invitation/challenge domain model + participant-safe DTOs;
- async repository boundary;
- durable local/dev mission repository;
- RelayStore snapshot/hydration boundary;
- durable local/dev relay store;
- target wallet AES-256-GCM encryption;
- separate HMAC-SHA256 target equality/arrival key;
- Nimiq signed-action challenge generation and verification;
- public-key -> claimed Nimiq wallet binding;
- one-time challenge consumption/replay rejection;
- mission create/read/pristine-cancel service;
- one-open-invitation create/accept/decline/withdraw/expiry logic;
- accepted invitation -> authorized pass -> broadcast -> relay finality coordinator;
- FINAL -> `COMPLETED` invitation + holder/sequence/hop-count update;
- target-HMAC arrival transition;
- restart and crash-window recovery;
- executable PostgreSQL-oriented foundation migration;
- security-critical regression tests.

Key modules:

- `src/mission/types.ts`
- `src/mission/repository.ts`
- `src/mission/file-repository.ts`
- `src/mission/target-wallet-crypto.ts`
- `src/mission/wallet-auth.ts`
- `src/mission/service.ts`
- `src/mission/coordinator.ts`
- `src/persistence/file-relay-store.ts`
- `migrations/001_reach_mission_foundation.sql`

## Important implementation discovery — durable pass intents

The earlier schema persisted missions/invitations/hops but not the exact active pass intent. That leaves a dangerous restart gap after `AUTHORIZE_PASS` or broadcast because an on-chain transaction can still finalize after process memory disappears.

The canonical persistence contract now includes `pass_intents` bound to:

- mission;
- invitation;
- sequence;
- current holder;
- accepted recipient;
- nonce;
- optional tx hash.

The local proof adapter persists equivalent relay state today. The production PostgreSQL implementation must preserve the same invariant with transactions/row locks.

## Security/privacy implemented

Target wallet:

- Nimiq-normalized before storage/comparison;
- encrypted with AES-256-GCM;
- equality/arrival check uses keyed HMAC-SHA256;
- encryption and HMAC keys are separate 32-byte secrets;
- plaintext target absent from normal DTOs;
- runtime state path is gitignored.

Wallet authorization:

- canonical domain `carry-one:v1`;
- 5-minute challenge TTL;
- >=128-bit random nonce;
- exact action/mission/invitation/sequence binding;
- Nimiq public-key/address correspondence check;
- Nimiq signed-message verification;
- atomic one-time consume;
- replay rejected.

Signed actions:

- `CREATE_MISSION`
- `CREATE_INVITATION`
- `ACCEPT_INVITATION`
- `WITHDRAW_INVITATION`
- `AUTHORIZE_PASS`
- `CANCEL_MISSION`

Invite links use 256-bit random capability tokens; only SHA-256 hashes are persisted. Token-only decline remains allowed because it cannot move custody/funds.

## Relay/finality integration

The existing relay remains the authority for transaction verification. A submitted tx hash remains only a claim.

Pass authorization requires:

- ACTIVE mission;
- signer = canonical holder;
- ACCEPTED invitation;
- accepted bridge wallet bound;
- exact next sequence;
- unexpired pass window.

On FINAL:

- invitation -> `COMPLETED`;
- mission sequence increments exactly once;
- recipient becomes current holder;
- finalized hop count increments;
- recipient HMAC is compared with target HMAC;
- match -> `ARRIVED`.

If relay FINAL is durably written but the process dies before mission projection, restart reconciliation finds the exact next FINAL hop and applies it idempotently. This failure window is tested.

## Verification

Code-bearing Slice-1 CI:

- run **33932462066**
- head `87ec3581de23ea972656076f5610ce0402612301`
- `npm ci` ✅
- strict TypeScript ✅
- **56/56 Vitest tests across 9 files ✅**
- build ✅

Final full PR-head CI after documentation/state/security cleanup:

- run **33932685723**
- head `e0982f947799ae687cbaa99e275b595d13809adf`
- install ✅
- typecheck ✅
- tests ✅
- build ✅

Baseline before Slice 1 was 44 independently verified tests. Slice 1 adds 12 foundation/security tests without regressions.

A first new-test run exposed only a bad test fixture using a pre-testnet-genesis block number. The fixture was corrected to a valid post-genesis block; production finality code was not weakened.

**Authoritative test count now: 56. Do not cite the earlier collaborator-reported 76 as independently verified.**

## Persistence/deployment boundary

Slice 1 proves durability with local/dev file adapters and defines the executable PostgreSQL migration. This is not yet a public multi-instance production DB implementation.

Before public deployment, the same repository interfaces need a PostgreSQL transaction/row-lock implementation plus production HTTP validation/rate-limit/idempotency controls.

Canonical contracts:

- `docs/REACH-MISSION-PERSISTENCE.sql`
- `docs/REACH-MISSION-SECURITY-AUTH.md`
- `docs/REACH-MISSION-API-CONTRACT.md`
- `docs/REACH-MISSION-UX-STATE-CONTRACT.md`
- `docs/REACH-MISSION-TEST-MATRIX.md`

## Current gate

`CARRY_ONE_FOUNDATION_IMPLEMENTATION_SLICE_1 = PASS`

PR #5 is merged. Slice 1 is closed.

## NEXT EXACT GATE

`CARRY_ONE_MVP_VERTICAL_SLICE_1 = READY`

Authorized scope:

1. implement production PostgreSQL repository + migration runner;
2. expose auth/mission/invitation/pass services through the HTTP API;
3. connect Mini App challenge -> Nimiq Pay `sign()` -> server verification;
4. connect accepted pass -> Nimiq Pay transaction -> tx hash -> independent reconciliation;
5. build the functional five-screen Mini App skeleton without polish creep;
6. execute a real 2–3-wallet testnet mission from CREATE through ARRIVED;
7. instrument genuine wallet usage without unique-human claims.

Exit criteria:

- real testnet `CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> PASS 1 NIM -> FINAL -> ARRIVE` succeeds;
- production DB restart recovery succeeds;
- no unsigned sensitive mutation path exists;
- target wallet never leaks;
- five-screen state mapping is functional;
- all old and new tests + typecheck/build are green.

## Still blocked

- public Early Access;
- public repo before secret scan;
- mainnet funds/cutover;
- marketing launch;
- full visual polish before vertical-flow proof;
- prizes/wagering/pools;
- forwarding rewards;
- AI routing;
- marketplace expansion;
- unique-human claims.

## Source of truth

`CANONICAL-STATE.yaml` overrides chat memory when conflicts appear.
