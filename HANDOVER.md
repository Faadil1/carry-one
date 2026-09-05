# HANDOVER — Carry One

Date: 2026-09-04  
State: `FOUNDATION_IMPLEMENTATION_SLICE_1_VERIFIED`

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

## UX/state contract

Five screens remain frozen:

1. `Mission Home`
2. `Create Mission`
3. `Bridge Invitation`
4. `Pass 1 NIM`
5. `Route / Arrival`

Canonical mission states: `ACTIVE / ARRIVED / CANCELLED`.

Canonical invitation states are now:

`INVITED / ACCEPTED / DECLINED / EXPIRED / WITHDRAWN / COMPLETED`.

`COMPLETED` was added during implementation because a successful finalized pass needs an explicit terminal invitation state. Leaving it as `ACCEPTED` after custody advances would make the one-open-invitation invariant ambiguous.

Only `INVITED` and `ACCEPTED` count as open invitations.

## Foundation Slice 1 — implemented

Branch: `foundation/reach-mission-slice-1`  
PR: **#5 — Implement Reach Mission foundation slice 1**

Implemented modules:

- `src/mission/types.ts` — mission/invitation/challenge domain types and safe DTOs;
- `src/mission/repository.ts` — persistence port;
- `src/mission/file-repository.ts` — durable local/dev mission repository with serialized fail-closed mutations;
- `src/mission/target-wallet-crypto.ts` — target wallet normalization, AES-256-GCM encryption and keyed HMAC-SHA256 equality;
- `src/mission/wallet-auth.ts` — Nimiq signed-action challenge issuance, wallet/public-key binding and one-time replay protection;
- `src/mission/service.ts` — mission create/read/cancel and invitation create/accept/decline/withdraw/expiry;
- `src/mission/coordinator.ts` — accepted invitation -> authorized canonical relay intent -> broadcast -> finality -> mission projection;
- `src/persistence/file-relay-store.ts` — durable relay snapshot adapter proving restart recovery;
- `migrations/001_reach_mission_foundation.sql` — executable PostgreSQL-oriented foundation migration.

The legacy `RelayStore` now has a stable snapshot/hydration boundary and persistence hook without changing the verified relay semantics.

## Important implementation discovery: active pass state must be durable

The earlier persistence contract covered missions, invitations and hops but not the exact active pass intent.

That was insufficient for restart safety: if the server died after `AUTHORIZE_PASS` or after recording a tx hash, a process-memory-only pass intent could disappear while the transaction could still finalize on-chain.

The contract/migration now therefore includes durable **`pass_intents`** bound to:

- mission;
- invitation;
- sequence;
- current holder;
- accepted recipient;
- nonce;
- optional tx hash.

The local Slice-1 proof uses durable relay snapshots; production deployment will implement the same boundary with PostgreSQL transactions/locks.

## Target-wallet privacy

Implemented and tested:

- Nimiq address normalization;
- AES-256-GCM authenticated encryption at rest;
- separate HMAC-SHA256 key for equality/arrival matching;
- encryption key and HMAC key must be different 32-byte secrets;
- target plaintext absent from public mission/invitation DTOs;
- normal participant wallets render as short fingerprints;
- local durable state is gitignored.

Do not replace keyed HMAC with a plain hash.

## Wallet authorization

Canonical challenge domain remains `carry-one:v1`.

Slice 1 implements:

- 5-minute challenge TTL;
- cryptographically random one-time nonce;
- exact action/mission/invitation/sequence binding;
- Nimiq public-key -> claimed-wallet verification;
- Nimiq signed-message digest verification;
- atomic one-time challenge consumption;
- replay rejection.

Signed sensitive actions remain:

- CREATE_MISSION
- CREATE_INVITATION
- ACCEPT_INVITATION
- WITHDRAW_INVITATION
- AUTHORIZE_PASS
- CANCEL_MISSION

Token-only `DECLINE` remains intentionally low-risk because it cannot move custody or funds.

## Mission/invitation behavior implemented

- creator becomes holder at sequence 0;
- target cannot equal creator;
- default visibility remains UNLISTED;
- at most one `INVITED`/`ACCEPTED` invitation per mission;
- invitation token = 256 random bits and only its SHA-256 hash is stored;
- pre-bound invitation requires exact wallet match;
- unbound invitation binds the first valid signed accepting wallet;
- invitation TTL = 12h;
- accepted pass window = 60 minutes;
- decline/expiry/withdraw never move custody;
- cancellation is allowed only while mission is pristine and no invitation/broadcast is open;
- broadcast blocks withdrawal/cancellation fail-closed.

## Relay integration + crash recovery

`ReachMissionCoordinator` binds mission/invitation state to the existing canonical relay service.

A holder can authorize a pass only when:

- mission is ACTIVE;
- signer is canonical current holder;
- invitation is ACCEPTED;
- invitation is the next canonical sequence;
- accepted bridge wallet is bound;
- pass deadline has not expired.

The transaction hash remains only a claim. Existing independent Nimiq RPC verification and Albatross finality logic still decide `FINAL`.

On FINAL:

- matching invitation -> `COMPLETED`;
- mission sequence/hop count advance exactly once;
- recipient becomes current holder;
- recipient HMAC is compared to target HMAC;
- match -> mission `ARRIVED`.

Critical restart proof: if relay FINAL is persisted and the process dies before mission projection commits, the next startup reconciliation replays that exact next FINAL hop idempotently into mission state instead of losing or double-counting it.

## Persistence/deployment boundary

Slice 1 includes durable **local/dev proof adapters** plus the PostgreSQL migration/contract.

This does **not** mean public multi-instance production persistence is complete. Before deployment, implement a PostgreSQL `MissionRepository`/relay persistence adapter with database transactions, row locks and idempotency at the same interfaces.

Reference files:

- `docs/REACH-MISSION-PERSISTENCE.sql`
- `migrations/001_reach_mission_foundation.sql`
- `docs/REACH-MISSION-SECURITY-AUTH.md`
- `docs/REACH-MISSION-API-CONTRACT.md`
- `docs/REACH-MISSION-UX-STATE-CONTRACT.md`
- `docs/REACH-MISSION-TEST-MATRIX.md`

## Verification

Code-bearing PR #5 CI run: **33932462066**  
Verified head: `87ec3581de23ea972656076f5610ce0402612301`

Result:

- `npm ci` ✅
- TypeScript strict typecheck ✅
- **56 / 56 Vitest tests passed across 9 files** ✅
- build ✅

The original reconciled backend had 44 verified tests. Slice 1 adds 12 security/foundation tests while preserving all 44 baseline tests.

New proof coverage includes:

- target encryption/HMAC + wrong-key rejection;
- Nimiq signed challenge verification;
- signer public-key/wallet binding;
- one-time challenge replay rejection;
- public target-wallet redaction;
- concurrent invitation race fail-closed;
- decline then reroute;
- invitation expiry leaves custody unchanged;
- open invitation blocks mission cancellation;
- mission + active broadcast restart recovery;
- FINAL relay projection to holder/arrival;
- crash-window recovery after relay FINAL but before mission projection.

A first CI attempt correctly caught a bad new finality fixture that used a block before the configured Nimiq testnet PoS genesis. The fixture was corrected to a post-genesis block; no production finality code was weakened.

**56 is now the authoritative independently verified code-bearing test count. Do not cite the historical collaborator-reported 76 as verified.**

## Current gate

`CARRY_ONE_FOUNDATION_IMPLEMENTATION_SLICE_1 = PASS_PENDING_PR5_FINAL_CI_AND_MERGE`

All code exit criteria have passed. PR #5 only needs its final full-head CI after state/documentation updates, then merge.

## Next exact gate after PR #5 merge

`CARRY_ONE_MVP_VERTICAL_SLICE_1`

Authorized scope:

1. implement production PostgreSQL repository + migration runner;
2. wire auth/mission/invitation/pass domain services into the HTTP API;
3. wire the Mini App client to challenge -> Nimiq Pay `sign()` -> action submission;
4. wire accepted pass -> Nimiq Pay transaction -> tx hash -> reconcile;
5. implement the functional five-screen skeleton without visual polish creep;
6. execute a real 2–3 wallet end-to-end testnet mission through arrival;
7. add real-usage instrumentation without claiming unique-human identity.

Exit criteria:

- real testnet `CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> PASS 1 NIM -> FINAL -> ARRIVE` works end-to-end;
- production DB restart recovery works;
- no unsigned sensitive mutation path;
- target wallet never leaks;
- five-screen state mapping is functional;
- all existing tests plus new vertical tests are green.

## Still blocked

- public Early Access;
- public repository before secret scan;
- mainnet funds/cutover;
- marketing launch;
- full visual polish before vertical flow proof;
- prizes/wagering/pools;
- forwarding rewards;
- AI routing;
- marketplace expansion;
- unique-human claims.

## Source of truth

`CANONICAL-STATE.yaml` overrides chat memory when conflicts appear.
