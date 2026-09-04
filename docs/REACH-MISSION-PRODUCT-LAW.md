# Carry One — Reach Mission Product Law

Date: 2026-09-04  
Gate: `CARRY_ONE_REACH_MISSION_PRODUCT_LAW_VALIDATION`  
Decision: **PASS / LOCK FOR MVP**

## 1. Product thesis

Carry One is not a generic relay game.

Carry One is a **destination-bound human routing product**: one verified 1-NIM baton moves through a sequence of consenting human bridges until it reaches a defined destination.

Working promise:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

The product is the verified path, not the money, not a prize, not a leaderboard and not a mini-game.

## 2. Real problem

Warm introductions and community routing are opaque after the first handoff.

A person may know who they want to reach but not who in their network is the right intermediary. Typical DMs and referral chains have no durable chain of custody: after "I’ll forward this", the originator cannot tell whether the request moved, stalled, was rerouted or actually arrived.

Carry One makes the routing action explicit:

1. A current holder nominates a person who may be one step closer.
2. That person accepts being the next bridge.
3. Exactly 1 NIM is transferred to them.
4. The backend independently verifies the transaction and finality.
5. Only then do they become the canonical holder.
6. The process repeats until the destination receives the baton.

## 3. Primary user and first launch market

### Primary target user

Members of small-to-medium online communities where warm introductions matter:

- builders and hackathon communities;
- open-source communities;
- professional groups;
- founder / creator communities;
- interest-based groups with overlapping social graphs.

### Not the initial target

- mass-market social networking;
- cold outreach to celebrities;
- bounty marketplaces;
- investment / staking / wagering;
- viral games based on points, streaks or leaderboards.

### Competition launch wedge

The first public test should happen inside the Nimiq builder community because:

- participants already have or can open Nimiq Pay;
- the chain can produce genuine unique-wallet usage;
- builders understand warm introductions and community routing;
- the product can demonstrate its own distribution loop.

## 4. Collision-first verdict

### Cycle II: NIM Relay

NIM Relay is a direct collision with the old generic-baton concept. Its public pitch centers on one coin moving hand-to-hand as the game itself, combined with a short challenge and onward transfer.

**Therefore Carry One must NOT compete on:**

- "one coin, one relay, one journey" as the whole thesis;
- skill challenges before passing;
- generic journey distance;
- streaks;
- leaderboards;
- country-count / map progression as the main product.

### Cycle II: Ralli

Ralli is a social challenge product where people start challenges, respond, react, build chains and pass challenges onward, with rewards, boosts and tips layered underneath.

**Therefore Carry One must NOT become:**

- a challenge feed;
- a response chain;
- a creator reward pool;
- a social-content network with payments underneath.

### Cycle I — 62-entry scan

The Cycle I field is dense in these families:

- payment / settlement / splitting / invoicing;
- rewards, bounties, games and challenges;
- gifting / drops / tipping;
- staking, savings and pooled coordination;
- creator commerce and marketplaces;
- proof / identity / voting / education;
- AI and content generation.

Relevant near-collisions include:

- **Renda Signal** — funded requests to a direct recipient;
- **RallyNIM** — reward campaigns for communities;
- **NimDrops / Kado** — money turned into shareable gifts or claims;
- **Nim Dare** — social challenges with NIM rewards;
- **Nimcapsule** — intentional future delivery of a message/gift;
- **Pact** — money-backed accountability between friends;
- **EverRelay Mini** — emergency / family continuity, unrelated despite the relay name.

No Cycle I entry makes **destination-bound sequential human routing with one canonical transferable baton** its core mechanism.

### White-space conclusion

The defensible white space is:

> **A consented, destination-specific referral path whose chain of custody is verified by Nimiq.**

That is materially different from a relay game, challenge chain, gift drop, bounty or funded request.

## 5. Frozen MVP product laws

### LAW 1 — The baton is exactly 1 NIM

> **THE BATON IS A VERIFIED 1-NIM HANDOFF — NOT AN INVESTMENT, WAGER, PRIZE POOL OR UNIQUE-HUMAN PROOF.**

A canonical pass is a transaction where the intended recipient receives exactly `100,000 Luna`. Fee is separate. Existing fail-closed verification remains authoritative.

### LAW 2 — Every mission has one destination

> **EVERY BATON HAS A DESTINATION.**

The MVP mission has one destination wallet plus a human-readable label.

The destination wallet is stored server-side and does not need to be displayed publicly.

### LAW 3 — Every hop is consented before value moves

> **NO ONE BECOMES A BRIDGE BY SURPRISE.**

The current holder first sends a bridge invitation. The candidate must explicitly accept before the current holder creates the payment intent and sends the 1 NIM baton.

This prevents unsolicited value transfer from becoming the interaction model and makes decline/reroute deterministic.

### LAW 4 — Only a finalized pass changes custody

> **THE PATH CHANGES ONLY AFTER VERIFIED FINALITY.**

Opening an invite, accepting it, closing a wallet dialog, returning a hash, or observing mempool activity never changes the canonical holder.

### LAW 5 — Decline never moves the baton

> **A DECLINE LEAVES CUSTODY WHERE IT IS.**

If a candidate declines or an invitation expires before broadcast, the current holder remains the holder and can invite another bridge.

There is no claw-back and no automatic reassignment.

### LAW 6 — Arrival is destination-specific

> **THE MISSION ENDS ONLY WHEN THE DESTINATION BECOMES THE FINALIZED RECIPIENT.**

For the MVP, the backend compares the finalized recipient to the mission's destination wallet.

Optional target acknowledgment/signature may be added after the core route works, but it is not required to define canonical arrival.

### LAW 7 — The path is the reward

> **THE PATH IS THE PRODUCT.**

The MVP has no points, XP, token rewards, winner-take-all prize, streak, rank or speculative mechanic.

A bridge's durable payoff is:

- they were deliberately chosen;
- they advanced the mission;
- they remain part of the completed route;
- they can follow whether the mission eventually arrived.

## 6. Why someone wants to receive it

The receiver experience must answer three questions immediately:

1. **Who chose me?**
2. **What is this trying to reach?**
3. **Why do they think I am the next bridge?**

The invitation therefore includes a lightweight `why_you` note, preferably under 80 characters.

Examples:

- "You know more Nimiq builders than I do."
- "You may know someone closer to the target."
- "You connect this community to theirs."

This is not public praise or a points system. It is routing context.

## 7. Why someone wants to pass it

The holder's core question is:

> **Who can move this one person closer?**

The holder is not asked to "keep a streak alive" or complete a mini-game. Their job is to make one routing judgment.

The pass loop is:

`SEE TARGET → THINK OF A CLOSER PERSON → INVITE → CANDIDATE ACCEPTS → PASS 1 NIM → VERIFY → FOLLOW`.

This creates a natural reason to forward the baton: the mission is unresolved while the holder has custody.

## 8. Target model for the MVP

Required fields:

- `mission_id`
- `creator_wallet`
- `target_wallet`
- `target_label`
- `mission_note` (short context)
- `visibility` = `PRIVATE` or `PUBLIC`
- `status` = `ACTIVE | REACHED | CANCELLED`
- `created_at`
- canonical `current_holder`
- canonical hop count / route

### Privacy rule

A wallet address is never mapped to a real-world name publicly by default.

For an active mission:

- target wallet: private server-side;
- full participant wallet addresses: private in product UI;
- route: identicon / truncated address unless participant opts into a display name;
- `why_you`: visible only to the candidate/participant it concerns;
- target label: public only when the creator has a legitimate basis to make it public; otherwise mission is unlisted/private.

### Public launch rule

For a publicly promoted mission, use either:

- a consenting named target; or
- a role/community destination that has agreed to participate.

Do not launch the product by publicly routing toward an unsuspecting private person or celebrity.

## 9. Invitation / consent contract

A pass is a two-person handshake before it becomes a blockchain handoff.

### Candidate states

`INVITED → ACCEPTED | DECLINED | EXPIRED`

### If ACCEPTED

- candidate connects Nimiq Pay;
- candidate wallet becomes the intended recipient;
- server creates the canonical pass intent;
- current holder sees `Ready to pass 1 NIM`;
- current holder approves the Nimiq transaction;
- backend verifies and finalizes;
- candidate becomes canonical holder.

### If DECLINED

- no transaction occurs;
- no sequence is consumed;
- current holder remains unchanged;
- current holder can invite someone else immediately.

### If EXPIRED

Same effect as decline: no transfer and no custody change.

Suggested invitation expiry for MVP: **12 hours**. Expiry is an invitation concern, not baton custody. The mission itself may remain active/dormant indefinitely.

### If wallet approval is cancelled

Before hash: cancel the pass intent safely and let the holder retry/reroute.

After hash: fail closed and reconcile; do not pretend the payment disappeared.

## 10. Reroute law

There is no special "reroute transaction".

Rerouting means the current holder invites a different candidate before any canonical pass occurs.

Once a pass is FINAL, the new holder owns the routing decision. The previous holder cannot take the baton back or redirect it.

## 11. Five-screen MVP contract

### Screen 1 — Mission Home

Purpose: immediate comprehension.

Shows:

- mission target label;
- `CURRENT HOLDER` state;
- hop count;
- one-line mission note;
- primary CTA based on state (`Create`, `View mission`, `Choose next bridge`).

A first-time user should understand "one baton, one target, one next person" in under 15 seconds.

### Screen 2 — Create Mission

Inputs only:

- target label;
- target Nimiq address;
- short mission note;
- private/public toggle.

Primary CTA: `Start mission`.

No advanced rules, rewards, country goals or game settings.

### Screen 3 — Bridge Invitation

Candidate sees:

- `Faadil chose you as the next bridge`;
- target label;
- route so far (compact);
- `Why you` note;
- two actions: `Accept as bridge` / `Decline`.

If connected wallet equals target wallet, change CTA copy to `Accept as destination`.

### Screen 4 — Pass 1 NIM

Current holder sees the accepted candidate and one decisive action:

`Pass 1 NIM`.

Transaction lifecycle is explicit:

`AWAITING APPROVAL → PENDING → INCLUDED → FINAL`.

Only `FINAL` produces the success state.

### Screen 5 — Route / Arrival

While active:

- current holder;
- route timeline;
- number of verified bridges;
- `Follow mission`.

When reached:

- `It made it.`
- immutable ordered route;
- verified hop count;
- shareable completion card.

The share card may show opt-in names / identicons, never expose full wallet addresses by default.

## 12. Anti-feature list for Cycle II

Do not add before a complete working route exists:

- mini-games;
- skill challenges;
- XP;
- streaks;
- leaderboards;
- global map as main screen;
- prize pools;
- wagers;
- rewards for forwarding;
- AI routing recommendations;
- marketplace matching;
- automatic next-recipient selection;
- unique-human claims;
- public social feed;
- multiple mission types.

A route map or country count may later be a visualization, but never the core mechanic for this cycle.

## 13. Scoring attack

### Functionality, reliability & usefulness — 45

Proof needed:

- complete create → invite → accept → pass → verify → next holder flow;
- decline and cancellation work cleanly;
- stale / duplicate / replay paths fail closed;
- route survives refresh/restart after durable persistence is added;
- simple user story: route a warm introduction through a community.

### Nimiq integration — 25

Nimiq is structurally necessary:

- the baton is the same 1 NIM moving between holders;
- Nimiq Pay confirms each user-controlled handoff;
- server independently verifies sender, recipient, value and finality;
- transaction history creates the evidence layer for the route.

Nimiq Pay documentation allows fee `0` when possible, so the exact 1-NIM baton is compatible with low/zero-fee passes in normal conditions. The UI must still surface any fee chosen by Nimiq Pay and never assume a fee is always zero.

### Real usage — 15

Cycle II awards full usage points at 25+ unique Nimiq wallets opening the Mini App.

The launch experiment should use one or more genuine routing missions that naturally require participants to open the Mini App as bridges.

Do not manufacture wallets or bot traffic.

### Design & UX — 10

Five-screen maximum. Main interaction understood in under 60 seconds, preferably under 15 seconds.

### Builder promotion — 5

Promotion should demonstrate the mission, not merely advertise the app.

Example public narrative:

> "We started a Carry One mission. It has crossed 11 verified human bridges. Can the next person get it closer?"

## 14. First real-user experiment

### Experiment A — consented destination

Use a consenting member of the Nimiq builder community as destination.

Goal:

- at least 10 genuine bridges in the first dry run;
- then a second public mission designed to exceed 25 unique wallets during the official measurement period.

Success criteria:

- >= 70% of accepted bridge invitations produce a finalized pass;
- median time from accepted invite to FINAL < 5 minutes, excluding human waiting time before acceptance;
- no duplicate canonical hop;
- no transfer after decline;
- zero unrecoverable baton loss;
- at least 60% of holders choose a next candidate without external explanation;
- qualitative evidence that users understand why they were selected.

### Metrics to log

- invitation created;
- invitation accepted / declined / expired;
- time-to-accept;
- payment approval initiated;
- cancellation before hash;
- hash recorded;
- finality time;
- successful handoff;
- next-invite creation;
- mission reached;
- unique wallets opening mission.

## 15. Gate result

`CARRY_ONE_REACH_MISSION_PRODUCT_LAW_VALIDATION = PASS`

Frozen positioning for the Cycle II MVP:

> **Carry One routes a single verified 1-NIM baton through consenting human bridges until it reaches one destination.**

Frozen emotional loop:

> **I was chosen → I can move this closer → I leave a verified place in the path → I can see if it arrives.**

Frozen product question:

> **Who can move this one person closer?**

## 16. Next exact gate

`CARRY_ONE_REACH_MISSION_UX_AND_STATE_CONTRACT`

Deliverables before frontend implementation:

1. exact wire contract for the five screens;
2. mission + invitation persistence schema;
3. holder authorization / signature scheme for write endpoints;
4. invite-token threat model;
5. target-wallet privacy rules in API responses;
6. test matrix for accept / decline / expiry / target-arrival;
7. reconcile PR #1 branch ancestry before integrating production code into `main`.

Full feature build remains blocked until that gate passes.