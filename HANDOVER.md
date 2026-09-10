# HANDOVER — NimCarry

Date: 2026-09-09  
Canonical version: **0.8.19**  
State: `LIVING_ROUTE_UI_PRODUCTION_READY_CREATE_ROUTE_VERIFIED_POLISH_GREEN_HTTP_SECURITY_PARALLEL_RECONCILIATION`

## Read first

`CANONICAL-STATE.yaml` is the current source of truth and overrides chat memory. Update **both** `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.*

Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward, stake, wager, prize or pooled fund. Every mission has a destination. Every bridge consents. Only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Winning Intelligence — COMPLETE

Seven full Otter transcripts were analyzed: Cycle I Jul 8/15/22/29 + Cycle II Aug 26/Sep 2/Sep 9.

Primary docs:
- `docs/SIP-SHIP-7-CALL-WINNING-INTELLIGENCE-2026-09-09.md`
- `docs/SIP-SHIP-HIDDEN-SPOT-DELTA-AND-SCORE-CAPTURE-2026-09-09.md`

Locked transfer patterns: problem-first; live proof > architecture; simplicity as implicit meta-rubric; persistent proof artifact; real-user behavior as PMF signal; natural share loop; avoid crypto as front-door; make Nimiq visible at authorization/finality/proof; deterministic demo; lifecycle closure; known-good judge-window runtime.

## Hidden spots product layer — MERGED

PR **#19** → `main` merge `7ccf67aefb53ee101b2df7fdc1dc638d976cb4cc`, CI PASS.

Implemented: problem-first framing, five-step flow, 1-NIM baton disambiguation, wallet/finality/custody proof ladder, bridge lifecycle, private share loop, FINAL-only route explanation, privacy-safe `ARRIVED / Verified Route Receipt`, judge smoke tooling, first-five 60-second testing protocol, 4/11/25 usage ladder and promotion drafts.

## Living Route UI P0/P1 — MERGED AND SEEN IN PRODUCTION

PR **#21** → `main` merge `08b3ce1d3662e78a40c5c43e647a6940900e92bc`, CI PASS.

Implementation: `docs/LIVING-ROUTE-UI-P0-P1-2026-09-09.md`

Implemented: route-native NimCarry logo/header/favicon; install/social branding; continuous five-step living route; current holder emphasis; wallet approval → verification → FINAL interactions; progressive finalized-hop reveal; ARRIVED/Verified Route Receipt climax; button/loading micro-interactions; stronger consent copy; dashed unverified route; one-time receipt focus; reduced-motion.

Truthfulness boundary: presentation only. It does **not** send transactions, create FINAL, move custody or manufacture ARRIVED.

## Vercel production — READY, `/create` DIRECT ROUTE VERIFIED

Initial production failed because Vercel expected `public/` although the Mini App lives in `web/`. PR **#22** fixed this via root `vercel.json` (`buildCommand: npm run build`, `outputDirectory: web`, SPA rewrites) and merged as `90673c060e7afbd1e3102326b845b2c1768584b3`.

User screenshots then confirmed:
- Vercel status **Ready / Production / Current**;
- observed source commit `adeca0d360c727e1af71b23e86c8cefc9cbcc14f`;
- public production domain `https://carry-one-mu.vercel.app`;
- Living Route/NimCarry visual shell present;
- direct `https://carry-one-mu.vercel.app/create` loads successfully;
- five-step route and create form render, proving the `/create` rewrite works.

Still smoke-test later: one real `/mission/...` deep link, one `/i/...` invitation link, then mobile/Nimiq Pay WebView.

## Create-surface QA patch — GREEN, NEWEST VERCEL DEPLOYMENT NOT YET RE-OBSERVED

The production `/create` screenshot exposed three non-backend polish issues:
1. focus-on-render could scroll the brand header off-screen;
2. `Screen 2 / 5` conflicted with the Living Route stepper showing Create as step 1;
3. `Cycle II` competition language made the production product feel more like a hackathon prototype.

A small presentation-only patch is already on `main`:
- `web/route-shell-polish.js` commit `3a8093e6feedd7198738518ff90c9bf3fdb66867`;
- loaded by `web/index.html` commit `1479e49a61b460d7606f0012854cb49938deed3f`;
- CI syntax coverage commit `d96234b9b3476dc9400555f3edcce733e9ee9927`;
- CI run `34422173066`: **PASS**.

Behavior: route changes restore page scroll to top once so NimCarry branding remains visible; create kicker becomes `STEP 1 OF 5 · CREATE MISSION`; public lede and consent checkbox no longer mention `Cycle II`.

Important: the screenshot predates this latest polish patch. Verify the next Vercel Production deployment before claiming those three corrections live.

## Faadil HTTP security — PR #20 GREEN, NOT MERGED

PR **#20** `Secure broadcast claims and add client idempotency`; branch `feat/faadil-http-security`; base Opeyemi `feat/mission-http-bindings`; head `2588021ea45c806ec9588c24b00ce209f67ddbfe`; CI `34416146070` PASS; reviewer `opeblow`.

Implemented: short-lived one-time broadcast capability after signed `AUTHORIZE_PASS`, bound to mission + invitation + sequence + intent nonce + holder wallet; replay/binding/expiry protection; automatic TypeScript mutation `Idempotency-Key`; stable broadcast retry key.

Do not call blockers closed until reconciled with Opeyemi work and browser runtime.

## Opeyemi parallel HTTP work — DO NOT FORCE UPDATE

Last observed: `feat/mission-http-bindings` at `4f219cbd153484e560c4079ffd8c549ec52e483f`. Re-fetch live before integration.

Split:
- **Opeyemi:** verified route-view capability, invitation privacy/redaction, legacy `/relay` production dev-gate.
- **Faadil side:** PR #20 broadcast capability + TS API client idempotency.
- **Shared:** final browser contract + frontend/HTTP/PostgreSQL vertical integration + real 3-wallet E2E.

Current gate: **`NIMCARRY_HTTP_SECURITY_AND_VERTICAL_INTEGRATION`**.

## Demo law

Target narrative: `human problem → Create → Invite → Accept → Pass 1 NIM → FINAL → next bridge → FINAL → ARRIVED → Verified Route Receipt`.

The judge must not be required to install/sign/play a role. If live finality is slow, show `Waiting for independent finality`; only an already-captured **real testnet run** may be used as fallback proof. Never present local demo mode as testnet evidence.

## Next real gate after secure HTTP merge

Preferred topology: Wallet A creator/initial holder, Wallet B bridge, Wallet C destination; two physical devices preferred.

Target: `CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`.

Also prove multi-account behavior, exact 1-NIM forwarding with fee 0, native invite deeplink, and iOS cold/warm/background/resume/deeplink lifecycle.

## Score-floor strategy after secure E2E

Builder Promotion = Skool `2` + public social `3` = **5/5**. Real Usage = `0–3:0`, `4–10:6`, `11–24:10`, `25+:15`.

Therefore promotion + 4 genuine users = **11 points**, +11 users = **15**, +25 users = **20/20** outside the 80-point core. No bots/artificial wallets/gaming.

## Execution order — CURRENT

1. Verify newest Vercel deployment contains `route-shell-polish.js`; refresh `/create` and confirm logo/header stays visible, kicker says `STEP 1 OF 5`, and Cycle-II jargon is gone.
2. Smoke-test one `/mission/...` deep link and one `/i/...` invitation deep link when safe fixtures/runtime exist.
3. Re-fetch Opeyemi live branch / PR status.
4. Reconcile his route-view/privacy/relay work with green PR #20 without force-updating his branch.
5. Wire browser + HTTP + PostgreSQL while preserving Living Route UI and Vercel config.
6. Full CI green → merge → update canon + handover.
7. Run real A→B→C testnet through `ARRIVED` and validate Route Receipt against real data.
8. Run 5 observed first-time tests under 60 seconds.
9. Publish genuine Skool + public posts for 5/5 promotion.
10. Reach 4+, 11+, then 25+ legitimate unique wallet opens; submit once genuinely usable.
11. Sep 16 Sip & Show only as real-product proof if runtime is green; then judge-window monitoring/rollback and final TRACE/demo packaging.

## External naming debt

Public identity is NimCarry, but external identifiers are not yet renamed:
- desired repo: `Faadil1/nimcarry`; current: `Faadil1/carry-one`;
- desired alias: `https://nimcarry.vercel.app`; current production observed at `https://carry-one-mu.vercel.app` and legacy demo locator `https://carry-one-sip-show.vercel.app`.

## Still blocked

Public Early Access before secure vertical flow; mainnet cutover/funds; broad marketing before real E2E; target claiming/public discovery; prizes/wagers/pools; forwarding rewards; autonomous AI spend/routing; marketplace expansion; unique-human claims.
