# HANDOVER — NimCarry

Date: 2026-09-11  
Canonical version: **0.8.33**  
State: `CLOUDFLARE_DEEP_RUNTIME_SMOKE_PASS_NIMIQ_PAY_PROVIDER_NEXT`

## Read first

`CANONICAL-STATE.yaml` is the source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone so a new conversation can take lead without chat history.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Secure stack already complete

PR #24 — secure vertical — merged at `449f1d3b942b8593596ea2e637033444f41f0bc9`; post-merge CI `34598905774` PASS.

PR #25 — Cloudflare runtime scaffold — merged at `aed163d0335b5fc68317ec4cb325a56739cf54b8`; post-merge CI `34601571626` PASS. The stack is:
- Cloudflare Worker Static Assets from `web/`;
- canonical Node backend inside Cloudflare Container;
- stable container identity `nimcarry-primary`;
- `max_instances: 1` for the proof gate;
- same-origin SPA/API routing;
- production mode + Postgres repository + legacy `/relay` mutations disabled.

No real Nimiq testnet `FINAL` or `ARRIVED` has yet been claimed.

## Database — NEON READY

Dedicated Neon PostgreSQL project:
- project `nimcarry`
- project id `late-credit-21248077`
- branch `main`
- database `nimcarry`
- region `aws-us-east-1`
- PostgreSQL 18

Applied on production main:
- `migrations/001_reach_mission_foundation.sql`
- `migrations/002_postgres_concurrency_guards.sql`

Verified: **7 canonical tables + 3 concurrency triggers PASS**.

The Neon connection string is installed only as Cloudflare runtime secret `CARRY_ONE_DATABASE_URL`. Never expose it in chat, Git, issues, screenshots, logs, or evidence.

## Cloudflare production runtime — DEEP SMOKE PASS

Production origin:
`https://nimcarry.faadil-casecraft.workers.dev`

Account/runtime status:
- Workers Paid enabled;
- production `workers.dev` enabled;
- preview disabled;
- Worker + Container deployed;
- runtime secrets installed;
- Observability enabled;
- `CARRY_ONE_CANONICAL_ORIGIN` is now a Wrangler var so it cannot silently disappear on deploy;
- the three sensitive runtime names are declared via `secrets.required`.

Hardening commits:
- Observability config: `48679a3cc4b6681a6f6dca923dc06006e1cee788`
- runtime config source-of-truth hardening: `1189cc6096b96c21827be9350ae90a814e85e45f` — CI `34646840377` PASS
- deterministic deep runtime smoke: `0ff137d5287fec484cb2fa7e132e1c88758e6e0b` — CI `34649046241` PASS

Observed production proof:
- `GET /health` = `200 {"status":"ok"}`
- static same-origin asset check `/nimcarry-mark.svg` = `304`, outcome OK
- `GET /health?deep=1` = **PASS** with:
  - `backend_http_status: 200`
  - `repository_mode: postgres`
  - `mission_http_bindings: enabled`
  - `canonical_origin: https://nimcarry.faadil-casecraft.workers.dev`
  - `container_identity: nimcarry-primary`
  - `max_instances_for_proof_gate: 1`
  - `legacy_relay_gate.pass: true`
  - `legacy_relay_gate.status: 403`
  - `legacy_relay_gate.error: LEGACY_RELAY_DISABLED`

This deterministic endpoint supersedes the need to manually hunt startup console lines for the runtime gate. Runtime smoke is now considered **PASS**.

Important remaining Cloudflare housekeeping:
- harden Build watch paths so documentation-only commits such as `CANONICAL-STATE.yaml` / `HANDOVER.md` do not redeploy production;
- remove duplicate Build-variable copies of secrets if they still exist.

Why singleton routing matters: route-view and broadcast capabilities remain process-local. If the Container restarts during an active proof, fail closed and restart the proof. Never manufacture recovery evidence.

## CURRENT GATE — REAL NIMIQ PAY TESTNET E2E

Current status:
`RUNTIME_SMOKE_PASS_NIMIQ_PAY_PROVIDER_THEN_REAL_PROOF`

Next exact actions:
1. harden Cloudflare Build watch paths;
2. remove duplicate Build-variable secrets if still present;
3. open the production Mini App in Nimiq Pay and confirm the injected provider is available;
4. execute the real A → B → C Nimiq Pay testnet proof;
5. after each real `FINAL`, query Neon and capture durable state evidence before advancing custody.

Target topology:
- A = creator / initial holder
- B = bridge
- C = consented destination
- 3 testnet wallets, preferably 2 physical devices

Target proof:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → INVITE C → ACCEPT → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Required checks:
- exactly `100000 Luna` each hop;
- requested fee `0` plus actual wallet/network behavior;
- independent FINAL before custody movement;
- durable Neon state after each FINAL;
- multi-account wallet selection;
- native invitation deep link;
- iOS cold/warm/background-resume;
- real Route Receipt matches finalized route.

**Never claim real testnet `FINAL` or `ARRIVED` before observed evidence exists.**

## Tooling boundary

GitHub and Neon are directly manageable from this chat. Cloudflare dashboard/account settings still require the authenticated user session unless moved to ChatGPT Work/Cloud Browser or a local Codex/CLI flow with Cloudflare auth. Do not expose the database credential or encryption/HMAC keys.

## Post-E2E order

1. verify real Route Receipt;
2. first 5 observed cold-start tests under 60s;
3. genuine Skool + public social posts for 5/5 promotion;
4. reach 4+, 11+, then 25+ legitimate unique wallet opens;
5. submit once genuinely usable;
6. Sep 16 Sip & Show only if runtime remains green;
7. judge-window monitoring/rollback + final TRACE/demo packaging.
