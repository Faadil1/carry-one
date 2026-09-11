# HANDOVER — NimCarry

Date: 2026-09-11  
Canonical version: **0.8.27**  
State: `REAL_TESTNET_E2E_RUNTIME_TOPOLOGY_LOCKED_INFRA_PROVISIONING_NEXT`

## Read first

`CANONICAL-STATE.yaml` is the source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone so a new conversation can take lead without chat history.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Winning Intelligence / UI — GREEN

Seven full Sip & Ship transcripts were analyzed. Hidden spots are implemented. Living Route UI is on `main`, and production Vercel was observed Ready/Current at:
`https://carry-one-mu.vercel.app`

Provider-free guided demo:
`https://carry-one-mu.vercel.app/?demo=1&tour=1&reset=1`

The guided demo reaches simulated **ARRIVED + DEMO Route Receipt** in ~54s from fresh start. It is UI/story evidence only, never real testnet proof.

## HTTP security — COMPLETE AND NOW ON MAIN

Faadil PR #20 supplied:
- one-time scoped broadcast capability after signed `AUTHORIZE_PASS`;
- mission + invitation + sequence + intent nonce + holder binding;
- replay/expiry/binding protection;
- automatic TypeScript client idempotency and stable broadcast retry key.

Opeyemi PR #23 supplied:
- route-view capability replacing spoofable `X-Wallet` authorization;
- viewer-role invitation privacy/redaction;
- legacy `/relay` production mutation gate;
- protected non-public reconcile responses;
- invite token limited to the landing page; continued route access requires signed `VIEW_ROUTE` capability.

The stale old PR #14 is closed as **superseded / not merged**. Do not reopen it and do not force-update Opeyemi's old feature branch.

## SHARED VERTICAL INTEGRATION — MERGED TO MAIN

Important commits:
- secure backend port onto latest-main base: `372cb8a1bbd3d09a561476f56c50fd3208185018`
- secure browser transport wiring: `f0f4da99821d472df93dcb9370d3a2b0929eba74`
- browser contract regression tests: `4c27998f91d1120aa4fbd8da8d429116602251dc`
- browser → HTTP → PostgreSQL vertical harness: `8c73c5a4a43142765b239ff4bbae022ab4440dfa`

PR #24 — **Integrate secure vertical slice on latest main** — was merged into `main` at:
`449f1d3b942b8593596ea2e637033444f41f0bc9`

Verification:
- branch CI `34598755496` = **PASS**
- PR CI `34598845208` = **PASS**
- post-merge main CI `34598905774` = **PASS**

The post-merge CI passed secret scan, browser JavaScript syntax, typecheck, complete tests, and build.

## Browser secure contract now on main

The real browser transport now:
- stores route-view capabilities in session storage;
- attaches Bearer route-view capability to non-public mission reads and reconcile;
- does **not** use `X-Wallet` as authorization;
- after a signed invitation acceptance, separately mints a signed `VIEW_ROUTE` capability for the accepted participant before route following;
- gives browser mutations `Idempotency-Key` automatically, excluding challenge/reconcile where intentional;
- carries the one-time `broadcast_capability` from authorized pass intent into `/missions/:id/broadcast`;
- uses a stable idempotency key for retries of the same broadcast claim;
- normalizes backend invitation `id` into the browser `invitation_id` contract;
- fails closed when required security artifacts are missing.

Guided/demo mode remains separate and cannot create real wallet/network authority, `FINAL`, custody transfer, or real `ARRIVED` evidence.

## Combined vertical harness — GREEN

File:
`tests/integration/secure-vertical-slice.test.ts`

It exercises the shared stack against the Postgres adapter (`pg-mem` with the foundation schema):

`browser security contract → signed create → invite → accept → signed VIEW_ROUTE mint → AUTHORIZE_PASS → capability-bound broadcast → independent FINAL observation → reconcile → holder projection → durable PostgreSQL mission/hop state`

The test verifies the FINAL hop and mission sequence/finalized-hop count are present in the database before success is accepted.

Production Postgres concurrency hardening remains governed by migration `002_postgres_concurrency_guards.sql`; the hermetic vertical harness is not itself a claim of production Postgres or live Nimiq evidence.

## REAL TESTNET RUNTIME TOPOLOGY — LOCKED

Runbook:
`docs/REAL-TESTNET-E2E-RUNBOOK-2026-09-11.md`

For this gate use:
- existing Vercel Mini App as the frontend surface;
- **one long-lived Node backend process** running the canonical `src/index.ts` application;
- a **dedicated Postgres database** with migrations `001` and `002` applied;
- Nimiq **testnet only**;
- same-origin proxy/rewrite between frontend and backend when possible;
- real Nimiq Pay injected provider for wallet selection, signatures and transaction approval.

Important deployment constraint: route-view and broadcast capabilities are process-local short-lived stores today. Do **not** deploy the real proof backend as multi-instance/serverless unless those stores are first made shared/durable. Sequential requests in the proof run must reach the same backend capability store.

External state observed on 2026-09-11:
- the Vercel connector available in this conversation exposes zero projects, so it cannot currently manage the existing `carry-one-mu.vercel.app` project;
- no dedicated NimCarry Supabase/Postgres project exists among the connected database projects;
- unrelated existing databases must **not** be repurposed for this proof.

Therefore the gate has advanced from “decide how to run it” to **external infrastructure provisioning**. No real FINAL/ARRIVED is claimed.

## CURRENT GATE — REAL NIMIQ PAY TESTNET E2E

Current status:
`RUNTIME_TOPOLOGY_LOCKED_INFRA_PROVISIONING_AND_REAL_NIMIQ_PAY_PROOF_NEXT`

Code-level shared vertical integration is complete. Do **not** add new product scope now.

Before executing the real run:
- provision a dedicated NimCarry Postgres database;
- apply `001_reach_mission_foundation.sql` and `002_postgres_concurrency_guards.sql`;
- provision/connect a single-process long-lived Node runtime;
- install target-wallet encryption + HMAC secrets in deployment secret storage;
- configure canonical origin + Nimiq testnet RPC read endpoint(s);
- keep `CARRY_ONE_LEGACY_RELAY_ENABLED=false` in production;
- make the Mission HTTP runtime reachable from the Mini App without weakening the browser boundary;
- verify `/health` and `Repository mode: postgres` before touching wallets.

Target topology:
- Wallet A = creator / initial holder
- Wallet B = bridge
- Wallet C = consented destination
- 3 testnet wallets, preferably 2 physical devices

Target proof:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B becomes holder → INVITE C → ACCEPT → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Also validate:
- exact 1 NIM = 100,000 Luna per hop;
- requested fee 0 and actual wallet/network behavior;
- custody never moves before independent FINAL;
- finalized state is durable in Postgres after each hop;
- multi-account wallet selection;
- native invitation deep link;
- iOS cold/warm/background/resume behavior;
- real Route Receipt matches the finalized route.

**Never claim real testnet `FINAL` or `ARRIVED` before observed evidence exists.**

## Score-floor after real E2E

Builder Promotion = Skool 2 + public social 3 = **5/5**. Real Usage = `0–3:0`, `4–10:6`, `11–24:10`, `25+:15`. Promotion + 4 genuine users = **11 points**, +11 users = **15**, +25 users = **20/20** outside the 80-point core. No bots/artificial wallets/gaming.

## Post-E2E order

1. verify the real Route Receipt;
2. run first 5 observed cold-start tests under 60s;
3. publish genuine Skool + public social posts for 5/5 promotion;
4. reach 4+, 11+, then 25+ legitimate unique wallet opens;
5. submit once genuinely usable;
6. Sep 16 Sip & Show only if the runtime is green;
7. judge-window monitoring/rollback + final TRACE/demo packaging.
