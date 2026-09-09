# Carry One — Weekend Finalization Plan

Date: 2026-09-09

Goal: close the secure vertical slice and obtain real Nimiq Pay testnet proof by the end of this week, without waiting for external users.

## Decision locked

The team may run the first real testnet proof itself. External users are not required for the first E2E proof.

Preferred proof topology:
- Wallet A: creator / initial holder
- Wallet B: bridge
- Wallet C: destination
- ideally 2 physical devices with 3 testnet accounts so multi-account/device behavior is exercised

Target proof:
`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B becomes holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

Do not claim PASS until real Nimiq Pay confirmations and testnet finality have happened.

## Work Faadil can complete before Opeyemi returns

1. Verify the public Sip & Show demo after PR #16:
   - favicon visible
   - Accept as bridge returns to Mission Home
   - Pass 1 NIM visible
2. Prepare the testnet setup:
   - enable/use Nimiq testnet in Nimiq Pay
   - prepare 3 testnet accounts A/B/C
   - keep seed phrases/private keys out of GitHub and chat
   - arrange access to a second device if possible
3. Prepare the exact-balance test:
   - reserve one bridge wallet for the critical exactly-1-NIM forwarding proof
   - do not execute until secure HTTP integration is merged
4. Prepare the canonical mission scenario:
   - consenting known destination
   - short target label
   - one clear mission purpose/ask
   - bridge rationale for A -> B and B -> C
5. Prepare evidence capture:
   - screen recording on device
   - timestamps
   - tx hashes after broadcast
   - screenshots of PENDING/FINAL/ARRIVED states
   - note expected wallet fingerprints and device/account used
6. Prepare Sip & Show feedback capture:
   - collect Opeyemi/Nimiq feedback verbatim
   - classify each item as blocker / improvement / judging insight
7. Do not spend time on full TRACE polish before the real vertical proof is green.

## Opeyemi return / integration gate

On Opeyemi return:
- re-fetch live `feat/mission-http-bindings` head before reconciling
- preserve his branch; do not force-update it
- close route-view capability, invitation privacy, secure broadcast claim, frontend idempotency, and legacy relay dev-gating
- run combined frontend + HTTP + PostgreSQL harness
- run full CI
- merge only if green
- immediately update `CANONICAL-STATE.yaml` and `HANDOVER.md`

## After secure HTTP merge

Run the real A -> B -> C testnet proof ourselves first. Only after that proof is green should we move to small real-user testing, TRACE/full polish, promotion, and final submission packaging.
