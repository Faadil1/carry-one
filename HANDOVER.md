# HANDOVER — NimCarry

Date: 2026-09-09  
Canonical version: **0.8.17**  
State: `LIVING_ROUTE_UI_P0_P1_MERGED_HTTP_SECURITY_PARALLEL_RECONCILIATION`

## Read first

`CANONICAL-STATE.yaml` is the current source of truth and overrides chat memory. Update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.*

Promise: **Get this to someone you cannot reach directly — one human bridge at a time.**

Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward, stake, wager, prize or pooled fund. Every mission has a destination. Every bridge consents. Only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`. No surprise bridges, route loops, clawbacks, forwarding rewards, gamification, AI routing or unique-human claims.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Winning Intelligence — COMPLETE

Seven full Otter transcripts were analyzed: Cycle I Jul 8/15/22/29 + Cycle II Aug 26/Sep 2/Sep 9.

Primary docs:
- `docs/SIP-SHIP-7-CALL-WINNING-INTELLIGENCE-2026-09-09.md`
- `docs/SIP-SHIP-HIDDEN-SPOT-DELTA-AND-SCORE-CAPTURE-2026-09-09.md`

Locked transfer patterns: problem-first; live proof > architecture; simple/intuitive/crystal-clear behaves like an implicit meta-rubric; persistent proof artifacts win attention; real-user behavior signals PMF; natural sharing beats bolted-on referral mechanics; avoid crypto as front-door but make Nimiq explicit at authorization/finality/proof; do not depend on judge participation; lifecycle gaps get noticed; freeze a known-good build for the random judge window.

## Hidden spots product layer — MERGED

PR **#19** → `main` merge `7ccf67aefb53ee101b2df7fdc1dc638d976cb4cc`, CI PASS.

Implemented: problem-first framing, five-step flow, 1-NIM baton disambiguation, wallet/finality/custody proof ladder, bridge lifecycle, private share loop, FINAL-only route explanation, privacy-safe `ARRIVED / Verified Route Receipt`, judge smoke tooling, first-five 60-second testing protocol, 4/11/25 real-usage ladder and promotion drafts.

## Living Route UI P0/P1 — MERGED

PR **#21** → `main` merge:
`08b3ce1d3662e78a40c5c43e647a6940900e92bc`

Pre-merge CI `34419875834`: PASS.  
Post-merge CI `34419936778`: PASS.

Implementation contract:
`docs/LIVING-ROUTE-UI-P0-P1-2026-09-09.md`

Implemented now, without touching blocked backend contracts:
- new route-native **NimCarry logo** in header + favicon;
- install manifest and social-preview asset source;
- five-step progress rendered as a continuous living route;
- current baton holder visually emphasized;
- wallet approval → verification → FINAL proof ladder reacts only to state already reported by the app;
- finalized route hops reveal progressively;
- ARRIVED / Verified Route Receipt receives the strongest visual climax;
- physical button press/hover feedback;
- loading affordances derived from the existing busy state;
- stronger bridge-consent copy without inventing sender identity;
- dashed/unverified empty-route state;
- one-time focus on ARRIVED receipt;
- reduced-motion preserved.

Truthfulness boundary: `living-route.js` is presentation-only. It does **not** send transactions, create FINAL, move custody or manufacture ARRIVED.

Still deferred until secure integration / real-device evidence: browser wiring to the final HTTP contract, production route-view capability, browser transport of PR #20 broadcast capability, real Nimiq Pay timing, iOS lifecycle/deeplink assurance and final TRACE polish.

## Faadil HTTP security — PR #20 GREEN, NOT MERGED

PR: **#20** — `Secure broadcast claims and add client idempotency`  
Branch: `feat/faadil-http-security`  
Base: Opeyemi's `feat/mission-http-bindings`  
Head: `2588021ea45c806ec9588c24b00ce209f67ddbfe`  
CI run `34416146070`: PASS  
Reviewer: **Opeyemi (`opeblow`)**

Implemented on PR #20:
- one-time short-lived broadcast capability issued only after signed `AUTHORIZE_PASS`;
- binding to mission + invitation + sequence + intent nonce + canonical holder wallet;
- replay/binding/expiry protections;
- TypeScript API client automatic mutation `Idempotency-Key`;
- stable broadcast retry key.

Do **not** call blockers #3/#4 fully closed yet: the browser shell still needs the final secure contract during shared integration.

## Opeyemi parallel HTTP work — DO NOT FORCE UPDATE

Last observed branch: `feat/mission-http-bindings` at `4f219cbd153484e560c4079ffd8c549ec52e483f`. Re-fetch live before integration.

Split:
- **Opeyemi:** verified route-view capability replacing spoofable `X-Wallet`; invitation privacy/redaction; production dev-gate for legacy `/relay` mutations.
- **Faadil side:** PR #20 broadcast capability + TS API client idempotency.
- **Shared:** final browser contract + frontend/HTTP/PostgreSQL vertical integration + real 3-wallet E2E.

Current blockers:
1. route-view capability — `PENDING_OPEYEMI`;
2. invitation privacy/redaction — `PENDING_OPEYEMI`;
3. legacy `/relay` dev gate — `PENDING_OPEYEMI`;
4. PR #20 broadcast capability — `GREEN_PENDING_RECONCILIATION`;
5. browser idempotency + broadcast-capability wiring — `PENDING_SHARED_INTEGRATION`;
6. combined frontend + HTTP + PostgreSQL harness — `PENDING_SHARED_INTEGRATION`.

Current gate: **`NIMCARRY_HTTP_SECURITY_AND_VERTICAL_INTEGRATION`**.

## Demo law

`docs/SEP16-DETERMINISTIC-DEMO-RUNBOOK-2026-09-09.md`

Target narrative:
`human problem → Create → Invite → Accept → Pass 1 NIM → FINAL → next bridge → FINAL → ARRIVED → Verified Route Receipt`.

The judge must not be required to install/sign/play a role. If live finality is slow, show `Waiting for independent finality`; only an already-captured **real testnet run** may be used as fallback proof. Never present local demo mode as testnet evidence.

## Next real gate after secure HTTP merge

Preferred topology: Wallet A creator/initial holder, Wallet B bridge, Wallet C destination; two physical devices preferred.

Target:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Also prove multi-account behavior, exact 1-NIM forwarding with requested fee 0, native invite deeplink, and iOS cold/warm/background/resume/deeplink lifecycle.

## Score-floor strategy after secure E2E

Builder Promotion = Skool `2` + public social `3` = **5/5**.

Real Usage = `0–3:0`, `4–10:6`, `11–24:10`, `25+:15`.

Therefore promotion + 4 genuine users = **11 points**, +11 users = **15**, +25 users = **20/20** outside the 80-point core. No bots/artificial wallets/gaming.

## Execution order — CURRENT

1. Re-fetch Opeyemi's live branch / PR status.
2. Reconcile his route-view/privacy/relay work with green PR #20, without force-updating his branch.
3. Wire browser + HTTP + PostgreSQL while preserving the newly merged Living Route UI.
4. Full CI green → merge → update canon + handover.
5. Run real A→B→C testnet through `ARRIVED` and validate the Route Receipt against real route data.
6. Run 5 observed first-time tests under 60 seconds.
7. Publish genuine Skool + public posts for 5/5 promotion.
8. Reach 4+, then 11+, then 25+ legitimate unique wallet opens.
9. Submit once genuinely usable.
10. Sep 16 Sip & Show only as real-product proof if runtime is green.
11. Enable judge-window monitoring/rollback, then focused TRACE polish and final demo packaging.

## External naming debt

Public identity is NimCarry, but external identifiers are not yet claimed renamed:
- desired repo: `Faadil1/nimcarry`; current: `Faadil1/carry-one`;
- desired alias: `https://nimcarry.vercel.app`; current legacy demo: `https://carry-one-sip-show.vercel.app`.

Legacy `carryone.*` storage/protocol fixtures may remain only where backward compatibility or evidence traceability requires them.

## Still blocked

Public Early Access before secure vertical flow; mainnet funds/cutover; broad marketing before real E2E; target claiming/public discovery; prizes/wagers/pools; forwarding rewards; autonomous AI spend/routing; marketplace expansion; unique-human claims.
