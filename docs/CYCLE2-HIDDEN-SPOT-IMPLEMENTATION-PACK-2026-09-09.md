# NimCarry — Cycle II Hidden-Spot Implementation Pack

Date: 2026-09-09  
Status: **IMPLEMENTATION LAYER — product law unchanged**  
Source: full seven-call Sip & Ship transcript pass + Cycle II score-floor analysis.

## Goal

Turn the hidden spots into shipped behavior, proof surfaces and execution gates without reopening the frozen NimCarry product law.

The operating rule is:

> **Implement what can be made real now. Gate anything that would require pretending the secure E2E, real users or judge-window production state already exists.**

## Hidden-spot implementation matrix

| Hidden spot | Concrete implementation | Status after this branch |
|---|---|---|
| Problem-first story | Home adds `Warm introductions disappear after the first handoff.` before product mechanics | IMPLEMENTED |
| Observer maps product to own life | Home adds a concrete warm-introduction example | IMPLEMENTED |
| Simple / intuitive / crystal clear | Five-step visual path: `Create → Invite → Accept → Pass → Arrive` | IMPLEMENTED |
| NIM as coordination primitive | 1 NIM is explicitly described as a custody baton | IMPLEMENTED |
| Avoid reward/stake/gambling confusion | Pass surface says no reward, stake, wager, prize or pooled fund | IMPLEMENTED |
| Make Nimiq visible at proof moments | Pass surface shows wallet approval → independent FINAL → custody movement | IMPLEMENTED |
| Live proof > architecture | UI emphasizes outcome/proof states; architecture stays out of primary path | IMPLEMENTED |
| Persistent proof artifact | ARRIVED route gets a `Verified Route Receipt` with FINAL hop summary | IMPLEMENTED |
| Receipt is demo climax | Demo mode can preview an explicit local-demo ARRIVED receipt | IMPLEMENTED, DEMO-ONLY |
| Natural distribution loop | Private bridge invite gets explicit private-share action; no referral reward | IMPLEMENTED |
| Lifecycle clarity | Bridge invite explains accept/decline/after-handoff states | IMPLEMENTED |
| FINAL-only custody legibility | Active route receives explicit `Only FINAL handoffs count` note | IMPLEMENTED |
| No judge cooperation for core demo | Receipt preview is deterministic and requires no judge action; real proof remains separate | IMPLEMENTED FOR DEMO; REAL E2E PENDING |
| Judge-window reliability | Static `/health.json`, `npm run smoke:judge`, manual GitHub workflow | IMPLEMENTED / NOT YET SCHEDULED |
| First users by hand | Five-user observed-test protocol below | ARMED; EXECUTE AFTER SECURE E2E |
| Real-user PMF evidence | Capture completed genuine routes + observed feedback, not vanity metrics | ARMED; EXECUTE AFTER SECURE E2E |
| Score-floor engineering | Promotion + usage ladder below | ARMED; POSTS/USERS BLOCKED UNTIL USABLE APP |
| 25+ legitimate wallet opens | Acquisition ladder below | ARMED; EXECUTE AFTER SECURE E2E |
| My Routes / re-engagement | Keep as P1 only if it can be added without destabilizing the core | GATED AFTER E2E |
| Reusable route/receipt verification | Preserve as post-Cycle-II architectural seam | GATED POST-CYCLE-II |

## 1. Judge-visible product law

The first user-facing sentence should be the problem:

> **Warm introductions disappear after the first handoff.**

Then the mechanism:

> **NimCarry turns every human bridge into a consented, verifiable handoff until the destination is actually reached.**

The user should be able to summarize the product using five verbs:

> **Create → Invite → Accept → Pass → Arrive.**

The blockchain explanation comes only when it adds proof:

> **The 1 NIM is the baton, not the reward.**

> **Pending is not custody. Only independent FINAL advances the route.**

## 2. Route Receipt contract

`ARRIVED` must leave a persistent, memorable result artifact.

Minimum judge-visible receipt:

- `ARRIVED` status;
- count of finalized handoffs;
- exactly `1 NIM` baton semantics;
- FINAL-only custody rule;
- privacy-safe participant labels/fingerprints already authorized in the route view;
- short transaction references and finalization timestamps when already present in the authorized route view;
- no full target wallet;
- no private destination secret;
- no implication that a demo receipt is real testnet evidence.

The browser enhancement layer implements this from data already rendered by the canonical route view. It does not invent additional chain evidence.

## 3. First-five observed 60-second test protocol

Do this immediately after secure real testnet E2E is green.

For each tester, start cold. Do not coach for the first 60 seconds.

Record:

| Field | Record |
|---|---|
| Tester | pseudonym / internal identifier |
| Unique Nimiq Pay open | yes/no |
| `0–10s`: what do you think this does? | verbatim |
| Time to identify destination | seconds |
| Time to identify current holder | seconds |
| Time to understand why 1 NIM exists | seconds |
| Time to reach primary action | seconds |
| Dead end / hesitation | exact screen + action |
| Error encountered | exact message |
| Can they explain `FINAL`? | yes/no + wording |
| Can they explain `ARRIVED`? | yes/no + wording |
| Would they use it for a real introduction? | yes/no + scenario |

Pass condition for the first-five gate:

- 5/5 understand the human problem without architecture explanation;
- median time to core point < 60 seconds;
- no blocker-level dead end;
- no tester interprets 1 NIM as a reward, stake, wager or investment after seeing the pass screen;
- any recurring confusion gets fixed before broad promotion.

## 4. Score-floor engineering

Cycle II points that are mechanically attainable should not be left on the table.

### Builder Promotion — 5/5 target

- **2 points:** one genuine post in the Mini Apps Competition Skool community.
- **3 points:** one genuine public social post about NimCarry and the competition.

These posts should only go live once the secure vertical flow is genuinely usable. The current block on broad marketing remains valid until real E2E.

### Real Usage ladder — 15 points available

- `0–3` unique users → `0` points
- `4–10` → `6` points
- `11–24` → `10` points
- `25+` → `15` points

### Score-floor milestones

- two required posts + 4 legitimate users = **11 points** across promotion + usage;
- two required posts + 11 legitimate users = **15 points**;
- two required posts + 25 legitimate users = **20/20 points**.

Do not use bots, artificial wallets, coerced opens or any other gaming behavior.

## 5. Promotion drafts — publish only after E2E green

### Skool draft

**NimCarry — one NIM, one human bridge at a time**

Warm introductions usually disappear after the first handoff. NimCarry is a destination-bound Mini App that lets one consenting human bridge carry a mission closer to a known destination. Exactly 1 NIM acts as the baton: the route advances only after the wallet-approved handoff is independently FINAL.

The goal is simple: `Create → Invite → Accept → Pass 1 NIM → Arrive`.

I’m looking for a few builders to try the first-time flow and tell me where it becomes unclear. I’ll reciprocate with testing on your Mini App.

### Public social draft

Warm introductions break after the first forward: you rarely know where they stalled or whether they arrived.

I’m building **NimCarry** for the Nimiq Mini Apps Competition.

One destination. One consenting human bridge at a time. Exactly **1 NIM** acts as the custody baton, and the route moves only after independent finality.

`Create → Invite → Accept → Pass → ARRIVED.`

The 1 NIM is not a reward. It is the verifiable handoff.

## 6. Legitimate 25+ acquisition ladder

Do not start with broad generic promotion. Use actions that improve the product while increasing legitimate opens.

1. **5 observed testers** — reliability + comprehension + first usage bucket.
2. **Reciprocal builder testing** — test another Mini App in exchange for a real first-time NimCarry test.
3. **11+ users** — targeted Skool / Nimiq community outreach around warm-introduction use cases.
4. **Sep 16 Sip & Show** — only if real E2E is green; use as proof event and invite attendees to try the live app.
5. **25+ users** — continue direct hand-recruited testing and relevant community distribution until full usage threshold is reached.

The bridge invitation itself remains the strongest product-native acquisition loop. Do not bolt on referral rewards.

## 7. Demo law

The real demo must never require the judge or host to become an active participant.

For local presentation rehearsal, `?demo=1` may show a clearly labelled demo-only ARRIVED receipt. This is not evidence of testnet finality.

For the score-critical demo, use controlled A/B/C testnet wallets and show:

`CREATE → INVITE → ACCEPT → AUTHORIZE → A→B 1 NIM → FINAL → B→C 1 NIM → FINAL → ARRIVED → Route Receipt`

Do not claim this proof until it happens on real Nimiq Pay testnet.

## 8. Judge-window reliability

This branch adds:

- `web/health.json` — static availability/proof-law marker;
- `scripts/judge-smoke.mjs` — deterministic HTTP smoke check;
- `npm run smoke:judge -- <url>` — local/operator command;
- `.github/workflows/judge-smoke.yml` — manual remote check.

Before Sep 18 / random scoring window:

- set the final stable production URL;
- run smoke after every deploy;
- record last-known-good commit SHA;
- retain a rollback target;
- stop speculative UI/product changes on the judge path;
- after real E2E, extend smoke to the production API health boundary if a safe non-mutating endpoint exists;
- only then consider a scheduled workflow.

The manual workflow is intentionally **not scheduled yet** because the secure production vertical flow is not green. Scheduling a check against an incomplete/demo-only runtime would create false confidence.

## 9. Error / recovery assurance

Before Early Access, explicitly test:

- Nimiq Pay provider missing;
- no account shared;
- wrong wallet selected;
- invite invalid/expired;
- invite declined;
- wallet refuses transaction;
- transaction broadcast succeeds but verification is delayed;
- RPC endpoint outage;
- refresh/reopen while FINAL is pending;
- iOS cold/warm/background/deeplink lifecycle;
- route remains unchanged through every non-FINAL failure.

The UI must explain the next safe action without implying custody changed.

## 10. What remains intentionally gated

The following hidden spots are **not** implemented by pretending they are already real:

- genuine A→B→C testnet proof;
- real user/PMF evidence;
- 4/11/25 unique wallet usage thresholds;
- published Skool/public posts;
- Sep 16 live product proof;
- scheduled judge-window monitoring against the final production runtime;
- `My Routes` if it risks destabilizing the core;
- reusable external route/receipt SDK or protocol surface.

They become executable immediately after their prerequisite gate is green.

## 11. Merge boundary with Opeyemi

Opeyemi's `feat/mission-http-bindings` branch remains untouched.

This hidden-spot product layer should merge independently into `main` if CI is green. Later HTTP integration must reconcile against the resulting main head rather than force-updating Opeyemi's branch.

The separate HTTP security split remains authoritative:

- Opeyemi: route-view capability, invitation privacy/redaction, legacy relay dev-gate;
- Faadil side: scoped broadcast capability + frontend idempotency keys;
- shared: frontend + HTTP + Postgres combined integration and real testnet E2E.
