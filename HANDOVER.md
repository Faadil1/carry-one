# HANDOVER — NimCarry

Date: 2026-09-10  
Canonical version: **0.8.21**  
State: `GUIDED_DEMO_VIDEO_QA_SECOND_BRIDGE_FIX_GREEN_PENDING_VERCEL_OBSERVATION_HTTP_SECURITY_PARALLEL_RECONCILIATION`

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

## Provider-free guided demo — FIRST VIDEO QA DONE

Clean-start link:
`https://carry-one-mu.vercel.app/?demo=1&tour=1&reset=1`

The user supplied an ~81.8s screen recording of the guided tour. Observed PASS through:
- home/problem-first surface;
- Create with prefill;
- first bridge invitation;
- browser-only `Open demo invite`;
- Accept as a no-funds consent step;
- simulated demo FINAL;
- custody moving to Bridge B;
- route showing **1 FINAL** handoff.

Observed friction at the second bridge cycle: **Continue demo to destination** returned to Mission Home, but the next required action was not obvious. The recording therefore ended with one FINAL handoff and did **not** reach ARRIVED.

Fix is already on `main`:
- `web/demo-tour.js` commit `ede8737a63ff1988be5540322ece4966d529fbe0`;
- CI run `34440569128`: **PASS** across secret scan, browser syntax, typecheck, tests and build.

New behavior:
- `Continue demo to destination` returns to Mission Home **and automatically opens the next bridge dialog**;
- that second dialog is prefilled with the precommitted destination;
- real `nimiqpay://` links are hidden **only inside the guided browser demo**, preventing provider confusion;
- production and real Nimiq Pay paths are unchanged.

Critical evidence boundary: this tour is for UI/story/interaction QA only. **Never present it as testnet or on-chain proof.**

Next QA action: wait for Vercel deployment containing `ede8737...` or later, reopen the clean-start link, and record/observe the path all the way through the second invitation, second Pass, **ARRIVED**, and the **DEMO RECEIPT**.

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

1. Verify Vercel has deployed `ede8737...` or later and rerun guided tour through **ARRIVED / DEMO RECEIPT**.
2. Fix only remaining presentation/demo friction that does not touch blocked backend contracts.
3. Re-fetch Opeyemi branch/PR status.
4. Reconcile PR #20 + Opeyemi route-view/privacy/relay changes without force updates.
5. Wire browser + HTTP + PostgreSQL preserving Living Route UI and Vercel config.
6. Full CI green → merge → update canon/handover.
7. Run real A→B→C testnet through ARRIVED and validate Route Receipt against real data.
8. Then five first-time tests, 5/5 promotion, 4→11→25+ legitimate wallet opens, submission, Sep 16 proof event if green, judge-window monitoring and final TRACE polish.

## External naming debt

Public identity is NimCarry, but external identifiers are not yet renamed: desired repo `Faadil1/nimcarry`, current `Faadil1/carry-one`; desired alias `https://nimcarry.vercel.app`, current observed production `https://carry-one-mu.vercel.app`.
