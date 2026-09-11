# HANDOVER — NimCarry

Date: 2026-09-11  
Canonical version: **0.8.25**  
State: `SECURE_BACKEND_PORTED_TO_LATEST_MAIN_CI_GREEN_BROWSER_WIRING_NEXT`

## Read first

`CANONICAL-STATE.yaml` is the source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Winning Intelligence / UI — GREEN

Seven full Sip & Ship transcripts were analyzed. Hidden spots are implemented. Living Route UI is merged and production Vercel has been observed Ready/Current at `https://carry-one-mu.vercel.app`.

Provider-free guided demo:
`https://carry-one-mu.vercel.app/?demo=1&tour=1&reset=1`

The guided demo reaches simulated **ARRIVED + DEMO Route Receipt** in ~54s from fresh start. It is UI/story evidence only, never real testnet proof.

## HTTP security — COMPLETE

Faadil PR #20 was merged into the backend feature base at `77c89bb9f289de1c00b5d22d6f8c7280dc223b01`:
- one-time scoped broadcast capability after signed `AUTHORIZE_PASS`;
- binding to mission + invitation + sequence + intent nonce + current holder;
- replay/expiry/binding protection;
- automatic TS-client idempotency + stable broadcast retry key.

Opeyemi PR #23 was reviewed, fixed, re-reviewed, approved and merged at `76fe73efe0e397dbacc447f7a0ead8f75c9fbca8`. CI `34578961361` = PASS, 148 tests reported.

Verified Opeyemi items:
- spoofable `X-Wallet` route view removed in favor of route-view capability;
- invitation-sensitive fields redacted by viewer role;
- legacy `/relay` production mutation gate;
- non-public reconcile no longer leaks mission view without route capability;
- invite token is landing-page-only; continued route access requires signed `VIEW_ROUTE` capability.

All five security blockers are closed.

## IMPORTANT: latest-main integration branch is now the active path

A fresh branch was created from latest `main`:
`integration/secure-vertical-slice`

Base main SHA:
`2b36d85ef8d8e0355a1ff4cf27d99ee69ace5005`

The secure backend source/test surface from `feat/mission-http-bindings` was ported onto that latest-main branch without copying stale UI/docs/canonical files.

Port commit:
`372cb8a1bbd3d09a561476f56c50fd3208185018`

CI run:
`34597326151` = **PASS**

This preserves the current Living Route UI, guided demo, Vercel config and canonical docs while carrying forward the secure HTTP implementation.

The old PR #14 from the stale/diverged feature branch to `main` is now **closed as superseded, not merged**. Do not reopen it and do not force-update Opeyemi's branch.

## CURRENT GATE — BROWSER + HTTP + POSTGRES VERTICAL INTEGRATION

Next exact work on `integration/secure-vertical-slice`:
1. replace the old browser compatibility assumptions (`X-Wallet`, unsigned broadcast claim) with the secure contract;
2. store and forward `view_token` for non-public mission reads + reconcile;
3. carry `broadcast_capability` from pass-intent authorization into `/broadcast`;
4. ensure browser mutation calls use `Idempotency-Key` correctly;
5. verify browser + secure HTTP + PostgreSQL bootstrap/durability in one combined harness;
6. keep guided demo fully isolated from real authority/runtime paths;
7. full CI green;
8. open/merge integration PR to `main`;
9. update canon + handover again.

## NEXT REAL PROOF GATE

After shared integration is merged:
Wallet A creator/holder → Wallet B bridge → Wallet C destination, 3 testnet wallets, preferably 2 physical devices.

Target proof:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Also validate exact 1 NIM / fee-0 forwarding, multi-account behavior, native invitation deep link, iOS cold/warm/background/resume, and the real Route Receipt.

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
