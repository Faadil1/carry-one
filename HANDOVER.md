# HANDOVER — Carry One

Date: 2026-09-09  
State: `MVP_VERTICAL_SLICE_1_WEEKEND_FINALIZATION_PREP_WITH_CYCLE2_HIDDEN_SPOT_AUDIT`

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
- PR #16 fixed demo `Accept as bridge` navigation and added Carry One favicon.
- Latest verified code baseline: secret scan ✅, typecheck ✅, **124/124 tests across 20 files ✅**, build ✅.
- README/public repo presentation pack is done; video remains intentionally pending the real testnet proof.

## Opeyemi HTTP work / task split

Branch: `feat/mission-http-bindings`  
Latest observed head before current active work: `4f219cbd153484e560c4079ffd8c549ec52e483f`.

**Re-fetch the live head before integration.** Preserve his branch; do not force-update it.

Current agreed split:
- **Opeyemi:** #1 route-view capability, #2 invitation privacy/redaction, #5 legacy `/relay` dev-gating.
- **Faadil side:** #3 secure tx-hash broadcast capability, #4 frontend `Idempotency-Key` generation.
- **Together:** #6 frontend + HTTP + PostgreSQL integration, #7 real Nimiq Pay 3-wallet testnet proof.

Do not redo PostgreSQL.

## Cycle II hidden-spot audit — NEW

Full audit: `docs/CYCLE2-HIDDEN-SPOT-AUDIT-2026-09-09.md`.

Fresh research covered the Cycle I top 3, full Cycle I showcase, current Cycle II showcase, current 100-point scoring, rules/FAQ and Skool discussions.

### Critical findings

1. **Winner pattern = persistent proof artifact, not mechanic alone.**
   - Nimiq Space: persistent shared world.
   - NimJump: server-replayable evidence behind scores + published usage.
   - NimQuest: server-graded + wallet-signed stored completion receipt.
   - Carry One equivalent should be a privacy-safe **Route Receipt / Handoff Receipt** after the real E2E is proven.

2. **Carry One was not seen in the checked live Cycle II showcase.**
   - FAQ says merged submissions appear in the showcase and Week 3 is Early Access.
   - Do not wait until Sep 18 if secure vertical flow is green earlier; submit as soon as genuinely usable to gain testing/usage runway.

3. **Full real-usage score is a concrete target:** 25+ legitimate unique Nimiq wallets opening the app = 15/15 usage points. 11–24 = 10, 4–10 = 6, 0–3 = 0. Bot-like/gamed traffic is excluded and risky.

4. **New direct collision: Pay It Sideways.** It already supports an exact-NIM private relay/gift pattern. Therefore Carry One must never pitch itself as merely "relay the same NIM." Differentiator is **precommitted destination + consented human routing + verified chain of custody + FINAL-only path + ARRIVED terminal state**.

5. **Target-wallet paradox is more visible.** Pay It Sideways shows addressless bearer UX is possible. For Cycle II, keep the frozen known/consenting target-wallet beachhead and explain it as socially unreachable but wallet-known/public/consenting. Do not build a large destination-claim identity system before the deadline.

6. **Current iOS/Nimiq Pay lifecycle risk:** Skool has a report of a reproducible stuck overlay after backgrounding a Mini App and then opening another Mini App link, including iOS 26.6.1 / Nimiq Pay 2.19.1. Add cold/warm/background/resume/deeplink lifecycle testing to the real-device gate. Do not make the judge path depend on a fragile background -> deeplink transition.

7. **Judges evaluate the live Mini App inside Nimiq Pay, not our code.** Backend sophistication must be visible in UX: `Accepted with Nimiq Pay`, `Waiting for finality`, `FINAL — custody moved`, `Verified route receipt`.

8. **60-second judge path is a hard UX target.** First-time user should understand and reach the main point without instructions. Treat this as its own assurance gate after the real vertical proof.

9. **Repeat value should be history/following, not gamification.** `My routes`, follow after handoff, see arrival, start another mission. Optional shareable handoff/arrival card can become a distribution loop only after privacy review.

10. **Storytelling should be structural, not architectural.** Submission story should lead with: warm introductions disappear into private messages; Carry One makes every bridge a consented, verified 1-NIM custody handoff until a defined destination is actually reached.

## Decision locked — first real testnet can be self-run

External users are **not required** for the first E2E proof.

Preferred topology:
- Wallet A = creator / initial holder
- Wallet B = bridge
- Wallet C = destination
- preferably 2 physical devices with 3 testnet accounts

Target proof:

`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A sends exactly 1 NIM to B -> FINAL -> B becomes holder -> AUTHORIZE -> B sends exactly 1 NIM to C -> FINAL -> ARRIVED`

Never claim PASS until actual Nimiq Pay confirmations and testnet finality are observed.

## Weekend execution order

1. Opeyemi completes #1/#2/#5.
2. Faadil-side completes #3/#4 in parallel without editing his working branch.
3. Re-fetch Opeyemi live head and integrate frontend + HTTP + PostgreSQL on clean current `main`.
4. Full CI green; merge; immediately update canonical + handover.
5. Run real A -> B -> C Nimiq testnet proof including iOS lifecycle/deeplink checks.
6. Record screenshots, timestamps, tx hashes, FINAL and ARRIVED evidence.
7. Add judge-visible Route Receipt / verification language if vertical proof is green.
8. Submit to Cycle II showcase as soon as the real product is genuinely usable; do not wait unnecessarily for Sep 18.
9. Run legitimate community testing toward **25+ unique wallet opens** and collect feedback.
10. Run strict 60-second judge-path/error/cancellation assurance.
11. Then TRACE/full visual polish, Skool + public social promotion, real testnet demo video and final submission story.

## What not to build before E2E

- addressless destination-claim system;
- social feed;
- XP/streaks/leaderboards;
- forwarding rewards;
- rich notification system;
- broad marketplace/AI routing expansion.

## Runtime proofs still pending — never fake PASS

- real Nimiq Pay multi-account behavior;
- wallet funded with exactly 1 NIM forwarding exactly 1 NIM with data + requested fee 0;
- native invite deeplink on a real device;
- iOS cold/warm/background/resume/deeplink lifecycle;
- full 3-wallet testnet `CREATE -> ... -> ARRIVED`.

## Still blocked

Public Early Access before secure vertical flow, mainnet funds/cutover, broad marketing launch before real E2E, full TRACE polish before vertical proof, target claiming/public discovery, prizes/wagers/pools, forwarding rewards, autonomous AI spend/routing, marketplace expansion and unique-human claims.
