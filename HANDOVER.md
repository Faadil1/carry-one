# HANDOVER — NimCarry

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WEEKEND_FINALIZATION_PREP_WITH_CYCLE2_HIDDEN_SPOT_AUDIT`

## Naming — LOCKED

The product previously presented as **Carry One** is now **NimCarry**.

Tagline: **One NIM. One bridge at a time.**

The rename is public-facing and does not change product law or runtime semantics. Full decision: `docs/NIMCARRY-NAMING-DECISION-2026-09-09.md`.

Compatibility boundary for the active Cycle II build: keep `Faadil1/carry-one`, the current `carry-one-sip-show.vercel.app` deployment URL, `carryone.*` storage keys, historical evidence names, and collision-prone internal identifiers stable until a controlled migration after the current secure integration work. New judge-facing copy, UI, decks, promotion and submission material must use **NimCarry**.

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone, update both `CANONICAL-STATE.yaml` and `HANDOVER.md` so a new conversation can take the lead without prior chat history.

## Frozen product law

NimCarry = destination-bound human routing:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Exactly `100000` Luna is the baton. A bridge consents before payment. Only independently verified `FINAL` changes custody. No surprise bridges, clawbacks, forwarding rewards, wagering, gamification, AI routing, or unique-human claims. Destination becoming the finalized recipient means `ARRIVED`.

## Current implementation state

- Repo: `Faadil1/carry-one`, public, MIT; repo slug intentionally stable during rename migration.
- Frontend five-screen skeleton: merged.
- PostgreSQL persistence/hardening: merged via authoritative PR #12.
- Sip & Show clickable demo: public at `https://carry-one-sip-show.vercel.app/?demo=1`.
- PR #16 fixed demo `Accept as bridge` navigation and favicon.
- NimCarry public brand applied to README and `web/index.html` on 2026-09-09.
- Updated NimCarry Sip & Show deck generated for the live presentation.
- Latest verified code baseline before naming-only changes: secret scan PASS, typecheck PASS, 124/124 tests across 20 files PASS, build PASS.
- README/public repo presentation pack is done; video remains intentionally pending the real testnet proof.

## Opeyemi HTTP work / task split

Branch: `feat/mission-http-bindings`  
Latest observed head before current active work: `4f219cbd153484e560c4079ffd8c549ec52e483f`.

**Re-fetch the live head before integration.** Preserve his branch; do not force-update it.

Current agreed split:
- **Opeyemi:** route-view capability, invitation privacy/redaction, legacy `/relay` dev-gating.
- **Faadil side:** secure tx-hash broadcast capability, frontend `Idempotency-Key` generation.
- **Together:** frontend + HTTP + PostgreSQL integration, real Nimiq Pay 3-wallet testnet proof.

Do not redo PostgreSQL.

## Cycle II hidden-spot audit

Full audit: `docs/CYCLE2-HIDDEN-SPOT-AUDIT-2026-09-09.md`.

Critical conclusions remain: build a privacy-safe Route Receipt after real E2E; submit to the Cycle II showcase as soon as the secure product is genuinely usable; target 25+ legitimate unique Nimiq wallet opens; differentiate from Pay It Sideways through predefined destination + consented routing + verified chain of custody + FINAL-only advancement + ARRIVED; retain the known/consenting target-wallet beachhead for Cycle II; test the reported iOS/Nimiq Pay background/deeplink lifecycle risk; make Nimiq verification visible in the UI; assure the 60-second judge path; and use history/following rather than gamification for repeat value.

## Decision locked — first real testnet can be self-run

External users are not required for the first E2E proof.

Preferred topology:
- Wallet A = creator / initial holder
- Wallet B = bridge
- Wallet C = destination
- preferably 2 physical devices with 3 testnet accounts

Target proof:

`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B becomes holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

Never claim PASS until actual Nimiq Pay confirmations and testnet finality are observed.

## Execution order

1. Finish the current Sip & Show and capture every Nimiq/community feedback item as blocker / improvement / judging insight / platform issue.
2. Opeyemi completes route-view capability, invitation privacy/redaction and legacy relay dev-gating.
3. Faadil-side completes secure tx-hash broadcast capability + frontend Idempotency-Key in parallel without editing Opeyemi's working branch.
4. Re-fetch Opeyemi live head and integrate frontend + HTTP + PostgreSQL on clean current `main`.
5. Full CI green; merge; immediately update canonical + handover.
6. Run real A -> B -> C Nimiq testnet proof including iOS lifecycle/deeplink checks.
7. Record screenshots, timestamps, tx hashes, FINAL and ARRIVED evidence.
8. Add judge-visible Route Receipt / verification language if vertical proof is green.
9. Submit to Cycle II showcase as soon as the real product is genuinely usable.
10. Run legitimate community testing toward 25+ unique wallet opens, 60-second judge-path assurance, TRACE polish, promotion and final submission package.

## What not to build before E2E

No addressless destination-claim system, social feed, XP/streaks/leaderboards, forwarding rewards, rich notification system, broad marketplace or AI routing expansion.

## Runtime proofs still pending — never fake PASS

- real Nimiq Pay multi-account behavior;
- wallet funded with exactly 1 NIM forwarding exactly 1 NIM with data + requested fee 0;
- native invite deeplink on a real device;
- iOS cold/warm/background/resume/deeplink lifecycle;
- full 3-wallet testnet `CREATE -> ... -> ARRIVED`.

## Still blocked

Public Early Access before secure vertical flow, mainnet funds/cutover, broad marketing launch before real E2E, full TRACE polish before vertical proof, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, autonomous AI spend/routing, marketplace expansion and unique-human claims.
