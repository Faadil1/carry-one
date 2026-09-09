# HANDOVER — NimCarry

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WITH_FULL_NIMCARRY_BRAND_MIGRATION_AND_SIP_SHIP_TRANSCRIPT_INGESTION`

## Naming — LOCKED / FULL MIGRATION AUTHORIZED

The product previously presented as **Carry One** is now **NimCarry**.

Tagline: **One NIM. One bridge at a time.**

The user explicitly authorized a full rename on 2026-09-09. New UI, copy, documentation, promotion, submission material and newly touched code must use **NimCarry**. Product law and runtime semantics do not change.

External rename target remains authorized but pending tooling support:
- GitHub desired slug: `Faadil1/nimcarry`
- Vercel desired alias: `https://nimcarry.vercel.app`

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone, update both `CANONICAL-STATE.yaml` and `HANDOVER.md`. The user explicitly reconfirmed this continuity protocol on 2026-09-09 and wants the next long-conversation handoff to be able to take lead immediately.

Current canonical version: **0.8.9**.

## Frozen product law

NimCarry = destination-bound human routing:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Exactly `100000` Luna is the baton. A bridge consents before payment. Only independently verified `FINAL` changes custody. No surprise bridges, clawbacks, forwarding rewards, wagering, gamification, AI routing, or unique-human claims. Destination becoming the finalized recipient means `ARRIVED`.

## Current implementation state

- Current repository locator: `Faadil1/carry-one`, public, MIT; desired slug is `Faadil1/nimcarry`.
- Frontend five-screen skeleton: merged.
- PostgreSQL persistence/hardening: merged via authoritative PR #12.
- Current legacy deployment locator: `https://carry-one-sip-show.vercel.app/?demo=1`; desired NimCarry alias pending.
- NimCarry public brand applied to README and visible Mini App shell.
- `SECURITY.md` and `CONTRIBUTING.md` use NimCarry.
- NimCarry presentation deck generated.
- Full code-bearing rename should be reconciled with Opeyemi's active HTTP branch at integration rather than force-rewriting his branch.
- Latest verified code baseline before code-bearing rename: secret scan PASS, typecheck PASS, 124/124 tests across 20 files PASS, build PASS.

## Sip & Ship corpus — six historical transcriptions COMPLETE

Faadil supplied the historical video corpus in Google Drive and transcribed all six recordings with WhisperTranscribe. WhisperTranscribe reports every job as `completed`.

Canonical ingestion checkpoint:
`docs/SIP-SHIP-TRANSCRIPT-INGESTION-CHECKPOINT-2026-09-09.md`

Historical recordings now transcribed:
- Cycle I Call #1 — Jul 8 — 2623.77s
- Cycle I Call #2 — Jul 15 — 3605.74s
- Cycle I Call #3 — Jul 22 — 6198.29s
- Cycle I Call #4 — Jul 29 — 1463.89s
- Cycle II Call #1 — Aug 26 — 3897.45s
- Cycle II Call #2 — Sep 2 — 3461.97s

The Sep 9 Cycle II recording is still pending publication and must be appended when available.

### Current transcript-access limitation

The current WhisperTranscribe connector exposes roughly the opening minute of each long completed transcription in `get-transcription-result`, while automated fetches of the public share pages return cache-miss errors. Therefore full call-by-call transcript coding is **not yet complete**.

Do not overclaim unobserved transcript segments. Evidence must remain separated into:
- `VERIFIED_OFFICIAL_PUBLIC`
- `USER_SUPPLIED_LIVE_FEEDBACK`
- `TRANSCRIPT_VERIFIED_OPENING_SEGMENT`
- `TRANSCRIPT_FULL_PASS_PENDING`

### Transcript-verified opening signals already available

- Cycle I Call #1: organizers explicitly frame the competition around validating ideas, building useful apps, community and collaboration; teams are encouraged.
- Cycle I Call #3: submissions are open during the cycle and the call includes `Sip & Submit`, reinforcing iterative/early submission rather than a single freeze moment.
- Cycle I Call #4: the Nimiq team directly praises a demonstrated app for solving a real-world problem, opening with the builder's own problem, addressing existing competitors/market, being functional, and being `Simple, elegant, and a strong use case.` This is a strong live judging-behavior signal.
- Cycle II Call #1: organizers explicitly say Cycle II adjustments were made from builder feedback to make the competition more valuable, inclusive and transparent.
- Cycle II Call #2: returning Cycle I builders are encouraged to apply what they learned to a new/improved app; the opening mentions roughly 100 new builders joining Skool in under two weeks.

### Current NimCarry implication

The strongest judge-facing structure remains:

> **Problem first → one simple human-routing mechanism → visible Nimiq-native custody proof → ARRIVED / Route Receipt.**

Do not lead with architecture. The app should feel simpler than its implementation.

Short positioning:
> **NimCarry uses 1 NIM to make warm introductions verifiable.**

Native-Nimiq answer:
> **Without Nimiq, a bridge can only say “I forwarded it.” With NimCarry, the custody handoff has a wallet-approved transaction and independent finality behind it.**

## Full transcript pass — required next evidence step

Obtain full TXT/SRT/VTT exports for all six completed jobs, then code every call with timestamps. For each finding record:
- exact/tight Nimiq-team wording;
- app/demo subject;
- PRODUCT / JUDGING / DISTRIBUTION / PLATFORM / COMPETITOR;
- PRAISE / CONCERN / QUESTION / FAILURE / ADVICE;
- recurrence across calls;
- whether the written rubric already contains it;
- confidence;
- NimCarry action: DO / DO_NOT_DO / WATCH / ALREADY_COVERED;
- priority P0/P1/P2/POST_CYCLE_II.

Key questions for the full pass:
- What does the Nimiq team praise spontaneously?
- What questions recur before builders finish explaining?
- Which onboarding/demo failures visibly hurt perception?
- Which uses of NIM are treated as native versus bolted on?
- What platform friction appears repeatedly?
- What did eventual Cycle I winners change between early demo and final submission?
- Which signals are absent from the official rubric but recurrent in live behavior?

## Opeyemi HTTP work / task split

Branch: `feat/mission-http-bindings`  
Latest observed head: `4f219cbd153484e560c4079ffd8c549ec52e483f` — **re-fetch before integration**. Never force-update his branch.

Agreed split:
- **Opeyemi:** route-view capability, invitation privacy/redaction, legacy `/relay` dev-gating.
- **Faadil side:** secure tx-hash broadcast capability, frontend `Idempotency-Key` generation.
- **Together:** frontend + HTTP + PostgreSQL integration, NimCarry brand reconciliation, real Nimiq Pay 3-wallet testnet proof.

Do not redo PostgreSQL.

## Cycle II intelligence that governs

Build a privacy-safe Route Receipt after real E2E; submit as soon as the secure product is genuinely usable; target 25+ legitimate unique Nimiq wallet opens; differentiate from Pay It Sideways through predefined destination + consented routing + verified chain of custody + FINAL-only advancement + ARRIVED; retain the known/consenting target-wallet beachhead for Cycle II; test iOS/Nimiq Pay background/deeplink lifecycle; make verification visible in UI; assure the 60-second judge path; use history/following rather than gamification for repeat value.

New transcript-supported judging emphasis: **real-world problem + problem-first story + functionality + simplicity/elegance + strong use case.**

## First real testnet proof

External users are not required. Preferred topology: Wallet A creator/initial holder, Wallet B bridge, Wallet C destination, preferably two physical devices.

Target proof:
`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

Never claim PASS until actual Nimiq Pay confirmations and testnet finality are observed.

## Updated execution order

1. Obtain full transcript exports (TXT/SRT/VTT) for the six completed historical Sip & Ship jobs and run the evidence-coded cross-call pass.
2. Add the Sep 9 recording/transcript when published.
3. Re-fetch Opeyemi live branch and preserve it.
4. Finish HTTP security split work.
5. Integrate frontend + HTTP + PostgreSQL and reconcile all newly touched runtime naming to NimCarry.
6. Full CI green; merge; update canonical + handover.
7. Run A -> B -> C Nimiq testnet proof including iOS lifecycle/deeplink checks.
8. Capture screenshots, timestamps, tx hashes, FINAL and ARRIVED evidence.
9. Add judge-visible Route Receipt and make it the demo climax.
10. Submit to Cycle II showcase as soon as genuinely usable.
11. Run first 5 observed first-time tests against the 60-second path, then expand toward 25+ legitimate wallet opens.
12. If runtime proof is green, target Sep 16 Sip & Show as a real-product proof event; attend regardless for Q&A/community scoring.
13. Add judge-window reliability monitoring/safe deploy/rollback layer before Sep 18.

## What not to build before E2E

No addressless destination-claim system, social feed, XP/streaks/leaderboards, forwarding rewards, rich notification system, broad marketplace or AI routing expansion.

## Runtime proofs still pending — never fake PASS

- real Nimiq Pay multi-account behavior;
- exactly-1-NIM forwarding with data + requested fee 0;
- native invite deeplink on a real device;
- iOS cold/warm/background/resume/deeplink lifecycle;
- full 3-wallet testnet `CREATE -> ... -> ARRIVED`.

## Still blocked

Public Early Access before secure vertical flow, mainnet funds/cutover, broad marketing launch before real E2E, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, autonomous AI spend/routing, marketplace expansion and unique-human claims.
