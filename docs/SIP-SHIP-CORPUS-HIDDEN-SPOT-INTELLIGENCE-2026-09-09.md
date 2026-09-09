# NimCarry — Sip & Ship Corpus / Hidden-Spot Intelligence

Date: 2026-09-09  
Status: ACTIVE COMPETITION INTELLIGENCE — not a product-law rewrite

## Purpose

Use the complete historical Sip & Ship corpus as a judge-intent and competitor-positioning dataset for NimCarry. The goal is not to copy demoed products. The goal is to extract repeated signals about what the Nimiq team rewards, what builders repeatedly misunderstand, where judges experience friction, and where NimCarry can occupy under-served strategic space.

## Source corpus supplied by Faadil

Six historical Classroom links were supplied on 2026-09-09. The first four share one Classroom course identifier and the final two share the current Cycle II identifier.

1. https://www.skool.com/miniappscompetition/classroom/345d5739?md=fd4f463ecabd46578c80551efc876d45
2. https://www.skool.com/miniappscompetition/classroom/345d5739?md=3af0666112154afeb6c4cea994b0bb1e
3. https://www.skool.com/miniappscompetition/classroom/345d5739?md=ed7b5f84f28043a285ca980d330703ed
4. https://www.skool.com/miniappscompetition/classroom/345d5739?md=c3f78d564e614f2688fe52bed8a79d95
5. https://www.skool.com/miniappscompetition/classroom/ad26be08?md=7784b42f59f14f23bef291b6db47f244
6. https://www.skool.com/miniappscompetition/classroom/ad26be08?md=a1e0700ef6c846e6a0c7dd967c836490

Today's 2026-09-09 Sip & Ship recording is not yet in the corpus and must be added when published.

### Evidence boundary

The direct Classroom video pages are not fetchable through the current automated web surface. Therefore this document separates three evidence classes:

- `VERIFIED_OFFICIAL_PUBLIC`: public Skool announcements, recaps, scoring posts and moderator/community-council statements surrounding the calls.
- `USER_SUPPLIED_LIVE_FEEDBACK`: feedback captured directly by Faadil from the live call, including the naming signal that Nimiq-native names should use `Nim` as a prefix; this led to the locked public name **NimCarry**.
- `TRANSCRIPT_PENDING`: claims that require direct review/transcription of the six recordings. Do not represent these as heard-from-recording until transcripts/media are ingested.

## What the public call trail already proves

### A. Cycle II explicitly moved toward product quality, usefulness and reliability

The official Call #1 recap says the call focused on finding good ideas, deciding whether an idea is worth building, researching/validating it, and that Cycle II would place more weight on the Mini App itself and overall product experience.

The current 100-point scorecard now makes this concrete:

- 45 Functionality, Reliability & Usefulness
- 25 Nimiq Pay / Nimiq integration
- 15 Real Usage
- 10 Design & UX
- 5 Builder Promotion

NimCarry implication: technical depth is useful only when it is visible as reliability, trust, finality and a crisp user outcome. Backend sophistication that judges cannot perceive is not sufficient.

### B. The competition repeatedly asks the same three idea questions

Official Week-1 guidance asks builders:

1. Who is this for?
2. What problem does it solve?
3. Why would they come back?

NimCarry has a strong mechanism, but its judge-facing beachhead must answer those questions without architecture language.

Recommended answer:

> **For people in communities who need a warm introduction to a specific person they cannot reach directly. NimCarry makes the human handoff path consented and verifiable, then lets the creator follow the mission until it arrives.**

Repeat value is not forwarding for reward. It is starting another mission, following an active route after custody changes, and retaining a verified route history.

### C. Sip & Show is not just presentation; it is a distribution surface

Official Sip & Show posts state that builders receive live Nimiq-team/community feedback, free visibility, and that strong demos may be clipped and shared on official channels. Call participation is also explicitly described as part of competition scoring.

Cycle I Call #3 follow-up told builders that the community is their first audience, testers and users and encouraged even non-presenters to post 1–2 minute demos.

NimCarry implication: the final 2026-09-16 Sip & Ship/Sip & Show is a high-leverage earned-distribution opportunity. A strong live testnet NimCarry proof can produce feedback, official amplification and legitimate wallet opens at the same time.

### D. Presentation quality materially changes perceived product quality

A public Cycle-II launch discussion includes an evaluator/community-council observation that a good presentation can change the perception of an app. Examples called out include NimJump placing a physical sign inside Nimiq Space and NimCapsule repeatedly publishing strong videos.

NimCarry implication: do not treat story/presentation as cosmetic. The live product should make the central concept self-evident:

`defined destination -> consenting bridge -> exactly 1 NIM baton -> independent FINAL -> custody moves -> ARRIVED`

The user should never need to read Postgres/HMAC/RPC documentation to understand why the app is different.

### E. Marketing was reduced, not removed; usage became more objective

Cycle I heavily rewarded marketing. Cycle II moved promotion to 5 points but added a separate 15-point real-usage measure based on unique Nimiq wallets opening the app. Official community guidance still says: build something great and tell people about it.

NimCarry implication: avoid spending days on generic content. Prefer promotion actions that also produce product evidence and legitimate opens: reciprocal builder testing, Sip & Show, a short proof video, a privacy-safe route receipt/share card, and targeted community outreach.

### F. The deadline is a submission deadline, not a freeze

The official Call #2 recap confirms the app must be submitted by Sep 18 23:59 UTC, but can continue to be improved and promoted afterward and may be evaluated at any point.

NimCarry implication: there are two finish lines:

1. submit a genuinely usable secure app by the deadline;
2. keep the live app continuously judge-ready after submission.

This creates an operational hidden spot: **judge-window reliability**. Uptime, stable production URL, safe deploys, runtime error monitoring and a non-breaking fallback matter after the deadline.

## New hidden spots for NimCarry

### P0-1 — `1 NIM` is stronger as a semantic baton than as an economic incentive

A Cycle-II builder promoting ShowIn received immediate community pushback around the economic significance of NIM stakes at current token value. That exposes a weakness in products whose behavior depends on the user caring about the monetary amount.

NimCarry does not have that weakness if positioned correctly. Its exactly-1-NIM amount is deliberately **semantic and state-bearing**, not economically motivational.

Judge-facing language should make this explicit:

> **The 1 NIM is not the reward. It is the baton — a wallet-approved, independently verifiable custody transition.**

This makes the product useful regardless of NIM price and differentiates it from staking, rewards, tips and pay-it-forward mechanics.

### P0-2 — NimCarry should own `NIM as coordination primitive`, not `NIM as payment`

Most obvious Mini App concepts use NIM to pay, tip, stake, reward or transfer value. NimCarry's strongest native-Nimiq story is different: NIM acts as a **coordination primitive** that marks who currently carries responsibility for a destination-bound mission.

This is a stronger answer to the scoring question "does Nimiq matter to the product?" than merely accepting payment.

Positioning thesis:

> **NimCarry uses a NIM transaction to move responsibility, not just money.**

### P0-3 — The product must look simpler than the implementation

Official guidance repeatedly says a simple useful Mini App can beat a complicated one. NimCarry's implementation contains finality watchers, capabilities, HMAC/encryption, Postgres durability and state-machine rules. That is an advantage only if the UX compresses it.

Judge-visible core should be reducible to three verbs:

**Invite -> Carry -> Verify**

or five very short beats:

**Create -> Invite -> Accept -> Pass 1 NIM -> Arrive**

Do not expose internal complexity unless a judge asks.

### P0-4 — The final Sip & Show should be treated as a product gate, not a presentation task

Because Sip & Show produces live feedback, visibility and possible official clipping, Sep 16 should be targeted as a **proof-event gate**.

Before requesting/demoing a slot, NimCarry should have:

- real Nimiq Pay testnet A -> B -> C proof;
- FINAL-only custody visible;
- ARRIVED visible;
- a privacy-safe Route Receipt;
- a cold-start judge path under 60 seconds;
- no presenter-only workaround;
- one line explaining exactly why 1 NIM matters.

If those are not green, attending/Q&A is still valuable, but do not substitute a simulated demo for runtime proof.

### P0-5 — Community testing can solve three score problems at once

A reciprocal testing loop with real builders can simultaneously improve:

- 45-point functionality/reliability through bug discovery;
- 15-point real usage through legitimate unique wallet opens;
- 10-point UX through observed first-time behavior.

This is much higher leverage than broad untargeted promotion.

After secure E2E, recruit the first 5 testers specifically to observe the 60-second path. Then expand toward 25+ legitimate wallet opens.

### P1-1 — Route Receipt should become the demo climax

The earlier hidden-spot audit identified the Route Receipt as the equivalent of winner proof artifacts. The Sip & Ship evidence strengthens that conclusion because presentation clarity changes perception and demos are shareable/distributable.

The strongest demo ending is not merely `transaction sent`; it is:

> **ARRIVED — 3 verified human bridges — Route Receipt**

That makes the product outcome durable, visible and clip-friendly.

### P1-2 — Build a judge-window reliability layer

Because evaluation can happen after the deadline at an unknown time, add an operational readiness layer after secure E2E:

- stable production alias;
- production health endpoint or deterministic smoke check;
- runtime error/log monitoring;
- safe deploy checklist;
- rollback path;
- no demo-only state leaking into production;
- preserve last-known-good judge flow while shipping post-deadline improvements.

A technically superior app that is temporarily broken during the unknown judge window can lose heavily.

### P1-3 — The bridge invite is also the acquisition loop

The community is explicitly positioned as first testers/users, and real usage counts wallet opens. NimCarry's unbound private bridge invite can become a natural distribution primitive: each mission potentially brings another real person into the Mini App because accepting the bridge is part of the actual product, not manufactured marketing.

Do not fake this before E2E. After secure runtime proof, make the bridge-invite onboarding path extremely clear and low-friction.

### P1-4 — Naming is part of ecosystem legibility

The live 2026-09-09 feedback produced a direct naming adjustment: Nimiq-native product names should use `Nim` as the prefix. The product is now locked as **NimCarry**.

This should be treated as more than aesthetics. It immediately communicates ecosystem belonging while preserving the product verb `Carry`.

### P1-5 — Competitor categories create a favorable contrast

Current Cycle-II examples visible around the Sip & Ship ecosystem include staking/attendance, streak/habit, word/game, social challenge, money-pool and chat/payment concepts. NimCarry should not imitate their engagement mechanics.

Its strategic white space is:

**destination-bound human coordination + consent + verifiable custody + terminal arrival**.

That combination is materially different from generic payment, reward, stake, challenge or relay loops.

## Positioning delta — what should change now

### Old risk

"A 1 NIM relay through people until it reaches someone" can sound like a pay-it-forward chain and collide with existing relay/gift concepts.

### Recommended judge-facing position

> **NimCarry is a destination-bound human routing Mini App. When you cannot reach someone directly, you invite one trusted bridge at a time. Each bridge consents, then exactly 1 NIM acts as the baton. The route advances only after the handoff is independently FINAL, so you can follow a real chain of custody until the destination is ARRIVED.**

### Short version

> **NimCarry uses 1 NIM to make warm introductions verifiable.**

### Native-Nimiq answer

> **Without Nimiq, a bridge can only say "I forwarded it." With NimCarry, the custody handoff has a wallet-approved transaction and independent finality behind it.**

## What this does NOT authorize

This intelligence does not authorize reopening the frozen product law or adding:

- prizes/rewards for forwarding;
- staking/wager mechanics;
- leaderboards, streaks or XP;
- AI routing;
- public target discovery;
- a broad social feed;
- a destination-claim identity system before Cycle II proof.

## Execution impact

1. Finish the secure HTTP/frontend/Postgres vertical integration.
2. Run the real 3-wallet Nimiq Pay testnet proof.
3. Make FINAL, custody movement and ARRIVED visible.
4. Add a privacy-safe Route Receipt as the proof artifact/demo climax.
5. Submit as soon as genuinely usable; do not wait unnecessarily for Sep 18.
6. Run 5 observed first-time tests, then expand toward 25+ legitimate wallet opens.
7. Prepare NimCarry for the final Sep 16 Sip & Show as a real-product proof event.
8. Add judge-window reliability/monitoring before the submission deadline.
9. Ingest today's recording when published and update this corpus with transcript-level evidence.

## Public evidence consulted alongside the supplied corpus

- Official Sip & Ship Call #1 recap / scoring update, Aug 26 Cycle II.
- Official Sip & Ship Call #2 recording announcement / post-deadline evaluation update, Sep 2 Cycle II.
- Official Cycle II scoring post and 100-point scorecard.
- Official End-of-Week-1 idea validation guidance.
- Official Cycle I Call #3 community/demo follow-up.
- Official Cycle I final Sip & Show announcement.
- Official Cycle II Sip & Show announcements and participation-scoring reminder.
- Public evaluator/community-council discussion around presentation, NimJump physical promotion and NimCapsule video promotion.
- Public Cycle II ShowIn product discussion exposing low-value-stake sensitivity.

## Pending next intelligence pass

When direct recording media/transcripts are available, extract call-by-call:

- exact Nimiq-team wording;
- every product shown;
- repeated positive reactions;
- repeated objections;
- questions judges/team ask first;
- features they ignore;
- onboarding failures visible live;
- naming/branding feedback;
- Nimiq-native integration examples praised;
- friction around Nimiq Pay/WebView/deeplinks;
- evidence of what later winners changed between early demo and final submission.

Then rank each extracted signal as `PRODUCT`, `JUDGING`, `DISTRIBUTION`, `PLATFORM`, or `COMPETITOR`, with confidence and a NimCarry action/no-action decision.
