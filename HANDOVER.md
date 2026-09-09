# HANDOVER — NimCarry

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WITH_HIDDEN_SPOTS_PRODUCT_LAYER_MERGED`

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md` so a new conversation can immediately take lead.

Current canonical version: **0.8.15**.

## Product law — FROZEN

Product: **NimCarry**  
Tagline: **One NIM. One bridge at a time.**  
Promise: **Get this to someone you cannot reach directly — one human bridge at a time.**

Category = destination-bound human routing. Exactly `1 NIM = 100000 Luna` is a semantic custody baton, **not** a reward, stake, wager, prize or pooled fund. A bridge consents before payment. Only independently verified `FINAL` changes custody. Destination becoming the finalized recipient means `ARRIVED`. No surprise bridges, route loops, clawbacks, forwarding rewards, gamification, AI routing or unique-human claims.

Judge-facing short line:

> **NimCarry uses 1 NIM to make warm introductions verifiable.**

Front-door narrative = human problem, not crypto. Nimiq becomes explicit at wallet authorization / finality / proof moments.

## Seven-call Winning Intelligence — COMPLETE

Otter.ai is connected. Full transcripts with timestamps + speakers were fetched for all seven currently available Sip & Ship calls: Cycle I Jul 8/15/22/29 and Cycle II Aug 26/Sep 2/Sep 9.

Primary audit:
`docs/SIP-SHIP-7-CALL-WINNING-INTELLIGENCE-2026-09-09.md`

Score/hidden-spot delta:
`docs/SIP-SHIP-HIDDEN-SPOT-DELTA-AND-SCORE-CAPTURE-2026-09-09.md`

High-confidence patterns: problem-first story; live proof > architecture; simple/intuitive/crystal-clear as implicit meta-rubric; persistent proof artifact; real user behavior as PMF signal; natural share loop; first users by hand; Cycle-II reweighting toward utility + Nimiq; avoid crypto as front-door; known-good runtime during judge window; only visible evidence gets rewarded; financial-looking mechanics need immediate disambiguation; never depend on judge cooperation for demo; lifecycle gaps are noticed; after core comprehension, distribution + abuse are next questions.

## Hidden spots — PRODUCT LAYER MERGED

PR **#19** merged to `main` as:
`7ccf67aefb53ee101b2df7fdc1dc638d976cb4cc`

Pre-merge CI `34413498020`: PASS.  
Post-merge CI `34413573164`: PASS.

Implementation contract:
`docs/CYCLE2-HIDDEN-SPOT-IMPLEMENTATION-PACK-2026-09-09.md`

Milestone record:
`docs/HIDDEN-SPOTS-IMPLEMENTATION-MILESTONE-2026-09-09.md`

### Implemented now

- problem-first home line: `Warm introductions disappear after the first handoff.`;
- relatable warm-introduction example;
- five-step judge flow: `Create → Invite → Accept → Pass → Arrive`;
- explicit 1 NIM baton/not-reward language;
- wallet approval → independent FINAL → custody movement proof ladder;
- bridge lifecycle clarification;
- private invite sharing without referral incentives;
- FINAL-only route explanation;
- privacy-safe `ARRIVED / Verified Route Receipt` derived from already-authorized route data;
- explicit demo-only ARRIVED receipt preview;
- `/health.json` static judge marker;
- `scripts/judge-smoke.mjs` and `npm run smoke:judge`;
- manual `Judge Window Smoke` GitHub workflow;
- browser-runtime JS syntax check added to CI;
- first-five observed 60-second test protocol;
- 4/11/25 real-usage ladder + promotion drafts;
- README now explicitly communicates problem, why 1 NIM, FINAL, ARRIVED, differentiation and Route Receipt.

### Still gated — never claim complete before evidence exists

- real A→B→C Nimiq Pay testnet proof;
- 5 actual observed first-time tests;
- 4 / 11 / 25 genuine unique wallet opens;
- actual 2-point Skool + 3-point public post;
- Sep 16 real-product Sip & Show proof;
- scheduled judge-window monitoring against the final secure runtime;
- `My Routes` only if safe after E2E;
- reusable external route/receipt verification primitive after Cycle II.

## Easy-point / score-floor strategy — LOCKED

Cycle II:
- Builder Promotion: Skool post `2` + public social post `3` = **5/5**.
- Real Usage: `0–3 = 0`, `4–10 = 6`, `11–24 = 10`, `25+ = 15`.

Once secure E2E is green:
- promotion + 4 genuine opens = **11 points** outside the 80-point core;
- promotion + 11 genuine opens = **15 points**;
- promotion + 25+ genuine opens = **20/20**.

No bots, artificial wallets or gaming. The same first testers should improve Reliability/Usefulness + UX while legitimately moving the usage bucket.

## Opeyemi HTTP work — CURRENT GATE

Branch: `feat/mission-http-bindings`  
Re-fetched 2026-09-09; still at:
`4f219cbd153484e560c4079ffd8c549ec52e483f`

Do **not** force-update or rewrite Opeyemi's branch.

Agreed split:
- **Opeyemi:** verified route-view capability replacing spoofable `X-Wallet`; invitation privacy/redaction; production dev-gate for legacy `/relay` mutations.
- **Faadil side:** scoped short-lived broadcast capability + frontend `Idempotency-Key` generation.
- **Shared:** frontend + HTTP + PostgreSQL integration, NimCarry runtime branding, real 3-wallet testnet E2E.

Remaining blockers:
1. spoofable `X-Wallet` → verified route-view capability;
2. role-scope/redact private invitation context;
3. secure tx-hash broadcast claim with scoped capability;
4. frontend mutation idempotency keys;
5. disable/dev-gate legacy relay mutations;
6. combined frontend + HTTP + PostgreSQL harness.

Current gate: **`NIMCARRY_HTTP_SECURITY_AND_VERTICAL_INTEGRATION`**. Resume it now.

## First real testnet proof after secure merge

Preferred topology: Wallet A creator/initial holder, Wallet B bridge, Wallet C destination; two physical devices preferred.

Target:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Real Nimiq Pay human confirmations required. Never claim PASS before observed testnet finality.

Also prove: multi-account behavior, exact-balance forwarding with requested fee 0, native invitation deep link, and iOS cold/warm/background/resume/deeplink lifecycle.

## Execution order — CURRENT

1. Re-fetch Opeyemi branch again immediately before touching HTTP integration if time has passed.
2. Close the HTTP security split blockers.
3. Integrate frontend + HTTP + PostgreSQL + NimCarry runtime branding.
4. Full CI green; merge; update canon + handover immediately.
5. Run real A→B→C testnet route through `ARRIVED`.
6. Verify the already-merged Route Receipt against real route data; capture screenshots/timestamps/tx hashes.
7. Run 5 observed cold-start <60-second tests.
8. Publish the genuine Skool post + public social post for 5/5 promotion points.
9. Reach 4+ genuine wallet opens, then 11+, then 25+.
10. Submit to Cycle II showcase as soon as the app is genuinely usable.
11. If runtime is green, use Sep 16 Sip & Show as a real-product proof event; otherwise attend without faking proof.
12. Enable production judge-window monitoring/safe rollback once final secure URL exists.
13. Apply focused TRACE polish only after proof-critical work is green.

## External naming debt

Public product identity is NimCarry, but do not claim external identifiers are renamed yet:
- desired repo slug: `Faadil1/nimcarry`; current locator: `Faadil1/carry-one`;
- desired Vercel alias: `https://nimcarry.vercel.app`; current legacy demo locator: `https://carry-one-sip-show.vercel.app`.

Some legacy code/doc/storage identifiers still use Carry One / `carryone.*`; reconcile safely during HTTP/runtime integration rather than breaking compatibility.

## Still blocked

Public Early Access before secure vertical flow; mainnet funds/cutover; broad marketing before real E2E; target claiming/public discovery; prizes/wagers/pools; forwarding rewards; autonomous AI spend/routing; marketplace expansion; unique-human claims.
