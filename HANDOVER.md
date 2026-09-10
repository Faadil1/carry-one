# HANDOVER — NimCarry

Date: 2026-09-10  
Canonical version: **0.8.22**  
State: `GUIDED_DEMO_1_TO_5_VISUAL_QA_PASS_MINOR_POLISH_GREEN_HTTP_SECURITY_PARALLEL_RECONCILIATION`

## Read first

`CANONICAL-STATE.yaml` is the current source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Winning Intelligence — COMPLETE

Seven full Otter transcripts analyzed through Sep 9. Primary docs:
- `docs/SIP-SHIP-7-CALL-WINNING-INTELLIGENCE-2026-09-09.md`
- `docs/SIP-SHIP-HIDDEN-SPOT-DELTA-AND-SCORE-CAPTURE-2026-09-09.md`

Locked transfer patterns: problem-first; live proof > architecture; simplicity as implicit meta-rubric; persistent proof artifact; real-user behavior as PMF signal; natural invite loop; avoid crypto as front-door; deterministic demo; lifecycle closure; known-good judge-window runtime.

## Hidden spots + Living Route UI — MERGED

PR #19 hidden-spot layer merged at `7ccf67a...`. PR #21 Living Route UI merged at `08b3ce1...`, CI PASS and observed in Production. Implemented: route-native NimCarry branding/logo/favicon, continuous five-step route, holder emphasis, wallet→verification→FINAL interactions, progressive finalized hops, ARRIVED/Verified Route Receipt climax, micro-interactions, stronger consent copy and reduced-motion.

Truthfulness boundary: presentation does not create real transactions, FINAL, custody or ARRIVED.

## Vercel production — READY

Initial Vercel output failure was fixed by PR #22 / merge `90673c0...`; root `vercel.json` serves `web/`. User observed Production `Ready / Current` at `https://carry-one-mu.vercel.app`, and `/create` direct route renders.

## Guided provider-free demo — 1→5 VIDEO QA PASSED

Clean-start link:
`https://carry-one-mu.vercel.app/?demo=1&tour=1&reset=1`

A second user-supplied production recording (~109.3s) was inspected across the full timeline after the second-bridge continuation fix. The fresh guided run is visible from roughly 12s and reaches **ARRIVED / DEMO Route Receipt** around 66s — approximately **54 seconds** from the fresh home surface to the proof climax in that recording.

Observed PASS:
- home/problem-first surface;
- Create;
- first bridge invitation;
- browser-only demo invite;
- Accept as no-funds consent;
- first simulated FINAL and custody move to Bridge B;
- automatic continuation into the second bridge cycle;
- second simulated FINAL;
- destination reached;
- **ARRIVED**;
- **DEMO Route Receipt with two finalized hops**;
- a new mission can be started after arrival.

Evidence record: `docs/GUIDED-DEMO-SECOND-VIDEO-QA-2026-09-10.md`.

Two minor presentation issues observed in the video were already fixed on `main` in `61a64e530b74f1f3c0300fc1387694c6ef6218af`, CI run `34441565599` = **PASS**:
- pre-FINAL pass headline now says **`Pass the 1 NIM baton.`** rather than prematurely claiming a verified handoff;
- Invitation / Pass / Route kickers are normalized to STEP 3 / 4 / 5;
- `Preview ARRIVED receipt` is hidden only in `demo=1&tour=1` so the guided tester cannot skip the intended narrative; ordinary `?demo=1` preview remains available.

Critical boundary: guided demo is UI/story QA only. **Never present simulated demo FINAL/ARRIVED as Nimiq testnet or on-chain evidence.**

Vercel should next deploy `61a64e5...` or later; no need to rerun the whole demo unless checking that final minor polish.

## HTTP security — CURRENT REAL GATE

PR #20 `Secure broadcast claims and add client idempotency` is green but not merged. Opeyemi branch remains `feat/mission-http-bindings` at last observed `4f219c...`; re-fetch before reconciliation and never force-update his branch.

Split:
- Opeyemi: verified route-view capability, invitation privacy/redaction, legacy `/relay` production gate;
- Faadil side: PR #20 one-time scoped broadcast capability + TS mutation idempotency;
- Shared: browser secure contract + frontend/HTTP/PostgreSQL vertical integration + real testnet E2E.

Current gate: **`NIMCARRY_HTTP_SECURITY_AND_VERTICAL_INTEGRATION`**.

## Next real proof gate

After secure merge: Wallet A creator/holder → Wallet B bridge → Wallet C destination, two physical devices preferred.

Target:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`.

Also prove multi-account behavior, fee-0 exact 1-NIM forwarding, native invite deep link and iOS cold/warm/background/resume lifecycle.

## Score-floor after real E2E

Builder Promotion = Skool 2 + public social 3 = **5/5**. Real Usage = `0–3:0`, `4–10:6`, `11–24:10`, `25+:15`. Promotion + 4 genuine users = **11 points**, +11 users = **15**, +25 users = **20/20** outside the 80-point core. No bots/artificial wallets/gaming.

## Current execution order

1. Re-fetch Opeyemi live branch / PR status.
2. Reconcile his route-view/privacy/relay work with green PR #20 without force-updating his branch.
3. Wire browser + HTTP + PostgreSQL while preserving Living Route UI, guided demo isolation and Vercel config.
4. Full CI green → merge → update canon/handover.
5. Run real A→B→C testnet through ARRIVED and validate Route Receipt against real data.
6. Run 5 observed first-time tests under 60 seconds.
7. Publish genuine Skool + public posts for 5/5 promotion.
8. Reach 4+, 11+, then 25+ legitimate unique wallet opens; submit once genuinely usable.
9. Sep 16 Sip & Show only as real-product proof if runtime is green; then judge-window monitoring/rollback and final TRACE/demo packaging.

## External naming debt

Public identity is NimCarry, but external identifiers are not yet renamed: desired repo `Faadil1/nimcarry`, current `Faadil1/carry-one`; desired alias `https://nimcarry.vercel.app`, current observed production `https://carry-one-mu.vercel.app`.
