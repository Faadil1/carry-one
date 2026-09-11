# HANDOVER — NimCarry

Date: 2026-09-11  
Canonical version: **0.8.24**  
State: `HTTP_SECURITY_SPLIT_COMPLETE_SHARED_VERTICAL_INTEGRATION_NEXT`

## Read first

`CANONICAL-STATE.yaml` is the source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Winning Intelligence — COMPLETE

Seven full Otter Sip & Ship transcripts analyzed through Sep 9. Primary docs:
- `docs/SIP-SHIP-7-CALL-WINNING-INTELLIGENCE-2026-09-09.md`
- `docs/SIP-SHIP-HIDDEN-SPOT-DELTA-AND-SCORE-CAPTURE-2026-09-09.md`

Locked transfer patterns: problem-first; live proof > architecture; simplicity as implicit meta-rubric; persistent proof artifact; real-user behavior as PMF signal; natural invite loop; avoid crypto as front-door; deterministic demo; lifecycle closure; known-good judge-window runtime.

## UI / demo — GREEN

PR #19 hidden-spot layer and PR #21 Living Route UI are merged on `main`. Production Vercel has been observed Ready/Current at `https://carry-one-mu.vercel.app`.

Provider-free guided demo:
`https://carry-one-mu.vercel.app/?demo=1&tour=1&reset=1`

A user-supplied production recording verified the complete simulated 1→5 narrative through **ARRIVED + DEMO Route Receipt** in ~54 seconds from the fresh start. This remains UI/story evidence only and must never be presented as real testnet/on-chain proof.

## Repository naming

The GitHub repository is now actually renamed to:
`Faadil1/nimcarry`

The old `Faadil1/carry-one` path redirects. Desired Vercel alias `https://nimcarry.vercel.app` is still pending; current observed production URL remains `https://carry-one-mu.vercel.app`.

## HTTP security split — COMPLETE ON FEATURE BRANCH

### Faadil #3/#4

PR #20 `Secure broadcast claims and add client idempotency` is **MERGED** into `feat/mission-http-bindings` at merge SHA:
`77c89bb9f289de1c00b5d22d6f8c7280dc223b01`

Implemented:
- one-time short-lived broadcast capability issued after signed `AUTHORIZE_PASS`;
- capability binding to mission + invitation + sequence + intent nonce + current holder;
- replay/binding/expiry protection;
- automatic TypeScript API-client `Idempotency-Key` support and stable broadcast retry key.

### Opeyemi #1/#2/#5

PR #23 `Feat/route privacy security` was re-reviewed after the first review found two holes. Opeyemi fixed both at head `4dfc6ac1fb2f65cc2879dfb48f76643c5cd9d964`.

Verified fixes:
1. non-public reconcile responses now pass through the authorized route-view boundary and anonymous/invalid callers receive 401 without mission-view disclosure;
2. the false claim that invite tokens double as route-view capabilities was removed — invite token is landing-page-only (`GET /i/:token`), while continued route access requires signed `VIEW_ROUTE` capability minting.

Regression coverage was added, TypeScript client now forwards the stored view token on reconcile, CI run `34578961361` = **PASS**, and Opeyemi reports **148/148 tests** passing.

PR #23 was **APPROVED and MERGED** into `feat/mission-http-bindings` at:
`76fe73efe0e397dbacc447f7a0ead8f75c9fbca8`

The three Opeyemi-owned security items are now complete:
- route-view capability replacing spoofable `X-Wallet`;
- role-aware invitation privacy/redaction;
- legacy `/relay` production mutation gate.

**All five HTTP security blockers are now closed on `feat/mission-http-bindings`.**

## Important branch state

Do **not** force-update Opeyemi's branch.

Current comparison against `main` after PR #23 merge:
- feature branch is **22 commits ahead**;
- feature branch is **100 commits behind** current `main`;
- existing PR #14 (`feat/mission-http-bindings` → `main`) is open but currently **not mergeable**.

This means the next task is not another security feature. It is reconciliation onto latest main while preserving Living Route UI, guided demo isolation, Vercel configuration, and the canonical state files.

## CURRENT GATE — SHARED VERTICAL INTEGRATION

Gate: **`NIMCARRY_SHARED_VERTICAL_INTEGRATION`**

Next exact actions:
1. branch from latest `main` for shared integration;
2. port/reconcile the secure HTTP surface from `feat/mission-http-bindings` without overwriting the current UI/demo work;
3. wire browser runtime to the secure route-view capability + broadcast-capability contracts;
4. verify frontend + HTTP + PostgreSQL bootstrap/durability together;
5. full CI green;
6. merge to `main`;
7. update canon + handover again.

## NEXT REAL PROOF GATE

After shared integration is merged:
Wallet A creator/holder → Wallet B bridge → Wallet C destination, 3 testnet wallets, preferably 2 physical devices.

Target proof:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Also validate:
- exact 1 NIM / fee-0 forwarding;
- multi-account behavior;
- native invitation deep link;
- iOS cold/warm/background/resume behavior;
- real Route Receipt against the real finalized route.

Never claim real testnet `FINAL` or `ARRIVED` before observed evidence exists.

## Score-floor after real E2E

Builder Promotion = Skool 2 + public social 3 = **5/5**. Real Usage = `0–3:0`, `4–10:6`, `11–24:10`, `25+:15`. Promotion + 4 genuine users = **11 points**, +11 users = **15**, +25 users = **20/20** outside the 80-point core. No bots/artificial wallets/gaming.

## Post-E2E order

1. verify real Route Receipt;
2. run first 5 observed cold-start tests under 60s;
3. publish genuine Skool + public social posts for 5/5 promotion;
4. reach 4+, 11+, then 25+ legitimate unique wallet opens;
5. submit once genuinely usable;
6. Sep 16 Sip & Show only if runtime is green;
7. judge-window monitoring/rollback + final TRACE/demo packaging.
