# HANDOVER — NimCarry

Date: 2026-09-11  
Canonical version: **0.8.28**  
State: `CLOUDFLARE_RUNTIME_PREPARED_SUPABASE_CONFIRMATION_AND_DEPLOYMENT_NEXT`

## Read first

`CANONICAL-STATE.yaml` is the source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone so a new conversation can take lead without chat history.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Previous UI / demo state

Living Route UI and guided demo were previously observed on Vercel at `https://carry-one-mu.vercel.app`. The guided demo reaches simulated ARRIVED + DEMO Route Receipt in ~54s from fresh start. That remains presentation evidence only and must never be presented as real testnet proof.

The active deployment direction is now **Cloudflare**, not Vercel.

## Shared secure vertical — COMPLETE ON MAIN

PR #24 — **Integrate secure vertical slice on latest main** — merged to `main` at:
`449f1d3b942b8593596ea2e637033444f41f0bc9`

Post-merge CI `34598905774` = **PASS**.

The merged stack includes:
- signed route-view capabilities; no spoofable `X-Wallet` authorization;
- invitation privacy/redaction;
- production gate on legacy `/relay` mutations;
- protected reconcile;
- separate signed `VIEW_ROUTE` mint after acceptance;
- one-time broadcast capability after `AUTHORIZE_PASS`;
- browser + TS idempotency;
- normalized `invitation_id`;
- secure browser → HTTP → PostgreSQL vertical harness;
- durable DB assertion before a FINAL handoff is accepted by the harness.

No real Nimiq testnet FINAL/ARRIVED has yet been claimed.

## Cloudflare runtime — PREPARED, NOT DEPLOYED

Active branch:
`ops/real-testnet-e2e-runtime`

Runbook:
`docs/REAL-TESTNET-E2E-RUNBOOK-2026-09-11.md`

Deployment scaffolding now exists:
- `cloudflare/worker.mjs`
- `cloudflare/wrangler.jsonc`
- `cloudflare/package.json`
- `Dockerfile.cloudflare`
- `.dockerignore`

Architecture:
- one Cloudflare Worker serves `web/` as Workers Static Assets;
- JSON/mutation API traffic is forwarded to the canonical Node runtime inside a Cloudflare Container;
- backend is addressed with stable container identity `nimcarry-primary`;
- `max_instances: 1` for the real proof gate;
- frontend and API stay on the same Cloudflare origin;
- `/mission/*` and browser navigation to `/i/*` remain SPA routes;
- JSON API calls to `/missions/*` and `/i/*` are sent to the Node backend;
- Node container runs on port 8787 with `NODE_ENV=production`, Postgres mode, and legacy relay writes disabled.

Why singleton routing matters: route-view and broadcast capabilities are still short-lived process-local stores. A multi-instance backend could split sequential requests across stores and break the secure flow. Cloudflare Containers allow requests to be routed to a stable named instance. Cloudflare can still restart a container; if that happens during the proof and a capability is lost, **fail closed and restart the proof run**. Do not manufacture recovery evidence.

Cloudflare Containers currently require Workers Paid; the documented floor is USD 5/month. No paid Cloudflare action has been executed by this branch alone.

## PostgreSQL / possible Supabase project

Opeyemi built the generic PostgreSQL adapter. The repo contains no Supabase URL/project ID/configuration and no Supabase-specific branch.

Faadil's currently connected Supabase account shows no dedicated NimCarry project. It is still possible Opeyemi created a database under his own Supabase account/organization; this is **UNCONFIRMED**.

Do not create a duplicate database until that is confirmed or ruled out.

If Opeyemi already created it, obtain project access / the Postgres connection string securely. Do not commit it or paste it into issues/PRs.

If no existing project exists, create a dedicated NimCarry Postgres database and apply:
- `migrations/001_reach_mission_foundation.sql`
- `migrations/002_postgres_concurrency_guards.sql`

## Cloudflare secrets required before deployment

Set in Cloudflare Worker Secrets, not Git:

- `CARRY_ONE_DATABASE_URL`
- `CARRY_ONE_TARGET_ENCRYPTION_KEY_B64URL`
- `CARRY_ONE_TARGET_HMAC_KEY_B64URL`
- `CARRY_ONE_CANONICAL_ORIGIN`

Optional:
- `NIMIQ_RPC_URL`
- `NIMIQ_RPC_URLS`

The encryption and HMAC keys must be independently generated different 32-byte base64url values.

## CURRENT GATE — REAL NIMIQ PAY TESTNET E2E

Current status:
`CLOUDFLARE_SCAFFOLD_READY_CONFIRM_DATABASE_THEN_DEPLOY_AND_RUN_REAL_PROOF`

Next exact actions:
1. confirm with Opeyemi whether the NimCarry Supabase/Postgres project already exists;
2. use it if valid, otherwise provision a dedicated Postgres database;
3. apply migrations `001` + `002`;
4. enable/confirm Cloudflare Workers Paid for Containers;
5. configure Cloudflare secrets;
6. deploy Worker Static Assets + singleton Container;
7. verify `/health`, Postgres mode, same-origin routing, and legacy relay `403`;
8. execute the real A → B → C Nimiq Pay testnet proof.

Target topology:
- Wallet A = creator / initial holder
- Wallet B = bridge
- Wallet C = consented destination
- 3 testnet wallets, preferably 2 physical devices

Target proof:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B becomes holder → INVITE C → ACCEPT → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Also validate:
- exactly `100000 Luna` per hop;
- requested fee `0` and actual wallet/network behavior;
- custody never moves before independent FINAL;
- durable Postgres state after each FINAL;
- multi-account wallet selection;
- native invitation deep link;
- iOS cold/warm/background/resume;
- Route Receipt matches the finalized route.

**Never claim real testnet `FINAL` or `ARRIVED` before observed evidence exists.**

## Post-E2E order

1. verify the real Route Receipt;
2. run first 5 observed cold-start tests under 60s;
3. publish genuine Skool + public social posts for 5/5 promotion;
4. reach 4+, 11+, then 25+ legitimate unique wallet opens;
5. submit once genuinely usable;
6. Sep 16 Sip & Show only if runtime is green;
7. judge-window monitoring/rollback + final TRACE/demo packaging.
