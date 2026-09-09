# HANDOVER — NimCarry

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WITH_FULL_NIMCARRY_BRAND_MIGRATION_AND_SEVEN_CALL_SIP_SHIP_CORPUS`

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone, update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md`. Faadil explicitly reconfirmed this protocol on 2026-09-09 because long conversations must be able to hand off cleanly to a new conversation.

Current canonical version: **0.8.10**.

## Naming — LOCKED

The former product name **Carry One** is retired. The product is **NimCarry**.

Tagline: **One NIM. One bridge at a time.**

New UI, copy, docs, promotion, submission material and newly touched code must use NimCarry. Historical evidence can retain the old name only when rewriting would damage traceability. Desired external identifiers remain `Faadil1/nimcarry` and `https://nimcarry.vercel.app`; current repo/deployment locators are still legacy pending tooling support.

## Frozen product law

NimCarry = destination-bound human routing:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Exactly `100000` Luna is the baton. A bridge consents before payment. Only independently verified `FINAL` changes custody. No surprise bridges, clawbacks, forwarding rewards, wagering, gamification, AI routing, or unique-human claims. Destination becoming the finalized recipient means `ARRIVED`.

Key positioning:
- **NIM as a coordination primitive, not merely payment.**
- **The 1 NIM is the baton, not the reward.**
- Judge flow should feel simple: `Create → Invite → Accept → Pass 1 NIM → Arrive`.

## Current implementation state

- Repo locator: `Faadil1/carry-one`, public, MIT; desired slug `Faadil1/nimcarry`.
- Frontend five-screen skeleton: merged.
- PostgreSQL persistence/hardening: merged via authoritative PR #12; do not redo Postgres.
- Current demo locator: `https://carry-one-sip-show.vercel.app/?demo=1`; desired NimCarry alias pending.
- NimCarry public brand applied to README/visible shell/security/contributor docs.
- Latest verified code baseline before code-bearing brand integration: secret scan PASS, typecheck PASS, 124/124 tests across 20 files PASS, build PASS.

## Sip & Ship Winning Intelligence — corpus expanded

The limited WhisperTranscribe workflow has been superseded for the full long-form pass. Faadil used **Otter AI** and uploaded six transcript export ZIPs directly into the active conversation:

- Cycle I Call #1 — Jul 8
- Cycle I Call #2 — Jul 15
- Cycle I Call #3 — Jul 22
- Cycle I Call #4 — Jul 29
- Cycle II Call #1 — Aug 26
- Cycle II Call #2 — Sep 2

New checkpoint doc:
`docs/SIP-SHIP-OTTER-INGESTION-AND-SEP9-CORPUS-EXPANSION-2026-09-09.md`

### Sep 9 recording now available

The Cycle II Call #3 recording published while the transcript work was being prepared and is now in the same Google Drive corpus:

- folder: `03 - Sip & Ship Call #3 (Sep 9)`
- file: `01 - Sip & Ship Call #3 (Sep 9).mp4`
- Drive id: `1cyeBj2KFbriRSSoADZPLByf9Rz3JaYES`
- observed size: `167824742` bytes

This brings the **recording corpus to seven calls**: four Cycle I + three Cycle II. The Sep 9 video is available for visual/demo-reference analysis, but its audio must not be treated as transcript-verified until a full transcript is parsed/created.

### Evidence posture

WhisperTranscribe remains useful only as an opening-segment cross-check because its connector returned roughly the first minute of long jobs. Otter is now the preferred source for the full historical transcript coding pass.

Do not overclaim. Evidence classes are:
- `VERIFIED_OFFICIAL_PUBLIC`
- `USER_SUPPLIED_LIVE_FEEDBACK`
- `TRANSCRIPT_VERIFIED_OPENING_SEGMENT`
- `OTTER_FULL_TRANSCRIPT_PACKAGE_UPLOADED_PENDING_PARSE`
- `VIDEO_REFERENCE_AVAILABLE_PENDING_VISUAL_PASS`
- `TRANSCRIPT_FULL_PASS_VERIFIED`

### Already-supported judging signals

The evidence already supports these directions, pending recurrence quantification from the full Otter pass:
- Nimiq explicitly values idea validation, useful apps, community and collaboration.
- Iterative/early submission is normal.
- Live praise strongly rewards real-world problems, problem-first storytelling, existing-market awareness, functionality, simplicity/elegance and strong use cases.
- Cycle II changes are explicitly feedback-driven.
- Returning builders are expected to apply prior-cycle learning.
- NimCarry should position exactly 1 NIM as a **semantic custody baton**, not an economic incentive.
- NimCarry can own **NIM as a coordination primitive**.
- `ARRIVED / Route Receipt` should become the demo climax rather than `transaction sent`.

### Full coding pass — next intelligence milestone

Parse the six Otter packages and code each call with a common schema:
- timestamp + tight Nimiq-team wording;
- app/demo subject;
- PRODUCT / JUDGING / DISTRIBUTION / PLATFORM / COMPETITOR;
- PRAISE / CONCERN / QUESTION / FAILURE / ADVICE;
- recurrence across calls;
- whether explicit in rubric or implicit only;
- confidence;
- NimCarry action: DO / DO_NOT_DO / WATCH / ALREADY_COVERED;
- priority P0/P1/P2/POST_CYCLE_II.

Then use the Sep 9 recording for visual/demo-reference checks and add a full Sep 9 transcript to produce the seven-call matrix.

Questions to answer:
- What does Nimiq praise spontaneously?
- Which questions recur before builders finish explaining?
- Which live onboarding/demo failures hurt perception?
- Which uses of NIM feel native versus bolted on?
- What platform friction repeats?
- What did eventual Cycle I winners change between early demo and final submission?
- Which live judging behaviors are absent from the written rubric?

## Opeyemi HTTP work / task split

Branch: `feat/mission-http-bindings`  
Latest observed head: `4f219cbd153484e560c4079ffd8c549ec52e483f` — **re-fetch before integration**. Never force-update his branch.

Agreed split:
- **Opeyemi:** route-view capability, invitation privacy/redaction, legacy `/relay` dev-gating.
- **Faadil side:** secure tx-hash broadcast capability, frontend `Idempotency-Key` generation.
- **Together:** frontend + HTTP + PostgreSQL integration, NimCarry brand reconciliation, real Nimiq Pay 3-wallet testnet proof.

## First real testnet proof

External users are not required. Preferred topology: Wallet A creator/initial holder, Wallet B bridge, Wallet C destination, preferably two physical devices.

Target proof:
`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

Never claim PASS until actual Nimiq Pay confirmations and testnet finality are observed.

## Execution order

1. Parse and evidence-code the six uploaded Otter transcript packages.
2. Use Sep 9 video as visual/demo reference and obtain/create its full transcript; expand to seven-call matrix.
3. Synthesize cross-call hidden spots and update NimCarry P0/P1/P2; immediately update canonical + handover.
4. Re-fetch Opeyemi live branch and preserve it.
5. Finish HTTP security split work.
6. Integrate frontend + HTTP + PostgreSQL + NimCarry brand; full CI green; merge; update canon/handover.
7. Run A → B → C real Nimiq testnet proof including iOS lifecycle/deeplink checks.
8. Capture screenshots, timestamps, tx hashes, FINAL and ARRIVED evidence.
9. Add judge-visible Route Receipt and make it the demo climax.
10. Submit to Cycle II showcase as soon as genuinely usable.
11. Run first 5 observed first-time 60-second tests, then expand toward 25+ legitimate wallet opens.
12. If runtime proof is green, use Sep 16 Sip & Show as a real-product proof event; attend regardless for Q&A/community scoring.
13. Add judge-window reliability monitoring/safe-deploy/rollback before Sep 18.

## Still blocked

Public Early Access before secure vertical flow, mainnet funds/cutover, broad marketing before real E2E, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, autonomous AI spend/routing, marketplace expansion and unique-human claims.
