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
- Latest verified code baseline: secret scan ✅, typecheck ✅, **124/124 tests across 20 files ✅**, build ✅.

## Repository presentation / public judge readiness — DONE

Immediately before Sip & Show, the public repo presentation was upgraded on `main`:

- README now shows the Carry One logo at the top;
- live clickable demo is the first prominent link;
- demo/evidence section is present;
- video is intentionally marked pending until the **real** testnet recording exists, rather than linking a fake simulated proof;
- README now explains the problem, 5-screen flow, product laws, security/Nimiq integration, current build state and remaining runtime proof;
- `CONTRIBUTING.md` added;
- `SECURITY.md` added;
- `CODE_OF_CONDUCT.md` added;
- security/privacy/reporting boundaries are explicit for the now-public repository.

Stable demo URL to give Opeyemi/Nimiq:

`https://carry-one-sip-show.vercel.app/?demo=1`

If the live Vercel alias is serving PR #16+, expected presenter flow is:

`Create -> Choose bridge -> Accept -> Mission Home -> Pass 1 NIM -> verified route (simulated in demo mode)`

Never represent the demo as the real testnet E2E.

## Opeyemi HTTP work / task split

Branch: `feat/mission-http-bindings`  
Latest observed head before his current work: `4f219cbd153484e560c4079ffd8c549ec52e483f`.

**Re-fetch the live head before integration** because Opeyemi is actively pushing. Preserve his branch; do not force-update it.

Current agreed split:

- **Opeyemi:** #1 route-view capability, #2 invitation privacy/redaction, #5 legacy `/relay` dev-gating.
- **Faadil side:** #3 secure tx-hash broadcast capability, #4 frontend `Idempotency-Key` generation.
- **Together:** #6 frontend + HTTP + PostgreSQL integration, #7 real Nimiq Pay 3-wallet testnet proof.

Do not redo PostgreSQL.

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

## What Faadil can complete while Opeyemi works

Use `docs/WEEKEND-FINALIZATION-PLAN.md` as the operational checklist.

Priority preparation:
- manually verify the latest Sip & Show demo bytes are live;
- prepare 3 testnet accounts A/B/C;
- arrange a second physical device if possible;
- reserve one bridge wallet for the critical exactly-1-NIM forwarding test;
- define one simple known/consenting destination mission scenario;
- prepare evidence capture: screen recording, screenshots, timestamps and tx hashes;
- capture Sip & Show/Nimiq feedback and classify it as blocker / improvement / judging insight.

Do **not** execute the exact-1-NIM proof or claim real E2E PASS before secure HTTP integration is merged.

## Weekend target

Goal: **close the secure vertical slice + obtain real testnet proof by end of this week.**

Execution sequence:
1. Opeyemi completes #1/#2/#5 on `feat/mission-http-bindings`;
2. Faadil-side #3/#4 run in parallel without editing his working branch;
3. re-fetch Opeyemi live head;
4. clean-main integration of frontend + HTTP + PostgreSQL;
5. full CI green;
6. merge to `main`;
7. immediately update canonical + handover;
8. run our own real A -> B -> C Nimiq testnet proof;
9. record real-device/testnet evidence;
10. only then move to small real-user testing, TRACE/full visual polish, promotion and submission packaging.

## Runtime proofs still pending — never fake PASS

- real Nimiq Pay multi-account behavior;
- wallet funded with exactly 1 NIM forwarding exactly 1 NIM with data + requested fee 0;
- native invite deeplink on a real device;
- full 3-wallet testnet `CREATE -> ... -> ARRIVED`.

## Still blocked

Public Early Access, mainnet funds/cutover, broad marketing launch, full TRACE polish before vertical proof, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, autonomous AI spend/routing, marketplace expansion and unique-human claims.
