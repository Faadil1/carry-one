# Carry One — Reach Mission UX & State Contract

Date: 2026-09-04  
Gate: `CARRY_ONE_REACH_MISSION_UX_AND_STATE_CONTRACT`  
Decision: **PASS / BUILD-READY CONTRACT**

## 1. Contract objective

This document converts the locked Reach Mission product law into an implementation contract. It intentionally limits the Cycle II MVP to one destination-bound mission, one canonical holder, one active bridge invitation, one verified 1-NIM handoff at a time.

The five-screen rule is strict. Dialogs, native Nimiq Pay confirmation sheets and inline state changes do not count as additional product screens.

## 2. Canonical product states

### Mission status

- `ACTIVE` — mission exists and has not reached its destination.
- `ARRIVED` — target wallet is the recipient of a finalized canonical hop. Terminal.
- `CANCELLED` — allowed only before the first finalized hop. Terminal.

### Invitation status

- `INVITED` — one bridge candidate has been invited; no transfer may begin.
- `ACCEPTED` — candidate has explicitly accepted and bound a Nimiq wallet.
- `DECLINED` — candidate declined; custody is unchanged.
- `EXPIRED` — invitation or accepted-pass window expired; custody is unchanged.
- `WITHDRAWN` — current holder withdrew the invitation before a broadcast; custody is unchanged.
- `COMPLETED` — the invitation produced its matching finalized canonical hop. Terminal success state.

Only `INVITED` and `ACCEPTED` are non-terminal/open invitation states. Only one may exist per active mission.

### Hop status

- `PENDING` — transaction hash reported but not yet included.
- `INCLUDED` — independently observed on-chain but not final.
- `FINAL` — independently verified sender, recipient, value and finality; canonical holder changes.
- `INVALID` — failed verification or expired unreconciled transfer; holder does not change.

## 3. Hard invariants

1. Every mission has exactly one private target wallet.
2. A mission has exactly one canonical holder at any time.
3. A holder can have at most one active bridge invitation for that mission.
4. An invitee never becomes a bridge merely by opening a link.
5. `ACCEPTED` binds one wallet but does not change custody.
6. No pass intent is created until an invitation is `ACCEPTED`.
7. Active pass intent/broadcast state must be durable across restart, not process-memory-only.
8. Exactly `100000` Luna is the canonical recipient value. Fee is separate.
9. Only `FINAL` changes the canonical holder.
10. A successful FINAL transition closes the matching invitation as `COMPLETED`.
11. Decline, expiry, withdrawal, cancellation-before-broadcast and invalid transactions leave custody unchanged.
12. Arrival is detected server-side when a finalized recipient equals the mission target wallet.
13. The target wallet is never returned by public/client-readable mission APIs except to the target after authenticated arrival where strictly required.
14. The path is derived from finalized hops; it is never manually editable.

## 4. Five-screen wire contract

### Screen 1 — Mission Home

**Purpose:** one place to understand the mission and the holder’s next action.

Always shows:
- target label, never raw target wallet;
- short mission note;
- current holder display label or wallet fingerprint;
- verified route so far;
- one current state banner;
- one primary CTA maximum.

Holder-state CTA mapping:

| State | Primary CTA |
|---|---|
| no mission | `Create a mission` |
| ACTIVE + no invitation | `Choose next bridge` |
| INVITED | `Waiting for response` (disabled) |
| ACCEPTED | `Pass 1 NIM` |
| hop PENDING/INCLUDED | `Verifying transfer…` (disabled) |
| DECLINED/EXPIRED/WITHDRAWN | `Choose another bridge` |
| COMPLETED + mission ACTIVE | `Continue route` |
| ARRIVED | `View completed route` |

`Choose next bridge` opens an inline/bottom-sheet action within Mission Home: candidate label or share target, optional pre-bound wallet, and `why_you` up to 120 characters. Submitting creates one invitation and produces a private invite link/deeplink.

### Screen 2 — Create Mission

Required fields:
- `target_label` — 1–60 chars;
- `target_wallet` — valid Nimiq address; stored private;
- `mission_note` — 1–180 chars;
- optional creator display label.

Rules:
- creator authenticates with a Nimiq signature;
- target cannot equal creator wallet;
- default visibility is `UNLISTED`;
- public naming of a target is not enabled in MVP unless target consent is explicitly recorded;
- after creation, creator is canonical holder at sequence 0.

Primary CTA: `Create mission`.

### Screen 3 — Bridge Invitation

Opened from the private invitation link.

Shows:
- `You were chosen as the next bridge`;
- target label;
- mission note;
- inviter display label / wallet fingerprint;
- private `why_you`;
- number of finalized bridges so far;
- clear statement: `Accepting does not move funds. The current holder will send exactly 1 NIM only after you accept.`

Actions:
- `Accept as bridge` — request/list Nimiq account, sign acceptance challenge, bind wallet, status -> `ACCEPTED`;
- `Decline` — token-authorized low-risk refusal, status -> `DECLINED`;
- closing/ignoring leaves `INVITED` until expiry.

Acceptance creates `pass_deadline_at = accepted_at + 60 minutes`. If no canonical broadcast begins before that deadline, invitation -> `EXPIRED`.

### Screen 4 — Pass 1 NIM

Accessible only to current holder when invitation = `ACCEPTED`.

Shows:
- accepted bridge label;
- accepted wallet fingerprint (not full address by default);
- target label;
- `why_you` previously written;
- exact transfer: `1 NIM + network fee`;
- warning: `After broadcast, this pass cannot be cancelled inside Carry One.`

Flow:
1. server issues a holder-bound pass authorization challenge;
2. holder signs the action;
3. server creates a **durable** atomic pass intent bound to mission, invitation, sequence, holder and accepted recipient;
4. client opens Nimiq Pay native transaction approval for exactly 100000 Luna;
5. returned tx hash is submitted as a claim and persisted on the active pass;
6. UI enters `PENDING` / `INCLUDED` until backend independently verifies finality;
7. `FINAL` advances holder and route and closes the invitation as `COMPLETED`;
8. if recipient is target wallet, mission -> `ARRIVED`; otherwise return to Mission Home for the new holder.

### Screen 5 — Route / Arrival

For active missions, shows only finalized path entries plus the current holder.

For arrived missions:
- headline: `It made it.`
- ordered verified route;
- number of human bridges;
- verified arrival timestamp;
- optional participant display names only where each participant opted in.

Never show:
- raw target wallet;
- raw participant wallets by default;
- failed/invalid tx details to unauthenticated viewers;
- leaderboards, points, XP, country counts or map progress as the core experience.

## 5. Holder and invitation lifecycle

```text
MISSION CREATED
  -> holder = creator
  -> no invitation

holder invites candidate
  -> INVITED
      -> DECLINED -> holder unchanged -> may invite another
      -> EXPIRED  -> holder unchanged -> may invite another
      -> WITHDRAWN -> holder unchanged -> may invite another
      -> ACCEPTED
          -> pass deadline reached without broadcast -> EXPIRED
          -> durable pass intent + wallet broadcast
              -> PENDING -> INCLUDED -> FINAL
                  -> invitation -> COMPLETED
                  -> recipient != target -> recipient becomes holder
                  -> recipient == target -> ARRIVED
              -> INVALID -> holder unchanged; invitation closes/reroutes under deterministic recovery policy
```

## 6. Reroute rules

- Reroute is permitted only while no transaction hash has been recorded for the canonical pass.
- Before acceptance: holder may withdraw invitation and choose another candidate.
- After acceptance but before pass intent/broadcast: holder may withdraw; candidate is notified when possible.
- After transaction hash is recorded: no withdrawal/cancel path exists; reconciliation must finish fail-closed.
- A declined/expired/withdrawn candidate cannot be silently reactivated; create a new invitation.
- A `COMPLETED` invitation is historical proof of the finalized route segment and cannot be reopened.

## 7. Mission cancellation

MVP rule: mission cancellation is allowed only while `finalized_hop_count = 0`, there is no open invitation and no transaction hash is in flight. After the first finalized hop, the originator cannot revoke a mission from a later canonical holder.

## 8. Privacy defaults

- mission visibility: `UNLISTED`;
- target wallet: server-private;
- target label: visible only to mission participants and invitees;
- participant display name: opt-in;
- wallet rendering: shortened fingerprint only;
- `why_you`: inviter + invitee only by default;
- public completed-route sharing: explicit creator/target/participant-safe view generated after arrival, never raw internal record exposure.

## 9. Build acceptance criteria

This contract is implementable only if the backend can prove:
- durable mission, invitation, pass-intent and relay persistence across restart;
- wallet-signature authorization for state-changing holder actions;
- opaque invite tokens with one-time/expiry controls;
- target-wallet privacy at API boundary;
- one-active-invitation uniqueness;
- exact 1-NIM + finality verification;
- global tx-hash replay protection;
- deterministic decline/expiry/withdraw/reroute behavior;
- deterministic `COMPLETED` and target-arrival transitions;
- crash-window reconciliation if relay FINAL persists before mission projection.

No frontend polish work should outrun these invariants.
