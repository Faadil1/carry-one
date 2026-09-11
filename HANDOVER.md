# HANDOVER — NimCarry

Date: 2026-09-11  
Canonical version: **0.8.32**  
State: `CLOUDFLARE_PRODUCTION_DEPLOYED_HEALTH_GREEN_RUNTIME_VERIFICATION_NEXT`

## Read first

`CANONICAL-STATE.yaml` is the source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone so a new conversation can take lead without chat history.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Previous UI / demo state

Living Route UI and guided demo were previously observed on Vercel at `https://carry-one-mu.vercel.app`. The guided demo reaches simulated ARRIVED + DEMO Route Receipt in ~54s from fresh start. That remains presentation evidence only and must never be presented as real testnet proof.

The active production runtime is now **Cloudflare**, not Vercel.

## Shared secure vertical — COMPLETE ON MAIN

PR #24 — **Integrate secure vertical slice on latest main** — merged to `main` at:
`449f1d3b942b8593596ea2e637033444f41f0bc9`

Post-merge CI `34598905774` = **PASS**.

The merged stack includes signed route-view capabilities, invitation privacy/redaction, production gating for legacy `/relay`, protected reconcile, a separate signed `VIEW_ROUTE` mint after acceptance, one-time broadcast capability after `AUTHORIZE_PASS`, browser/TS idempotency, normalized `invitation_id`, and the secure browser → HTTP → PostgreSQL vertical harness with durable DB assertion before a FINAL handoff is accepted by the harness.

No real Nimiq testnet FINAL/ARRIVED has yet been claimed.

## Cloudflare runtime — PRODUCTION DEPLOYED + HEALTH GREEN

PR #25 — **Prepare Cloudflare runtime for real testnet E2E** — merged to `main` at:
`aed163d0335b5fc68317ec4cb325a56739cf54b8`

Final PR head:
`011a24ec34562a99fe1746365ea8088dcd8165ba`

Build verification remains green:
- PR CI `34601474683` = **PASS**
- post-merge main CI `34601571626` = **PASS**
- public-repo secret scan = PASS
- Cloudflare runtime syntax/config = PASS
- pinned Cloudflare toolchain install = PASS
- Wrangler `deploy --dry-run` = PASS
- TypeScript typecheck/build = PASS
- complete suite = **156/156 tests PASS**
- Cloudflare container Docker image build = PASS

Deployment scaffolding on `main`:
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
- Node container is configured for production mode, Postgres repository mode, port 8787, and disabled legacy relay mutations.

Cloudflare account/runtime work completed on 2026-09-11:
- Workers Paid enabled so Containers can deploy;
- production `workers.dev` enabled; preview intentionally left disabled for the proof gate;
- Worker + Container production deployment succeeded;
- production origin is `https://nimcarry.faadil-casecraft.workers.dev`;
- required runtime secrets were installed in the Worker runtime scope, not Git;
- `CARRY_ONE_DATABASE_URL` now points securely to the dedicated Neon project;
- target encryption and HMAC keys are distinct random 32-byte base64url runtime secrets;
- `CARRY_ONE_CANONICAL_ORIGIN` is set to the exact production origin;
- `GET /health` at `https://nimcarry.faadil-casecraft.workers.dev/health` returned **200** with `{"status":"ok"}`.

The initial attempt placed the values in Cloudflare **Build variables**, which did not expose them to the Worker runtime. That was corrected by installing them in runtime Variables and Secrets. If duplicate build-scoped secret entries still exist, remove them after the runtime smoke checks are complete.

Why singleton routing matters: route-view and broadcast capabilities are still short-lived process-local stores. If Cloudflare restarts the container during an active proof and one of these capabilities is lost, **fail closed and restart the proof run**. Never manufacture recovery evidence.

### Runtime verification still pending

Before real wallet proof, confirm:
- Cloudflare startup logs show `Repository mode: postgres`;
- startup logs show `Reach Mission HTTP bindings enabled (PostgreSQL, ...)`;
- same-origin static SPA + JSON API routing works on the production origin;
- production legacy `/relay/*` POST mutations return `403 LEGACY_RELAY_DISABLED`;
- the production page opens correctly outside demo mode;
- the Nimiq Pay provider is available from the production origin.

## Database — NEON PROVISIONED + PRODUCTION MIGRATIONS APPLIED

Opeyemi confirmed on 2026-09-11 that he never created or connected any persistent NimCarry database, so duplicate-database risk is closed.

A dedicated **Neon PostgreSQL** project is provisioned:
- project: `nimcarry`
- project id: `late-credit-21248077`
- branch: `main`
- database: `nimcarry`
- region: `aws-us-east-1`
- PostgreSQL: 18

Production database work completed:
- `migrations/001_reach_mission_foundation.sql` applied to Neon `main`;
- `migrations/002_postgres_concurrency_guards.sql` applied to Neon `main` in one transaction after explicit user approval;
- final schema verification = **PASS**;
- 7 canonical tables are present: `missions`, `invitations`, `pass_intents`, `hops`, `participants`, `auth_challenges`, `audit_events`;
- all 3 production concurrency triggers are present:
  - `carry_one_invitation_insert_guard`
  - `carry_one_invitation_accept_guard`
  - `carry_one_participant_reentry_guard`

The Neon PostgreSQL connection string is installed as the Cloudflare runtime secret `CARRY_ONE_DATABASE_URL`. **Do not write it into Git, issues, PRs, logs, screenshots, or public evidence.**

The green `/health` response is meaningful because the Node process starts only after `createRepositoryStores()` completes, and Postgres mode loads the relay store through the configured PostgreSQL pool. Still capture the startup log explicitly before declaring the runtime verification gate complete.

## CURRENT GATE — REAL NIMIQ PAY TESTNET E2E

Current status:
`CLOUDFLARE_HEALTH_GREEN_RUNTIME_SMOKE_THEN_REAL_PROOF`

Next exact actions:
1. inspect Cloudflare runtime/container logs and confirm `Repository mode: postgres` plus PostgreSQL Mission HTTP bindings;
2. verify production same-origin routing for the SPA and JSON API;
3. verify legacy `/relay/*` POST mutations return `403 LEGACY_RELAY_DISABLED`;
4. remove duplicate Build-variable copies of secrets if they still exist;
5. open the production Mini App in Nimiq Pay and confirm the injected provider is available;
6. execute the real A → B → C Nimiq Pay testnet proof;
7. after each real FINAL, query Neon and capture durable state evidence before advancing custody.

Target topology:
- Wallet A = creator / initial holder
- Wallet B = bridge
- Wallet C = consented destination
- 3 testnet wallets, preferably 2 physical devices

Target proof:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B becomes holder → INVITE C → ACCEPT → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Also validate exactly `100000 Luna` per hop, requested fee `0` plus actual wallet/network behavior, no custody movement before independent FINAL, durable Neon state after each FINAL, multi-account wallet selection, native invitation deep link, iOS cold/warm/background/resume, and a Route Receipt matching the finalized route.

**Never claim real testnet `FINAL` or `ARRIVED` before observed evidence exists.**

## Tooling boundary for next conversation

Neon is connected and manageable directly from ChatGPT. Cloudflare account configuration has been completed manually through the authenticated Cloudflare dashboard because no Cloudflare management plugin was available in this chat. Do not expose the Neon database credential or the runtime encryption/HMAC keys while continuing the gate.

## Post-E2E order

1. verify the real Route Receipt;
2. run first 5 observed cold-start tests under 60s;
3. publish genuine Skool + public social posts for 5/5 promotion;
4. reach 4+, 11+, then 25+ legitimate unique wallet opens;
5. submit once genuinely usable;
6. Sep 16 Sip & Show only if runtime is green;
7. judge-window monitoring/rollback + final TRACE/demo packaging.
