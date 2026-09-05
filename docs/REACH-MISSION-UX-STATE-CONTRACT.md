# Carry One — Reach Mission UX & State Contract

Date: 2026-09-05  
Gate: `CARRY_ONE_MVP_VERTICAL_SLICE_1`  
Decision: **BLIND-SPOT HARDENED / BUILD-READY CONTRACT**

## 1. Product boundary

Carry One remains one destination-bound mission, one canonical holder, one open bridge invitation and one verified 1-NIM handoff at a time. The path is the product; there are no points, streaks, leaderboards, prizes, wagering, AI routing or marketplace matching.

Cycle-II beachhead: the creator must already know the destination wallet and must explicitly attest that the named destination consented to be targeted by the mission. This is policy enforcement, not cryptographic proof of target consent. Public-scale target discovery/claiming is deferred.

The five-screen rule remains strict. Dialogs, native Nimiq Pay sheets and inline state changes do not add screens.

## 2. Canonical state

Mission status: `ACTIVE / ARRIVED / CANCELLED`.

Mission activity is display-only: `ACTIVE / STALLED / TERMINAL`.

- `STALLED` means an ACTIVE mission has had no product activity for 24h.
- STALLED never changes holder, sequence or funds.
- There is no clawback/reassignment. The UX may offer `Start a new route` as a new mission to the same consented destination.

Invitation status: `INVITED / ACCEPTED / DECLINED / EXPIRED / WITHDRAWN / COMPLETED`. Only `INVITED` and `ACCEPTED` are open.

Hop status: `PENDING / INCLUDED / FINAL / INVALID`. Only `FINAL` changes custody.

## 3. Hard invariants

1. Every Cycle-II mission has one private, creator-attested consented target wallet.
2. A mission has one canonical holder at any time.
3. At most one invitation is open per mission.
4. Opening an invite never makes someone a bridge.
5. ACCEPTED binds a wallet but does not change custody.
6. No pass intent exists before ACCEPTED.
7. Pass intent/broadcast state survives restart.
8. Recipient receives exactly `100000` Luna; Carry One MVP requests an explicit zero-luna fee so a bridge holding exactly the received 1 NIM can forward it intact.
9. Reach Mission passes require an opaque `co:v1:<commitment>` recipient-data value <=64 bytes. Clear mission id/sequence tags are forbidden in the product flow.
10. The actual on-chain sender must equal the canonical holder even after client-side wallet preflight.
11. Only FINAL advances holder and route, then closes the invitation as COMPLETED.
12. A wallet already present in the finalized route cannot re-enter the same mission.
13. Decline/expiry/withdraw/invalid leave custody unchanged.
14. A temporary RPC outage is `VERIFICATION_DELAYED`, not transaction failure; custody remains unchanged.
15. Arrival occurs only when the finalized recipient matches the private target HMAC.
16. The target wallet never appears in normal participant/public DTOs.
17. The route is derived only from FINAL hops and cannot be edited.

## 4. Five screens

### Screen 1 — Mission Home

Shows target label, the mission purpose/ask, current holder fingerprint/display label, verified route, state banner and at most one primary action.

| State | Primary action |
|---|---|
| no mission | `Create a mission` |
| ACTIVE + no invite | `Choose next bridge` |
| INVITED | `Waiting for response` |
| ACCEPTED | `Pass 1 NIM` |
| PENDING/INCLUDED | `Verifying transfer…` |
| verification backend unavailable | `Verification delayed — your pass is still pending` |
| DECLINED/EXPIRED/WITHDRAWN | `Choose another bridge` |
| COMPLETED + mission ACTIVE | `Continue route` |
| STALLED | `Waiting on current bridge` + secondary `Start a new route` |
| ARRIVED | `View completed route` |

Any former bridge may retain read-only access to follow a route where authorization permits. Following is retention/read access, not custody, points or rewards. After ARRIVED, a participant may be offered `Start your own mission`.

### Screen 2 — Create Mission

Required:
- target label (1–60 chars);
- valid target wallet, encrypted immediately;
- `target_consent_confirmed = true` checkbox/attestation;
- purpose/ask (stored in `mission_note`, 1–180 chars): **Why should this mission reach them?**

Target cannot equal creator. Default visibility is UNLISTED. Creator starts as holder at sequence 0.

### Screen 3 — Bridge Invitation

Private invite says `You were chosen as the next bridge`, shows target label, purpose/ask, inviter fingerprint/display label, private `why_you`, finalized bridge count and clearly states that accepting moves no funds.

The share action produces a Carry One private HTTPS invite URL and, where supported, a Nimiq Pay mini-app launcher so tap -> Nimiq Pay -> invitation.

Accept requires wallet signature; decline remains low-risk token-only in MVP. Invitation TTL is 12h. After acceptance, pass window is 60 minutes.

### Screen 4 — Pass 1 NIM

Only current holder + ACCEPTED invitation.

Before opening Nimiq Pay, Carry One lists available accounts and confirms the canonical holder wallet exists in the session. Because the provider does not let Carry One force the sending account, this is UX preflight only; independent chain verification remains authoritative.

The screen displays accepted bridge fingerprint, target label, private `why_you`, exact recipient value `1 NIM`, requested fee `0 NIM`, and `After broadcast, this pass cannot be cancelled inside Carry One.`

Flow:
1. holder signs AUTHORIZE_PASS;
2. server creates durable intent bound to mission/invitation/sequence/holder/recipient and opaque commitment;
3. client sends exactly 100000 Luna with explicit fee 0 and the opaque `co:v1:` data;
4. returned hash is a claim;
5. backend reads Nimiq independently, using configured RPC fallback;
6. PENDING -> INCLUDED -> FINAL;
7. FINAL advances route/holder and invitation -> COMPLETED;
8. target match -> ARRIVED.

### Screen 5 — Route / Arrival

Shows FINAL route only. ARRIVED headline: `It made it.` Route followers can see the verified path and arrival timestamp; participant names are opt-in. Raw target wallet, raw participant wallets, failed transaction details, leaderboards and country/map progress remain excluded.

## 5. Reroute, loops and stalls

- Before tx hash: holder can withdraw/reroute.
- After tx hash: no user cancel/reroute until deterministic resolution.
- Declined/expired/withdrawn invites are never reactivated.
- A finalized route wallet cannot be selected again in that mission.
- STALLED never mutates custody. A new route means a new mission; the old 1 NIM is not reclaimed.

## 6. Privacy reality

Target metadata is private to Carry One, but Nimiq transfers themselves are public blockchain events. Carry One therefore does not promise transaction anonymity. The opaque on-chain commitment only removes unnecessary clear-text mission/sequence linkage from recipient data; sender, recipient and value remain visible on-chain.

## 7. Runtime validations still required

Automated code can enforce the request shape, but these must be proven in real Nimiq Pay before public Early Access:

- multi-account session: holder can identify/use the correct canonical wallet;
- wallet holding exactly 1 NIM can send exactly 1 NIM with recipient data and explicit fee 0;
- native Nimiq Pay invite deeplink launches the intended private invite screen on device.

These are runtime gates, not currently claimed PASS.
