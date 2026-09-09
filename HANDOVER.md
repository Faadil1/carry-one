# HANDOVER — Carry One

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WEEKEND_FINALIZATION_PREP`

## Source of truth / continuity

Read `CANONICAL-STATE.yaml` first; it overrides chat memory. After every meaningful milestone, update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md` so a new conversation can take the lead without prior chat history.

## Frozen product law

Carry One = destination-bound human routing:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

Exactly `100000` Luna is the baton. A bridge consents before payment. Only independently verified `FINAL` changes custody. No surprise bridges, clawbacks, forwarding rewards, wagering, gamification, AI routing, or unique-human claims. Destination becoming the finalized recipient means `ARRIVED`.

## Current implementation state

- Repo: `Faadil1/carry-one`, public, MIT.
- Frontend five-screen skeleton: merged.
- PostgreSQL persistence/hardening: merged via authoritative PR #12.
- Sip & Show clickable demo: public at `https://carry-one-sip-show.vercel.app/?demo=1`.
- Demo only: no wallet writes, no backend mutations, no real testnet proof.
- PR #16 fixed demo `Accept as bridge` navigation and added Carry One favicon.
- PR #16 CI: secret scan ✅, typecheck ✅, **124/124 tests across 20 files ✅**, build ✅.
- Manually confirm the public alias serves the PR #16 bytes: favicon visible, Accept returns to Mission Home, `Pass 1 NIM` visible.

## Opeyemi HTTP work — next integration source

Branch: `feat/mission-http-bindings`
Latest observed head: `4f219cbd153484e560c4079ffd8c549ec52e483f`

**Re-fetch the live head before integration** because Opeyemi may push again. Preserve his branch; do not force-update it.

Known work present: mission HTTP bindings, signed mutation auth, request validation, `Idempotency-Key`, rate limits and mission DTOs.

Still required before merge/Public Early Access:
1. replace spoofable `X-Wallet` route identity with verified route-view Bearer/server capability;
2. redact `why_you` and private invitation context by verified role;
3. protect tx-hash broadcast claim with short-lived mission+invitation+sequence capability;
4. generate `Idempotency-Key` automatically from frontend mutation requests;
5. disable/dev-gate legacy `/relay` mutation paths;
6. combine frontend + HTTP + PostgreSQL into one tested vertical flow.

## Decision locked — we can run the real testnet ourselves

External users are **not required** for the first E2E proof.

Preferred topology:
- Wallet A = creator / initial holder
- Wallet B = bridge
- Wallet C = destination
- preferably 2 physical devices with 3 testnet accounts

Target proof:

`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B becomes holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

The real Nimiq Pay confirmations remain manual human approvals. Never claim PASS until actual testnet transactions and finality are observed.

## What Faadil can complete before Opeyemi returns

Use `docs/WEEKEND-FINALIZATION-PLAN.md` as the operational checklist.

Priority preparation:
- manually verify the PR #16 Sip & Show demo bytes are live;
- prepare 3 testnet accounts A/B/C;
- arrange a second physical device if possible;
- reserve one bridge wallet for the critical exactly-1-NIM forwarding test;
- define one simple known/consenting destination mission scenario;
- prepare evidence capture: screen recording, screenshots, timestamps and tx hashes;
- capture any Sip & Show/Nimiq feedback and classify it as blocker / improvement / judging insight.

Do **not** execute the exact-1-NIM proof or claim real E2E PASS before secure HTTP integration is merged.

## Weekend target

Goal: **close the secure vertical slice + obtain real testnet proof by end of this week.**

Execution sequence:
1. wait for / re-fetch Opeyemi live HTTP head;
2. clean-main integration and close the five security/integration blockers;
3. combined frontend + HTTP + PostgreSQL harness;
4. full CI green;
5. merge to `main`;
6. immediately update canonical + handover;
7. run our own real A -> B -> C Nimiq testnet proof;
8. record real-device/testnet evidence;
9. only then move to small real-user testing, TRACE/full visual polish, promotion and submission packaging.

## Runtime proofs still pending — never fake PASS

- real Nimiq Pay multi-account behavior;
- wallet funded with exactly 1 NIM forwarding exactly 1 NIM with data + requested fee 0;
- native invite deeplink on a real device;
- full 3-wallet testnet `CREATE -> ... -> ARRIVED`.

## Still blocked

Public Early Access, mainnet funds/cutover, broad marketing launch, full TRACE polish before vertical proof, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, autonomous AI spend/routing, marketplace expansion and unique-human claims.
