# HANDOVER — NimCarry

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WITH_FULL_NIMCARRY_BRAND_MIGRATION_AND_SIP_SHIP_CORPUS_INTELLIGENCE`

## Naming — LOCKED / FULL MIGRATION AUTHORIZED

The product previously presented as **Carry One** is now **NimCarry**.

Tagline: **One NIM. One bridge at a time.**

The user explicitly authorized a full rename on 2026-09-09 after confirming there is no presentation today. New UI, copy, documentation, promotion, submission material and newly touched code must use **NimCarry**.

Product law and runtime semantics do not change. Historical evidence may retain the former name when rewriting it would damage traceability. Legacy protocol fixtures may remain only where backward compatibility or negative tests require them.

External rename target:
- GitHub desired slug: `Faadil1/nimcarry`
- Vercel desired alias: `https://nimcarry.vercel.app`

The currently connected GitHub/Vercel actions in this chat do not expose repository-slug or Vercel-project/alias rename mutations, so those two external identifiers are authorized but still pending.

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone, update both `CANONICAL-STATE.yaml` and `HANDOVER.md`.

## Frozen product law

NimCarry = destination-bound human routing:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Exactly `100000` Luna is the baton. A bridge consents before payment. Only independently verified `FINAL` changes custody. No surprise bridges, clawbacks, forwarding rewards, wagering, gamification, AI routing, or unique-human claims. Destination becoming the finalized recipient means `ARRIVED`.

## Current implementation state

- Current repository locator: `Faadil1/carry-one`, public, MIT; desired slug is `Faadil1/nimcarry`.
- Frontend five-screen skeleton: merged.
- PostgreSQL persistence/hardening: merged via authoritative PR #12.
- Current legacy deployment locator: `https://carry-one-sip-show.vercel.app/?demo=1`; desired NimCarry alias pending.
- NimCarry public brand is applied to README and the visible Mini App shell (`web/index.html`).
- `SECURITY.md` and `CONTRIBUTING.md` now use NimCarry.
- NimCarry presentation deck generated.
- Full code-bearing rename should be reconciled with Opeyemi's active HTTP branch at integration rather than force-rewriting his branch.
- Latest verified code baseline before code-bearing rename: secret scan PASS, typecheck PASS, 124/124 tests across 20 files PASS, build PASS.

## New: complete historical Sip & Ship corpus registered

Faadil supplied six Classroom links covering the historical Sip & Ship corpus available before today's 2026-09-09 call. Today's recording is not yet published and must be added later.

Canonical intelligence memo:
`docs/SIP-SHIP-CORPUS-HIDDEN-SPOT-INTELLIGENCE-2026-09-09.md`

The direct Classroom video pages are not fetchable through the current automated web surface. Therefore the corpus memo strictly separates:
- `VERIFIED_OFFICIAL_PUBLIC` — official Skool recaps/announcements/scoring/moderator statements;
- `USER_SUPPLIED_LIVE_FEEDBACK` — direct feedback captured by Faadil, including the Nim-prefix naming signal;
- `TRANSCRIPT_PENDING` — anything that requires actual recording/transcript review.

Do not claim transcript-level evidence until recordings/media/transcripts are ingested.

### New high-confidence hidden spots

1. **Exactly 1 NIM should be framed as a semantic/state-bearing baton, not an economic incentive.** Public discussion around a Cycle-II staking app exposed how quickly users question low-value token stakes. NimCarry avoids this because the 1 NIM amount is meant to prove custody movement, not motivate behavior economically.
2. **NimCarry should own `NIM as coordination primitive`, not generic payment.** Strongest native-Nimiq line: `NimCarry uses a NIM transaction to move responsibility, not just money.`
3. **The product must look simpler than the implementation.** Judge path should compress to `Create -> Invite -> Accept -> Pass 1 NIM -> Arrive`; never lead with HMAC/Postgres/RPC/finality architecture.
4. **Final Sep 16 Sip & Show is a proof-event gate if E2E is green.** Official posts make Sip & Show a live-feedback, visibility and possible official-clipping channel. Do not substitute a simulated demo for runtime proof.
5. **Reciprocal builder testing has triple leverage.** It can improve the 45-point functionality/reliability category, the 15-point real-usage category and the 10-point UX category at the same time.
6. **Route Receipt should become the demo climax.** Strongest ending: `ARRIVED — N verified human bridges — Route Receipt`.
7. **Judge-window reliability is now an explicit post-E2E requirement.** Since the live app can be judged after Sep 18 at an unknown time, add stable production alias, smoke/health check, runtime-error monitoring, safe deploy/rollback discipline and preserve a last-known-good judge path.
8. **Private bridge invites are a natural acquisition loop.** After secure E2E, each legitimate mission can bring another real person into NimCarry because accepting the bridge is the product itself, not artificial marketing.

### Positioning now locked for judge-facing use

Short:
> **NimCarry uses 1 NIM to make warm introductions verifiable.**

Full:
> **NimCarry is a destination-bound human routing Mini App. When you cannot reach someone directly, you invite one trusted bridge at a time. Each bridge consents, then exactly 1 NIM acts as the baton. The route advances only after the handoff is independently FINAL, so you can follow a real chain of custody until the destination is ARRIVED.**

Native-Nimiq answer:
> **Without Nimiq, a bridge can only say “I forwarded it.” With NimCarry, the custody handoff has a wallet-approved transaction and independent finality behind it.**

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

## First real testnet proof

External users are not required. Preferred topology: Wallet A creator/initial holder, Wallet B bridge, Wallet C destination, preferably two physical devices.

Target proof:
`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

Never claim PASS until actual Nimiq Pay confirmations and testnet finality are observed.

## Updated execution order

1. Re-fetch Opeyemi live branch and preserve it.
2. Finish HTTP security split work.
3. Integrate frontend + HTTP + PostgreSQL and reconcile all newly touched runtime naming to NimCarry.
4. Full CI green; merge; update canonical + handover.
5. Run A -> B -> C Nimiq testnet proof including iOS lifecycle/deeplink checks.
6. Capture screenshots, timestamps, tx hashes, FINAL and ARRIVED evidence.
7. Add judge-visible Route Receipt and make it the demo climax.
8. Submit to Cycle II showcase as soon as genuinely usable.
9. Run the first 5 observed first-time tests against the 60-second path, then expand toward 25+ legitimate wallet opens.
10. If runtime proof is green, target Sep 16 Sip & Show as a real-product proof event; attend regardless for Q&A/community scoring.
11. Add judge-window reliability monitoring/safe deploy/rollback layer before Sep 18.
12. Ingest today's Sip & Ship recording when published, then run transcript-level call-by-call intelligence across all seven recordings.

## Transcript-level next pass

When recording media/transcripts are available, extract:
- exact Nimiq-team wording;
- every demoed product and reaction;
- repeated objections/questions;
- onboarding failures visible live;
- native-Nimiq patterns praised;
- Nimiq Pay/WebView/deeplink friction;
- what later winners changed between early demo and final submission.

Classify each signal as `PRODUCT`, `JUDGING`, `DISTRIBUTION`, `PLATFORM`, or `COMPETITOR`, with confidence and an explicit NimCarry action/no-action decision.

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
