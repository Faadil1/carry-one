# HANDOVER — NimCarry

Date: 2026-09-11  
Canonical version: **0.8.29**  
State: `CLOUDFLARE_RUNTIME_SCAFFOLD_MERGED_MAIN_CI_GREEN_DATABASE_CONFIRMATION_NEXT`

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

The merged stack includes signed route-view capabilities, invitation privacy/redaction, production gating for legacy `/relay`, protected reconcile, a separate signed `VIEW_ROUTE` mint after acceptance, one-time broadcast capability after `AUTHORIZE_PASS`, browser/TS idempotency, normalized `invitation_id`, and the secure browser → HTTP → PostgreSQL vertical harness with durable DB assertion before a FINAL handoff is accepted by the harness.

No real Nimiq testnet FINAL/ARRIVED has yet been claimed.

## Cloudflare runtime scaffold — MERGED TO MAIN + CI GREEN

PR #25 — **Prepare Cloudflare runtime for real testnet E2E** — merged to `main` at:
`aed163d0335b5fc68317ec4cb325a56739cf54b8`

Final PR head:
`011a24ec34562a99fe1746365ea8088dcd8165ba`

Verification:
- PR CI `34601474683` = **PASS**
- post-merge main CI `34601571626` = **PASS**
- public-repo secret scan = PASS
- Cloudflare runtime syntax/config = PASS
- pinned Cloudflare toolchain install = PASS
- Wrangler `deploy --dry-run` = PASS
- TypeScript typecheck/build = PASS
- complete suite = **156/156 tests PASS**
- Cloudflare container Docker image build = PASS

Deployment scaffolding now on `main`:
- `cloudflare/worker.mjs`
- `cloudflare/wrangler.jsonc`
- `cloudflare/package.json`
- `Dockerfile.cloudflare`
- `.dockerignore`
- `docs/REAL-TESTNET-E2E-RUNBOOK-2026-09-11.md`

Pinned toolchain:
- `@cloudflare/containers` = `0.3.7`
- Wrangler = `4.131.0`

Architecture:
- one Cloudflare Worker serves `web/` as Workers Static Assets;
- JSON/mutation API traffic is forwarded to the canonical Node runtime inside a Cloudflare Container;
- backend uses stable container identity `nimcarry-primary`;
- `max_instances: 1` for the proof gate;
- frontend and API stay on the same Cloudflare origin;
- browser `/mission/*` and `/i/*` navigation remains SPA navigation while JSON API requests reach the Node backend;
- Node container uses production mode, Postgres repository mode, port 8787, and disabled legacy relay mutations.

Why singleton routing matters: route-view and broadcast capabilities are still short-lived process-local stores. If Cloudflare restarts the container during an active proof and one of these capabilities is lost, **fail closed and restart the proof run**. Never manufacture recovery evidence.

Cloudflare Containers require Workers Paid; the documented floor at this gate is USD 5/month. **The runtime is not deployed yet.** No Cloudflare public origin or live runtime evidence exists yet.

## PostgreSQL / possible Supabase project

Opeyemi built the generic PostgreSQL adapter. The repository contains no Supabase URL, project ID, Supabase config, or Supabase-specific branch.

Faadil's currently connected Supabase account shows no dedicated NimCarry project. It remains possible Opeyemi created the intended database under his own Supabase account/organization; this is **UNCONFIRMED**.

Do not create a duplicate database until that is confirmed or ruled out.

If Opeyemi already created it, obtain project access / the Postgres connection string securely. Do not commit it or paste it into issues/PRs.

If no existing project exists, provision a dedicated NimCarry Postgres database and apply:
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
`CLOUDFLARE_RUNTIME_MERGED_CONFIRM_DATABASE_THEN_DEPLOY_AND_RUN_REAL_PROOF`

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

Also validate exactly `100000 Luna` per hop, requested fee `0` plus actual wallet/network behavior, no custody movement before independent FINAL, durable Postgres state after each FINAL, multi-account wallet selection, native invitation deep link, iOS cold/warm/background/resume, and a Route Receipt matching the finalized route.

**Never claim real testnet `FINAL` or `ARRIVED` before observed evidence exists.**

## Post-E2E order

1. verify the real Route Receipt;
2. run first 5 observed cold-start tests under 60s;
3. publish genuine Skool + public social posts for 5/5 promotion;
4. reach 4+, 11+, then 25+ legitimate unique wallet opens;
5. submit once genuinely usable;
6. Sep 16 Sip & Show only if runtime is green;
7. judge-window monitoring/rollback + final TRACE/demo packaging.
