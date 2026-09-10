# HANDOVER — NimCarry

Date: 2026-09-10  
Canonical version: **0.8.20**  
State: `GUIDED_PROVIDER_FREE_DEMO_GREEN_PENDING_VERCEL_OBSERVATION_HTTP_SECURITY_PARALLEL_RECONCILIATION`

## Read first

`CANONICAL-STATE.yaml` is the current source of truth and overrides chat memory. Update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone.

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

Initial `public/` output failure was fixed by PR #22 / merge `90673c0...`; root `vercel.json` now builds and serves `web/`. User observed Production `Ready / Current` at `https://carry-one-mu.vercel.app`, and `/create` direct route renders.

Create-surface polish is also on `main` with CI PASS: keep header visible after route navigation, `STEP 1 OF 5 · CREATE MISSION`, no Cycle-II jargon on the production create form.

## NEW — provider-free guided demo tour

User wanted a link that can exercise the product from the first screen through ARRIVED without requiring the Nimiq Pay provider. Implemented directly on `main` and CI green.

Code:
- `web/demo-tour.js` commit `13e26bfa831d267a0b7a3beb5837009980161925`;
- loaded by `web/index.html` commit `d5a3945a4f7556460134c9ccbeed148362404c9f`;
- CI syntax coverage commit `49301203e96934aefc6b597536a689a54649bbc4`;
- CI run `34439421092`: **PASS**.

Intended public clean-start link after Vercel deploy:
`https://carry-one-mu.vercel.app/?demo=1&tour=1&reset=1`

What it does:
- explicit banner remains `DEMO MODE — no wallet or network writes` and adds `GUIDED 1→5 TOUR`;
- `reset=1` clears prior local demo state, then removes only the reset flag so refreshes do not keep wiping progress;
- pre-fills a safe fictional scenario but all fields remain editable;
- creates a demo invite link with `demo=1&tour=1` preserved, so no Nimiq Pay provider is needed;
- `Accept` remains a no-funds consent transition;
- `Pass 1 NIM` simulates wallet-approved → independent FINAL only inside explicit demo mode;
- first pass: Creator → Bridge B, FINAL, custody moves;
- route view provides **Continue demo to destination**;
- second invite is prefilled as the precommitted target;
- second simulated FINAL sets `ARRIVED` and triggers the existing **DEMO RECEIPT** / Route Receipt climax.

Critical evidence boundary: this tour is for UI/story/interaction testing only. **Never present it as testnet or on-chain proof.** Real proof remains blocked until secure HTTP integration and the real A→B→C Nimiq Pay testnet run.

Production status of the new tour: **PENDING OBSERVED VERCEL DEPLOYMENT CONTAINING `49301203` OR LATER**. If the auto-deploy is Ready, open the clean-start link above and test the whole guided path.

## HTTP security — CURRENT REAL GATE

PR #20 `Secure broadcast claims and add client idempotency` is green but not merged. Opeyemi branch remains `feat/mission-http-bindings` at last observed `4f219c...`; **re-fetch before reconciliation and never force-update his branch**.

Split:
- Opeyemi: route-view capability, invitation privacy/redaction, legacy `/relay` production gate;
- Faadil side: PR #20 one-time scoped broadcast capability + TS mutation idempotency;
- Shared: browser secure contract + frontend/HTTP/PostgreSQL vertical integration + real testnet E2E.

Current gate: **`NIMCARRY_HTTP_SECURITY_AND_VERTICAL_INTEGRATION`**.

## Next real proof gate

After secure merge: Wallet A creator/holder → Wallet B bridge → Wallet C destination, two devices preferred.

Target:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`.

Also prove multi-account behavior, fee-0 exact 1-NIM forwarding, native invite deep link and iOS cold/warm/background/resume lifecycle.

## Score-floor after real E2E

Builder Promotion = Skool 2 + public social 3 = **5/5**. Real Usage = `0–3:0`, `4–10:6`, `11–24:10`, `25+:15`. Promotion + 4 genuine users = **11 points**, +11 users = **15**, +25 users = **20/20** outside the 80-point core. No bots/artificial wallets/gaming.

## Current execution order

1. Observe newest Vercel deployment with `49301203` or later and run the provider-free guided tour from clean start through ARRIVED/DEMO RECEIPT.
2. Use the tour to QA all five screen types, interactions, labels, overflows and demo narrative; fix only presentation issues that do not touch blocked backend contracts.
3. Re-fetch Opeyemi branch/PR status.
4. Reconcile PR #20 + Opeyemi route-view/privacy/relay changes without force updates.
5. Wire browser + HTTP + PostgreSQL preserving Living Route UI and Vercel config.
6. Full CI green → merge → update canon/handover.
7. Run real A→B→C testnet through ARRIVED and validate Route Receipt against real data.
8. Then five first-time tests, 5/5 promotion, 4→11→25+ legitimate wallet opens, submission, Sep 16 proof event if green, judge-window monitoring and final TRACE polish.

## External naming debt

Public identity is NimCarry, but external identifiers are not yet renamed: desired repo `Faadil1/nimcarry`, current `Faadil1/carry-one`; desired alias `https://nimcarry.vercel.app`, current observed production `https://carry-one-mu.vercel.app`.
