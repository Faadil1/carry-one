# HANDOVER — NimCarry

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WITH_FULL_NIMCARRY_BRAND_MIGRATION`

## Naming — LOCKED / FULL MIGRATION AUTHORIZED

The product previously presented as **Carry One** is now **NimCarry**.

Tagline: **One NIM. One bridge at a time.**

The user explicitly authorized a full rename on 2026-09-09 after confirming there is no presentation today. This supersedes the earlier temporary policy of keeping the old public identity for Sip & Show continuity. New UI, copy, documentation, promotion, submission material and newly touched code must use **NimCarry**.

Product law and runtime semantics do not change. Historical evidence may retain the former name when rewriting it would damage traceability. Legacy protocol fixtures may remain only where backward compatibility or negative tests require them.

External rename target:
- GitHub desired slug: `Faadil1/nimcarry`
- Vercel desired alias: `https://nimcarry.vercel.app`

The currently connected GitHub/Vercel actions in this chat do not expose repository-slug or Vercel-project/alias rename mutations, so those two external identifiers are **authorized but still pending**. Until changed externally, the existing repository and deployment URLs remain redirects/legacy locators, not the product name.

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

## Opeyemi HTTP work / task split

Branch: `feat/mission-http-bindings`  
Latest observed head: `4f219cbd153484e560c4079ffd8c549ec52e483f` — **re-fetch before integration**. Never force-update his branch.

Agreed split:
- **Opeyemi:** route-view capability, invitation privacy/redaction, legacy `/relay` dev-gating.
- **Faadil side:** secure tx-hash broadcast capability, frontend `Idempotency-Key` generation.
- **Together:** frontend + HTTP + PostgreSQL integration, NimCarry brand reconciliation, real Nimiq Pay 3-wallet testnet proof.

Do not redo PostgreSQL.

## Cycle II intelligence that still governs

Build a privacy-safe Route Receipt after real E2E; submit as soon as the secure product is genuinely usable; target 25+ legitimate unique Nimiq wallet opens; differentiate from Pay It Sideways through predefined destination + consented routing + verified chain of custody + FINAL-only advancement + ARRIVED; retain the known/consenting target-wallet beachhead for Cycle II; test iOS/Nimiq Pay background/deeplink lifecycle; make verification visible in UI; assure the 60-second judge path; use history/following rather than gamification for repeat value.

## First real testnet proof

External users are not required. Preferred topology: Wallet A creator/initial holder, Wallet B bridge, Wallet C destination, preferably two physical devices.

Target proof:
`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

Never claim PASS until actual Nimiq Pay confirmations and testnet finality are observed.

## Execution order

1. Re-fetch Opeyemi live branch and preserve it.
2. Finish HTTP security split work.
3. Integrate frontend + HTTP + PostgreSQL and reconcile all newly touched runtime naming to NimCarry.
4. Full CI green; merge; update canonical + handover.
5. Run A -> B -> C Nimiq testnet proof including iOS lifecycle/deeplink checks.
6. Capture screenshots, timestamps, tx hashes, FINAL and ARRIVED evidence.
7. Add judge-visible Route Receipt.
8. Submit to Cycle II showcase as soon as genuinely usable.
9. Drive legitimate testing toward 25+ wallet opens, then 60-second judge assurance, TRACE polish, promotion and final package.

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
