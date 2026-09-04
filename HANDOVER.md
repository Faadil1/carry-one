# HANDOVER — Carry One

Date: 2026-09-04  
State: `REACH_MISSION_PRODUCT_LAW_LOCKED`

## Product direction now locked for the Cycle II MVP

Carry One is no longer positioned as a generic relay game.

It is a **destination-bound human routing product**:

> One verified 1-NIM baton moves through consenting human bridges until it reaches one defined destination.

Working promise:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Core holder question:

> **Who can move this one person closer?**

The path itself is the product. No points, streaks, leaderboards, mini-games, prize pools or forwarding rewards are authorized for the MVP.

## Why this direction was selected

A collision-first scan found that Cycle II competitor **NIM Relay** occupies the generic one-coin relay / challenge / onward-pass territory, while **Ralli** occupies social challenge chains with responses, rewards, boosts and tips.

The official Cycle I showcase was scanned across all 62 entries. The field is dense in payments, settlement, rewards, gifting, games, challenges, bounties, savings, commerce, proof and creator tools, but no identified Cycle I entry uses destination-bound sequential human routing with one canonical transferable baton as its core.

Carry One therefore freezes the white space as:

> **A consented, destination-specific referral path whose chain of custody is verified by Nimiq.**

See `docs/REACH-MISSION-PRODUCT-LAW.md` for the full collision scan, scoring attack and MVP contract.

## Frozen product laws

1. **The baton is exactly 1 NIM.**
2. **Every baton has one destination.**
3. **No one becomes a bridge by surprise — candidate acceptance occurs before payment.**
4. **Only a finalized verified transaction changes custody.**
5. **A decline or expired invitation leaves custody with the current holder.**
6. **The mission ends only when the destination becomes the finalized recipient.**
7. **The path is the reward.**

## MVP interaction contract

Five screens maximum:

1. `Mission Home`
2. `Create Mission`
3. `Bridge Invitation`
4. `Pass 1 NIM`
5. `Route / Arrival`

Core loop:

`SEE TARGET → THINK OF SOMEONE CLOSER → INVITE → ACCEPT → PASS 1 NIM → VERIFY → FOLLOW`.

Invitation states:

`INVITED → ACCEPTED | DECLINED | EXPIRED`

Suggested invitation expiry: 12 hours. Expiry never reassigns custody automatically.

## Privacy baseline

- target wallet is private server-side;
- full wallet addresses are not displayed in normal product UI;
- names are opt-in;
- `why_you` context is participant-only;
- active missions default to private/unlisted;
- public named targets should be consenting participants or an agreed public/community destination.

## Technical spike status

The backend spike was previously audited and an owner-side remediation produced evidence for:

- fail-closed cancellation after broadcast;
- stale-intent cleanup;
- cross-baton transaction-hash replay protection;
- MIT project licensing;
- GitHub Actions CI with typecheck, tests and build passing;
- 42 repository tests verified in CI at that point.

Do **not** cite the earlier collaborator-reported 76 tests as independently verified.

## Important repository integration issue discovered

PR #1 has **not** been merged.

A merge attempt was rejected as `head out of date`. Repository reads then showed inconsistent integration state:

- PR metadata still referenced remediated head `ecac9cb...`;
- collaborator branch `feat/carry-one-spike-v2` was observed at later commit `5118589...`;
- a direct compare to `main` reported no common ancestor.

Do not force-merge or overwrite collaborator commits.

The product-law work is therefore isolated on clean branch:

`product/reach-mission-law-v2`

rooted from `main`.

## Current gate

`CARRY_ONE_REACH_MISSION_PRODUCT_LAW_VALIDATION = PASS`

Human product-law GO has been given.

## Next exact gate

`CARRY_ONE_REACH_MISSION_UX_AND_STATE_CONTRACT`

Complete before full frontend/product implementation:

1. exact wire contract for all five screens;
2. durable mission + invitation persistence schema;
3. holder authorization/signature scheme for write endpoints;
4. invite-token threat model;
5. target-wallet privacy API contract;
6. accept / decline / expiry / target-arrival test matrix;
7. reconcile PR #1 ancestry while preserving both verified remediation and Opeyemi's later commits.

## First real-user experiment after the next gate

Use a consenting destination inside the Nimiq builder community.

Dry run target: at least 10 genuine bridges. Then run a public mission during the official measurement period aimed at exceeding the competition's 25-unique-wallet threshold through genuine users, never bots or manufactured wallets.

## Do not do yet

- Do not add mini-games, skill challenges, XP, streaks or leaderboards.
- Do not add prize pools, wagering or forwarding rewards.
- Do not add AI routing or marketplace matching.
- Do not auto-select or auto-reassign a next bridge.
- Do not make unique-human claims.
- Do not make the repository public before secret scan and intentional Early Access opening.
- Do not force-merge PR #1 until ancestry is reconciled.

## Source of truth

`CANONICAL-STATE.yaml` overrides chat memory when conflicts appear.
