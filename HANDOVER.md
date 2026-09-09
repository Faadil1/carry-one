# HANDOVER — NimCarry

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WITH_COMPLETE_SEVEN_CALL_CORPUS_AND_OTTER_DIRECT_CONNECTOR_PENDING`

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone, update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md`. Faadil explicitly reconfirmed this protocol on 2026-09-09 because long conversations must be able to hand off cleanly to a new conversation.

Current canonical version: **0.8.12**.

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

## Sip & Ship Winning Intelligence — COMPLETE 7-CALL CORPUS

The full currently available Cycle I + Cycle II corpus through Sep 9 is assembled.

### Cycle I
- Call #1 — Jul 8 — Otter export supplied
- Call #2 — Jul 15 — Otter export supplied
- Call #3 — Jul 22 — Otter export supplied
- Call #4 — Jul 29 — Otter export supplied

### Cycle II
- Call #1 — Aug 26 — Otter export supplied
- Call #2 — Sep 2 — Otter export supplied
- Call #3 — Sep 9 — Otter export supplied

The Sep 9 video is also available in Google Drive:
- folder: `03 - Sip & Ship Call #3 (Sep 9)`
- file: `01 - Sip & Ship Call #3 (Sep 9).mp4`
- Drive id: `1cyeBj2KFbriRSSoADZPLByf9Rz3JaYES`

Corpus checkpoints:
- `docs/SIP-SHIP-CORPUS-COMPLETE-7-CALLS-2026-09-09.md`
- `docs/SIP-SHIP-OTTER-DIRECT-CONNECTOR-CHECKPOINT-2026-09-09.md`

## Direct Otter.ai connector — preferred extraction path

The local execution sandbox repeatedly timed out while trying to unzip the supplied Otter packages. This is a tooling/runtime issue, not a corpus gap.

A better path has now been discovered: ChatGPT exposes an **Otter.ai** plugin capable of searching meetings and fetching full transcripts with speaker attribution. The plugin has been surfaced to Faadil in the active conversation and is the preferred path for the seven-call transcript pass.

Current connection status: **PENDING_USER_CONNECTION**.

Once connected, do **not** ask Faadil to recreate, re-export or re-upload the seven transcripts. Search/fetch them directly from Otter.ai. Manual ZIP extraction becomes fallback only.

### Evidence discipline

Do not overclaim unparsed transcript segments. Continue separating:
- `VERIFIED_OFFICIAL_PUBLIC`
- `USER_SUPPLIED_LIVE_FEEDBACK`
- `TRANSCRIPT_VERIFIED_OPENING_SEGMENT`
- `OTTER_FULL_TRANSCRIPT_PACKAGE_UPLOADED_PENDING_PARSE`
- `VIDEO_REFERENCE_AVAILABLE_PENDING_VISUAL_PASS`
- `TRANSCRIPT_FULL_PASS_VERIFIED`

### Already-supported judging signals

Before the seven-call recurrence pass is complete, current evidence already supports:
- Nimiq values idea validation, useful apps, community and collaboration.
- Iterative/early submission is normal.
- Live praise strongly rewards real-world problems, problem-first storytelling, existing-market awareness, functionality, simplicity/elegance and strong use cases.
- Cycle II scoring shifts heavily toward functionality/reliability/usefulness and first-time comprehension.
- Publicly shared Cycle I judge feedback cites onboarding, error handling, over-broad scope and limited ecosystem reach as meaningful weaknesses.
- Exactly 1 NIM should be positioned as a semantic custody baton, not an economic incentive.
- NimCarry can own NIM as a coordination primitive.
- `ARRIVED / Route Receipt` should become the demo climax rather than `transaction sent`.
- Post-deadline production reliability matters because judging can occur after submission at an unknown time.

### Full coding pass — next intelligence milestone

After Otter.ai is connected, fetch and code all seven calls with a common schema:
- timestamp + tight Nimiq-team wording;
- speaker attribution;
- app/demo subject;
- PRODUCT / JUDGING / DISTRIBUTION / PLATFORM / COMPETITOR;
- PRAISE / CONCERN / QUESTION / FAILURE / ADVICE;
- recurrence across calls;
- explicit in rubric vs implicit only;
- confidence;
- relationship to eventual Cycle I winners/non-winners where applicable;
- NimCarry action: DO / DO_NOT_DO / WATCH / ALREADY_COVERED;
- priority P0/P1/P2/POST_CYCLE_II.

Then use Drive videos for targeted visual checks around the highest-signal timestamps.

Questions to answer:
- What does Nimiq praise spontaneously?
- Which questions recur before builders finish explaining?
- Which live onboarding/demo failures hurt perception?
- Which uses of NIM feel native versus bolted on?
- What platform friction repeats?
- What did eventual Cycle I winners change between early demo and final submission?
- Which live judging behaviors are absent from the written rubric?
- What changed from Cycle I to Cycle II in Nimiq's expectations?

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

1. Connect the surfaced Otter.ai plugin.
2. Fetch/evidence-code all seven Otter transcripts directly with speaker attribution.
3. Use Google Drive videos for targeted visual/demo-reference checks around high-signal moments.
4. Synthesize the seven-call hidden-spot matrix, compare Cycle I feedback with eventual winners/non-winners, and update NimCarry P0/P1/P2 + submission story; immediately update canon + handover.
5. Re-fetch Opeyemi live branch and preserve it.
6. Finish HTTP security split work.
7. Integrate frontend + HTTP + PostgreSQL + NimCarry brand; full CI green; merge; update canon/handover.
8. Run A → B → C real Nimiq testnet proof including iOS lifecycle/deeplink checks.
9. Capture screenshots, timestamps, tx hashes, FINAL and ARRIVED evidence.
10. Add judge-visible Route Receipt and make it the demo climax.
11. Submit to Cycle II showcase as soon as genuinely usable.
12. Run first 5 observed first-time 60-second tests, then expand toward 25+ legitimate wallet opens.
13. If runtime proof is green, use Sep 16 Sip & Show as a real-product proof event; attend regardless for Q&A/community scoring.
14. Add judge-window reliability monitoring/safe-deploy/rollback before Sep 18.

## Still blocked

Public Early Access before secure vertical flow, mainnet funds/cutover, broad marketing before real E2E, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, autonomous AI spend/routing, marketplace expansion and unique-human claims.
